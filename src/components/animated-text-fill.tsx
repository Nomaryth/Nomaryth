'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedTextFillProps {
  text1: string;
  text2: string;
  className?: string;
}

export function AnimatedTextFill({ text1, text2, className = "" }: AnimatedTextFillProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [text1, text2]);

  return (
    <div className={`relative ${className}`}>
      <motion.span
        key={`text1-${animationKey}`}
        className="relative block text-white/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {text1}
        
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 3,
            delay: 1,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 2,
          }}
        >
          <div className="h-full w-full bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">
            {text1}
          </div>
        </motion.div>
      </motion.span>

      <motion.span 
        key={`text2-${animationKey}`}
        className="relative block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent bg-[length:300%_auto] animate-gradient-x">
          {text2}
        </span>
        
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 3,
            delay: 1,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 2,
          }}
        >
          <div className="h-full w-full text-white/90">
            {text2}
          </div>
        </motion.div>
      </motion.span>
    </div>
  );
}

export function CSSAnimatedTextFill({ text1, text2, className = "" }: AnimatedTextFillProps) {
  return (
    <div className={`relative ${className}`}>
      <style jsx>{`
        .animated-text-fill {
          position: relative;
          display: block;
          overflow: hidden;
        }
        
        .text-fill-1 {
          background: linear-gradient(90deg, 
            rgba(255,255,255,0.9) 0%,
            rgba(255,255,255,0.9) 50%,
            rgb(251, 191, 36) 50%,
            rgb(251, 146, 60) 100%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textFill1 4s ease-in-out infinite;
        }
        
        .text-fill-2 {
          background: linear-gradient(90deg,
            rgb(251, 191, 36) 0%,
            rgb(251, 146, 60) 50%,
            rgba(255,255,255,0.9) 50%,
            rgba(255,255,255,0.9) 100%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textFill2 4s ease-in-out infinite;
        }
        
        @keyframes textFill1 {
          0%, 20% { background-position: 0% 50%; }
          50%, 70% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes textFill2 {
          0%, 20% { background-position: 100% 50%; }
          50%, 70% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      
      <motion.span
        className="animated-text-fill text-fill-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {text1}
      </motion.span>
      
      <motion.span 
        className="animated-text-fill text-fill-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {text2}
      </motion.span>
    </div>
  );
}

export function SimpleTextFill({ text1, text2, className = "" }: AnimatedTextFillProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.span
        className="block"
        style={{
          textShadow: '0 0 80px rgba(255, 255, 255, 0.5)',
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.9) 25%, rgb(251, 191, 36) 35%, rgb(251, 146, 60) 45%, rgb(251, 191, 36) 55%, rgba(255, 255, 255, 0.9) 65%, rgba(255, 255, 255, 0.9) 75%, rgb(251, 191, 36) 85%, rgb(251, 146, 60) 95%, rgba(255, 255, 255, 0.9) 100%)',
          backgroundSize: '400% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          WebkitTransform: 'translate3d(0, 0, 0)',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }}
        animate={{
          backgroundPosition: ['0% 50%', '300% 50%'],
          opacity: 1
        }}
        transition={{
          backgroundPosition: {
            duration: 10,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          },
          opacity: { duration: 0.8, delay: 0.5 }
        }}
        initial={{ opacity: 0 }}
      >
        {text1}
      </motion.span>

      <motion.span
        className="block"
        style={{
          textShadow: '0 0 80px rgba(251, 191, 36, 0.5)',
          background: 'linear-gradient(90deg, rgb(251, 191, 36) 0%, rgb(251, 146, 60) 25%, rgb(251, 191, 36) 35%, rgba(255, 255, 255, 0.9) 45%, rgba(255, 255, 255, 0.9) 55%, rgb(251, 191, 36) 65%, rgb(251, 146, 60) 75%, rgb(251, 191, 36) 85%, rgb(251, 146, 60) 95%, rgb(251, 191, 36) 100%)',
          backgroundSize: '400% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          WebkitTransform: 'translate3d(0, 0, 0)',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }}
        animate={{
          backgroundPosition: ['300% 50%', '0% 50%'],
          opacity: 1
        }}
        transition={{
          backgroundPosition: {
            duration: 10,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          },
          opacity: { duration: 0.8, delay: 0.7 }
        }}
        initial={{ opacity: 0 }}
      >
        {text2}
      </motion.span>
    </div>
  );
}

export function ContinuousTextFill({ text1, text2, className = "" }: AnimatedTextFillProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.span
        className="animated-text-fill block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {text1}
      </motion.span>

      <motion.span
        className="animated-text-fill-reverse block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {text2}
      </motion.span>
    </div>
  );
}

export function MotionTextFill({ text1, text2, className = "" }: AnimatedTextFillProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <motion.span 
          className="block text-white/90 relative z-10"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 50%, rgb(251, 191, 36) 50%, rgb(251, 146, 60) 100%)',
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          {text1}
        </motion.span>
      </motion.div>

      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <motion.span 
          className="block relative z-10"
          style={{
            background: 'linear-gradient(90deg, rgb(251, 191, 36) 0%, rgb(251, 146, 60) 50%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.9) 100%)',
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          animate={{
            backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          {text2}
        </motion.span>
      </motion.div>
    </div>
  );
}
