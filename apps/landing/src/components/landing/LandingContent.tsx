"use client";

import { 
  BarChart3, 
  MessageSquare, 
  Zap, 
  Users, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Download,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { ScreenshotBlock } from "@/components/ui/ScreenshotBlock";
import { FadeIn, StaggerContainer, staggerItem } from "@/components/ui/Animations";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroBackground } from "./HeroBackground";
import { FloatingElements } from "./FloatingElements";
import type { Dictionary } from "@/i18n/types";

interface LandingContentProps {
  dict: Dictionary;
  lang: "en" | "fr";
}

const iconMap: Record<number, LucideIcon> = {
  0: Bot,
  1: MessageSquare,
  2: Zap,
  3: Users,
  4: Smartphone,
  5: ShieldCheck,
};

export function LandingContent({ dict, lang }: LandingContentProps) {
  const prefix = lang === "fr" ? "/fr" : "";
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 500], [0, 100]);

  // Animation for the title split
  const titleWords = dict.hero.title.split(" ");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden text-sm sm:text-base min-h-[90vh] flex items-center">
        <HeroBackground />
        <FloatingElements />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-24">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold mb-8 shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:bg-primary/15 transition-colors cursor-default">
                <Zap size={14} aria-hidden="true" className="fill-current animate-pulse" />
                <span className="tracking-wide uppercase">{dict.hero.badge}</span>
              </div>
            </FadeIn>
            
            <div className="overflow-hidden mb-8">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1] text-white">
                <motion.span 
                  className="flex flex-wrap justify-center gap-x-[0.2em]"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {titleWords.map((word, i) => (
                    <motion.span 
                      key={i}
                      variants={{
                        hidden: { y: "100%", opacity: 0 },
                        visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 200 } }
                      }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#a78bfa] to-secondary bg-[length:200%_auto] animate-gradient pb-2"
                >
                  {dict.hero.titleAccent}
                </motion.span>
              </h1>
            </div>
            
            <FadeIn delay={1}>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
                {dict.hero.subtitle}
              </p>
            </FadeIn>
            
            <FadeIn delay={1.2}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href={`${prefix}/product`} 
                  className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-gradient-to-r from-primary to-[#9f67ff] text-white font-black text-lg sm:text-xl shadow-[0_0_50px_rgba(124,58,237,0.4)] hover:shadow-[0_0_80px_rgba(124,58,237,0.6)] border-t border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 drop-shadow-md">{dict.hero.ctaPrimary}</span>
                  <ArrowRight size={22} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link 
                  href={`${prefix}/install`} 
                  className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 hover:text-white font-extrabold text-lg sm:text-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download size={20} aria-hidden="true" className="text-primary" />
                  {dict.hero.ctaSecondary}
                </Link>
              </div>
            </FadeIn>
          </div>

          <motion.div 
            style={{ y: heroImageY }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 sm:mt-24 relative"
          >
            {/* Focal Glow */}
            <div className="absolute inset-x-0 -top-20 h-60 bg-primary/20 blur-[100px] pointer-events-none -z-10" />
            
            <ScreenshotBlock 
              src="/screenshots/dashboard.png"
              alt="AUTOWHATS Dashboard Preview" 
              className="max-w-6xl mx-auto shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            />
          </motion.div>
        </div>
      </section>

      {/* Main Benefits Grid */}
      <SectionBlock 
        title={dict.benefits.title} 
        subtitle={dict.benefits.subtitle}
      >
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-16">
          {dict.benefits.features.map((feature, i) => (
            <motion.div key={i} variants={staggerItem}>
              <FeatureCard 
                icon={iconMap[i] || Bot} 
                title={feature.title} 
                description={feature.description}
              />
            </motion.div>
          ))}
        </StaggerContainer>
      </SectionBlock>

      {/* Visual Product Showcase Section */}
      <SectionBlock className="bg-muted/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-bold mb-6 text-sm sm:text-base">
              <BarChart3 size={20} />
              <span>{dict.showcase.label}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 tracking-tight">{dict.showcase.title}</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
              {dict.showcase.description}
            </p>
            <ul className="space-y-4 mb-10 text-sm sm:text-base md:text-lg">
              {dict.showcase.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Link 
              href={`${prefix}/product`} 
              className="text-primary font-bold inline-flex items-center gap-2 group"
            >
              {dict.showcase.cta}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ScreenshotBlock 
            src="/screenshots/analytics.png"
            alt="Analytics Dashboard View" 
            glow={true}
          />
        </div>
      </SectionBlock>

      {/* CTA Footer */}
      <SectionBlock>
        <div className="glass-panel p-6 sm:p-10 md:p-16 lg:p-20 rounded-2xl sm:rounded-3xl md:rounded-[3rem] text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tighter">
              {dict.cta.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mb-12">
              {dict.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0 justify-center">
              <Link 
                href={`${prefix}/install`} 
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-gradient-to-r from-primary to-[#9f67ff] text-white font-bold text-base sm:text-lg md:text-xl shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] border-t border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center flex items-center justify-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 drop-shadow-md">{dict.cta.primary}</span>
              </Link>
              <Link 
                href={`${prefix}/pricing`} 
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 hover:text-white font-bold text-base sm:text-lg md:text-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center flex items-center justify-center"
              >
                {dict.cta.secondary}
              </Link>
            </div>
            <p className="mt-8 text-sm text-muted-foreground/60 font-medium">
              {dict.cta.trustLine}
            </p>
          </div>
          {/* Decorative side glows */}
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[80px]" />
        </div>
      </SectionBlock>
    </div>
  );
}
