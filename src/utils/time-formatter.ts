export function formatTime(seconds: number, showDecimals = true): string {
  const absSeconds = Math.abs(seconds);

  if (showDecimals) {
    return absSeconds.toFixed(2);
  }

  return absSeconds.toFixed(0);
}

export function formatTimeDisplay(current: number, total: number): string {
  return `${formatTime(current)} / ${formatTime(total)}`;
}
