import type { DoubleArray, DoubleMatrix } from 'cheminfo-types';
import { isAnyArray } from 'is-any-array';
import { matrixMinMaxZ } from 'ml-spectra-processing/matrix';
import { xMinMaxValues } from 'ml-spectra-processing/x';

import { checkMatrix } from './checkMatrix.ts';
import { checkNumberOrArray } from './checkNumberOrArray.ts';

export function getExtremeValues(data: DoubleArray | DoubleMatrix) {
  if (isAnyArray(data[0])) {
    checkMatrix(data);
    const firstRow = data[0];
    return {
      firstLast: {
        first: firstRow[0] as number,
        last: (data.at(-1) as DoubleArray)[firstRow.length - 1] as number,
      },
      minMax: matrixMinMaxZ(data),
    };
  }

  checkNumberOrArray(data);

  return {
    firstLast: {
      first: data[0] as number,
      last: data.at(-1) as number,
    },
    minMax: xMinMaxValues(data),
  };
}
