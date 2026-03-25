"use client";

import { 
  BarChart3, 
  MessageSquare, 
  Zap, 
  Users, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { ScreenshotBlock } from "@/components/ui/ScreenshotBlock";
import { FadeIn, StaggerContainer, staggerItem } from "@/components/ui/Animations";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-[200px] -right-[100px] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-8 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                <Zap size={14} className="fill-current" />
                <span>✨ AI WhatsApp Sales Agent</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Own Your Customer <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">Relationships.</span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
                The most advanced AI-powered WhatsApp CRM and Automation platform. 
                Built for high-performance sales teams and business owners.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/product" 
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-gradient-to-r from-primary to-[#9f67ff] text-white font-bold text-base sm:text-lg md:text-xl shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] border-t border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 drop-shadow-md">Explore Features</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/install" 
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 hover:text-white font-bold text-base sm:text-lg md:text-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  Self-Host Now
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
        title="Why AUTOWHATS?" 
        subtitle="We've combined powerful CRM features with cutting-edge AI to transform how you engage with customers."
      >
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-16">
          <motion.div variants={staggerItem}>
            <FeatureCard 
              icon={Bot} 
              title="Autonomous AI Agents" 
              description="Deploy AI that learns your business and handles 80% of routine inquiries instantly."
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <FeatureCard 
              icon={MessageSquare} 
              title="Multi-Session Inbox" 
              description="Manage dozens of WhatsApp numbers from a single, unified team interface."
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <FeatureCard 
              icon={Zap} 
              title="Smart Automations" 
              description="Build complex message chains and workflows triggered by user behavior."
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <FeatureCard 
              icon={Users} 
              title="Team Collaboration" 
              description="Assign chats, leave internal notes, and track agent performance with ease."
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <FeatureCard 
              icon={Smartphone} 
              title="Demo Mode" 
              description="Try every feature in a sandbox environment before connecting your live number."
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <FeatureCard 
              icon={ShieldCheck} 
              title="Privacy First" 
              description="Fully self-hostable. Your data stays on your server, under your control."
            />
          </motion.div>
        </StaggerContainer>
      </SectionBlock>

      {/* Visual Product Showcase Section */}
      <SectionBlock className="bg-muted/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-bold mb-6 text-sm sm:text-base">
              <BarChart3 size={20} />
              <span>DATA-DRIVEN SALES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 tracking-tight">Real-time Analytics & Campaigns</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
              Track your conversion rates, message delivery stats, and agent response times. 
              Launch broadcast campaigns with personalized variables to skyrocket your engagement.
            </p>
            <ul className="space-y-4 mb-10 text-sm sm:text-base md:text-lg">
              {[
                "Personalized Bulk Messaging",
                "Advanced Filtering & Tagging",
                "Automated Follow-up Sequences",
                "Detailed Performance Reports"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Link 
              href="/product" 
              className="text-primary font-bold inline-flex items-center gap-2 group"
            >
              See full campaign features
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
              Ready to automate your growth?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mb-12">
              Join thousands of businesses scaling their WhatsApp operations with AUTOWHATS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0 justify-center">
              <Link 
                href="/install" 
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-gradient-to-r from-primary to-[#9f67ff] text-white font-bold text-base sm:text-lg md:text-xl shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] border-t border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center flex items-center justify-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 drop-shadow-md">Get Started for Free</span>
              </Link>
              <Link 
                href="/pricing" 
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 hover:text-white font-bold text-base sm:text-lg md:text-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center flex items-center justify-center"
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-8 text-sm text-muted-foreground/60 font-medium">
              Used by growing businesses to automate conversations
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
