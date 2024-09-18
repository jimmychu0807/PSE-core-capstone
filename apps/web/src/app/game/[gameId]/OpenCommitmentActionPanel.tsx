"use client";

// 3rd-parties components
import { type FormEvent, useCallback, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  VStack,
} from "@chakra-ui/react";
import { useLocalStorage } from "@uidotdev/usehooks";

// Components defined in this repo
import { useGameContractConfig, useSleepAndGotoURL } from "@/hooks";
import { useLogContext } from "@/context";
import { type GameView } from "@/types";
import { generateFullProof } from "@/utils/proof";
import { type SubNullLocalStorage } from "@/types";

export default function OpenCommitmentActionPanel({
  gameId,
  game,
  hasOpened,
}: {
  gameId: number;
  game: GameView;
  hasOpened: boolean;
}) {
  const advancedMode = false;
  const { address: userAccount } = useAccount();
  const contractCfg = useGameContractConfig();
  const { writeContractAsync, isPending } = useWriteContract();
  const { setLog } = useLogContext();
  const [subNull] = useLocalStorage<SubNullLocalStorage>(
    `subNull-${gameId}-${game.currentRound}-${userAccount}`,
    undefined
  );
  const [openingError, setOpeningError] = useState<string>("");
  const sleepAndGotoURL = useSleepAndGotoURL();

  const openCommitment = useCallback(
    async (ev: FormEvent) => {
      ev.preventDefault();
      const formData = new FormData(ev.target as HTMLFormElement);
      const formValues = Object.fromEntries(formData.entries());
      const { submission, nullifier } = formValues;

      if (!!submission || !!nullifier) {
        return setOpeningError("Please enter a value for submission & nullifier");
      }

      const fullProof = await generateFullProof(
        "OpeningProof",
        Number(submission),
        nullifier || ""
      );

      await writeContractAsync({
        ...contractCfg,
        functionName: "openCommitment",
        args: [gameId, fullProof.proof, fullProof.publicSignals],
      });

      setLog(`Opening commitment: ${submission}, with nullifier: ${nullifier}`);
      sleepAndGotoURL();
    },
    [gameId, contractCfg, setLog, sleepAndGotoURL, writeContractAsync]
  );

  return hasOpened ? (
    <Button variant="outline" colorScheme="yellow" isDisabled={true}>
      Waiting for other players to open...
    </Button>
  ) : (
    <form onSubmit={openCommitment}>
      <VStack spacing={3} border="1px" borderColor="gray.200" borderRadius="8" p={4}>
        <FormControl isInvalid={!!openingError}>
          <FormLabel>Open Commitment</FormLabel>

          <InputGroup display={advancedMode ? "block" : "none"}>
            <InputLeftAddon>Commitment</InputLeftAddon>
            <Input
              id="submission"
              name="submission"
              type={advancedMode ? "number" : "hidden"}
              value={subNull?.["submission"]}
            />
          </InputGroup>

          <InputGroup display={advancedMode ? "block" : "none"}>
            <InputLeftAddon>Nullifier</InputLeftAddon>
            <Input
              id="nullifier"
              name="nullifier"
              type={advancedMode ? "number" : "hidden"}
              value={subNull?.["nullifier"]}
            />
          </InputGroup>
        </FormControl>
        <Button
          display="block"
          margin="0.5em auto"
          mt={4}
          colorScheme="yellow"
          type="submit"
          isLoading={isPending}
        >
          Open Commitment
        </Button>
      </VStack>
    </form>
  );
}
