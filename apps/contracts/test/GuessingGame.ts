import { expect } from "chai";
import hre, { run } from "hardhat";

// @ts-ignore: typechain folder will be generated after contracts compilation
import { GuessingGame } from "../typechain-types";

describe("GuessingGame", () => {
  let contracts;
  let owner;

  before(async () => {
    contracts = await run("deploy", { logs: true });
    owner = (await hre.ethers.getSigners())[0];
    Object.values(contracts).map((c) => c.connect(owner));
  });

  describe("# newGame", () => {
    it("should create a new game", async () => {
      const gameContract = contracts["game"];
      await gameContract.newGame();
      const game = await gameContract.games(0);
    });
  });

  describe("Range check: genarate proof offchain, verify proof onchain", () => {
    it("should create a range proof and be verified", async() => {
      const rcContract = contracts["rcContract"];

      console.log(`rcContract addr: ${await rcContract.getAddress()}`)

    });
  });
});
