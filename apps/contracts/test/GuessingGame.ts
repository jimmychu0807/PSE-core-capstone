import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import hre, { run } from "hardhat";
const { randomInt } = require("node:crypto");

import { GameState, prove, toOnChainProof } from "./helpers";
// @ts-ignore: typechain folder will be generated after contracts compilation
import { GuessingGame } from "../typechain-types";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("GuessingGame", () => {
  let contracts;
  let host;
  let bob, charlie;

  beforeEach(async () => {
    contracts = await run("deploy", { logs: false });
    [host, bob, charlie] = await hre.ethers.getSigners();
    Object.values(contracts).map((c) => c.connect(host));
  });

  describe("L New Game", () => {
    it("should create a new game", async () => {
      const gameContract = contracts.game;
      await gameContract.newGame();

      const gameId = 0;
      const game = await gameContract.getGame(gameId);
      expect(game.state).to.be.equal(GameState.GameInitiated);

      const gameHost = await gameContract.getGameHost(gameId);
      expect(gameHost).to.be.equal(host);
    });

    it("host can't join the game again, but other players can", async () => {
      const gameContract = contracts.game;
      await gameContract.newGame();

      const gameId = 0;
      await expect(gameContract.joinGame(gameId)).to.be.revertedWithCustomError(
        gameContract,
        "GuessingGame__PlayerAlreadyJoin"
      );

      await expect(gameContract.connect(bob).joinGame(gameId))
        .to.emit(gameContract, "PlayerJoinGame")
        .withArgs(gameId, bob.address);

      const game = await gameContract.getGame(gameId);
      expect(game.players).to.deep.equal([host.address, bob.address]);
    });

    it("can start game by host once there are more than one player", async () => {
      const gameContract = contracts.game;
      await gameContract.newGame();

      const gameId = 0;
      await expect(gameContract.startGame(gameId)).to.be.revertedWithCustomError(
        gameContract,
        "GuessingGame__NoOtherPlayer"
      );

      gameContract.connect(bob).joinGame(gameId);

      await expect(gameContract.connect(host).startGame(gameId))
        .to.emit(gameContract, "GameStarted")
        .withArgs(gameId);

      const game = await gameContract.getGame(gameId);
      expect(game.state).to.be.equal(GameState.RoundBid);
    });
  });

  describe("L Range check: genarate proof offchain, verify proof onchain", () => {
    it("should create a range proof and be verified", async () => {
      const rcContract = contracts.rcContract;
      const rand = randomInt(281474976710655);

      // generate proof
      const input = { in: 99, rand };
      const { proof, publicSignals } = await prove(
        input,
        `./artifacts/circuits/submit-rangecheck-1-100`
      );
      const result = await rcContract.verifyProof(toOnChainProof(proof), publicSignals);
      expect(result).to.be.true;
    });
  });
});
