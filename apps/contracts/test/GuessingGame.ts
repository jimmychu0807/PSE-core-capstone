import { expect } from "chai";
import hre, { run } from "hardhat";
import { GameState, prove } from "./helpers";

// @ts-ignore: typechain folder will be generated after contracts compilation
import { GuessingGame } from "../typechain-types";

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

      // generate proof
      const input = { in: 99 };
      const { proof, publicSignals } = await prove(input, `./artifacts/circuits/submit-rangecheck`);

      await rcContract.verifyProof(proof, publicSignals);
    });
  });
});
