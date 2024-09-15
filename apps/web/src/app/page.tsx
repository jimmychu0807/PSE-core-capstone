"use client";

// 3rd-parties components
import { useCallback, useEffect, useState } from "react";
import { useConfig, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract } from "@wagmi/core";
import { Button, Heading, VStack, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

// Components defined in this repo
import { useGameContractConfig } from "@/hooks";
import { GameCard } from "@/components";
import { zeroToNArr } from "@/utils";

export default function HomePage() {
  const wagmiConfig = useConfig();
  const contractCfg = useGameContractConfig();
  const router = useRouter();
  const [nextGameId, setNextGameId] = useState(0);
  const [newGameHandling, setNewGameHandling] = useState(false);

  const { data: txHash, isPending, writeContract } = useWriteContract();
  const { data: txReceipt } = useWaitForTransactionReceipt({ hash: txHash });

  /**
   * Handlers
   **/
  const newGameHandler = useCallback(() => {
    writeContract({
      ...contractCfg,
      functionName: "newGame",
      args: [],
    });
    setNewGameHandling(true);
  }, [writeContract, contractCfg]);

  useEffect(() => {
    let setState = true;
    if (newGameHandling && txReceipt && setState) {
      setNewGameHandling(false);
      router.push(`/game/${nextGameId}`);
    }

    return () => {
      setState = false;
    };
  }, [newGameHandling, txReceipt, router, nextGameId]);

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
      <Stack direction="column" spacing={8}>
        {zeroToNArr(nextGameId).map((idx: number) => (
          <GameCard key={`game-${idx}`} gameId={idx} />
        ))}
      </Stack>
      <Button
        colorScheme="yellow"
        size="lg"
        width="10em"
        isLoading={isPending}
        onClick={newGameHandler}
      >
        New Game
      </Button>
    </VStack>
  );
}
