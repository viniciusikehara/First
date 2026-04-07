import { motion } from 'framer-motion';
import styles from './Footer.module.css';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className={styles.footer}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {year} <strong>First Project</strong>. Built with React, TypeScript & Framer Motion.
        </p>
        <div className={styles.links}>
          <a
            href="https://vitejs.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Vite
          </a>
          <span className={styles.separator}>·</span>
          <a
            href="https://www.framer.com/motion/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Framer Motion
          </a>
          <span className={styles.separator}>·</span>
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            React
          </a>
        </div>
      </div>
    </motion.footer>
  );
};
