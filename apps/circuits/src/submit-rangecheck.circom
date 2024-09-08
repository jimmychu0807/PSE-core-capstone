pragma circom 2.1.6;

include "../../../node_modules/circomlib/circuits/comparators.circom";

template SubmissionRangeCheck(min, max, nBit) {
  signal input in;

  component lessEqThan = LessEqThan(nBit);
  lessEqThan.in <== [in, max];

  component greaterEqThan = GreaterEqThan(nBit);
  greaterEqThan.in <== [in, min];

  lessEqThan.out * greaterEqThan.out === 1;
}

// component main  = SubmissionRangeCheck(1, 100, 7);
