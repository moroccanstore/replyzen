"use client";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ScreenshotBlockProps {
  src?: string;
  alt: string;
  title?: string;
  description?: string;
  className?: string;
  glow?: boolean;
}

export function ScreenshotBlock({ 
  src, 
  alt, 
  title, 
  description, 
  className,
  glow = true 
}: ScreenshotBlockProps) {
  return (
    <div className={cn("group relative", className)}>
      {/* Premium Outer Glow & Glass Wrap */}
      <div className={cn(
        "relative glass-panel p-2 rounded-xl transition-all duration-500",
        glow && "ambient-glow before:absolute before:inset-0 before:bg-primary/5 before:blur-2xl"
      )}>
        <motion.div 
          whileHover={{ scale: 1.01, rotateX: 2, rotateY: 2 }}
          className="relative rounded-xl overflow-hidden border border-border bg-card/30 z-10"
          style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
        >
          {src ? (
              <CloudinaryImage
                src={src}
                alt={alt}
                width={1280}
                height={720}
                className="w-full h-auto object-cover rounded-xl transition-transform duration-700 hover:scale-105"
              />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-muted/50 text-muted-foreground italic">
              <div className="text-center group-hover:scale-105 transition-transform duration-500">
                <p className="text-lg font-medium opacity-50">Screenshot coming soon</p>
                <p className="text-sm opacity-30 mt-1">{alt}</p>
              </div>
            </div>
          )}
          
          {/* Subtle glass overlay for that depth look */}
          <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl z-10" />
        </motion.div>
      </div>
      
      {(title || description) && (
        <div className="mt-8">
          {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
          {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
        </div>
      )}
    </div>
  );
}
