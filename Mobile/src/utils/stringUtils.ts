export function splitPairSize(value: string): [string, string] {
  const [first = "", second = ""] = value.split("x");
  return [first, second];
}

export function joinPairSize(first: string, second: string): string {
  return `${first}${second ? `x${second}` : ""}`;
}

export function formatNumberInput(value: string): string {
  return value.replace(/[^0-9.,]/g, "");
}
