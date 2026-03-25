"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroEffectType = 
  | "product" 
  | "install" 
  | "how-to" 
  | "docs" 
  | "support" 
  | "pricing";

interface HeroEffectProps {
  type: HeroEffectType;
  className?: string;
}

export function HeroEffect({ type, className }: HeroEffectProps) {
  switch (type) {
    case "product":
      return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-24 h-32 md:w-32 md:h-44 bg-primary/10 rounded-2xl glass-panel border border-primary/20"
              initial={{ 
                x: Math.random() * 100 - 50 + "%", 
                y: "100%", 
                rotate: Math.random() * 40 - 20,
                opacity: 0 
              }}
              animate={{ 
                y: "-20%", 
                opacity: [0, 1, 1, 0],
                rotate: Math.random() * 60 - 30 
              }}
              transition={{ 
                duration: 10 + Math.random() * 5, 
                repeat: Infinity, 
                delay: i * 2,
                ease: "linear"
              }}
              style={{ left: `${15 + i * 15}%` }}
            />
          ))}
        </div>
      );

    case "install":
      return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none opacity-40", className)}>
          <svg className="w-full h-full">
            {[...Array(8)].map((_, i) => (
              <motion.line
                key={i}
                x1={0}
                y1={20 + i * 15 + "%"}
                x2="100%"
                y2={20 + i * 15 + "%"}
                stroke="var(--color-primary)"
                strokeWidth="1"
                strokeDasharray="4 12"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -100 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </svg>
        </div>
      );

    case "how-to":
      return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{ width: "1000px", height: "1000px", opacity: 0 }}
              transition={{ duration: 8, repeat: Infinity, delay: i * 2.6, ease: "easeOut" }}
            />
          ))}
        </div>
      );

    case "docs":
      return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none opacity-20", className)}>
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} 
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[50%]"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );

    case "support":
      return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/40"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                scale: 0 
              }}
              animate={{ 
                scale: [0, 1.5, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
            />
          ))}
        </div>
      );

    case "pricing":
      return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
          <motion.div 
            className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-[100px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-around opacity-10">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-px h-full bg-gradient-to-b from-transparent via-primary to-transparent"
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 8, repeat: Infinity, delay: i * 1.5, ease: "linear" }}
              />
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
