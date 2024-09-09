import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("submit-rangecheck", () => {
  let circuit: WitnessTester<
    ["in"] // private inputs
  >;

  const [MIN, MAX, NBITS] = [1, 100, 7];

  before(async () => {
    circuit = await circomkit.WitnessTester("submit-rangecheck", {
      file: "submit-rangecheck",
      template: "SubmissionRangeCheck",
      params: [MIN, MAX, NBITS],
    });
  });

  it("Should pass when the value is within range", async () => {
    let INPUT = { in: MIN };
    const OUT = { out: 1 };
    await circuit.expectPass(INPUT, OUT);

    INPUT = { in: MAX };
    await circuit.expectPass(INPUT, OUT);
  });

  it("Should fail when the value is out of range", async () => {
    let INPUT = { in: MIN - 1 };
    await circuit.expectFail(INPUT);

    INPUT = { in: MAX + 1};
    await circuit.expectFail(INPUT);
  });
});
