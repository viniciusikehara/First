/**
 * Formats a Date (or ISO string) into a human-readable string.
 *
 * @example
 * formatDate(new Date())          // "Jun 24, 2025"
 * formatDate('2025-01-01', 'long') // "January 1, 2025"
 */
export function formatDate(
  date: Date | string,
  style: 'short' | 'medium' | 'long' = 'medium',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  };
  const options = optionsMap[style];

  return d.toLocaleDateString(undefined, options);
}
