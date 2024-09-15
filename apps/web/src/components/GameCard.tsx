"use client";

// 3rd-parties components
import { useCallback, useState, useEffect } from "react";
import { useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract } from "@wagmi/core";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
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
import { useGameContractConfig } from "@/hooks";
import { GameState, type GameView } from "@/config";
import { formatter } from "@/utils";

type GameCardProps = {
  gameId: number;
};

export default function GameCard({ gameId }: GameCardProps) {
  const wagmiConfig = useConfig();
  const router = useRouter();
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
      const res = await writeContractAsync({
        ...contractCfg,
        functionName: "joinGame",
        args: [gameId],
      });

      if (setState) {
        console.log("res", res);
        router.push(`/game/${gameId}`);
      }
    };

    joinGame();
    return () => {
      setState = false;
    };
  }, [writeContractAsync, contractCfg, gameId, router]);

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
          <UnorderedList styleType="- ">
            {game.players.map((p) => (
              <ListItem key={`game-${gameId}-${p}`} fontSize={14}>
                {p}
              </ListItem>
            ))}
          </UnorderedList>
          <Text>
            State: <strong>{GameState[Number(game.state)]}</strong>
          </Text>
          <Text>Created: {formatter.dateTime(Number(game.startTime))}</Text>
          <Text>Last Updated: {formatter.dateTime(Number(game.lastUpdate))}</Text>
        </CardBody>
      </LinkBox>
      <CardFooter justifyContent="center">
        {Number(game.state) === GameState.GameInitiated && (
          <Button
            onClick={joinGameHandler}
            variant="outline"
            colorScheme="blue"
            isDisabled={userJoinedGame}
            isLoading={isPending}
          >
            {userJoinedGame ? "Already Joined" : "Join Game"}
          </Button>
        )}
        {game.state >= GameState.RoundCommit && game.state <= GameState.RoundEnd && (
          <Text>Game in Progress...</Text>
        )}
        {game.state >= GameState.GameEnd && <Text>Game Ended</Text>}
      </CardFooter>
    </Card>
  );
}
