import { motion } from 'framer-motion';

import type { FC } from 'react';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      className={styles.card}
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={styles.iconWrapper}>
        <span className={styles.icon} role="img" aria-label={title}>
          {icon}
        </span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </motion.div>
  );
};
