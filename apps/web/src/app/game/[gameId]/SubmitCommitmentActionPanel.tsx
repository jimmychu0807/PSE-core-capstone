"use client";

// 3rd-parties components
import { type FormEvent, useCallback, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Button, FormControl, FormErrorMessage, FormLabel, Input, VStack } from "@chakra-ui/react";
import { useLocalStorage } from "@uidotdev/usehooks";

// Components defined in this repo
import { useGameContractConfig, useSleepAndGotoURL } from "@/hooks";
import { useLogContext } from "@/context";
import { GameConfig } from "@/config";
import { getRandomNullifier, generateFullProof } from "@/utils/proof";
import { type GameView, type SubNullLocalStorage } from "@/types";

export default function SubmitCommitmentActionPanel({
  gameId,
  game,
  hasSubmitted,
}: {
  gameId: number;
  game: GameView;
  hasSubmitted: boolean;
}) {
  const { address: userAccount } = useAccount();
  const { setLog } = useLogContext();
  const [, saveSubNull] = useLocalStorage<SubNullLocalStorage>(
    `subNull-${gameId}-${game.currentRound}-${userAccount}`,
    undefined
  );
  const [submissionError, setSubmissionError] = useState("");
  const contractCfg = useGameContractConfig();
  const sleepAndGotoURL = useSleepAndGotoURL();
  const { writeContractAsync, isPending } = useWriteContract();

  const submitCommitment = useCallback(
    async (ev: FormEvent) => {
      ev.preventDefault();
      const formData = new FormData(ev.target as HTMLFormElement);
      const formValues = Object.fromEntries(formData.entries());

      if (!formValues["submission"]) return setSubmissionError(`Please enter a value.`);

      const submission = Number.parseInt(formValues["submission"].toString(), 10);
      if (submission < GameConfig.MIN_NUM || submission > GameConfig.MAX_NUM) {
        return setSubmissionError(
          `Submission must be between ${GameConfig.MIN_NUM} to ${GameConfig.MAX_NUM}.`
        );
      }

      // Value validated, generate a large integer
      const nullifier = getRandomNullifier();
      const fullProof = await generateFullProof("CommitmentProof", submission, nullifier);

      await writeContractAsync({
        ...contractCfg,
        functionName: "submitCommitment",
        args: [gameId, fullProof.proof, fullProof.publicSignals],
      });

      setLog(`Committed: ${submission}, with nullifier: ${nullifier}`);
      saveSubNull({ submission, nullifier });
      sleepAndGotoURL();
    },
    [
      gameId,
      contractCfg,
      setSubmissionError,
      writeContractAsync,
      setLog,
      saveSubNull,
      sleepAndGotoURL,
    ]
  );

  const userJoinedGame = userAccount && game.players.includes(userAccount);

  if (!userAccount || !userJoinedGame) return <></>;

  return hasSubmitted ? (
    <Button variant="outline" colorScheme="yellow" isDisabled={true}>
      Waiting for other players to commit...
    </Button>
  ) : (
    <form onSubmit={submitCommitment}>
      <VStack spacing={3} border="1px" borderColor="gray.200" borderRadius="8" p={4}>
        <FormControl isInvalid={!!submissionError}>
          <FormLabel>
            Submit a commitment ({GameConfig.MIN_NUM} to {GameConfig.MAX_NUM})
          </FormLabel>
          <Input
            id="submission"
            name="submission"
            type="number"
            onChange={() => setSubmissionError("")}
          />
          <FormErrorMessage>{submissionError}</FormErrorMessage>
        </FormControl>
        <Button colorScheme="yellow" type="submit" isLoading={isPending}>
          Submit
        </Button>
      </VStack>
    </form>
  );
}
