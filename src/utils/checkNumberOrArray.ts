import type { DoubleArray } from 'cheminfo-types';
import { isAnyArray } from 'is-any-array';

export function checkNumberOrArray(
  data: DoubleArray | DoubleArray[],
): asserts data is DoubleArray {
  if (!isAnyArray(data) || isAnyArray(data[0])) {
    throw new Error(`x and y data should be an array of numbers`);
  }
}
