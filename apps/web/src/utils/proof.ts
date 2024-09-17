import { type Proof, type ProofType, proofArtifacts } from "@/config/proof";
import { type PlonkProof, plonk } from "snarkjs";

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
  return [
    zeroPadNBytes(proof.A[0], 32),
    zeroPadNBytes(proof.A[1], 32),
    zeroPadNBytes(proof.B[0], 32),
    zeroPadNBytes(proof.B[1], 32),
    zeroPadNBytes(proof.C[0], 32),
    zeroPadNBytes(proof.C[1], 32),
    zeroPadNBytes(proof.Z[0], 32),
    zeroPadNBytes(proof.Z[1], 32),
    zeroPadNBytes(proof.T1[0], 32),
    zeroPadNBytes(proof.T1[1], 32),
    zeroPadNBytes(proof.T2[0], 32),
    zeroPadNBytes(proof.T2[1], 32),
    zeroPadNBytes(proof.T3[0], 32),
    zeroPadNBytes(proof.T3[1], 32),
    zeroPadNBytes(proof.Wxi[0], 32),
    zeroPadNBytes(proof.Wxi[1], 32),
    zeroPadNBytes(proof.Wxiw[0], 32),
    zeroPadNBytes(proof.Wxiw[1], 32),
    zeroPadNBytes(proof.eval_a, 32),
    zeroPadNBytes(proof.eval_b, 32),
    zeroPadNBytes(proof.eval_c, 32),
    zeroPadNBytes(proof.eval_s1, 32),
    zeroPadNBytes(proof.eval_s2, 32),
    zeroPadNBytes(proof.eval_zw, 32),
  ];
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
