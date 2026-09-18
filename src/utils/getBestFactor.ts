import type { NumberArray } from 'cheminfo-types';
import { xMinMaxValues } from 'ml-spectra-processing/x';

import { getFactorNumber } from './getFactorNumber.ts';
import type { MinMax } from './minMax.ts';

export function getBestFactor(
  array: NumberArray,
  options: {
    factor?: number;
    /**
     * The maximum absolute value
     */
    maxValue?: number;
    minMax?: MinMax;
  } = {},
): number {
  const { maxValue, factor, minMax } = options;

  if (factor !== undefined) {
    return factor;
  }

  // is there non integer number ?
  let isOnlyInteger = true;
  for (const y of array) {
    if (Math.round(y) !== y) {
      isOnlyInteger = false;
      break;
    }
  }
  if (isOnlyInteger) {
    return 1;
  }
  // we need to rescale the values
  // need to find the max and min values
  const extremeValues = minMax || xMinMaxValues(array);
  return getFactorNumber(extremeValues, maxValue);
}
