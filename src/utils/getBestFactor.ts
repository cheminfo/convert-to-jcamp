import { DoubleArray } from 'cheminfo-types';
import { xMinMaxValues } from 'ml-spectra-processing';

import { getFactorNumber } from './getFactorNumber';
import { MinMax } from './minMax';

export function getBestFactor(
  array: DoubleArray,
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
  let onlyInteger = true;
  for (let y of array) {
    if (Math.round(y) !== y) {
      onlyInteger = false;
      break;
    }
  }
  if (onlyInteger) {
    return 1;
  }
  // we need to rescale the values
  // need to find the max and min values
  const extremeValues = minMax || xMinMaxValues(array);
  return getFactorNumber(extremeValues, maxValue);
}
