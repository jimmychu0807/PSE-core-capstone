import { task, types } from "hardhat/config";

task("deploy", "Deploy all Number Guessing Game contracts")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers, run }) => {
    const verifiers = await run("deploy:game-verifiers", { logs });

    const rcVerifier = await verifiers.rcContract.getAddress();
    const gameContract = await run("deploy:game", { logs, rcVerifier });

    return { gameContract, ...verifiers };
  });

task("deploy:game", "Deploy Number Guessing Game main contract")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .addParam("rcVerifier", "submit-rangecheck verifier address", undefined, types.string)
  .setAction(async ({ logs, rcVerifier }, { ethers, run }) => {
    const factory = await ethers.getContractFactory("GuessingGame");

    const contract = await factory.deploy(rcVerifier);
    await contract.waitForDeployment();

    logs && console.info(`GuessingGame contract: ${await contract.getAddress()}`);

    return contract;
  });

task("deploy:game-verifiers", "Deploy all Number Guessing Game verifier contracts")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers, run }) => {
    const rcFactory = await ethers.getContractFactory(
      "contracts/submit-rangecheck-1-100_verifier.sol:PlonkVerifier"
    );
    const rcContract = await rcFactory.deploy();
    await rcContract.waitForDeployment();

    logs &&
      console.info(`submit-rangecheck-1-100_verifier contract: ${await rcContract.getAddress()}`);

    return { rcContract };
  });

task("deploy:feedback", "Deploy a Feedback contract")
  .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs, semaphore: semaphoreAddress }, { ethers, run }) => {
    if (!semaphoreAddress) {
      const { semaphore } = await run("deploy:semaphore", {
        logs,
      });

      semaphoreAddress = await semaphore.getAddress();
    }

    const FeedbackFactory = await ethers.getContractFactory("Feedback");

    const feedbackContract = await FeedbackFactory.deploy(semaphoreAddress);

    await feedbackContract.waitForDeployment();

    const groupId = await feedbackContract.groupId();

    if (logs) {
      console.info(
        `Feedback contract has been deployed to: ${await feedbackContract.getAddress()} (groupId: ${groupId})`
      );
    }

    return feedbackContract;
  });
