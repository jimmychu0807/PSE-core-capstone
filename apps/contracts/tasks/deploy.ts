import { task, types } from "hardhat/config";

task("deploy", "Deploy all Number Guessing Game contracts")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers, run }) => {
    const verifiers = await run("deploy:game-verifiers", { logs });

    const [commitmentVerifier, openingVerifier] = await Promise.all([
      verifiers.commitmentVerifier.getAddress(),
      verifiers.openingVerifier.getAddress(),
    ]);

    const gameContract = await run("deploy:game", { logs, commitmentVerifier, openingVerifier });

    return { gameContract, ...verifiers };
  });

task("deploy:game", "Deploy Number Guessing Game main contract")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .addParam("commitmentVerifier", "commitment verifier address", undefined, types.string)
  .addParam("openingVerifier", "opening verifier address", undefined, types.string)
  .setAction(async ({ logs, commitmentVerifier, openingVerifier }, { ethers, run }) => {
    const factory = await ethers.getContractFactory("GuessingGame");
    const contract = await factory.deploy(commitmentVerifier, openingVerifier);
    await contract.waitForDeployment();

    logs && console.info(`GuessingGame contract: ${await contract.getAddress()}`);

    return contract;
  });

task("deploy:game-verifiers", "Deploy two Number Guessing Game verifier contracts")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers, run }) => {
    const cvFactory = await ethers.getContractFactory(
      "contracts/commit-1-100_verifier.sol:PlonkVerifier"
    );
    const commitmentVerifier = await cvFactory.deploy();
    await commitmentVerifier.waitForDeployment();

    const ovFactory = await ethers.getContractFactory(
      "contracts/open-1-100_verifier.sol:PlonkVerifier"
    );
    const openingVerifier = await ovFactory.deploy();
    await openingVerifier.waitForDeployment();

    if (logs) {
      console.info(`commitment verifier: ${await commitmentVerifier.getAddress()}`);
      console.info(`commitment verifier: ${await openingVerifier.getAddress()}`);
    }

    return { commitmentVerifier, openingVerifier };
  });
