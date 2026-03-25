"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Smartphone,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingNodeProps {
  icon: any;
  className: string;
  delay?: number;
  duration?: number;
  label?: string;
}

function FloatingNode({ icon: Icon, className, delay = 0, duration = 6, label }: FloatingNodeProps) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0, scale: 0.8 }}
      animate={{ 
        y: [-15, 15, -15],
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.05, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      whileHover={{ scale: 1.2, opacity: 1, filter: "brightness(1.2)" }}
      className={cn(
        "absolute p-4 rounded-2xl glass-panel border border-white/10 shadow-2xl backdrop-blur-md flex flex-col items-center gap-2 group cursor-default transition-all duration-300",
        className
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all">
        <Icon size={20} className="text-white drop-shadow-md" />
      </div>
      {label && (
        <span className="text-[10px] uppercase tracking-widest font-bold text-primary/80 group-hover:text-primary transition-colors">
          {label}
        </span>
      )}
      {/* Internal Glow */}
      <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
    </motion.div>
  );
}

export function FloatingElements() {
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<{ duration: number; delay: number }[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setParticles([...Array(6)].map(() => ({
      duration: 15 + Math.random() * 15,
      delay: Math.random() * 5
    })));
  }, []);

  return (
    <div className="absolute inset-0 -z-1 pointer-events-none overflow-hidden select-none">
      {/* Main Nodes */}
      <FloatingNode 
        icon={Bot} 
        label="AI Sales"
        className="top-[20%] left-[10%] sm:left-[15%] md:left-[20%]" 
        delay={0}
        duration={5}
      />
      <FloatingNode 
        icon={MessageSquare} 
        label="Inbox"
        className="top-[60%] left-[5%] sm:left-[10%]" 
        delay={1.5}
        duration={7}
      />
      <FloatingNode 
        icon={Zap} 
        label="Instant"
        className="top-[15%] right-[10%] sm:right-[15%] md:right-[20%]" 
        delay={0.5}
        duration={6}
      />
      <FloatingNode 
        icon={ShieldCheck} 
        label="Private"
        className="top-[65%] right-[5%] sm:right-[10%]" 
        delay={2.2}
        duration={8}
      />
      
      {/* Smaller Accent Nodes */}
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute top-[40%] right-[0%] opacity-20"
      >
        <Cpu size={120} className="text-primary blur-[2px]" />
      </motion.div>

      {/* Atmospheric Particles */}
      {isMounted && particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/30 blur-sm pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
            y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay
          }}
        />
      ))}
    </div>
  );
}
