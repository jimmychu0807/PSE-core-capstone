import { WitnessTester } from "circomkit";
import { circomkit } from "./common";
const { randomInt } = require("node:crypto");

// Check test here on how to build poseidon and use it:
//   https://github.com/iden3/circomlib/blob/master/test/poseidoncircuit.js
const buildPoseidon = require("circomlibjs").buildPoseidon;

describe("submission-check", () => {
  let circuit: WitnessTester<
    ["in", "rand"] // private inputs
  >;
  let poseidon;
  let F;
  const [MIN, MAX, NBITS] = [1, 100, 7];

  before(async () => {
    circuit = await circomkit.WitnessTester("submission-check", {
      file: "submission-check",
      template: "SubmissionCheck",
      params: [MIN, MAX, NBITS],
    });

    poseidon = await buildPoseidon();
    F = poseidon.F;
  });

  it("Should pass when the value is within range", async () => {
    const rand = randomInt(281474976710655);

    let INPUT = { in: MIN, rand };

    const nullifier = F.toObject(poseidon([rand]));
    let submission = F.toObject(poseidon([MIN, rand]));
    await circuit.expectPass(INPUT, { submission, nullifier });

    INPUT = { in: MAX, rand };

    submission = F.toObject(poseidon([MAX, rand]));
    await circuit.expectPass(INPUT, { submission, nullifier });
  });

  it("Should fail when the value is out of range", async () => {
    const rand = randomInt(281474976710655);

    let INPUT = { in: MIN - 1, rand };
    await circuit.expectFail(INPUT);

    INPUT = { in: MAX + 1, rand };
    await circuit.expectFail(INPUT);
  });
});
