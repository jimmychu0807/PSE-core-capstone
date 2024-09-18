import { type Address } from "viem";

// Copied over from typechain-types inside apps/contracts
export type GameView = [
  players: Address[],
  currentRound: bigint,
  roundWinners: Address[],
  state: bigint,
  winner: string,
  startTime: bigint,
  lastUpdate: bigint,
  endTime: bigint
] & {
  players: Address[];
  currentRound: bigint;
  roundWinners: Address[];
  state: bigint;
  winner: string;
  startTime: bigint;
  lastUpdate: bigint;
  endTime: bigint;
};

// IMPROVE: can you get this GameState from hardhat compilation?
export enum GameState {
  GameInitiated = 0,
  RoundCommit,
  RoundOpen,
  RoundEnd,
  GameEnd,
}

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

export type SubNullHash = {
  submission: string;
  nullifier: string;
};

export type SubNullLocalStorage = {
  submission: number;
  nullifier: SubNullHash["nullifier"];
};
