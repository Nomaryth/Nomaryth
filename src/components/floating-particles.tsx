'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({ count = 20, className = "" }: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const particles: Particle[] = [];
      
      for (let i = 0; i < count; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.6 + 0.2,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 10,
        }); 
      }
      
      particlesRef.current = particles;
    };

    generateParticles();
  }, [count]);

  const particleVariants = {
    initial: (particle: Particle) => ({
      x: `${particle.x}vw`,
      y: `${particle.y}vh`,
      opacity: 0,
      scale: 0,
    }),
    animate: (particle: Particle) => ({
      x: [
        `${particle.x}vw`,
        `${particle.x + (Math.random() - 0.5) * 20}vw`,
        `${particle.x + (Math.random() - 0.5) * 15}vw`,
        `${particle.x}vw`,
      ],
      y: [
        `${particle.y}vh`,
        `${particle.y + (Math.random() - 0.5) * 15}vh`,
        `${particle.y + (Math.random() - 0.5) * 20}vh`,
        `${particle.y}vh`,
      ],
      opacity: [0, particle.opacity, particle.opacity, 0],
      scale: [0, 1, 1, 0],
      transition: {
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: "linear",
      },
    }),
  };

  const twinkleVariants = {
    animate: {
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    >
      {particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          custom={particle}
          variants={particleVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="relative"
            variants={twinkleVariants}
            animate="animate"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/60 via-accent/80 to-primary/60 rounded-full blur-[0.5px]"
              style={{
                boxShadow: `0 0 ${particle.size * 2}px rgba(251, 191, 36, 0.3)`,
              }}
            />
            
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
              style={{
                width: `${particle.size * 3}px`,
                height: '1px',
                filter: 'blur(0.5px)',
              }}
            />
            
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/60 to-transparent"
              style={{
                width: '1px',
                height: `${particle.size * 3}px`,
                filter: 'blur(0.5px)',
              }}
            />

            <div
              className="absolute inset-0 bg-primary/20 rounded-full"
              style={{
                transform: `scale(${1.5 + particle.size * 0.2})`,
                filter: 'blur(1px)',
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export function HeroFloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const particles: Particle[] = [];
      
      for (let i = 0; i < 40; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1.5,
          opacity: Math.random() * 0.8 + 0.4,
          duration: Math.random() * 25 + 10,
          delay: Math.random() * 20,
        });
      }
      
      particlesRef.current = particles;
    };

    generateParticles();
  }, []);

  const particleVariants = {
    initial: (particle: Particle) => ({
      x: `${particle.x}vw`,
      y: `${particle.y}vh`,
      opacity: 0,
      scale: 0,
    }),
    animate: (particle: Particle) => ({
      x: [
        `${particle.x}vw`,
        `${particle.x + (Math.random() - 0.5) * 15}vw`,
        `${particle.x + (Math.random() - 0.5) * 10}vw`,
        `${particle.x}vw`,
      ],
      y: [
        `${particle.y}vh`,
        `${particle.y + (Math.random() - 0.5) * 12}vh`,
        `${particle.y + (Math.random() - 0.5) * 18}vh`,
        `${particle.y}vh`,
      ],
      opacity: [
        0, 
        particle.opacity * 0.3, 
        particle.opacity, 
        particle.opacity * 0.6, 
        particle.opacity * 0.9,
        particle.opacity * 0.2,
        particle.opacity,
        0
      ],
      scale: [0, 0.8, 1, 1.2, 1, 0.6, 1.1, 0],
      transition: {
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1],
      },
    }),
  };

  const twinkleVariants = {
    animate: (particle: Particle) => ({
      opacity: [0.5, 1, 0.3, 0.8, 0.6, 1, 0.4],
      scale: [0.9, 1.3, 0.8, 1.1, 1.0, 1.2, 0.9],
      transition: {
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      },
    }),
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none opacity-85 mix-blend-screen"
      style={{ zIndex: 1 }}
    >
      {particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          custom={particle}
          variants={particleVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="relative"
            custom={particle}
            variants={twinkleVariants}
            animate="animate"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/80 via-accent/90 to-primary/80 rounded-full blur-[0.3px]"
              style={{
                boxShadow: `0 0 ${particle.size * 3}px rgba(251, 191, 36, 0.5)`,
              }}
            />
            
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/70 to-transparent"
              style={{
                width: `${particle.size * 4}px`,
                height: '1px',
                filter: 'blur(0.3px)',
              }}
            />
            
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/70 to-transparent"
              style={{
                width: '1px',
                height: `${particle.size * 4}px`,
                filter: 'blur(0.3px)',
              }}
            />

            <div
              className="absolute inset-0 bg-primary/30 rounded-full"
              style={{
                transform: `scale(${2 + particle.size * 0.3})`,
                filter: 'blur(1.5px)',
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export function LightweightFloatingParticles({ count = 15 }: { count?: number }) {
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const particles: Particle[] = [];
      
      for (let i = 0; i < count; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          duration: Math.random() * 30 + 20,
          delay: Math.random() * 15,
        });
      }
      
      particlesRef.current = particles;
    };

    generateParticles();
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      {particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 0,
          }}
          animate={{
            x: [
              `${particle.x}vw`,
              `${particle.x + (Math.random() - 0.5) * 10}vw`,
              `${particle.x}vw`,
            ],
            y: [
              `${particle.y}vh`,
              `${particle.y + (Math.random() - 0.5) * 8}vh`,
              `${particle.y}vh`,
            ],
            opacity: [0, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="bg-primary/60 rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(251, 191, 36, 0.2)`,
              filter: 'blur(0.5px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
