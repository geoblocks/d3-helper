/**
 * @param value value to round. Only number values are rounded.
 * @returns value rounded to the nearest integer.
 */
export function getRoundedNumber(value: number|string): number|string {
  const floatValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(floatValue) ? value : Math.round(floatValue);
}
