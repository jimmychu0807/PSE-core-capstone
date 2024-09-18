"use client";

// 3rd-parties components
import { useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Button, HStack, Text } from "@chakra-ui/react";

// Components defined in this repo
import { useGameContractConfig, useSleepAndGotoURL } from "@/hooks";
import { GameConfig } from "@/config";
import { type GameView } from "@/types";

export default function GameInitiatedActionPanel({
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

  /**
   * event handlers
   **/
  const startGameHandler = useCallback(() => {
    const startGame = async () => {
      await writeContractAsync({
        ...contractCfg,
        functionName: "startGame",
        args: [gameId],
      });

      sleepAndGotoURL();
    };

    startGame();
  }, [contractCfg, gameId, writeContractAsync, sleepAndGotoURL]);

  const joinGameHandler = useCallback(() => {
    const joinGame = async () => {
      await writeContractAsync({
        ...contractCfg,
        functionName: "joinGame",
        args: [gameId],
      });

      sleepAndGotoURL();
    };

    joinGame();
  }, [contractCfg, gameId, writeContractAsync, sleepAndGotoURL]);

  if (!userAccount) return <></>;

  const canStartGame: boolean = game.players.length >= GameConfig.MIN_PLAYERS_TO_START;
  const userJoinedGame = game.players.includes(userAccount);
  const isGameHost = game.players[0] === userAccount;

  return (
    <HStack>
      {/*The order of the elements matter */}
      {!userJoinedGame && (
        <Button
          onClick={joinGameHandler}
          variant="solid"
          colorScheme="yellow"
          isLoading={isPending}
        >
          Join Game
        </Button>
      )}
      {userJoinedGame && !canStartGame && (
        <Text>
          Waiting for more players to join (mininum&nbsp;
          {GameConfig.MIN_PLAYERS_TO_START}&nbsp; players to start)
        </Text>
      )}
      {userJoinedGame && canStartGame && !isGameHost && (
        <Text>Waiting for game host to start game</Text>
      )}
      {canStartGame && isGameHost && (
        <Button
          onClick={startGameHandler}
          variant="solid"
          colorScheme="yellow"
          isLoading={isPending}
        >
          Start Game
        </Button>
      )}
    </HStack>
  );
}
