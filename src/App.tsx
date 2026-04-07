import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Header } from '@/components/Header/Header';
import { HeroSection } from '@/components/HeroSection/HeroSection';
import { FeatureGrid } from '@/components/FeatureGrid/FeatureGrid';
import { Calculator } from '@/components/Calculator/Calculator';
import { Footer } from '@/components/Footer/Footer';

import styles from './App.module.css';

const calculatorVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function App() {
  const [isDark, setIsDark] = useState<boolean>(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <motion.div
      className={`${styles.appWrapper} ${isDark ? styles.dark : ''}`}
      variants={calculatorVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className={styles.main}>
          <HeroSection />
          <Calculator />
          <FeatureGrid />
          <Calculator />
        </main>
        <Footer />
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
