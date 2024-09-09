pragma circom 2.1.6;

include "../../../node_modules/circomlib/circuits/comparators.circom";
include "../../../node_modules/circomlib/circuits/poseidon.circom";

template SubmissionRangeCheck(min, max, nBit) {
  signal input in;
  signal input rand;

  signal output submission;
  signal output nullifier;

  component lessEqThan = LessEqThan(nBit);
  lessEqThan.in <== [in, max];

  component greaterEqThan = GreaterEqThan(nBit);
  greaterEqThan.in <== [in, min];

  // assert the value must be within range
  lessEqThan.out * greaterEqThan.out === 1;

  submission <== Poseidon(2)([in, rand]);
  nullifier <== Poseidon(1)([rand]);
}
