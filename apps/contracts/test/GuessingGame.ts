import { expect } from "chai";
import hre, {run} from "hardhat";

// @ts-ignore: typechain folder will be generated after contracts compilation
import { GuessingGame } from "../typechain-types";

describe("GuessingGame", () => {
  let contract: GuessingGame;
  let owner;

  before(async () => {
    contract = await run("deploy:game", { logs: true });
    owner = (await hre.ethers.getSigners())[0];
    contract.connect(owner);
  });

  describe("# newGame", () => {
    it("should create a new game", async () => {
      await contract.newGame();
      const game = await contract.games(0);

      console.log(game);
    });
  });
});
