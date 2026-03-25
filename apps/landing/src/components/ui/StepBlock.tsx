"use client";

import { cn } from "@/lib/utils";
import { ScreenshotBlock } from "./ScreenshotBlock";
import { FadeIn } from "./Animations";

interface StepBlockProps {
  number: number;
  title: string;
  description: string;
  screenshotSrc?: string;
  screenshotAlt: string;
  className?: string;
  reversed?: boolean;
}

export function StepBlock({ 
  number, 
  title, 
  description, 
  screenshotSrc, 
  screenshotAlt,
  className,
  reversed = false
}: StepBlockProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16 border-b border-border last:border-0",
      className
    )}>
      <FadeIn 
        direction={reversed ? "left" : "right"} 
        className={cn(
          "order-2 lg:order-none",
          reversed ? "lg:order-2" : "lg:order-1"
        )}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/30">
            {number}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h3>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {description}
        </p>
      </FadeIn>

      <FadeIn 
        direction={reversed ? "right" : "left"}
        delay={0.2}
        className={cn(
          "order-1 lg:order-none",
          reversed ? "lg:order-1" : "lg:order-2"
        )}
      >
        <ScreenshotBlock 
          src={screenshotSrc} 
          alt={screenshotAlt} 
          glow={false}
          className="shadow-2xl"
        />
      </FadeIn>
    </div>
  );
}
