import { motion } from 'framer-motion';

import { Calculator } from '@/components/Calculator/Calculator';
import styles from './CalculatorSection.module.css';

export const CalculatorSection = () => {
  return (
    <section className={styles.section} id="calculator">
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>Try it out</h2>
          <p className={styles.subtitle}>
            Every key uses Framer Motion&rsquo;s <code>whileTap</code> with a spring transition —
            press any button to feel the bounce.
          </p>
        </motion.div>

        <div className={styles.calcWrapper}>
          <Calculator />
        </div>
      </div>
    </section>
  );
};
