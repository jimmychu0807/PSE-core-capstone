"use client";

import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  VStack,
  Stack,
  Link,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useWalletInfo, useWeb3ModalState } from "@web3modal/wagmi/react";
import {
  useAccount,
  useConfig,
  useWalletClient,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { readContracts } from "@wagmi/core";
import { parseEventLogs } from "viem";
import { useQueryClient } from "@tanstack/react-query";

import Stepper from "../components/Stepper";
import { zeroToNArr, formatter } from "../utils";
import { gameArtifact, GameState, gameEventTypes } from "../helpers";

export default function HomePage() {
  const { abi, deployedAddress } = gameArtifact;
  const contractCfg = { abi, address: deployedAddress };

  const wagmiConfig = useConfig();
  const { data: wc } = useWalletClient();
  const queryClient = useQueryClient();
  const { address: userAddr } = useAccount();

  const [games, setGames] = useState([]);
  const [newGameClicked, setNewGameClicked] = useState(false);

  const { data: txHash, isPending, writeContract } = useWriteContract();
  const { data: txReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const {
    data: nextGameId,
    error,
    isPending: nextGameIdPending,
    queryKey: nextGameIdQK,
  } = useReadContract({
    ...contractCfg,
    functionName: "nextGameId",
  });

  const newGameHandler = useCallback(() => {
    writeContract({
      ...contractCfg,
      functionName: "newGame",
      args: [],
    });

    setNewGameClicked(true);
  }, [writeContract]);

  // listen for the nextGameId
  useEffect(() => {
    let setState = true;

    if (nextGameId === undefined || wc === undefined) return;

    const readAllGames = async (nextGameId: number) => {
      if (nextGameId === 0 && setState) {
        setGames([]);
      }

      const contracts = [
        ...zeroToNArr(nextGameId).map((i) => ({
          ...contractCfg,
          functionName: "getGame",
          args: [i],
        })),
      ];

      const result = await readContracts(wagmiConfig, { contracts });

      if (setState) {
        const games = result.map((r) => r.result);
        setGames(games);
      }
    };
    readAllGames(nextGameId);

    return () => {
      setState = false;
    };
  }, [nextGameId, wc]);

  // listen for a newGame is finished created in the smart contract
  useEffect(() => {
    let setState = true;
    if (newGameClicked && txReceipt) {
      const evLogs = parseEventLogs({
        abi,
        eventName: gameEventTypes.newGame,
        logs: txReceipt.logs,
      });

      if (setState) {
        setNewGameClicked(false);
        queryClient.invalidateQueries({ queryKey: nextGameIdQK });
        // navigate(`/game/${roundId}`);
      }
    }

    return () => {
      setState = false;
    };
  }, [newGameClicked, txReceipt, abi]);

  return (
    <VStack>
      <Heading as="h2" size="xl" textAlign="center">
        Guessing Game
      </Heading>
      <Stack direction="column" spacing={8}>
        {games.map((game, idx) => (
          <GameCard key={"game-${idx}"} id={idx} game={game} />
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

function GameCard({ id, game }) {
  return (
    <Card w={500}>
      <CardHeader>Game ID: {id}</CardHeader>
      <CardBody>
        <Text># of Players: {game.players.join(", ")}</Text>
        <Text>
          State: <strong>{GameState[game.state]}</strong>
        </Text>
        <Text>Created: {formatter.dateTime(game.startTime)}</Text>
      </CardBody>
      <CardFooter justifyContent="center">
        {game.state === GameState.GameInitiated && (
          <Button variant="outline" colorScheme="blue">
            Join Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/*
export function IdentitiesPage() {
  const router = useRouter();
  const { setLog } = useLogContext();
  const [_identity, setIdentity] = useState<Identity>();

  useEffect(() => {
    const privateKey = localStorage.getItem("identity");

    if (privateKey) {
      const identity = Identity.import(privateKey);

      setIdentity(identity);

      setLog("Your Semaphore identity has been retrieved from the browser cache 👌🏽");
    } else {
      setLog("Create your Semaphore identity 👆🏽");
    }
  }, [setLog]);

  const createIdentity = useCallback(async () => {
    const identity = new Identity();

    setIdentity(identity);

    localStorage.setItem("identity", identity.export());

    setLog("Your new Semaphore identity has just been created 🎉");
  }, [setLog]);

  return (
    <>
      <Heading as="h2" size="xl">
        Identities
      </Heading>

      <Text pt="2" fontSize="md">
        The identity of a user in the Semaphore protocol. A{" "}
        <Link href="https://docs.semaphore.pse.dev/guides/identities" isExternal>
          Semaphore identity
        </Link>{" "}
        consists of an{" "}
        <Link
          href="https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon"
          isExternal
        >
          EdDSA
        </Link>{" "}
        public/private key pair and a commitment, used as the public identifier of the identity.
      </Text>

      <Divider pt="5" borderColor="gray.500" />

      <HStack py="5">
        <Text fontWeight="bold" fontSize="lg">
          Identity
        </Text>
      </HStack>

      {_identity && (
        <Box pb="6" pl="2">
          <Text>
            <b>Private Key (base64)</b>:<br /> {_identity.export()}
          </Text>
          <Text>
            <b>Public Key</b>:<br /> [{_identity.publicKey[0].toString()}, {_identity.publicKey[1].toString()}]
          </Text>
          <Text>
            <b>Commitment</b>:<br /> {_identity.commitment.toString()}
          </Text>
        </Box>
      )}

      <Box pb="5">
        <Button w="full" colorScheme="primary" onClick={createIdentity}>
          Create identity
        </Button>
      </Box>

      <Divider pt="3" borderColor="gray.500" />

      <Stepper step={1} onNextClick={_identity && (() => router.push("/group"))} />
    </>
  );
}
*/
