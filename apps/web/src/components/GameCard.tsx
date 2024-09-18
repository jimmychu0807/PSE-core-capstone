"use client";

// 3rd-parties components
import { useCallback, useState, useEffect } from "react";
import { useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract } from "@wagmi/core";
import NextLink from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  Text,
  UnorderedList,
  ListItem,
  CardFooter,
  Button,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";

// Components defined in this repo
import { useGameContractConfig, useSleepAndGotoURL } from "@/hooks";
import { GameState, type GameView } from "@/config";
import { formatter } from "@/utils";

type GameCardProps = {
  gameId: number;
};

export default function GameCard({ gameId }: GameCardProps) {
  const wagmiConfig = useConfig();
  const sleepAndGotoURL = useSleepAndGotoURL();
  const contractCfg = useGameContractConfig();
  const { writeContractAsync, isPending } = useWriteContract();
  const { address: userAccount } = useAccount();
  const [game, setGame] = useState<GameView | undefined>(undefined);

  /**
   * event handlers
   **/
  const joinGameHandler = useCallback(() => {
    let setState = true;
    const joinGame = async () => {
      await writeContractAsync({
        ...contractCfg,
        functionName: "joinGame",
        args: [gameId],
      });

      setState && sleepAndGotoURL(2, `/game/${gameId}`);
    };

    joinGame();
    return () => {
      setState = false;
    };
  }, [writeContractAsync, contractCfg, gameId, sleepAndGotoURL]);

  /**
   * call on-chain `getGame()` on page load
   **/
  useEffect(() => {
    // this is a good practice as unsubscription
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

  if (!game || !userAccount) {
    return <></>;
  }

  const userJoinedGame = game.players.includes(userAccount);
  const gameState = Number(game.state);

  return (
    <Card w={500}>
      <LinkBox>
        <CardHeader>
          <LinkOverlay as={NextLink} href={`/game/${gameId}`}>
            <strong>Game ID: {gameId}</strong>
          </LinkOverlay>
        </CardHeader>

        <CardBody>
          <Text>Players: {game.players.length}</Text>
          <UnorderedList styleType="'- '">
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
          <Text>Last Updated: {formatter.dateTime(Number(game.lastUpdate))}</Text>
        </CardBody>
      </LinkBox>
      <CardFooter justifyContent="center">
        {gameState === GameState.GameInitiated && (
          <Button
            onClick={joinGameHandler}
            variant="solid"
            colorScheme="yellow"
            isDisabled={userJoinedGame}
            isLoading={isPending}
          >
            {userJoinedGame ? "Already Joined" : "Join Game"}
          </Button>
        )}
        {gameState >= GameState.RoundCommit && gameState <= GameState.RoundEnd && (
          <Text>Game in Progress...</Text>
        )}
        {gameState >= GameState.GameEnd && <Text>Game Ended</Text>}
      </CardFooter>
    </Card>
  );
}
