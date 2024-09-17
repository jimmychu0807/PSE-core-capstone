// prettier-ignore
export type Proof = {
  proof: [ // Plonk proof for on-chain submission Have 24 elements inside
    string, string, string, string, string,
    string, string, string, string, string,
    string, string, string, string, string,
    string, string, string, string, string,
    string, string, string, string,
  ];
  publicSignals: Array<string>;
};

export type ProofType = "CommitmentProof" | "OpeningProof";

export const proofArtifacts = {
  CommitmentProof: {
    wasm: "/circuit-artifacts/commit-1-100.wasm",
    zkey: "/circuit-artifacts/commit-1-100.zkey",
  },
  OpeningProof: {
    wasm: "/circuit-artifacts/open-1-100.wasm",
    zkey: "/circuit-artifacts/open-1-100.zkey",
  },
};
