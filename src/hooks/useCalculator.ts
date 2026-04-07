import { useState, useCallback } from 'react';

import type { CalcHandlers, CalcOperator, CalcState } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_DISPLAY = '0';
const MAX_DISPLAY_LENGTH = 12;

// ---------------------------------------------------------------------------
// Pure arithmetic helper
// ---------------------------------------------------------------------------

/**
 * Applies `operator` to `a` and `b` and returns the result as a string.
 * Returns `'Error'` on division by zero.
 */
function applyOperator(a: number, b: number, operator: CalcOperator): string {
  let result: number;

  switch (operator) {
    case '+':
      result = a + b;
      break;
    case '−':
      result = a - b;
      break;
    case '×':
      result = a * b;
      break;
    case '÷':
      if (b === 0) return 'Error';
      result = a / b;
      break;
  }

  // Avoid floating-point display noise (e.g. 0.1 + 0.2 → 0.3 not 0.30000…)
  const rounded = parseFloat(result.toPrecision(10));
  return String(rounded);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Core calculator logic as a custom React hook.
 *
 * Manages current display value, pending operator, previous operand, and a
 * `waitingForNextOperand` flag that causes the next digit press to **replace**
 * the display rather than append to it.
 *
 * @example
 * const { display, operator, waitingForNextOperand, handleDigit,
 *         handleOperator, handleEquals, handleReset } = useCalculator();
 */
export function useCalculator(): CalcState & CalcHandlers {
  const [display, setDisplay] = useState<string>(INITIAL_DISPLAY);
  const [operator, setOperator] = useState<CalcOperator | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [waitingForNextOperand, setWaitingForNextOperand] = useState<boolean>(false);

  // -------------------------------------------------------------------------
  // handleDigit
  // -------------------------------------------------------------------------

  const handleDigit = useCallback(
    (digit: string) => {
      // Decimal point guard: only one '.' allowed per number
      if (digit === '.' && !waitingForNextOperand && display.includes('.')) return;

      if (waitingForNextOperand) {
        // Replace the display with the new digit; '.' starts as '0.'
        setDisplay(digit === '.' ? '0.' : digit);
        setWaitingForNextOperand(false);
        return;
      }

      // Prevent exceeding the maximum display length
      if (display.replace('-', '').replace('.', '').length >= MAX_DISPLAY_LENGTH) return;

      // '0' as sole display: replace with the digit (except '.' which appends)
      const nextDisplay = display === INITIAL_DISPLAY && digit !== '.' ? digit : display + digit;

      setDisplay(nextDisplay);
    },
    [display, waitingForNextOperand],
  );

  // -------------------------------------------------------------------------
  // handleOperator
  // -------------------------------------------------------------------------

  const handleOperator = useCallback(
    (op: CalcOperator) => {
      // Ignore operator presses when the display is in an error state
      if (display === 'Error') return;

      if (operator !== null && !waitingForNextOperand && previousValue !== null) {
        // Chain: evaluate the pending operation first, then use its result as
        // the new left operand for the incoming operator
        const chained = applyOperator(parseFloat(previousValue), parseFloat(display), operator);
        setDisplay(chained);
        setPreviousValue(chained);
      } else {
        // First operator press: store the current display as the left operand
        setPreviousValue(display);
      }

      setOperator(op);
      setWaitingForNextOperand(true);
    },
    [display, operator, previousValue, waitingForNextOperand],
  );

  // -------------------------------------------------------------------------
  // handleEquals
  // -------------------------------------------------------------------------

  const handleEquals = useCallback(() => {
    // Nothing to evaluate if there is no pending operator or left operand
    if (operator === null || previousValue === null) return;

    // When '=' is pressed while still waiting (i.e. no second operand typed),
    // use the left operand itself as the right operand so the pending
    // expression resolves cleanly (e.g. 5 + = → 10)
    const right = waitingForNextOperand ? parseFloat(previousValue) : parseFloat(display);
    const left = parseFloat(previousValue);
    const result = applyOperator(left, right, operator);

    setDisplay(result);
    setOperator(null);
    setPreviousValue(null);
    setWaitingForNextOperand(false);
  }, [display, operator, previousValue, waitingForNextOperand]);

  // -------------------------------------------------------------------------
  // handleReset  (AC — All Clear)
  // -------------------------------------------------------------------------

  const handleReset = useCallback(() => {
    setDisplay(INITIAL_DISPLAY);
    setOperator(null);
    setPreviousValue(null);
    setWaitingForNextOperand(false);
  }, []);

  // -------------------------------------------------------------------------
  // Return combined state + handlers
  // -------------------------------------------------------------------------

  return {
    // state
    display,
    operator,
    waitingForNextOperand,
    // handlers
    handleDigit,
    handleOperator,
    handleEquals,
    handleReset,
  };
}
