import { motion } from 'framer-motion';

import type { FC } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <motion.header
      className={styles.header}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>First Project</span>
        </a>

        <nav className={styles.nav}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#about" className={styles.navLink}>About</a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            GitHub
          </a>
        </nav>

        <button
          className={styles.themeToggle}
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </motion.header>
  );
};
