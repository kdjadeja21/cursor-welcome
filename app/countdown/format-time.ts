export function formatCountdown(totalSec: number): string {
  const sec = Math.max(0, Math.trunc(totalSec));
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
