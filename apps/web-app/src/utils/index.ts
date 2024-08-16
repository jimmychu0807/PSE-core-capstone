export function zeroToNArr(n: number): Array<number> {
  return [...Array(n).keys()];
}

export const formatter = {
  dateTime(dateTime: Date) {
    return new Date(Number(dateTime) * 1000).toLocaleString();
  },
};
