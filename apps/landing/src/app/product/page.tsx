"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { StepBlock } from "@/components/ui/StepBlock";
import { ScreenshotBlock } from "@/components/ui/ScreenshotBlock";
import { 
  MessageSquare, 
  Bot, 
  Zap, 
  BarChart3, 
  Smartphone,
  ArrowRight
} from "lucide-react";
import { FadeIn, StaggerContainer, staggerItem } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductPage() {
  return (
    <div className="flex flex-col">
      <PageHeader 
        title="Experience the Power" 
        subtitle="Go beyond simple messaging. AUTOWHATS gives you a complete AI-driven sales engine."
        effect="product"
      />

      <SectionBlock 
        title="The AI Sales Journey" 
        subtitle="Follow the path of a customer interaction, from first contact to closed deal."
      >
        <div className="max-w-5xl mx-auto">
          <StepBlock 
            number={1}
            title="Intelligent AI Inbox"
            description="Our AI doesn't just reply; it understands intent. It categorizes leads, prioritizes hot prospects, and provides your human agents with smart reply suggestions based on your own knowledge base."
            screenshotAlt="AI Inbox Dashboard"
            screenshotSrc="/screenshots/inbox.png"
          />

          <StepBlock 
            number={2}
            title="Interactive Demo Mode"
            description="Experience AUTOWHATS without a live number. Our built-in simulator allows you to test AI agents, automations, and team permissions in a perfectly safe sandbox."
            screenshotAlt="Demo Mode Simulator"
            screenshotSrc="/screenshots/demo-mode.png"
            reversed
          />

          <StepBlock 
            number={3}
            title="Visual Automation Builder"
            description="Create complex customer journeys without writing a single line of code. Drag and drop triggers, delays, and conditions to build an 24/7 sales machine."
            screenshotAlt="Workflow Automation Builder"
            screenshotSrc="/screenshots/automation.png"
          />

          <StepBlock 
            number={4}
            title="High-Resolution Analytics"
            description="Deep dive into your performance data. Monitor response times, conversion rates per agent, and campaign ROI with our premium reporting suite."
            screenshotAlt="Detailed Analytics View"
            screenshotSrc="/screenshots/analytics.png"
            reversed
          />
        </div>
      </SectionBlock>

      {/* Feature Spotlights */}
      <SectionBlock title="Engineered for Teams">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: MessageSquare,
              title: "Shared Team Folders",
              desc: "Organize chats into custom folders. Dedicated queues for Support, Sales, and VIPs."
            },
            {
              icon: Bot,
              title: "Self-Learning Knowledge Base",
              desc: "Upload your PDFs and docs. The AI stays updated as your business grows."
            },
            {
              icon: Zap,
              title: "Real-time Webhooks",
              desc: "Connect to 5,000+ apps. Trigger Zapier or custom endpoints instantly."
            },
            {
              icon: Smartphone,
              title: "Mobile Optimized",
              desc: "Manage your business on the go with our responsive PWA interface."
            }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              variants={staggerItem}
              className="p-10 rounded-3xl glass-panel border border-border/50 hover:border-primary/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </SectionBlock>

      {/* Campaign Feature Reveal */}
      <SectionBlock className="bg-muted/30">
        <div className="relative p-12 md:p-20 rounded-[3rem] glass-panel border border-border overflow-hidden">
          <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-10">
            <Zap size={200} className="text-primary" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <div className="inline-flex items-center gap-2 text-primary font-bold mb-6">
                  <BarChart3 size={20} />
                  <span>PREMIUM FEATURE</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Master your Campaigns</h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  Send thousands of messages with complete peace of mind. Our advanced 
                  scheduling and anti-ban rotation system ensures your messages land safely 
                  while maintaining a natural, human touch.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-wrap gap-4">
                  <Link href="/pricing" className="px-8 py-4 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                    Unlock Premium CRM
                  </Link>
                </div>
              </FadeIn>
            </div>
            <FadeIn delay={0.4} distance={40}>
              <ScreenshotBlock 
                src="/screenshots/campaign.png"
                alt="Campaign Manager Interface" 
                glow={true} 
              />
            </FadeIn>
          </div>
        </div>
      </SectionBlock>

      {/* Product CTA */}
      <SectionBlock>
        <div className="text-center max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-8 italic">"The most powerful tool we've used for WhatsApp."</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xl text-muted-foreground mb-12">
              Ready to see the difference? Join the self-hosting revolution today.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Link 
              href="/install" 
              className="inline-flex items-center gap-2 text-2xl font-bold text-primary group"
            >
              Start Installation
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </SectionBlock>
    </div>
  );
}
