export function calculateNiceStep(range: number, targetTicks: number): number {
  const roughStep = range / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let niceMultiplier = 1;
  if (normalized > 7.5)      niceMultiplier = 10;
  else if (normalized > 3.5) niceMultiplier = 5;
  else if (normalized > 1.5) niceMultiplier = 2;

  return niceMultiplier * magnitude;
}
