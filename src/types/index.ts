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

// ---------------------------------------------------------------------------
// Calculator types
// ---------------------------------------------------------------------------

/** The four arithmetic operators supported by the calculator. */
export type CalcOperator = '+' | '−' | '×' | '÷';

/** Snapshot of the calculator's internal state exposed to consumers. */
export interface CalcState {
  /** The value currently shown on the display. */
  display: string;
  /** The operator that is pending evaluation, if any. */
  operator: CalcOperator | null;
  /** True after an operator is pressed; the next digit press replaces the display. */
  waitingForNextOperand: boolean;
}

/** All handler functions returned by useCalculator. */
export interface CalcHandlers {
  /** Handle a digit or decimal-point key press (e.g. '0'–'9', '.'). */
  handleDigit: (digit: string) => void;
  /** Handle an operator key press ('+', '−', '×', '÷'). */
  handleOperator: (op: CalcOperator) => void;
  /** Evaluate the pending operation and update the display. */
  handleEquals: () => void;
  /** Reset all state back to initial values. */
  handleReset: () => void;
}
