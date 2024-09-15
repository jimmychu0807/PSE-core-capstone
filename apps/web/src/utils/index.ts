export { default as shortenString } from "./shortenString";

export function zeroToNArr(n: number): Array<number> {
  return [...Array(n).keys()];
}

export const formatter = {
  dateTime(dateTime: number) {
    return new Date(dateTime * 1000).toLocaleString();
  },
};
