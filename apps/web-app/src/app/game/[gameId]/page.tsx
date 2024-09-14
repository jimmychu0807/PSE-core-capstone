"use client";

import { Stack, HStack, VStack, Text, UnorderedList, ListItem, Button } from "@chakra-ui/react";

import { Box } from "@chakra-ui/react";
import { useConfig } from "wagmi";
import { readContracts, writeContract } from "@wagmi/core";
import { useEffect, useState, useMemo, useCallback } from "react";

import { formatter } from "@/utils";
import { gameArtifact, GameState, gameEventTypes, MIN_PLAYERS_TO_START } from "@/consts";

export default function GamePage({ params }: { params: { gameId: number } }) {
  const { gameId } = params;
  const { abi, deployedAddress } = gameArtifact;

  const wagmiConfig = useConfig();
  const contractCfg = useMemo(() => ({ abi, address: deployedAddress }), [abi, deployedAddress]);
  const [game, setGame] = useState(undefined);

  useEffect(() => {
    let setState = true;

    async function getGame(gameId: number) {
      const contracts = [
        {
          ...contractCfg,
          functionName: "getGame",
          args: [gameId],
        },
      ];

      const results = await readContracts(wagmiConfig, { contracts });
      setState && setGame(results[0].result);
    }
    getGame(gameId);

    return () => {
      setState = false;
    };
  }, [contractCfg, gameId, wagmiConfig]);

  // can you use async function inside useCallback?
  const startGameHandler = useCallback(async () => {
    const result = await writeContract(wagmiConfig, {
      ...contractCfg,
      functionName: "startGame",
      args: [gameId],
    });
  }, [contractCfg, gameId, wagmiConfig]);

  if (!game) {
    return <></>;
  } else {
    const canStartGame = game.players.length >= MIN_PLAYERS_TO_START;
    return (
      <VStack spacing={3}>
        <Text>
          Game ID: <strong>{gameId}</strong>
        </Text>
        <Text>Players: {game.players.length}</Text>
        <UnorderedList styleType="- ">
          {game.players.map((p) => (
            <ListItem key={`game-${gameId}-${p}`} fontSize={14}>
              {p}
            </ListItem>
          ))}
        </UnorderedList>
        <Text>
          State: <strong>{GameState[game.state]}</strong>
        </Text>
        <Text>Created: {formatter.dateTime(game.startTime)}</Text>
        <Text>Last Updated: {formatter.dateTime(game.lastUpdate)}</Text>
        <HStack>
          {game.state === GameState.GameInitiated && (
            <Button
              onClick={startGameHandler}
              variant="outline"
              colorScheme="blue"
              isDisabled={!canStartGame}
            >
              {canStartGame ? "Start Game" : "Waiting for more players to join"}
            </Button>
          )}
        </HStack>
      </VStack>
    );
  }
}
