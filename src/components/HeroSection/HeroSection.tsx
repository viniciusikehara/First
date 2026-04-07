import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Calculator } from '@/components/Calculator/Calculator';
import styles from './HeroSection.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const HeroSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* ── Copy column ─────────────────────────────────────────────────── */}
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge label="v1.0.0 — Now Live 🎉" />
          </motion.div>

        <motion.h1 className={styles.heading} variants={itemVariants}>
          Build faster with <span className={styles.highlight}>First Project</span>
        </motion.h1>

        <motion.p className={styles.subheading} variants={itemVariants}>
          A production-ready React + TypeScript starter with Framer Motion animations, CSS Modules,
          and Vite — so you can ship beautiful products without the boilerplate headache.
        </motion.p>

          <motion.div className={styles.actions} variants={itemVariants}>
            <Button variant="primary" size="lg">
              Get Started →
            </Button>
            <Button variant="outline" size="lg">
              View on GitHub
            </Button>
          </motion.div>

          <motion.div className={styles.stackPills} variants={itemVariants}>
            {['React 18', 'TypeScript', 'Framer Motion', 'Vite', 'CSS Modules'].map((tech) => (
              <span key={tech} className={styles.pill}>
                {tech}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Calculator demo column ───────────────────────────────────────── */}
        <div className={styles.demoWrapper}>
          <span className={styles.demoLabel}>Live demo ↓</span>
          <Calculator />
        </div>
      </div>

      {/* Decorative animated blobs */}
      <motion.div
        className={`${styles.blob} ${styles.blob1}`}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`${styles.blob} ${styles.blob2}`}
        animate={{ scale: [1, 1.1, 1], rotate: [0, -20, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
    </section>
  );
};
