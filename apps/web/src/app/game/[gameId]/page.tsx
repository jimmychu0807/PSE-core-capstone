"use client";

// 3rd-parties components
import { useCallback, useState, useEffect } from "react";
import { useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract } from "@wagmi/core";
import { VStack, UnorderedList, ListItem, HStack, Button, Text } from "@chakra-ui/react";

// Components defined in this repo
import { useGameContractConfig } from "@/hooks";
import { type GameView, MIN_PLAYERS_TO_START, GameState } from "@/config";
import { formatter } from "@/utils";

type GamePageProps = {
  params: {
    gameId: number;
  };
};

export default function GamePage(pageProps: GamePageProps) {
  const { gameId } = pageProps.params;
  const wagmiConfig = useConfig();
  const contractCfg = useGameContractConfig();
  const [game, setGame] = useState<GameView | undefined>(undefined);

  /**
   * call on-chain `getGame()` on page load
   **/
  useEffect(() => {
    let setState = true;
    const getGame = async () => {
      const res = await readContract(wagmiConfig, {
        ...contractCfg,
        functionName: "getGame",
        args: [gameId],
      });
      setState && setGame(res as GameView);
    };

    getGame();
    return () => {
      setState = false;
    };
  }, [wagmiConfig, contractCfg, setGame, gameId]);

  if (!game) return <></>;

  const gameState = Number(game.state);

  return (
    <VStack spacing={3}>
      <Text>
        Game ID: <strong>{gameId}</strong>
      </Text>
      <Text>Joined players: {game.players.length}</Text>
      <UnorderedList styleType="- ">
        {game.players.map((p) => (
          <ListItem key={`game-${gameId}-${p}`} fontSize={14}>
            {p}
          </ListItem>
        ))}
      </UnorderedList>
      <Text>
        State:&nbsp;
        <strong>{formatter.gameState(gameState, game.currentRound)}</strong>
      </Text>
      <Text>Created: {formatter.dateTime(Number(game.startTime))}</Text>
      <Text>Last Updated: {formatter.dateTime(Number(game.lastUpdate))}</Text>
      {gameState === GameState.GameInitiated && (
        <GameInitiatedActionPanel gameId={gameId} game={game} />
      )}
      {gameState === GameState.RoundCommit && (
        <SubmitCommitmentActionPanel gameId={gameId} game={game} />
      )}
    </VStack>
  );
}

function SubmitCommitmentActionPanel({ gameId, game }: { gameId: number; game: GameView }) {
  return <></>;
}

function GameInitiatedActionPanel({ gameId, game }: { gameId: number; game: GameView }) {
  const { address: userAccount } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const contractCfg = useGameContractConfig();

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
    };

    startGame();
  }, [contractCfg, gameId, writeContractAsync]);

  const joinGameHandler = useCallback(() => {
    const joinGame = async () => {
      await writeContractAsync({
        ...contractCfg,
        functionName: "joinGame",
        args: [gameId],
      });
    };

    joinGame();
  }, [contractCfg, gameId, writeContractAsync]);

  if (!userAccount) return <></>;

  const canStartGame: boolean = game.players.length >= MIN_PLAYERS_TO_START;
  const userJoinedGame = game.players.includes(userAccount);
  const isGameHost = userAccount === game.players[0];

  return (
    <HStack>
      {/*The order of the elements matter */}
      {!userJoinedGame && (
        <Button
          onClick={joinGameHandler}
          variant="outline"
          colorScheme="blue"
          isLoading={isPending}
        >
          Join Game
        </Button>
      )}
      {userJoinedGame && !canStartGame && (
        <Text>Waiting for more players to join (mininum 3 to start)</Text>
      )}
      {userJoinedGame && canStartGame && !isGameHost && (
        <Text>Waiting for game host to start game</Text>
      )}
      {canStartGame && isGameHost && (
        <Button
          onClick={startGameHandler}
          variant="outline"
          colorScheme="blue"
          isLoading={isPending}
        >
          Start Game
        </Button>
      )}
    </HStack>
  );
}
