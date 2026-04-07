import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Header } from '@/components/Header/Header';
import { HeroSection } from '@/components/HeroSection/HeroSection';
import { FeatureGrid } from '@/components/FeatureGrid/FeatureGrid';
import { Calculator } from '@/components/Calculator/Calculator';
import { Footer } from '@/components/Footer/Footer';

import styles from './App.module.css';

function App() {
  const [isDark, setIsDark] = useState<boolean>(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div className={`${styles.appWrapper} ${isDark ? styles.dark : ''}`}>
      <AnimatePresence>
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className={styles.main}>
          <HeroSection />
          <FeatureGrid />
          <Calculator />
        </main>
        <Footer />
      </AnimatePresence>
    </div>
  );
}

export default App;
