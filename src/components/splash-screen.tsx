'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular tempo de carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Grid de fundo */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-20">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "border-[0.5px] border-accent/20",
                  i % 2 === 0 ? "animate-pulse-slow" : "animate-pulse-slower"
                )}
              />
            ))}
          </div>

          {/* Container principal */}
          <div className="relative w-full max-w-lg px-4">
            {/* Linhas de escaneamento */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-[2px] bg-accent/30 animate-scan" />
            </div>

            {/* Logo container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex flex-col items-center"
            >
              {/* Hexágono externo */}
              <div className="absolute w-48 h-48 border-2 border-accent/50 rotate-45 animate-pulse-slow" />
              <div className="absolute w-48 h-48 border-2 border-accent/30 -rotate-45 animate-pulse-slower" />

              {/* Logo central */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative z-10 mb-8"
              >
                <h1 className="text-6xl font-black font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent animate-gradient">
                  NOMARYTH
                </h1>
              </motion.div>

              {/* Barra de progresso */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-full h-1 bg-accent/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-accent animate-pulse" />
              </motion.div>

              {/* Status de carregamento */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="mt-4 text-sm text-accent/80 font-mono tracking-wider"
              >
                INITIALIZING SYSTEMS...
              </motion.div>

              {/* Efeito de glitch decorativo */}
              <div className="absolute -inset-4 border border-accent/20 skew-x-12 -skew-y-12 animate-glitch" />
              <div className="absolute -inset-4 border border-accent/20 -skew-x-12 skew-y-12 animate-glitch-2" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
