import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-6 sm:p-8 rounded-2xl glass-panel border border-border/50 transition-all duration-300 hover:bg-card/50 hover:shadow-2xl hover:border-primary/30 group relative",
        className
      )}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <Icon size={24} className="scale-75 sm:scale-100" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
