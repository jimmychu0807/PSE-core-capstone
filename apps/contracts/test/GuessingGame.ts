import { expect } from "chai";
import hre, { run } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
const { randomInt } = require("node:crypto");

import { GameState, prove, toOnChainProof, zeroPadNBytes } from "./helpers";
// @ts-ignore: typechain folder will be generated after contracts compilation
import { GuessingGame } from "../typechain-types";

// Defining circuit base paths
const COMMITMENT_VERIFIER_BASEPATH = "./artifacts/circuits/commit-1-100";
const OPENING_VERIFIER_BASEPATH = "./artifacts/circuits/open-1-100";

describe("GuessingGame", () => {
  async function deployContractsCleanSlate() {
    const contracts = await run("deploy", { logs: false });
    const [host, bob, charlie] = await hre.ethers.getSigners();
    Object.values(contracts).map((c) => c.connect(host));

    return { contracts, players: { host, bob, charlie } };
  }

  async function deployContractsGameStarted() {
    const contracts = await run("deploy", { logs: false });
    const [host, bob, charlie, dave] = await hre.ethers.getSigners();
    Object.values(contracts).map((c) => c.connect(host));

    const { gameContract } = contracts;

    const GAME_ID = 0;
    await gameContract.newGame();
    await Promise.all([
      gameContract.connect(bob).joinGame(GAME_ID),
      gameContract.connect(charlie).joinGame(GAME_ID),
    ]);
    await gameContract.startGame(GAME_ID);

    return { contracts, players: { host, bob, charlie, dave } };
  }

  async function deployContractsRoundOpen() {
    const { contracts, players } = await deployContractsGameStarted();
    const { host, bob, charlie } = players;
    const { gameContract } = contracts;

    const GAME_ID = 0;
    const rand = randomInt(281474976710655);

    // generate proofs
    const inputs = {
      host: { in: 1, rand },
      bob: { in: 3, rand },
      charlie: { in: 5, rand },
    };

    const fullProofs = {
      host: await prove(inputs.host, COMMITMENT_VERIFIER_BASEPATH),
      bob: await prove(inputs.bob, COMMITMENT_VERIFIER_BASEPATH),
      charlie: await prove(inputs.charlie, COMMITMENT_VERIFIER_BASEPATH),
    };

    // Flatten the plonk proof to on-chain proof format
    Object.values(fullProofs).map((pproof) => {
      pproof.proof = toOnChainProof(pproof.proof);
    });

    await Promise.all([
      gameContract.submitCommitment(GAME_ID, fullProofs.host.proof, fullProofs.host.publicSignals),
      gameContract
        .connect(bob)
        .submitCommitment(GAME_ID, fullProofs.bob.proof, fullProofs.bob.publicSignals),
      gameContract
        .connect(charlie)
        .submitCommitment(GAME_ID, fullProofs.charlie.proof, fullProofs.charlie.publicSignals),
    ]);

    return { contracts, players, inputs, fullProofs };
  }

  async function deployContractsRoundEnd() {
    const { contracts, players, inputs } = await deployContractsRoundOpen();
    const { host, bob, charlie } = players;
    const { gameContract } = contracts;
    const GAME_ID = 0;

    const fullProofs = await Promise.all([
      prove(inputs.host, OPENING_VERIFIER_BASEPATH),
      prove(inputs.bob, OPENING_VERIFIER_BASEPATH),
      prove(inputs.charlie, OPENING_VERIFIER_BASEPATH),
    ]);

    await Promise.all([
      gameContract.openCommitment(
        GAME_ID,
        toOnChainProof(fullProofs[0].proof),
        fullProofs[0].publicSignals
      ),
      gameContract
        .connect(bob)
        .openCommitment(GAME_ID, toOnChainProof(fullProofs[1].proof), fullProofs[1].publicSignals),
      gameContract
        .connect(charlie)
        .openCommitment(GAME_ID, toOnChainProof(fullProofs[2].proof), fullProofs[2].publicSignals),
    ]);

    return { contracts, players, inputs };
  }

  describe("L New Game (GameState.GameInitiated)", () => {
    it("should create a new game", async () => {
      const { contracts, players } = await loadFixture(deployContractsCleanSlate);
      const { gameContract } = contracts;
      const { host } = players;

      await gameContract.newGame();

      const GAME_ID = 0;
      const game = await gameContract.getGame(GAME_ID);
      expect(game.state).to.be.equal(GameState.GameInitiated);

      const gameHost = await gameContract.getGameHost(GAME_ID);
      expect(gameHost).to.be.equal(host);
    });

    it("host can't join the game again, but other players can", async () => {
      const { contracts, players } = await loadFixture(deployContractsCleanSlate);
      const { gameContract } = contracts;
      const { host, bob } = players;

      await gameContract.newGame();

      const GAME_ID = 0;
      await expect(gameContract.joinGame(GAME_ID)).to.be.revertedWithCustomError(
        gameContract,
        "GuessingGame__PlayerAlreadyJoin"
      );

      await expect(gameContract.connect(bob).joinGame(GAME_ID))
        .to.emit(gameContract, "PlayerJoinGame")
        .withArgs(GAME_ID, bob.address);

      const game = await gameContract.getGame(GAME_ID);
      expect(game.players).to.deep.equal([host.address, bob.address]);
    });

    it("can start game by host once there are more than two players", async () => {
      const { contracts, players } = await loadFixture(deployContractsCleanSlate);
      const { gameContract } = contracts;
      const { host, bob, charlie } = players;

      await gameContract.newGame();

      const GAME_ID = 0;
      await gameContract.connect(bob).joinGame(GAME_ID);
      await expect(gameContract.startGame(GAME_ID)).to.be.revertedWithCustomError(
        gameContract,
        "GuessingGame__NotEnoughPlayers"
      );

      await gameContract.connect(charlie).joinGame(GAME_ID);
      await expect(gameContract.connect(host).startGame(GAME_ID))
        .to.emit(gameContract, "GameStarted")
        .withArgs(GAME_ID);

      const game = await gameContract.getGame(GAME_ID);
      expect(game.state).to.be.equal(GameState.RoundCommit);
    });
  });

  describe("L After a game started (GameState.RoundCommit)", () => {
    it("only players can submit a commitment, non-players cannot", async () => {
      const { contracts, players } = await loadFixture(deployContractsGameStarted);
      const { gameContract } = contracts;
      const { host, dave } = players;

      const GAME_ID = 0;
      const rand = randomInt(281474976710655);
      // generate proof
      const input = { in: 99, rand };
      const { proof, publicSignals } = await prove(input, COMMITMENT_VERIFIER_BASEPATH);

      // host can submit a commitment
      await expect(gameContract.submitCommitment(GAME_ID, toOnChainProof(proof), publicSignals))
        .to.emit(gameContract, "CommitmentSubmitted")
        .withArgs(GAME_ID, 0, host.address);

      // check the relevant game state on-chain
      const bid = await gameContract.getPlayerCommitment(GAME_ID, 0, host.address);
      expect(bid).to.deep.equal(publicSignals);

      // dave couldn't submit a commitment
      const daveGameContract = gameContract.connect(dave);
      await expect(
        daveGameContract.submitCommitment(GAME_ID, toOnChainProof(proof), publicSignals)
      ).to.be.revertedWithCustomError(gameContract, "GuessingGame__NotOneOfPlayers");
    });

    it("invalid commitment proof will be rejected", async () => {
      const { contracts, players } = await loadFixture(deployContractsGameStarted);
      const { gameContract } = contracts;
      const { host } = players;

      const GAME_ID = 0;
      const rand = randomInt(281474976710655);

      // generate a proof
      const input = { in: 99, rand };
      const { proof, publicSignals } = await prove(input, COMMITMENT_VERIFIER_BASEPATH);
      let onChainProof = toOnChainProof(proof);
      // meddle the proof
      onChainProof[0] = zeroPadNBytes(BigInt(onChainProof[0]) + BigInt(1), 32);

      // submit on-chain
      await expect(
        gameContract.submitCommitment(GAME_ID, onChainProof, publicSignals)
      ).to.be.revertedWithCustomError(gameContract, "GuessingGame__InvalidCommitmentProof");
    });

    it("when all players have submitted commitments, the game state is updated", async () => {
      const { contracts, players } = await loadFixture(deployContractsGameStarted);
      const { gameContract } = contracts;
      const { host, bob, charlie } = players;

      const GAME_ID = 0;
      const rands = [
        randomInt(281474976710655),
        randomInt(281474976710655),
        randomInt(281474976710655),
      ];

      // host generates a commitment and submit on-chain
      let input = { in: 1, rand: rands[0] };
      let { proof, publicSignals } = await prove(input, COMMITMENT_VERIFIER_BASEPATH);
      await gameContract.submitCommitment(GAME_ID, toOnChainProof(proof), publicSignals);

      // Bob's turn
      input = { in: 3, rand: rands[1] };
      ({ proof, publicSignals } = await prove(input, COMMITMENT_VERIFIER_BASEPATH));
      await gameContract
        .connect(bob)
        .submitCommitment(GAME_ID, toOnChainProof(proof), publicSignals);

      // Charlie's turn
      input = { in: 5, rand: rands[2] };
      ({ proof, publicSignals } = await prove(input, COMMITMENT_VERIFIER_BASEPATH));
      await expect(
        gameContract
          .connect(charlie)
          .submitCommitment(GAME_ID, toOnChainProof(proof), publicSignals)
      )
        .to.emit(gameContract, "GameStateUpdated")
        .withArgs(GAME_ID, GameState.RoundOpen);

      // check the game state
      const game = await gameContract.getGame(GAME_ID);
      expect(game.state).to.be.equal(GameState.RoundOpen);
    });
  });

  describe("L After all players submitted commitments (GamteState.RoundOpen)", () => {
    it("should allow player to open their commitments", async () => {
      const { contracts, players, inputs } = await loadFixture(deployContractsRoundOpen);
      const { gameContract } = contracts;
      const { host } = players;
      const GAME_ID = 0;

      const { proof, publicSignals } = await prove(inputs.host, OPENING_VERIFIER_BASEPATH);
      await expect(
        gameContract.openCommitment(GAME_ID, toOnChainProof(proof), publicSignals)
      ).to.emit(gameContract, "CommitmentOpened");

      const opening = await gameContract.getPlayerOpening(GAME_ID, 0, host.address);
      expect(opening).to.be.equal(inputs.host.in);
    });

    it("shouldn't allow players to meddling with the commitment", async () => {
      const { contracts, players, inputs } = await loadFixture(deployContractsRoundOpen);
      const { gameContract } = contracts;
      const { host } = players;
      const GAME_ID = 0;

      // meddling with the public signals
      let { proof, publicSignals } = await prove(inputs.host, OPENING_VERIFIER_BASEPATH);
      publicSignals[2] = publicSignals[2] + 1;
      await expect(
        gameContract.openCommitment(GAME_ID, toOnChainProof(proof), publicSignals)
      ).to.be.revertedWithCustomError(gameContract, "GuessingGame__InvalidOpeningProof");

      // Using an entirely new input
      ({ proof, publicSignals } = await prove(
        { in: 99, rand: randomInt(281474976710655) },
        OPENING_VERIFIER_BASEPATH
      ));
      await expect(
        gameContract.openCommitment(GAME_ID, toOnChainProof(proof), publicSignals)
      ).to.be.revertedWithCustomError(gameContract, "GuessingGame__UnmatchedCommitment");
    });

    it("should allow round to end when all players open their commitments", async () => {
      const { contracts, players, inputs } = await loadFixture(deployContractsRoundOpen);
      const { gameContract } = contracts;
      const { host, bob, charlie } = players;
      const GAME_ID = 0;

      const fullProofs = await Promise.all([
        prove(inputs.host, OPENING_VERIFIER_BASEPATH),
        prove(inputs.bob, OPENING_VERIFIER_BASEPATH),
        prove(inputs.charlie, OPENING_VERIFIER_BASEPATH),
      ]);

      await Promise.all([
        gameContract.openCommitment(
          GAME_ID,
          toOnChainProof(fullProofs[0].proof),
          fullProofs[0].publicSignals
        ),
        gameContract
          .connect(bob)
          .openCommitment(
            GAME_ID,
            toOnChainProof(fullProofs[1].proof),
            fullProofs[1].publicSignals
          ),
        gameContract
          .connect(charlie)
          .openCommitment(
            GAME_ID,
            toOnChainProof(fullProofs[2].proof),
            fullProofs[2].publicSignals
          ),
      ]);

      const game = await gameContract.getGame(GAME_ID);
      expect(game.state).to.be.equal(GameState.RoundEnd);
    });
  });

  describe("L After all players opened commitments (GamteState.RoundEnd)", () => {
    it("should allow game host to conclude a round", async () => {
      const { contracts, players, inputs } = await loadFixture(deployContractsRoundEnd);
      const { gameContract } = contracts;
      const { host, bob } = players;
      const GAME_ID = 0;

      // Expect Bob be the winner
      await expect(gameContract.concludeRound(GAME_ID))
        .to.emit(gameContract, "RoundWinner")
        .withArgs(GAME_ID, 0, bob.address, inputs.bob.in);

      // Check Bob has won
      const roundsWon = await gameContract.getPlayerGameRoundsWon(GAME_ID, bob.address);
      expect(roundsWon).to.be.equal(1);

      // check gamestate back to RoundCommit
      const game = await gameContract.getGame(GAME_ID);
      expect(game.state).to.be.equal(GameState.RoundCommit);
    });
  });
});
