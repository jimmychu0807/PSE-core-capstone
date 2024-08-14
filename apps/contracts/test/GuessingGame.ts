import { expect } from "chai";
import hre from "hardhat";
// @ts-ignore: typechain folder will be generated after contracts compilation
import { GuessingGame } from "../typechain-types";

describe("GuessingGame", () => {
  let contract: GuessingGame;
  let owner;

  before(async () => {
    contract = await hre.ethers.deployContract("GuessingGame", []);
    owner = (await hre.ethers.getSigners())[0];

    console.info(`owner addr: ${await owner.getAddress()}`);

    console.info(`GuessingGame contract has been deployed to: ${await contract.getAddress()}`);
  });

  describe("# newGame", () => {
    it("should create a new game", async () => {
      await contract.newGame();
      const game = await contract.games(0);

      console.log(game);
    });
  });
});
