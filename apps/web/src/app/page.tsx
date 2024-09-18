"use client";

// 3rd-parties components
import { useCallback, useEffect, useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { readContract } from "@wagmi/core";
import { Button, Heading, VStack, Stack } from "@chakra-ui/react";

// Components defined in this repo
import { useGameContractConfig, useSleepAndGotoURL } from "@/hooks";
import { GameCard } from "@/components";
import { zeroToNArr } from "@/utils";

export default function HomePage() {
  const wagmiConfig = useConfig();
  const contractCfg = useGameContractConfig();
  const sleepAndGotoURL = useSleepAndGotoURL();
  const [nextGameId, setNextGameId] = useState(0);

  const { isPending, writeContractAsync } = useWriteContract();

  /**
   * Handlers
   **/
  const newGameHandler = useCallback(() => {
    let setState = true;
    const newGame = async () => {
      await writeContractAsync({
        ...contractCfg,
        functionName: "newGame",
        args: [],
      });

      setState && sleepAndGotoURL(2, `/game/${nextGameId}`);
    };

    newGame();
    return () => {
      setState = false;
    };
  }, [writeContractAsync, contractCfg, sleepAndGotoURL, nextGameId]);

  /**
   * Get the `gameContract.nextGameId` on page load
   **/
  useEffect(() => {
    // this is a good practice as unsubscription
    let setState = true;
    const getNextGameId = async () => {
      const res = await readContract(wagmiConfig, {
        ...contractCfg,
        functionName: "nextGameId",
      });
      setState && setNextGameId(Number(res));
    };

    getNextGameId();
    return () => {
      setState = false;
    };
  }, [wagmiConfig, contractCfg, setNextGameId]);

  return (
    <VStack>
      <Heading as="h2" size="xl" textAlign="center">
        Guessing Game
      </Heading>
      <Button
        colorScheme="yellow"
        size="lg"
        m={4}
        width="8em"
        isLoading={isPending}
        onClick={newGameHandler}
      >
        New Game
      </Button>
      <Stack direction="column" spacing={8}>
        {zeroToNArr(nextGameId).map((idx: number) => (
          <GameCard key={`game-${idx}`} gameId={idx} />
        ))}
      </Stack>
    </VStack>
  );
}
