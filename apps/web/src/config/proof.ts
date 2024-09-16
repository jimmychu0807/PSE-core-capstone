// prettier-ignore
export type Proof = {
  proof: [ // Plonk proof for on-chain submission Have 24 elements inside
    string, string, string, string, string,
    string, string, string, string, string,
    string, string, string, string, string,
    string, string, string, string, string,
    string, string, string, string,
  ];
  pubSignals: Array<string>;
};

export type ProofType = "CommitmentProof" | "OpeningProof";

export const proofArtifacts = {
  CommitmentProof: {
    wasm: "wasm",
    zkey: "zkey",
  },
  OpeningProof: {
    wasm: "wasm",
    zkey: "zkey",
  },
};
