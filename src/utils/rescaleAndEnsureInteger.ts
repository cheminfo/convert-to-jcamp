import { DoubleArray } from 'cheminfo-types';
import { xDivide } from 'ml-spectra-processing';

export function rescaleAndEnsureInteger(data: DoubleArray, factor = 1) {
  if (factor === 1) return data.map((value) => Math.round(value));
  return xDivide(data, factor).map((value) => Math.round(value));
}
