export function ensureDate(value: Date | string): Date {
  return typeof value === 'string' ? new Date(value) : value;
}
