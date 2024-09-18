"use client";

// 3rd-parties components
import { type FormEvent, useCallback, useState, useEffect } from "react";
import { useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, readContracts } from "@wagmi/core";
import {
  Badge,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { useLocalStorage } from "@uidotdev/usehooks";
import { type Address } from "viem";

// Components defined in this repo
import { useGameContractConfig, useSleepAndGotoURL } from "@/hooks";
import { useLogContext } from "@/context";
import { type GameView, GameConfig, GameState } from "@/config";
import { formatter } from "@/utils";
import { getRandomNullifier, generateFullProof } from "@/utils/proof";

type GamePageProps = {
  params: {
    gameId: number;
  };
};

type SubNullHash = {
  submission: string;
  nullifier: string;
};

type SubNullLocalStorage = {
  submission: number;
  nullifier: string;
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

function OpenCommitmentActionPanel({
  gameId,
  game,
  hasOpened,
}: {
  gameId: number;
  game: GameView;
  hasOpened: boolean;
}) {
  const advancedMode = false;
  const { address: userAccount } = useAccount();
  const [subNull] = useLocalStorage<SubNullLocalStorage>(
    `subNull-${gameId}-${game.currentRound}-${userAccount}`,
    undefined
  );

  const openCommitment = useCallback(async (ev: FormEvent) => {
    ev.preventDefault();
    const formData = new FormData(ev.target as HTMLFormElement);
    const formValues = Object.fromEntries(formData.entries());

    console.log("openCommitment", formValues);
  }, []);

  return hasOpened ? (
    <Button variant="outline" colorScheme="yellow" isDisabled={true}>
      Waiting for other players to open...
    </Button>
  ) : (
    <form onSubmit={openCommitment}>
      <VStack spacing={3} border="1px" borderColor="gray.200" borderRadius="8" p={4}>
        <FormControl>
          <FormLabel>Open Commitment</FormLabel>

          <InputGroup display={advancedMode ? "block" : "none"}>
            <InputLeftAddon>Commitment</InputLeftAddon>
            <Input
              id="submission"
              name="submission"
              type={advancedMode ? "number" : "hidden"}
              value={subNull?.["submission"]}
            />
          </InputGroup>

          <InputGroup display={advancedMode ? "block" : "none"}>
            <InputLeftAddon>Nullifier</InputLeftAddon>
            <Input
              id="nullifier"
              name="nullifier"
              type={advancedMode ? "number" : "hidden"}
              value={subNull?.["nullifier"]}
            />
          </InputGroup>
        </FormControl>
        <Button display="block" margin="0.5em auto" mt={4} colorScheme="yellow" type="submit">
          Open Commitment
        </Button>
      </VStack>
    </form>
  );
}

function SubmitCommitmentActionPanel({
  gameId,
  game,
  hasSubmitted,
}: {
  gameId: number;
  game: GameView;
  hasSubmitted: boolean;
}) {
  const { address: userAccount } = useAccount();
  const { setLog } = useLogContext();
  const [, saveSubNull] = useLocalStorage<SubNullLocalStorage>(
    `subNull-${gameId}-${game.currentRound}-${userAccount}`,
    undefined
  );
  const [submissionError, setSubmissionError] = useState("");
  const contractCfg = useGameContractConfig();
  const sleepAndGotoURL = useSleepAndGotoURL();
  const { writeContractAsync, isPending } = useWriteContract();

  const submitCommitment = useCallback(
    async (ev: FormEvent) => {
      ev.preventDefault();
      const formData = new FormData(ev.target as HTMLFormElement);
      const formValues = Object.fromEntries(formData.entries());

      if (!formValues["submission"]) return setSubmissionError(`Please enter a value.`);

      const submission = Number.parseInt(formValues["submission"].toString(), 10);
      if (submission < GameConfig.MIN_NUM || submission > GameConfig.MAX_NUM) {
        return setSubmissionError(
          `Submission must be between ${GameConfig.MIN_NUM} to ${GameConfig.MAX_NUM}.`
        );
      }

      // Value validated, generate a large integer
      const nullifier = getRandomNullifier();
      const fullProof = await generateFullProof("CommitmentProof", submission, nullifier);

      await writeContractAsync({
        ...contractCfg,
        functionName: "submitCommitment",
        args: [gameId, fullProof.proof, fullProof.publicSignals],
      });

      setLog(`Committed submission: ${submission}, with nullifier: ${nullifier}`);
      saveSubNull({ submission, nullifier });
      sleepAndGotoURL();
    },
    [
      gameId,
      contractCfg,
      setSubmissionError,
      writeContractAsync,
      setLog,
      saveSubNull,
      sleepAndGotoURL,
    ]
  );

  const userJoinedGame = userAccount && game.players.includes(userAccount);

  if (!userAccount || !userJoinedGame) return <></>;

  return hasSubmitted ? (
    <Button variant="outline" colorScheme="yellow" isDisabled={true}>
      Waiting for other players to commit...
    </Button>
  ) : (
    <form onSubmit={submitCommitment}>
      <VStack spacing={3} border="1px" borderColor="gray.200" borderRadius="8" p={4}>
        <FormControl isInvalid={!!submissionError}>
          <FormLabel>
            Submit a commitment ({GameConfig.MIN_NUM} to {GameConfig.MAX_NUM})
          </FormLabel>
          <Input
            id="submission"
            name="submission"
            type="number"
            onChange={() => setSubmissionError("")}
          />
          <FormErrorMessage>{submissionError}</FormErrorMessage>
        </FormControl>
        <Button colorScheme="yellow" type="submit" isLoading={isPending}>
          Submit
        </Button>
      </VStack>
    </form>
  );
}

function GameInitiatedActionPanel({ gameId, game }: { gameId: number; game: GameView }) {
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
  const isGameHost = userAccount === game.players[0];

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
