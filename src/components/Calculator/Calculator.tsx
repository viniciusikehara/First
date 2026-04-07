import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './Calculator.module.css';

// ─── Animation variants ───────────────────────────────────────────────────────

/** Entering value: starts below and fades in, slides up into place */
const enterVariants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    transition: { duration: 0.16, ease: [0.55, 0, 1, 0.45] },
  },
};

// ─── Calculator logic ─────────────────────────────────────────────────────────

type Operator = '+' | '−' | '×' | '÷';

interface CalcState {
  /** The left-hand operand (as a display string) */
  lhs: string;
  /** The chosen operator */
  operator: Operator | null;
  /** The right-hand operand being entered */
  rhs: string;
  /** Whether we just pressed = and should start fresh on next digit */
  justEvaled: boolean;
}

const INITIAL_STATE: CalcState = {
  lhs: '0',
  operator: null,
  rhs: '',
  justEvaled: false,
};

/** Converts display operator symbol to a JS operator. */
function evaluate(lhs: string, operator: Operator, rhs: string): string {
  const a = parseFloat(lhs);
  const b = parseFloat(rhs);
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
  // Keep it readable: trim long floats to 10 significant digits
  return parseFloat(result.toPrecision(10)).toString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Calculator = () => {
  const [calc, setCalc] = useState<CalcState>(INITIAL_STATE);

  // ── Derived display values ──────────────────────────────────────────────────

  /**
   * The large "result" line — shows the active operand being typed,
   * or the evaluated result after pressing =.
   */
  const resultDisplay: string = calc.operator ? (calc.rhs === '' ? calc.lhs : calc.rhs) : calc.lhs;

  /**
   * The small "expression" line — shows the running expression,
   * e.g. "12 + " or "12 + 5 =".
   */
  const expressionDisplay: string = (() => {
    if (!calc.operator) return calc.justEvaled ? `${calc.lhs} =` : '';
    if (calc.rhs === '') return `${calc.lhs} ${calc.operator}`;
    return `${calc.lhs} ${calc.operator} ${calc.rhs}`;
  })();

  // ── Button handlers ─────────────────────────────────────────────────────────

  const handleDigit = useCallback((digit: string) => {
    setCalc((prev) => {
      // After evaluation, start a brand-new input
      if (prev.justEvaled) {
        return { ...INITIAL_STATE, lhs: digit, justEvaled: false };
      }
      if (prev.operator === null) {
        // Editing lhs
        const next = prev.lhs === '0' && digit !== '.' ? digit : prev.lhs + digit;
        return { ...prev, lhs: next };
      }
      // Editing rhs
      const next = prev.rhs === '0' && digit !== '.' ? digit : prev.rhs + digit;
      return { ...prev, rhs: next };
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setCalc((prev) => {
      if (prev.justEvaled) {
        return { ...INITIAL_STATE, lhs: '0.', justEvaled: false };
      }
      if (prev.operator === null) {
        if (prev.lhs.includes('.')) return prev;
        return { ...prev, lhs: prev.lhs + '.' };
      }
      const base = prev.rhs === '' ? '0' : prev.rhs;
      if (base.includes('.')) return prev;
      return { ...prev, rhs: base + '.' };
    });
  }, []);

  const handleOperator = useCallback((op: Operator) => {
    setCalc((prev) => {
      // Chain: if there's already a pending operation, evaluate it first
      if (prev.operator !== null && prev.rhs !== '') {
        const chained = evaluate(prev.lhs, prev.operator, prev.rhs);
        return { lhs: chained, operator: op, rhs: '', justEvaled: false };
      }
      return { ...prev, operator: op, rhs: '', justEvaled: false };
    });
  }, []);

  const handleEquals = useCallback(() => {
    setCalc((prev) => {
      if (!prev.operator || prev.rhs === '') return prev;
      const result = evaluate(prev.lhs, prev.operator, prev.rhs);
      return { lhs: result, operator: null, rhs: '', justEvaled: true };
    });
  }, []);

  const handleClear = useCallback(() => {
    setCalc(INITIAL_STATE);
  }, []);

  const handleToggleSign = useCallback(() => {
    setCalc((prev) => {
      if (prev.operator === null) {
        const toggled = prev.lhs.startsWith('-')
          ? prev.lhs.slice(1)
          : prev.lhs === '0'
            ? '0'
            : '-' + prev.lhs;
        return { ...prev, lhs: toggled };
      }
      if (prev.rhs !== '') {
        const toggled = prev.rhs.startsWith('-') ? prev.rhs.slice(1) : '-' + prev.rhs;
        return { ...prev, rhs: toggled };
      }
      return prev;
    });
  }, []);

  const handlePercent = useCallback(() => {
    setCalc((prev) => {
      if (prev.operator === null) {
        const val = parseFloat(prev.lhs) / 100;
        return { ...prev, lhs: parseFloat(val.toPrecision(10)).toString() };
      }
      if (prev.rhs !== '') {
        const val = parseFloat(prev.rhs) / 100;
        return { ...prev, rhs: parseFloat(val.toPrecision(10)).toString() };
      }
      return prev;
    });
  }, []);

  // ─── Button layout ──────────────────────────────────────────────────────────

  type ButtonDef = {
    label: string;
    action: () => void;
    variant?: 'function' | 'operator' | 'equals' | 'digit';
    wide?: boolean;
  };

  const buttons: ButtonDef[][] = [
    [
      { label: 'AC', action: handleClear, variant: 'function' },
      { label: '+/−', action: handleToggleSign, variant: 'function' },
      { label: '%', action: handlePercent, variant: 'function' },
      { label: '÷', action: () => handleOperator('÷'), variant: 'operator' },
    ],
    [
      { label: '7', action: () => handleDigit('7'), variant: 'digit' },
      { label: '8', action: () => handleDigit('8'), variant: 'digit' },
      { label: '9', action: () => handleDigit('9'), variant: 'digit' },
      { label: '×', action: () => handleOperator('×'), variant: 'operator' },
    ],
    [
      { label: '4', action: () => handleDigit('4'), variant: 'digit' },
      { label: '5', action: () => handleDigit('5'), variant: 'digit' },
      { label: '6', action: () => handleDigit('6'), variant: 'digit' },
      { label: '−', action: () => handleOperator('−'), variant: 'operator' },
    ],
    [
      { label: '1', action: () => handleDigit('1'), variant: 'digit' },
      { label: '2', action: () => handleDigit('2'), variant: 'digit' },
      { label: '3', action: () => handleDigit('3'), variant: 'digit' },
      { label: '+', action: () => handleOperator('+'), variant: 'operator' },
    ],
    [
      { label: '0', action: () => handleDigit('0'), variant: 'digit', wide: true },
      { label: '.', action: handleDecimal, variant: 'digit' },
      { label: '=', action: handleEquals, variant: 'equals' },
    ],
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className={styles.calculator}
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Calculator"
      role="application"
    >
      {/* ── Display ──────────────────────────────────────────────────────────── */}
      <div className={styles.display} aria-live="polite" aria-atomic="true">
        {/* Expression line */}
        <div className={styles.expressionRow}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={expressionDisplay}
              className={styles.expression}
              variants={enterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {expressionDisplay || '\u00A0' /* non-breaking space to hold height */}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Result line */}
        <div className={styles.resultRow}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={resultDisplay}
              className={styles.result}
              variants={enterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {resultDisplay}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Keypad ───────────────────────────────────────────────────────────── */}
      <div className={styles.keypad} role="group" aria-label="Calculator buttons">
        {buttons.map((row, rowIdx) => (
          <div key={rowIdx} className={styles.row}>
            {row.map((btn) => (
              <motion.button
                key={btn.label}
                className={[styles.key, styles[btn.variant ?? 'digit'], btn.wide ? styles.wide : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={btn.action}
                whileTap={{ scale: 0.91 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                aria-label={btn.label}
              >
                {btn.label}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
