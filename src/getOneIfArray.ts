import { isAnyArray } from 'is-any-array';

type PosibleInput = string | number | boolean;

/**
 * It returns an element if the input is an array otherwise it returns the input.
 * @param data - one list or single value
 * @param index - index of the desired element, if the index is out of the boundaries it throws an error.
 * @returns
 */
export function getOneIfArray<T extends PosibleInput>(
  data: T | T[],
  index = 0,
) {
  if (isAnyArray(data)) {
    const value = data.at(index);
    if (value !== undefined) {
      return value;
    } else {
      throw new RangeError('An array with a index out of boundaries');
    }
  }

  return data;
}
