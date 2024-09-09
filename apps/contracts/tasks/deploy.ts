import { task, types } from "hardhat/config";

task("deploy", "Deploy a contract")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers, run }) => {
    const game = await run("deploy:game", { logs });
    const verifiers = await run("deploy:verifiers", { logs });
    return { game, ...verifiers };
  });

task("deploy:game", "Deploy a GuessingGame contract")
  .addOptionalParam("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers, run }) => {
    const factory = await ethers.getContractFactory("GuessingGame");
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    logs && console.info(`GuessingGame contract: ${await contract.getAddress()}`);

    return contract;
  });

task("deploy:verifiers", "Deploy all verifier contracts")
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
