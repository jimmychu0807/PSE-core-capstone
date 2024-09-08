import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("submit-rangecheck", () => {
  let circuit: WitnessTester<
    ["in"], // private inputs
    [] // public inputs
  >;

  const [MIN, MAX, NBITS] = [1, 100, 7];

  before(async () => {
    circuit = await circomkit.WitnessTester("submit-rangecheck", {
      file: "submit-rangecheck",
      template: "SubmissionRangeCheck",
      params: [MIN, MAX, NBITS],
    });
  });

  it("Should return 1 when the value is within range", async () => {
    let INPUT = { in: MIN };
    await circuit.expectPass(INPUT);

    INPUT = { in: MAX };
    await circuit.expectPass(INPUT);
  });

  it("Should return 0 when the value is out of range", async () => {
    let INPUT = { in: MIN - 1 };
    await circuit.expectFail(INPUT);

    INPUT = { in: MAX + 1};
    await circuit.expectFail(INPUT);
  });
});
