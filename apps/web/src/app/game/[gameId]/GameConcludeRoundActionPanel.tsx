"use client";

// 3rd-parties components
import { useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Button, HStack, Text } from "@chakra-ui/react";

// Components defined in this repo
import { useGameContractConfig, useSleepAndGotoURL } from "@/hooks";
import { type GameView } from "@/types";

export default function GameConcludeRoundActionPanel({
  gameId,
  game,
}: {
  gameId: number;
  game: GameView;
}) {
  const { address: userAccount } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const contractCfg = useGameContractConfig();
  const sleepAndGotoURL = useSleepAndGotoURL();

  const endRoundHandler = useCallback(() => {
    const endRound = async () => {
      await writeContractAsync({
        ...contractCfg,
        functionName: "concludeRound",
        args: [gameId],
      });

      sleepAndGotoURL();
    };

    endRound();
  }, [contractCfg, gameId, writeContractAsync, sleepAndGotoURL]);

  const isGameHost = !!userAccount && game.players[0] === userAccount;

  return (
    <HStack>
      {!isGameHost ? (
        <Text>Waiting for game host to end round...</Text>
      ) : (
        <Button
          onClick={endRoundHandler}
          variant="solid"
          colorScheme="yellow"
          isLoading={isPending}
        >
          Conclude Round
        </Button>
      )}
    </HStack>
  );
}
