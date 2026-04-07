import { useState } from 'react';
import { motion } from 'framer-motion';

import styles from './Calculator.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type KeyKind = 'number' | 'operator' | 'equals' | 'utility';

interface CalcKey {
  label: string;
  value: string;
  kind: KeyKind;
  wide?: boolean;
  ariaLabel?: string;
}

// ─── Key layout (standard iOS-style 4×5 grid) ────────────────────────────────

const KEYS: CalcKey[] = [
  { label: 'AC', value: 'clear', kind: 'utility', ariaLabel: 'Clear' },
  { label: '+/−', value: 'sign', kind: 'utility', ariaLabel: 'Toggle sign' },
  { label: '%', value: 'percent', kind: 'utility', ariaLabel: 'Percent' },
  { label: '÷', value: '/', kind: 'operator', ariaLabel: 'Divide' },

  { label: '7', value: '7', kind: 'number' },
  { label: '8', value: '8', kind: 'number' },
  { label: '9', value: '9', kind: 'number' },
  { label: '×', value: '*', kind: 'operator', ariaLabel: 'Multiply' },

  { label: '4', value: '4', kind: 'number' },
  { label: '5', value: '5', kind: 'number' },
  { label: '6', value: '6', kind: 'number' },
  { label: '−', value: '-', kind: 'operator', ariaLabel: 'Subtract' },

  { label: '1', value: '1', kind: 'number' },
  { label: '2', value: '2', kind: 'number' },
  { label: '3', value: '3', kind: 'number' },
  { label: '+', value: '+', kind: 'operator', ariaLabel: 'Add' },

  { label: '0', value: '0', kind: 'number', wide: true },
  { label: '.', value: '.', kind: 'number', ariaLabel: 'Decimal point' },
  { label: '=', value: 'equals', kind: 'equals', ariaLabel: 'Equals' },
];

// ─── Framer Motion variants ───────────────────────────────────────────────────

/**
 * whileTap: scale down to 0.92 to simulate a physical key press.
 * Spring transition keeps the bounce-back snappy and natural.
 * `z-index` is raised while pressed so the scaled button visually
 * sits on top of adjacent keys, preventing clipping artifacts.
 */
const tapAnimation = {
  scale: 0.92,
  zIndex: 1,
} as const;

const springTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPERATORS = new Set(['/', '*', '-', '+']);
const MAX_DISPLAY_LENGTH = 12;

function trimDisplay(value: string): string {
  if (value.length <= MAX_DISPLAY_LENGTH) return value;
  const num = parseFloat(value);
  if (isNaN(num)) return value.slice(0, MAX_DISPLAY_LENGTH);
  return num.toExponential(4);
}

// ─── State machine ────────────────────────────────────────────────────────────

interface CalcState {
  /** The value shown in the main (result) display */
  display: string;
  /** The secondary expression line shown above the result */
  expression: string;
  /** The accumulated left-hand operand (raw string) */
  operand: string;
  /** The pending operator */
  operator: string | null;
  /** True right after = was pressed, so next digit starts a fresh input */
  justEvaluated: boolean;
}

const INITIAL_STATE: CalcState = {
  display: '0',
  expression: '',
  operand: '',
  operator: null,
  justEvaluated: false,
};

function evaluate(a: string, op: string, b: string): string {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return '0';
  let result: number;
  switch (op) {
    case '+':
      result = x + y;
      break;
    case '-':
      result = x - y;
      break;
    case '*':
      result = x * y;
      break;
    case '/':
      result = y === 0 ? NaN : x / y;
      break;
    default:
      result = y;
  }
  if (!isFinite(result)) return 'Error';
  // Avoid floating-point noise by rounding to 10 sig-figs
  return parseFloat(result.toPrecision(10)).toString();
}

function calcReducer(state: CalcState, value: string): CalcState {
  const { display, expression, operand, operator, justEvaluated } = state;

  // ── Clear ──
  if (value === 'clear') {
    return { ...INITIAL_STATE };
  }

  // ── Digit or decimal ──
  if (!isNaN(Number(value)) || value === '.') {
    // Prevent multiple decimals
    if (value === '.' && display.includes('.')) return state;

    const newDisplay =
      display === '0' || justEvaluated ? (value === '.' ? '0.' : value) : display + value;

    return {
      ...state,
      display: newDisplay,
      expression: justEvaluated ? '' : expression,
      justEvaluated: false,
    };
  }

  // ── Percent ──
  if (value === 'percent') {
    const num = parseFloat(display) / 100;
    const result = parseFloat(num.toPrecision(10)).toString();
    return { ...state, display: result, expression: `${display}%`, justEvaluated: true };
  }

  // ── Toggle sign ──
  if (value === 'sign') {
    if (display === '0' || display === 'Error') return state;
    const toggled = display.startsWith('-') ? display.slice(1) : '-' + display;
    return { ...state, display: toggled };
  }

  // ── Operator ──
  if (OPERATORS.has(value)) {
    const symbolMap: Record<string, string> = { '/': '÷', '*': '×', '-': '−', '+': '+' };
    const symbol = symbolMap[value] ?? value;

    if (operator && !justEvaluated) {
      // Chain: evaluate previous operation first
      const result = evaluate(operand, operator, display);
      return {
        display: result,
        expression: `${result} ${symbol}`,
        operand: result,
        operator: value,
        justEvaluated: false,
      };
    }

    return {
      ...state,
      expression: `${display} ${symbol}`,
      operand: display,
      operator: value,
      justEvaluated: false,
    };
  }

  // ── Equals ──
  if (value === 'equals') {
    if (!operator) return state;
    const result = evaluate(operand, operator, display);
    const symbolMap: Record<string, string> = { '/': '÷', '*': '×', '-': '−', '+': '+' };
    const symbol = symbolMap[operator] ?? operator;
    return {
      display: result,
      expression: `${operand} ${symbol} ${display} =`,
      operand: '',
      operator: null,
      justEvaluated: true,
    };
  }

  return state;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Calculator = () => {
  const [state, setState] = useState<CalcState>(INITIAL_STATE);

  const handleKey = (value: string) => {
    setState((prev) => calcReducer(prev, value));
  };

  const kindToClass: Record<KeyKind, string> = {
    number: '',
    operator: styles.btnOperator,
    equals: styles.btnEquals,
    utility: styles.btnUtility,
  };

  return (
    <section className={styles.section} aria-label="Calculator">
      <motion.div
        className={styles.wrapper}
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Display ── */}
        <div className={styles.display} aria-live="polite" aria-atomic="true">
          <span className={styles.expression} aria-label="Expression">
            {state.expression}
          </span>
          <span className={styles.result} aria-label="Result">
            {trimDisplay(state.display)}
          </span>
        </div>

        {/* ── Key grid ── */}
        <div className={styles.grid} role="group" aria-label="Calculator keys">
          {KEYS.map((key) => {
            const extraClass = kindToClass[key.kind];
            const wideClass = key.wide ? styles.btnWide : '';
            const className = [styles.btn, extraClass, wideClass].filter(Boolean).join(' ');

            return (
              <motion.button
                key={key.value + (key.wide ? '-wide' : '')}
                type="button"
                className={className}
                onClick={() => handleKey(key.value)}
                aria-label={key.ariaLabel ?? key.label}
                /**
                 * whileTap drives the press animation:
                 *   • scale 0.92  → satisfies "scale down slightly on press"
                 *   • zIndex 1    → pressed key stays above siblings visually
                 *
                 * The spring transition provides the bounce-back so it feels
                 * snappy on both mouse click AND touch (Framer Motion handles
                 * pointer/touch events uniformly via the Pointer Events API).
                 */
                whileTap={tapAnimation}
                transition={springTransition}
              >
                {key.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};
