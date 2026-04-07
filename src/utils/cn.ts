/**
 * Lightweight class name combiner — merges truthy class strings.
 *
 * @example
 * cn(styles.base, isActive && styles.active, className)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
