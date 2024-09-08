import { wtns, plonk } from "snarkjs";
const { utils } = require("ffjavascript");

// Ref. to the game state in contracts/interfaces/IGuessingGame.sol
export enum GameState {
  GameInitiated = 0,
  RoundBid,
  RoundReveal,
  RoundEnd,
  GameEnd,
}

export async function prove(input, keyBasePath) {
  const fullProof = await plonk.fullProve(
    // utils.stringifyBitInts(input),
    input,
    `${keyBasePath}.wasm`,
    `${keyBasePath}.zkey`
  );

  return fullProof;
}
