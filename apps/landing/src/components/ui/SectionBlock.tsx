"use client";

import { cn } from "@/lib/utils";
import { FadeIn } from "./Animations";

interface SectionBlockProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionBlock({ title, subtitle, children, className, id }: SectionBlockProps) {
  return (
    <section id={id} className={cn("py-12 sm:py-16 md:py-24", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <FadeIn className="mb-16">
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
                {subtitle}
              </p>
            )}
          </FadeIn>
        )}
        <FadeIn delay={0.2}>
          {children}
        </FadeIn>
      </div>
    </section>
  );
}
