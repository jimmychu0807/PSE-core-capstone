import { ethers } from "hardhat";
import { plonk } from "snarkjs";

// Ref. to the game constants in contracts/base/Constants.sol
export const MIN_NUM = 1;
export const MAX_NUM = 100;
export const ROUNDS_TO_WIN = 3;

// Ref. to the game state in contracts/interfaces/IGuessingGame.sol
export enum GameState {
  GameInitiated = 0,
  RoundCommit,
  RoundOpen,
  RoundEnd,
  GameEnd,
}

export async function prove(input, circuitPath) {
  const fullProof = await plonk.fullProve(
    input,
    `${circuitPath}.wasm`,
    `${circuitPath}.zkey`
  );

  return fullProof;
}

export function zeroPadNBytes(input, n, withPrefix = true) {
  let in16 = BigInt(input).toString(16);
  in16 = in16.length % 2 === 1 ? `0x0${in16}` : `0x${in16}`;
  const padded = ethers.zeroPadValue(in16, n);
  return withPrefix ? padded : padded.slice(2);
}

// Ref: https://github.com/iden3/snarkjs/blob/master/smart_contract_tests/test/smart_contracts.test.js
export function toOnChainProof(proofJson) {
  return [
    zeroPadNBytes(proofJson.A[0], 32),
    zeroPadNBytes(proofJson.A[1], 32),
    zeroPadNBytes(proofJson.B[0], 32),
    zeroPadNBytes(proofJson.B[1], 32),
    zeroPadNBytes(proofJson.C[0], 32),
    zeroPadNBytes(proofJson.C[1], 32),
    zeroPadNBytes(proofJson.Z[0], 32),
    zeroPadNBytes(proofJson.Z[1], 32),
    zeroPadNBytes(proofJson.T1[0], 32),
    zeroPadNBytes(proofJson.T1[1], 32),
    zeroPadNBytes(proofJson.T2[0], 32),
    zeroPadNBytes(proofJson.T2[1], 32),
    zeroPadNBytes(proofJson.T3[0], 32),
    zeroPadNBytes(proofJson.T3[1], 32),
    zeroPadNBytes(proofJson.Wxi[0], 32),
    zeroPadNBytes(proofJson.Wxi[1], 32),
    zeroPadNBytes(proofJson.Wxiw[0], 32),
    zeroPadNBytes(proofJson.Wxiw[1], 32),
    zeroPadNBytes(proofJson.eval_a, 32),
    zeroPadNBytes(proofJson.eval_b, 32),
    zeroPadNBytes(proofJson.eval_c, 32),
    zeroPadNBytes(proofJson.eval_s1, 32),
    zeroPadNBytes(proofJson.eval_s2, 32),
    zeroPadNBytes(proofJson.eval_zw, 32),
  ];
}

export function toOnChainFullProofs(fullProofs) {
  return fullProofs.map((fp) => ({
    proof: toOnChainProof(fp.proof),
    publicSignals: fp.publicSignals,
  }));
}
