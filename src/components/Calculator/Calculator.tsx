import { useState } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/utils/cn';
import styles from './Calculator.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonKind = 'number' | 'operator' | 'clear' | 'equals';

interface CalcButton {
  label: string;
  value: string;
  kind: ButtonKind;
  /** Aria-label override for symbol buttons */
  ariaLabel?: string;
}

// ─── Button definitions (row-major, 4 × 4) ───────────────────────────────────

const BUTTONS: CalcButton[] = [
  { label: '7', value: '7', kind: 'number' },
  { label: '8', value: '8', kind: 'number' },
  { label: '9', value: '9', kind: 'number' },
  { label: '÷', value: '÷', kind: 'operator', ariaLabel: 'divide' },

  { label: '4', value: '4', kind: 'number' },
  { label: '5', value: '5', kind: 'number' },
  { label: '6', value: '6', kind: 'number' },
  { label: '×', value: '×', kind: 'operator', ariaLabel: 'multiply' },

  { label: '1', value: '1', kind: 'number' },
  { label: '2', value: '2', kind: 'number' },
  { label: '3', value: '3', kind: 'number' },
  { label: '−', value: '−', kind: 'operator', ariaLabel: 'subtract' },

  { label: 'AC', value: 'AC', kind: 'clear', ariaLabel: 'clear' },
  { label: '0', value: '0', kind: 'number' },
  { label: '=', value: '=', kind: 'equals', ariaLabel: 'equals' },
  { label: '+', value: '+', kind: 'operator', ariaLabel: 'add' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPERATORS = new Set(['÷', '×', '−', '+']);

/** Evaluate an expression string that uses ÷ × − as operator symbols. */
function evaluate(expression: string): string {
  // Replace display operators with JS equivalents
  const normalised = expression
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/−/g, '-');

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${normalised})`)() as number;
    if (!isFinite(result)) return 'Error';
    // Trim floating-point noise (e.g. 0.1 + 0.2 → 0.3)
    return String(parseFloat(result.toPrecision(12)));
  } catch {
    return 'Error';
  }
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 32 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.15 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Calculator = () => {
  /**
   * `expression` — the full expression string built up by the user
   * `display`    — what is shown in the readout (may differ after evaluation)
   * `justEvaled` — true immediately after pressing "="; next digit starts fresh
   */
  const [expression, setExpression] = useState<string>('');
  const [display, setDisplay] = useState<string>('0');
  const [justEvaled, setJustEvaled] = useState<boolean>(false);

  const handleButton = (btn: CalcButton) => {
    if (btn.kind === 'clear') {
      setExpression('');
      setDisplay('0');
      setJustEvaled(false);
      return;
    }

    if (btn.kind === 'equals') {
      if (expression === '') return;
      const result = evaluate(expression);
      setDisplay(result);
      setExpression(result === 'Error' ? '' : result);
      setJustEvaled(true);
      return;
    }

    if (btn.kind === 'operator') {
      // If there's an error on display, reset before applying an operator
      if (display === 'Error') {
        setExpression('');
        setDisplay('0');
        setJustEvaled(false);
        return;
      }
      // Replace a trailing operator instead of appending a second one
      const trimmed = expression.replace(/[÷×−+]$/, '');
      const next = trimmed + btn.value;
      setExpression(next);
      setDisplay(btn.value);
      setJustEvaled(false);
      return;
    }

    // Digit
    if (justEvaled) {
      // Start a brand-new expression after evaluation
      setExpression(btn.value);
      setDisplay(btn.value);
      setJustEvaled(false);
      return;
    }

    // Prevent multiple leading zeros
    if (btn.value === '0' && expression === '0') return;

    const next = expression === '0' ? btn.value : expression + btn.value;
    setExpression(next);
    setDisplay(
      // Show only the current operand (everything after the last operator)
      (() => {
        const parts = next.split(/[÷×−+]/);
        return parts[parts.length - 1] || btn.value;
      })(),
    );
  };

  const kindClass: Record<ButtonKind, string> = {
    number: styles.btnNumber,
    operator: styles.btnOperator,
    clear: styles.btnClear,
    equals: styles.btnEquals,
  };

  const isOperatorActive = (btn: CalcButton) =>
    OPERATORS.has(display) && display === btn.value;

  return (
    <section className={styles.section} aria-label="Calculator">
      <motion.div
        className={styles.calculator}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Display ── */}
        <div className={styles.display} aria-live="polite" aria-label={`Result: ${display}`}>
          <span className={styles.expressionLine}>{expression || ''}</span>
          <span className={cn(styles.displayValue, display.length > 9 && styles.displayValueSm)}>
            {display}
          </span>
        </div>

        {/* ── Button grid ── */}
        <motion.div
          className={styles.grid}
          role="group"
          aria-label="Calculator buttons"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {BUTTONS.map((btn) => (
            <motion.button
              key={btn.value}
              className={cn(
                styles.btn,
                kindClass[btn.kind],
                isOperatorActive(btn) && styles.btnOperatorActive,
              )}
              onClick={() => handleButton(btn)}
              aria-label={btn.ariaLabel ?? btn.label}
              variants={buttonVariants}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            >
              {btn.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
