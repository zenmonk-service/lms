export function minutesToTimeString(minutes: string): string {
  const h = Math.floor(Number(minutes) / 60).toString().padStart(2, "0");
  const m = (Number(minutes) % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}