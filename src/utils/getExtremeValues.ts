import type { DoubleArray, DoubleMatrix } from 'cheminfo-types';
import { isAnyArray } from 'is-any-array';
import { matrixMinMaxZ, xMinMaxValues } from 'ml-spectra-processing';

import { checkMatrix } from './checkMatrix.ts';
import { checkNumberOrArray } from './checkNumberOrArray.ts';

export function getExtremeValues(data: DoubleArray | DoubleMatrix) {
  if (isAnyArray(data[0])) {
    checkMatrix(data);
    const firstRow = data[0];
    return {
      firstLast: {
        first: firstRow[0],
        last: data[data.length - 1][data[0].length - 1],
      },
      minMax: matrixMinMaxZ(data),
    };
  }

  checkNumberOrArray(data);

  return {
    firstLast: {
      first: data[0],
      last: data[data.length - 1],
    },
    minMax: xMinMaxValues(data),
  };
}
