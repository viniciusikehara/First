import { useCallback, useReducer } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** The four arithmetic operators the calculator supports. */
export type Operator = '+' | '-' | '*' | '/';

/** Internal state managed by the reducer. */
export interface CalculatorState {
  /** The value shown on the display (always a string for digit-by-digit input). */
  display: string;
  /** The operand captured before an operator was pressed. */
  previousValue: number | null;
  /** The pending operator waiting for the second operand. */
  pendingOperator: Operator | null;
  /**
   * When true, the very next digit press replaces the display instead of
   * appending — happens right after an operator or "=" is pressed.
   */
  awaitingOperand: boolean;
  /** Set to true after "=" is pressed; cleared by the next digit or operator. */
  hasResult: boolean;
}

/** Every action the reducer can handle. */
type CalculatorAction =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'INPUT_OPERATOR'; operator: Operator }
  | { type: 'CALCULATE' }
  | { type: 'RESET' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'INPUT_PERCENT' };

/** The public interface returned by the hook. */
export interface UseCalculatorReturn {
  /** Current value to render on the calculator display. */
  display: string;
  /** Whether a pending operator is active (useful for button highlight). */
  pendingOperator: Operator | null;
  /** Enter a digit (0–9). */
  inputDigit: (digit: string) => void;
  /** Append a decimal point if one is not already present. */
  inputDecimal: () => void;
  /** Store the current display value and set the pending operator. */
  inputOperator: (operator: Operator) => void;
  /** Evaluate the pending operation and update the display. */
  calculate: () => void;
  /** Reset the calculator to its initial state. */
  reset: () => void;
  /** Toggle the sign of the current display value. */
  toggleSign: () => void;
  /** Convert the current display value to a percentage. */
  inputPercent: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_DISPLAY_LENGTH = 12;
const DISPLAY_ERROR = 'Error';

const INITIAL_STATE: CalculatorState = {
  display: '0',
  previousValue: null,
  pendingOperator: null,
  awaitingOperand: false,
  hasResult: false,
};

// ─── Pure arithmetic helper ───────────────────────────────────────────────────

/**
 * Applies `operator` to `a` and `b`.
 * Returns `null` for division by zero so the caller can handle it gracefully.
 */
function applyOperator(operator: Operator, a: number, b: number): number | null {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) return null;
      return a / b;
  }
}

/**
 * Converts a numeric result to a display string, capping significant digits
 * so it always fits within MAX_DISPLAY_LENGTH characters.
 */
function formatResult(value: number): string {
  // Handle very large / very small numbers with exponential notation
  if (!isFinite(value)) return DISPLAY_ERROR;

  // Avoid -0
  const normalised = value === 0 ? 0 : value;

  // If the plain string representation fits, use it directly
  const plain = String(normalised);
  if (plain.length <= MAX_DISPLAY_LENGTH) return plain;

  // Otherwise try to trim decimal places while preserving precision
  const fixed = parseFloat(normalised.toPrecision(MAX_DISPLAY_LENGTH));
  const fixedStr = String(fixed);
  if (fixedStr.length <= MAX_DISPLAY_LENGTH) return fixedStr;

  // Fall back to exponential notation
  return normalised.toExponential(6);
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      const { digit } = action;

      // After a completed calculation, a new digit starts fresh (not appended)
      if (state.hasResult || state.awaitingOperand) {
        return {
          ...state,
          display: digit === '0' ? '0' : digit,
          awaitingOperand: false,
          hasResult: false,
        };
      }

      // Guard against exceeding the display length
      if (state.display.replace('-', '').replace('.', '').length >= MAX_DISPLAY_LENGTH) {
        return state;
      }

      // Replace the leading "0" unless the user is building a decimal like "0."
      const newDisplay =
        state.display === '0' || state.display === '-0' ? digit : state.display + digit;

      return { ...state, display: newDisplay };
    }

    case 'INPUT_DECIMAL': {
      // After a result or operator, start "0." fresh
      if (state.awaitingOperand || state.hasResult) {
        return {
          ...state,
          display: '0.',
          awaitingOperand: false,
          hasResult: false,
        };
      }

      // Only one decimal point allowed per number
      if (state.display.includes('.')) return state;

      return { ...state, display: state.display + '.' };
    }

    case 'INPUT_OPERATOR': {
      const { operator } = action;
      const currentValue = parseFloat(state.display);

      // Chain operations: if there's already a pending operator and the user
      // hasn't yet entered the second operand, just swap the operator.
      if (state.pendingOperator !== null && state.awaitingOperand) {
        return { ...state, pendingOperator: operator };
      }

      // If a previous value exists and we're not awaiting a new operand,
      // evaluate the pending operation before registering the new operator
      // (e.g. 2 + 3 * → shows 5, then awaits next operand).
      if (
        state.previousValue !== null &&
        state.pendingOperator !== null &&
        !state.awaitingOperand
      ) {
        const result = applyOperator(state.pendingOperator, state.previousValue, currentValue);

        if (result === null) {
          return { ...INITIAL_STATE, display: DISPLAY_ERROR };
        }

        const formatted = formatResult(result);
        if (formatted === DISPLAY_ERROR) {
          return { ...INITIAL_STATE, display: DISPLAY_ERROR };
        }

        return {
          display: formatted,
          previousValue: result,
          pendingOperator: operator,
          awaitingOperand: true,
          hasResult: false,
        };
      }

      // No prior operation — store current value and wait for next operand.
      return {
        ...state,
        previousValue: currentValue,
        pendingOperator: operator,
        awaitingOperand: true,
        hasResult: false,
      };
    }

    case 'CALCULATE': {
      // Nothing to evaluate
      if (state.pendingOperator === null || state.previousValue === null) {
        return { ...state, hasResult: true };
      }

      const currentValue = parseFloat(state.display);
      const result = applyOperator(state.pendingOperator, state.previousValue, currentValue);

      if (result === null) {
        return { ...INITIAL_STATE, display: DISPLAY_ERROR };
      }

      const formatted = formatResult(result);
      if (formatted === DISPLAY_ERROR) {
        return { ...INITIAL_STATE, display: DISPLAY_ERROR };
      }

      return {
        display: formatted,
        previousValue: null,
        pendingOperator: null,
        awaitingOperand: false,
        hasResult: true,
      };
    }

    case 'RESET': {
      return { ...INITIAL_STATE };
    }

    case 'TOGGLE_SIGN': {
      const value = parseFloat(state.display);
      if (isNaN(value) || value === 0) return state;
      const toggled = formatResult(value * -1);
      return { ...state, display: toggled };
    }

    case 'INPUT_PERCENT': {
      const value = parseFloat(state.display);
      if (isNaN(value)) return state;
      const percent = formatResult(value / 100);
      return { ...state, display: percent };
    }
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Core calculator logic hook.
 *
 * Manages display value, pending operator, and previous operand.
 * Handles digit input, operator chaining, result computation, and reset.
 *
 * @example
 * const { display, inputDigit, inputOperator, calculate, reset } = useCalculator();
 */
export function useCalculator(): UseCalculatorReturn {
  const [state, dispatch] = useReducer(calculatorReducer, INITIAL_STATE);

  const inputDigit = useCallback((digit: string) => {
    dispatch({ type: 'INPUT_DIGIT', digit });
  }, []);

  const inputDecimal = useCallback(() => {
    dispatch({ type: 'INPUT_DECIMAL' });
  }, []);

  const inputOperator = useCallback((operator: Operator) => {
    dispatch({ type: 'INPUT_OPERATOR', operator });
  }, []);

  const calculate = useCallback(() => {
    dispatch({ type: 'CALCULATE' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const toggleSign = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIGN' });
  }, []);

  const inputPercent = useCallback(() => {
    dispatch({ type: 'INPUT_PERCENT' });
  }, []);

  return {
    display: state.display,
    pendingOperator: state.pendingOperator,
    inputDigit,
    inputDecimal,
    inputOperator,
    calculate,
    reset,
    toggleSign,
    inputPercent,
  };
}
