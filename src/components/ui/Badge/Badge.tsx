import type { FC } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const Badge: FC<BadgeProps> = ({ label, variant = 'default' }) => {
  return <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>;
};
