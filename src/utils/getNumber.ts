/**
 * Reconvert number to original value
 * @param number Number used for computation
 * @param factor Multiplying factor
 * @returns Original value
 */
export function getNumber(number: number, factor: number):number {
  if (factor !== 1) number /= factor;
  const rounded = Math.round(number);
  if (rounded !== number && Math.abs(rounded - number) <= Number.EPSILON) {
    return rounded;
  }
  return number;
}
