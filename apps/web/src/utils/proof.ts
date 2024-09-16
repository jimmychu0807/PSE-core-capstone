import { type Proof, type ProofType } from "@/config/proof";

export function getRandomNullifier(): string {
  // TODO: implement using Crypto.getRandomValues()
  // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
  const res = 9007199254740991n;
  return res.toString(10);
}

export function generateFullProof(proofType: ProofType, submission: number, nullifier: string): Proof {
  proofType;
  submission;
  nullifier;

  // prettier-ignore
  return {
    proof: [
      "p", "p", "p", "p", "p",
      "p", "p", "p", "p", "p",
      "p", "p", "p", "p", "p",
      "p", "p", "p", "p", "p",
      "p", "p", "p", "p"
    ],
    pubSignals: ["signal", "signal"],
  };
}
