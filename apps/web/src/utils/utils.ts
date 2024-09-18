import { GameState } from "@/types";

export function shortenString(s: string, l: [number, number]) {
  return `${s.slice(0, l[0])}...${s.slice(-l[1])}`;
}

export function zeroToNArr(n: number): Array<number> {
  return [...Array(n).keys()];
}

export const formatter = {
  dateTime(dateTime: number): string {
    return new Date(dateTime * 1000).toLocaleString();
  },
  gameState(gameState: number | bigint, currentRound: number | bigint): string {
    const gameStateNum = Number(gameState);
    const roundStr = `(Round ${Number(currentRound) + 1})`;

    if (gameStateNum === GameState.GameInitiated) return "Game initiated, players joining.";
    if (gameStateNum === GameState.RoundCommit) return `Submit Commitment ${roundStr}`;
    if (gameStateNum === GameState.RoundOpen) return `Open Commitment ${roundStr}`;
    if (gameStateNum === GameState.RoundEnd) return `Round End ${roundStr}`;
    return "Game End";
  },
};
