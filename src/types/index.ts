/** Shared application-wide TypeScript types */

export type Theme = 'light' | 'dark';

export type Size = 'sm' | 'md' | 'lg' | 'xl';

export type Status = 'idle' | 'loading' | 'success' | 'error';

/** Represents a key-value pair of string entries */
export type StringRecord = Record<string, string>;

/** Makes all properties of T deeply optional */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
