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
  let owner;

  before(async () => {
    contracts = await run("deploy", { logs: false });
    owner = (await hre.ethers.getSigners())[0];
    Object.values(contracts).map((c) => c.connect(owner));
  });

  describe("L New Game", () => {
    it("should create a new game", async () => {
      const gameContract = contracts.game;
      await gameContract.newGame();

      const gameId = 0;
      const game = await gameContract.getGame(gameId);
      expect(game.state).to.be.equal(GameState.GameInitiated);

      const gameHost = await gameContract.getGameHost(gameId);
      expect(gameHost).to.be.equal(owner);
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

    it("should not generate a proof when value is out of range", async () => {
      const rcContract = contracts.rcContract;
      const rand = randomInt(281474976710655);

      const input = { in: 0, rand };
      expect(prove(input, `./artifacts/circuits/submit-rangecheck-1-100`)).to.eventually.be
        .rejected;
    });
  });
});
