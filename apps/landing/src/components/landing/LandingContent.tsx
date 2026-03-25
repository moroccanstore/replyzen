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
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { ScreenshotBlock } from "@/components/ui/ScreenshotBlock";
import { FadeIn, StaggerContainer, staggerItem } from "@/components/ui/Animations";
import { motion } from "framer-motion";
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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden text-sm sm:text-base">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-[200px] -right-[100px] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-8 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                <Zap size={14} className="fill-current" />
                <span>{dict.hero.badge}</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                {dict.hero.title} <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">{dict.hero.titleAccent}</span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
                {dict.hero.subtitle}
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href={`${prefix}/product`} 
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-gradient-to-r from-primary to-[#9f67ff] text-white font-bold text-base sm:text-lg md:text-xl shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] border-t border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 drop-shadow-md">{dict.hero.ctaPrimary}</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href={`${prefix}/install`} 
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 hover:text-white font-bold text-base sm:text-lg md:text-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  {dict.hero.ctaSecondary}
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.5} distance={40} className="mt-24">
            <ScreenshotBlock 
              src="/screenshots/dashboard.png"
              alt="AUTOWHATS Dashboard Preview" 
              className="max-w-5xl mx-auto"
            />
          </FadeIn>
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
