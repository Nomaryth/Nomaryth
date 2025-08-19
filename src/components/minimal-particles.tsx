'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MinimalParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export function MinimalFloatingParticles() {
  const [particles, setParticles] = useState<MinimalParticle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: MinimalParticle[] = [];
      
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 10,
        });
      }
      
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: '0 0 4px rgba(251, 191, 36, 0.3)',
          }}
          initial={{ 
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.8, 0],
            scale: [0, 1, 0.8, 1.2, 0],
            x: [0, Math.random() * 20 - 10, Math.random() * 15 - 7.5, 0],
            y: [0, Math.random() * 15 - 7.5, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 25 + Math.random() * 15, // 25-40s
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function TwinklingStars() {
  const [stars, setStars] = useState<MinimalParticle[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: MinimalParticle[] = [];
      
      for (let i = 0; i < 8; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5,
        });
      }
      
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: star.delay }}
        >
          <motion.div
            className="relative w-1 h-1 bg-primary/60 rounded-full"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              boxShadow: '0 0 6px rgba(251, 191, 36, 0.4)',
              filter: 'blur(0.3px)',
            }}
          />
          
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            style={{
              width: '8px',
              height: '0.5px',
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scaleX: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
            style={{
              width: '0.5px',
              height: '8px',
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scaleY: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
