import { useReducer } from 'react';
import { motion } from 'framer-motion';

import type { FC } from 'react';
import styles from './Calculator.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type Operator = '+' | '−' | '×' | '÷';

interface CalcState {
  display: string;
  prev: string;
  operator: Operator | null;
  waitingForOperand: boolean;
  hasResult: boolean;
}

type CalcAction =
  | { type: 'DIGIT'; payload: string }
  | { type: 'DECIMAL' }
  | { type: 'OPERATOR'; payload: Operator }
  | { type: 'EQUALS' }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'PERCENT' }
  | { type: 'BACKSPACE' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_DISPLAY_DIGITS = 12;

function applyOperator(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b !== 0 ? a / b : NaN;
  }
}

function formatResult(value: number): string {
  if (!isFinite(value)) return 'Error';
  if (isNaN(value)) return 'Error';

  const str = parseFloat(value.toPrecision(10)).toString();
  // Truncate if the number of digits exceeds the display limit
  if (str.replace(/[^0-9]/g, '').length > MAX_DISPLAY_DIGITS) {
    return parseFloat(value.toPrecision(8)).toString();
  }
  return str;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: CalcState = {
  display: '0',
  prev: '',
  operator: null,
  waitingForOperand: false,
  hasResult: false,
};

function calcReducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case 'DIGIT': {
      const { payload: digit } = action;

      // After a result, start fresh unless continuing with a new number
      if (state.hasResult && !state.waitingForOperand) {
        return {
          ...initialState,
          display: digit === '0' ? '0' : digit,
        };
      }

      if (state.waitingForOperand) {
        return {
          ...state,
          display: digit,
          waitingForOperand: false,
          hasResult: false,
        };
      }

      // Guard against going beyond display capacity
      const currentDigits = state.display.replace(/[^0-9]/g, '').length;
      if (currentDigits >= MAX_DISPLAY_DIGITS) return state;

      const newDisplay = state.display === '0' && digit !== '.' ? digit : state.display + digit;

      return { ...state, display: newDisplay, hasResult: false };
    }

    case 'DECIMAL': {
      if (state.waitingForOperand) {
        return { ...state, display: '0.', waitingForOperand: false };
      }
      if (state.display.includes('.')) return state;
      return { ...state, display: state.display + '.', hasResult: false };
    }

    case 'OPERATOR': {
      const { payload: operator } = action;
      const current = parseFloat(state.display);

      // Chain operators: evaluate the pending operation first
      if (state.operator && !state.waitingForOperand) {
        const prev = parseFloat(state.prev);
        const result = applyOperator(prev, current, state.operator);
        const resultStr = formatResult(result);
        return {
          ...state,
          display: resultStr,
          prev: resultStr,
          operator,
          waitingForOperand: true,
          hasResult: false,
        };
      }

      return {
        ...state,
        prev: state.display,
        operator,
        waitingForOperand: true,
        hasResult: false,
      };
    }

    case 'EQUALS': {
      if (!state.operator || state.waitingForOperand) return state;

      const a = parseFloat(state.prev);
      const b = parseFloat(state.display);
      const result = applyOperator(a, b, state.operator);
      const resultStr = formatResult(result);

      return {
        ...initialState,
        display: resultStr,
        hasResult: true,
      };
    }

    case 'CLEAR':
      return { ...initialState };

    case 'TOGGLE_SIGN': {
      if (state.display === '0' || state.display === 'Error') return state;
      const toggled = state.display.startsWith('-') ? state.display.slice(1) : '-' + state.display;
      return { ...state, display: toggled };
    }

    case 'PERCENT': {
      const num = parseFloat(state.display);
      if (isNaN(num)) return state;
      return { ...state, display: formatResult(num / 100), hasResult: false };
    }

    case 'BACKSPACE': {
      if (state.waitingForOperand || state.hasResult) return state;
      if (state.display.length <= 1 || state.display === 'Error') {
        return { ...state, display: '0' };
      }
      return { ...state, display: state.display.slice(0, -1) };
    }

    default:
      return state;
  }
}

// ─── Button press animation ───────────────────────────────────────────────────

const TAP_ANIMATION = { scale: 0.92 } as const;

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 500,
  damping: 22,
  mass: 0.8,
} as const;

// ─── Key definitions ──────────────────────────────────────────────────────────

interface CalcKey {
  label: string;
  ariaLabel: string;
  variant: 'function' | 'operator' | 'digit' | 'equals';
  wide?: boolean;
  action: CalcAction;
}

const KEYS: CalcKey[] = [
  { label: 'AC', ariaLabel: 'Clear', variant: 'function', action: { type: 'CLEAR' } },
  { label: '+/−', ariaLabel: 'Toggle sign', variant: 'function', action: { type: 'TOGGLE_SIGN' } },
  { label: '%', ariaLabel: 'Percent', variant: 'function', action: { type: 'PERCENT' } },
  {
    label: '÷',
    ariaLabel: 'Divide',
    variant: 'operator',
    action: { type: 'OPERATOR', payload: '÷' },
  },

  { label: '7', ariaLabel: '7', variant: 'digit', action: { type: 'DIGIT', payload: '7' } },
  { label: '8', ariaLabel: '8', variant: 'digit', action: { type: 'DIGIT', payload: '8' } },
  { label: '9', ariaLabel: '9', variant: 'digit', action: { type: 'DIGIT', payload: '9' } },
  {
    label: '×',
    ariaLabel: 'Multiply',
    variant: 'operator',
    action: { type: 'OPERATOR', payload: '×' },
  },

  { label: '4', ariaLabel: '4', variant: 'digit', action: { type: 'DIGIT', payload: '4' } },
  { label: '5', ariaLabel: '5', variant: 'digit', action: { type: 'DIGIT', payload: '5' } },
  { label: '6', ariaLabel: '6', variant: 'digit', action: { type: 'DIGIT', payload: '6' } },
  {
    label: '−',
    ariaLabel: 'Subtract',
    variant: 'operator',
    action: { type: 'OPERATOR', payload: '−' },
  },

  { label: '1', ariaLabel: '1', variant: 'digit', action: { type: 'DIGIT', payload: '1' } },
  { label: '2', ariaLabel: '2', variant: 'digit', action: { type: 'DIGIT', payload: '2' } },
  { label: '3', ariaLabel: '3', variant: 'digit', action: { type: 'DIGIT', payload: '3' } },
  { label: '+', ariaLabel: 'Add', variant: 'operator', action: { type: 'OPERATOR', payload: '+' } },

  {
    label: '0',
    ariaLabel: '0',
    variant: 'digit',
    wide: true,
    action: { type: 'DIGIT', payload: '0' },
  },
  { label: '.', ariaLabel: 'Decimal point', variant: 'digit', action: { type: 'DECIMAL' } },
  { label: '=', ariaLabel: 'Equals', variant: 'equals', action: { type: 'EQUALS' } },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const Calculator: FC = () => {
  const [state, dispatch] = useReducer(calcReducer, initialState);

  const isError = state.display === 'Error';

  // Shrink font size for long numbers to prevent overflow
  const displayFontSize =
    state.display.length > 9 ? '1.8rem' : state.display.length > 6 ? '2.4rem' : '3rem';

  return (
    <motion.div
      className={styles.calculator}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="application"
      aria-label="Calculator"
    >
      {/* Display */}
      <div className={styles.display} aria-live="polite" aria-atomic="true">
        <div className={styles.expressionRow}>
          {state.operator && state.prev ? (
            <span className={styles.expression}>
              {state.prev} {state.operator}
            </span>
          ) : null}
        </div>
        <div
          className={`${styles.displayValue} ${isError ? styles.displayError : ''}`}
          style={{ fontSize: displayFontSize }}
          aria-label={`Display: ${state.display}`}
        >
          {state.display}
        </div>
      </div>

      {/* Keypad */}
      <div className={styles.keypad} role="group" aria-label="Calculator keys">
        {KEYS.map((key) => (
          <motion.button
            key={key.ariaLabel}
            className={[styles.key, styles[key.variant], key.wide ? styles.wide : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => dispatch(key.action)}
            aria-label={key.ariaLabel}
            // ── Press animation ──────────────────────────────────────
            whileTap={TAP_ANIMATION}
            transition={SPRING_TRANSITION}
          >
            {key.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
