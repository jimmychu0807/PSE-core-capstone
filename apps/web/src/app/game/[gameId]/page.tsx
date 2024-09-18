"use client";

// 3rd-parties components
import { useState, useEffect } from "react";
import { useConfig, useAccount } from "wagmi";
import { readContract, readContracts } from "@wagmi/core";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
  ListItem,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { type Address } from "viem";

// Components defined in this repo
import { useGameContractConfig } from "@/hooks";
import { formatter } from "@/utils";
import { type GameView, type SubNullHash, GameState } from "@/types";

import GameInitiatedActionPanel from "./GameInitiatedActionPanel";
import SubmitCommitmentActionPanel from "./SubmitCommitmentActionPanel";
import OpenCommitmentActionPanel from "./OpenCommitmentActionPanel";
import GameConcludeRoundActionPanel from "./GameConcludeRoundActionPanel";

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

  // Reading in-depth game info: commitments, openings, playerRoundsWon
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
  const userJoinedGame: boolean = game.players.includes(userAccount);

  return (
    <VStack spacing={3}>
      <Text>
        Game ID: <strong>{gameId}</strong>
      </Text>
      <Text>Joined players: {game.players.length}</Text>
      <PlayerListWithRoundResult gameId={gameId} game={game} />
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

      {gameState === GameState.GameEnd ? (
        <Text>Game Ended: {formatter.dateTime(Number(game.endTime))}</Text>
      ) : (
        <Text>Last Updated: {formatter.dateTime(Number(game.lastUpdate))}</Text>
      )}

      {gameState === GameState.GameEnd && (
        <VStack>
          <Alert status="success" borderRadius="lg" variant="solid">
            <AlertIcon>
              <span role="img" aria-label="info">
                👑
              </span>
            </AlertIcon>
            <AlertTitle>Winner: {game.winner}</AlertTitle>
          </Alert>
        </VStack>
      )}

      {gameState === GameState.GameInitiated && (
        <GameInitiatedActionPanel gameId={gameId} game={game} />
      )}

      {/* For non-players sitting in the game */}
      {gameState > GameState.GameInitiated && gameState < GameState.GameEnd && !userJoinedGame && (
        <Text>Game in Progress...</Text>
      )}

      {gameState === GameState.RoundCommit && userJoinedGame && (
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

      {gameState === GameState.RoundOpen && userJoinedGame && (
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

      {gameState === GameState.RoundEnd && userJoinedGame && (
        <GameConcludeRoundActionPanel gameId={gameId} game={game} />
      )}
    </VStack>
  );
}

function PlayerListWithRoundResult({ gameId, game }: { gameId: number; game: GameView }) {
  const wagmiConfig = useConfig();
  const contractCfg = useGameContractConfig();
  const [wonOpenings, setWonOpenings] = useState<Array<number>>([]);

  useEffect(() => {
    let setState = true;

    const getWonOpenings = async () => {
      const res = await readContracts(wagmiConfig, {
        contracts: game.roundWinners.map((winner, idx) => ({
          ...contractCfg,
          functionName: "getPlayerOpening",
          args: [gameId, idx, winner],
        })),
      });

      const wo = res.reduce((memo, r) => {
        memo.push(r.result);
        return memo;
      }, []);
      setState && setWonOpenings(wo);
    };

    getWonOpenings();
    return () => {
      setState = false;
    };
  }, [gameId, game, contractCfg, wagmiConfig]);

  return (
    <>
      <UnorderedList styleType="''">
        {game.players.map((p) => (
          <ListItem key={`${gameId}-${p}`} fontSize={14}>
            {p}&nbsp;
            {formatter.repeatStrNTimes("🏅", game.roundWinners.filter((w) => w === p).length)}
          </ListItem>
        ))}
      </UnorderedList>
      {game.roundWinners.length > 0 && (
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Round</Th>
                <Th>Winner</Th>
                <Th>Submission</Th>
              </Tr>
            </Thead>
            <Tbody>
              {game.roundWinners.map((winner, idx) => (
                <Tr key={`row-${winner}`}>
                  <Td>{idx + 1}</Td>
                  <Td>{winner}</Td>
                  <Td isNumeric>{wonOpenings[idx]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
