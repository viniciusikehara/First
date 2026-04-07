import { motion } from 'framer-motion';

import { FeatureCard } from '@/components/FeatureCard/FeatureCard';
import styles from './FeatureGrid.module.css';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Blazing Fast Vite',
    description:
      'Instant HMR and lightning-quick cold starts with Vite — the modern frontend tooling standard.',
  },
  {
    icon: '🔷',
    title: 'TypeScript First',
    description:
      'Strict TypeScript configuration out of the box for safer code, better DX, and confident refactoring.',
  },
  {
    icon: '🎞️',
    title: 'Framer Motion',
    description:
      'Polished, production-grade animations powered by Framer Motion — declarative and performant.',
  },
  {
    icon: '🎨',
    title: 'CSS Modules',
    description:
      'Scoped, conflict-free styles with CSS Modules. No runtime overhead, just clean local class names.',
  },
  {
    icon: '🧹',
    title: 'ESLint + Prettier',
    description:
      'Pre-configured linting and formatting rules keep code quality consistent across your entire team.',
  },
  {
    icon: '📐',
    title: 'Path Aliases',
    description:
      'Import with clean @/ aliases instead of fragile relative paths — configured in both Vite and TypeScript.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const FeatureGrid = () => {
  return (
    <section className={styles.section} id="features">
      <div className={styles.inner}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <p className={styles.sectionSubtitle}>
            A carefully assembled stack so you can focus on building your product, not configuring
            tooling.
          </p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
