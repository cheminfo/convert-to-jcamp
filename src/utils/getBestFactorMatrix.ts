import { DoubleMatrix, matrixMinMaxZ } from 'ml-spectra-processing';

import { getFactorNumber } from './getFactorNumber';

interface MinMax {
  min: number;
  max: number;
}
export function getBestFactorMatrix(
  matrix: DoubleMatrix,
  options: {
    factor?: number;
    /**
     * The maximum absolute value
     */ maxValue?: number;
    minMax?: MinMax;
  } = {},
): number {
  const { maxValue, factor, minMax } = options;

  if (factor !== undefined) {
    return factor;
  }

  // is there non integer number ?
  let onlyInteger = true;
  for (const row of matrix) {
    for (const y of row) {
      if (Math.round(y) !== y) {
        onlyInteger = false;
        break;
      }
    }
  }
  if (onlyInteger) {
    return 1;
  }
  // we need to rescale the values
  // need to find the max and min values
  const extremeValues = minMax || matrixMinMaxZ(matrix);
  return getFactorNumber(extremeValues, maxValue);
}
