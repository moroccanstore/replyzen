"use client";

import { cn } from "@/lib/utils";
import { FadeIn } from "./Animations";
import { HeroEffect, HeroEffectType } from "./HeroEffect";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
  effect?: HeroEffectType;
}

export function PageHeader({ title, subtitle, className, effect }: PageHeaderProps) {
  return (
    <div className={cn(
      "relative py-24 md:py-32 overflow-hidden border-b border-border/50 bg-background",
      className
    )}>
      {/* Background Effect */}
      {effect && <HeroEffect type={effect} />}
      
      {/* Background Ambient Glow (Standard) */}
      {!effect && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />}
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <FadeIn>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {title}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
