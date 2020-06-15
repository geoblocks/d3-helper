/**
 * @param value value to round. Only number values are rounded.
 * @returns value rounded to the nearest integer.
 */
export function getRoundedNumber(value: number|string): number|string {
  if (value === null || value === undefined || Number.isNaN(value as number)) {
    return value;
  }
  // If the value contains any not numeric value (except point), return it as string.
  const stringValue = `${value}`;
  if (!(/^[\d|\.]+$/.test(stringValue))) {
    return `${stringValue}`;
  }
  const floatValue = typeof value === 'string' ? parseFloat(value) : value;
  return Math.round(floatValue);
}
