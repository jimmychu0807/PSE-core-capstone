"use client";

import { Stack, HStack, VStack, Text } from "@chakra-ui/react";

import { Box } from "@chakra-ui/react";
import { useConfig } from "wagmi";
import { readContracts } from "@wagmi/core";
import { useEffect, useState, useMemo } from "react";

import { formatter } from "@/utils";
import { gameArtifact, GameState, gameEventTypes } from "@/helpers";

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
      setGame(results[0].result);
    }

    getGame(gameId);

    return () => {
      setState = false;
    };
  }, [contractCfg, gameId, wagmiConfig]);

  return (
    game && (
      <VStack spacing={3}>
        <Text>
          Game ID: <strong>{gameId}</strong>
        </Text>
        <Text>Players: {game.players.length}</Text>
        <Text>
          State: <strong>{GameState[game.state]}</strong>
        </Text>
        <Text>Created: {formatter.dateTime(game.startTime)}</Text>
        <Text>Last Updated: {formatter.dateTime(game.lastUpdate)}</Text>
      </VStack>
    )
  );
}
