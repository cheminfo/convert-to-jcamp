import type { MinMax } from './minMax.ts';

export function getFactorNumber(minMax: MinMax, maxValue = 2 ** 31 - 1) {
  let factor: number;
  if (minMax.min < 0) {
    if (minMax.max > 0) {
      factor = Math.max(-minMax.min, minMax.max) / maxValue;
    } else {
      factor = -minMax.min / maxValue;
    }
  } else {
    factor = minMax.max / maxValue;
  }
  return factor;
}
