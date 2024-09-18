import { type PlonkProof, plonk } from "snarkjs";

import { type Proof, type ProofType } from "@/types";
import {  proofArtifacts } from "@/config/proof";

export function getRandomNullifier(): string {
  // Using Crypto.getRandomValues():
  //   https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
  const buf = new BigUint64Array(2);
  crypto.getRandomValues(buf);
  return buf.toString().replaceAll(",", "");
}

export function zeroPadNBytes(input: string | undefined, n: number, withPrefix = true): string {
  if (typeof input === "undefined") throw new Error("Undefined input in zeroPadNBytes()");

  let in16: string = BigInt(input).toString(16);
  // make it an even number of digits
  in16 = in16.length % 2 === 1 ? `0${in16}` : `${in16}`;

  const zeroNeeded = n * 2 - in16.length;
  if (zeroNeeded < 0) throw new Error("Value overflow in zeroPadNBytes()");

  in16 = `${"0".repeat(zeroNeeded)}${in16}`;
  return withPrefix ? `0x${in16}` : in16;
}

export function toOnChainProof(proof: PlonkProof): Proof["proof"] {
  const { A, B, C, Z, T1, T2, T3, Wxi, Wxiw, eval_a, eval_b, eval_c, eval_s1, eval_s2, eval_zw } =
    proof;

  // prettier-ignore
  return [
    A[0], A[1], B[0], B[1], C[0], C[1], Z[0], Z[1],
    T1[0], T1[1], T2[0], T2[1], T3[0], T3[1], Wxi[0], Wxi[1],
    Wxiw[0], Wxiw[1], eval_a, eval_b, eval_c, eval_s1, eval_s2, eval_zw
  ].map((v) => zeroPadNBytes(v, 32)) as Proof["proof"];
}

export async function generateFullProof(
  proofType: ProofType,
  submission: number,
  nullifier: string
): Promise<Proof> {
  const { wasm, zkey } = proofArtifacts[proofType];

  const fullProof = await plonk.fullProve(
    { in: submission.toString(10), rand: nullifier },
    wasm,
    zkey
  );

  // Convert fullProof.proof to a format suitable for on-chain submission
  return {
    proof: toOnChainProof(fullProof.proof),
    publicSignals: fullProof.publicSignals as Array<string>,
  };
}
