"use client";

// 3rd-parties components
import { useState, useEffect } from "react";
import { useConfig, useAccount } from "wagmi";
import { readContract, readContracts } from "@wagmi/core";
import {
  Badge,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { type Address } from "viem";

// Components defined in this repo
import { useGameContractConfig } from "@/hooks";
import { formatter } from "@/utils";
import { type GameView , type SubNullHash, GameState } from "@/types";

import GameInitiatedActionPanel from "./GameInitiatedActionPanel";
import SubmitCommitmentActionPanel from "./SubmitCommitmentActionPanel";
import OpenCommitmentActionPanel from "./OpenCommitmentActionPanel";

type GamePageProps = {
  params: {
    gameId: number;
  };
};

export default function GamePage(pageProps: GamePageProps) {
  const { gameId } = pageProps.params;
  const wagmiConfig = useConfig();
  const contractCfg = useGameContractConfig();
  const { address: userAccount } = useAccount();
  const [game, setGame] = useState<GameView | undefined>(undefined);
  const [playerCommitments, setPlayerCommitments] = useState<Record<Address, SubNullHash>>({});
  const [playerOpenings, setPlayerOpenings] = useState<Record<Address, number>>({});

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

  // Reading player commitments && openings
  useEffect(() => {
    let setState = true;

    const getPlayerCommitments = async () => {
      const result = await readContracts(wagmiConfig, {
        // @ts-ignore
        contracts: game?.players?.map((p) => ({
          ...contractCfg,
          functionName: "getPlayerCommitment",
          args: [gameId, game?.currentRound, p],
        })),
      });

      const commitments = game?.players?.reduce((memo, p, idx) => {
        memo[p] = result?.[idx]?.["result"] as SubNullHash;
        return memo;
      }, {} as Record<Address, SubNullHash>);

      setState && commitments && setPlayerCommitments(commitments);
    };

    const getPlayerOpenings = async () => {
      const result = await readContracts(wagmiConfig, {
        // @ts-ignore
        contracts: game?.players?.map((p) => ({
          ...contractCfg,
          functionName: "getPlayerOpening",
          args: [gameId, game?.currentRound, p],
        })),
      });

      const openings = game?.players?.reduce((memo, p, idx) => {
        memo[p] = result?.[idx]?.["result"] as number;
        return memo;
      }, {} as Record<Address, number>);

      setState && openings && setPlayerOpenings(openings);
    };

    game && Number(game.state) === GameState.RoundCommit && getPlayerCommitments();
    game && Number(game.state) === GameState.RoundOpen && getPlayerOpenings();

    return () => {
      setState = false;
    };
  }, [gameId, game, contractCfg, wagmiConfig]);

  if (!game) return <></>;

  const gameState = Number(game.state);

  return (
    <VStack spacing={3}>
      <Text>
        Game ID: <strong>{gameId}</strong>
      </Text>
      <Text>Joined players: {game.players.length}</Text>
      <UnorderedList styleType="'- '">
        {game.players.map((p) => (
          <ListItem key={`game-${gameId}-${p}`} fontSize={14}>
            {p}
          </ListItem>
        ))}
      </UnorderedList>

      <VStack spacing={3} border="1px" borderColor="gray.200" borderRadius="8" p={4}>
        <Text>
          State:&nbsp;
          <strong>{formatter.gameState(gameState, game.currentRound)}</strong>
        </Text>
        {(gameState === GameState.RoundCommit || gameState === GameState.RoundOpen) && (
          <>
            <Text fontSize="md">
              {gameState === GameState.RoundCommit ? "Commitment" : "Opening"} Status:
            </Text>
            <UnorderedList styleType="''">
              {game.players.map((p) => (
                <ListItem key={`${gameId}-${game.currentRound}-${p}`} fontSize={14}>
                  {p}&nbsp;
                  {((gameState === GameState.RoundCommit && !!playerCommitments?.[p]?.submission) ||
                    (gameState === GameState.RoundOpen && !!playerOpenings?.[p])) && (
                    <Badge variant="outline" colorScheme="yellow">
                      <CheckIcon boxSize={2} />
                    </Badge>
                  )}
                </ListItem>
              ))}
            </UnorderedList>
          </>
        )}
      </VStack>

      <Text>Last Updated: {formatter.dateTime(Number(game.lastUpdate))}</Text>
      {gameState === GameState.GameInitiated && (
        <GameInitiatedActionPanel gameId={gameId} game={game} />
      )}
      {gameState === GameState.RoundCommit && (
        <SubmitCommitmentActionPanel
          gameId={gameId}
          game={game}
          hasSubmitted={
            !!userAccount &&
            !!playerCommitments?.[userAccount]?.submission &&
            playerCommitments?.[userAccount]?.submission !== "0"
          }
        />
      )}
      {gameState === GameState.RoundOpen && (
        <OpenCommitmentActionPanel
          gameId={gameId}
          game={game}
          hasOpened={
            !!userAccount &&
            !!playerOpenings?.[userAccount] &&
            (playerOpenings?.[userAccount] as number) > 0
          }
        />
      )}
    </VStack>
  );
}
