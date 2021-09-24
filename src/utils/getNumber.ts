export function getNumber(number, factor) {
  if (factor !== 1) number /= factor;
  const rounded = Math.round(number);
  if (rounded !== number && Math.abs(rounded - number) <= Number.EPSILON) {
    return rounded;
  }
  return number;
}
