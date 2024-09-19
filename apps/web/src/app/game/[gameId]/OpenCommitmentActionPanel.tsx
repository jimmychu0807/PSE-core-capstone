"use client";

// 3rd-parties components
import { type FormEvent, useCallback, useState, useRef, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Switch,
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
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
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
  // For setting the initial value of the two form inputs
  const subRef = useRef<HTMLInputElement>(null);
  const nullRef = useRef<HTMLInputElement>(null);
  const [refSet, setRefSet] = useState<boolean>(false);

  const openCommitment = useCallback(
    async (ev: FormEvent) => {
      ev.preventDefault();
      const formData = new FormData(ev.target as HTMLFormElement);
      const formValues = Object.fromEntries(formData.entries());
      const { submission, nullifier } = formValues;

      if (!submission || !nullifier) {
        return setOpeningError("Please enter a value for submission and nullifier.");
      }

      const fullProof = await generateFullProof(
        "OpeningProof",
        Number(submission),
        nullifier as string
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

  useEffect(() => {
    !refSet && subRef.current && (subRef.current.value = subNull.submission.toString());
    !refSet && nullRef.current && (nullRef.current.value = subNull.nullifier);
    setRefSet(true);
  }, [subNull, refSet]);

  return hasOpened ? (
    <Button variant="outline" colorScheme="yellow" isDisabled={true}>
      Waiting for other players to open...
    </Button>
  ) : (
    <form onSubmit={openCommitment}>
      <VStack w="300px" spacing={3} border="1px" borderColor="gray.200" borderRadius="8" p={4}>
        <FormControl isInvalid={!!openingError}>
          <FormLabel>Open Commitment</FormLabel>

          <VStack spacing={3} alignItems="stretch">
            {/* Advanced mode toggle */}
            <HStack justify="space-between" align="center">
              <FormLabel htmlFor="form-advanced-mode" mb="0">
                Advanced Mode
              </FormLabel>
              <Switch
                id="form-advanced-mode"
                onChange={(e) => {
                  setAdvancedMode(e.target.checked);
                  setOpeningError("");
                }}
              />
            </HStack>

            <InputGroup size="sm" display={advancedMode ? "flex" : "none"}>
              <InputLeftAddon color="blue.800" fontWeight="medium">
                Commitment
              </InputLeftAddon>
              <Input
                ref={subRef}
                id="submission"
                name="submission"
                type={advancedMode ? "number" : "hidden"}
                onChange={() => setOpeningError("")}
              />
            </InputGroup>

            <InputGroup size="sm" display={advancedMode ? "flex" : "none"}>
              <InputLeftAddon color="blue.800" fontWeight="medium">
                Nullifier
              </InputLeftAddon>
              <Input
                ref={nullRef}
                id="nullifier"
                name="nullifier"
                type={advancedMode ? "number" : "hidden"}
                onChange={() => () => setOpeningError("")}
              />
            </InputGroup>
          </VStack>
          <FormErrorMessage>{openingError}</FormErrorMessage>
        </FormControl>
        <Button colorScheme="yellow" type="submit" isLoading={isPending}>
          Open Commitment
        </Button>
      </VStack>
    </form>
  );
}
