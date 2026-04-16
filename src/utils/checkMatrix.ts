import type { DoubleArray } from 'cheminfo-types';
import { isAnyArray } from 'is-any-array';

export function checkMatrix(
  data: DoubleArray | DoubleArray[],
): asserts data is DoubleArray[] {
  if (!isAnyArray(data) || !isAnyArray(data[0])) {
    throw new Error(`2D data should be a matrix`);
  }
}
