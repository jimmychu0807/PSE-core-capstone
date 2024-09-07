pragma circom 2.1.6;

include "../../../node_modules/circomlib/circuits/comparators.circom";

template SubmissionRangeCheck(min, max, nBit) {
  signal input in;
  signal output out;

  component lessEqThan = LessEqThan(nBit);
  lessEqThan.in <== [in, max];

  component greaterEqThan = GreaterEqThan(nBit);
  greaterEqThan.in <== [in, min];

  out <== lessEqThan.out * greaterEqThan.out;
}

component main  = SubmissionRangeCheck(1, 100, 7);
