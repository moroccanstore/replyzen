import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { StepBlock } from "@/components/ui/StepBlock";
import { 
  PlayCircle, 
  Settings, 
  MessageSquare, 
  Zap,
  LayoutDashboard
} from "lucide-react";

export default function HowToPage() {
  return (
    <div>
      <PageHeader 
        title="Master the Workflow" 
        subtitle="Step-by-step tutorials to help you automate your WhatsApp sales process like a pro."
        effect="how-to"
      />

      <SectionBlock 
        title="Getting Started Video" 
        subtitle="Watch our 5-minute quick start guide to learn the basics."
      >
        <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden glass-panel border border-border ambient-glow group cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <PlayCircle size={40} fill="currentColor" />
            </div>
          </div>
          <div className="absolute inset-0 bg-primary/10 z-10 group-hover:bg-primary/5 transition-colors" />
          <div className="w-full h-full bg-card/50 flex items-center justify-center italic text-muted-foreground/30">
            Quick Start Video Placeholder
          </div>
        </div>
      </SectionBlock>

      <SectionBlock className="bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Core Workflows</h2>
          
          <StepBlock 
            number={1}
            title="Connect your WhatsApp Session"
            description="Scan the QR code to link your WhatsApp account. We use secure WebSockets to maintain a persistent, reliable connection."
            screenshotAlt="WhatsApp QR scan"
            screenshotSrc="/screenshots/whatsapp-connect.png"
          />

          <StepBlock 
            number={2}
            title="Train your AI Agent"
            description="Upload your business documents or point the AI to your website. It will learn your products and brand voice instantly."
            screenshotAlt="AI Agent training"
            screenshotSrc="/screenshots/ai-setup.png"
            reversed
          />

          <StepBlock 
            number={3}
            title="Set up Multi-Agent Inbox"
            description="Configure your team members and roles. Assign specific numbers to different departments like Sales or Support."
            screenshotAlt="Multi-agent config"
            screenshotSrc="/screenshots/team-config.png"
          />

          <StepBlock 
            number={4}
            title="Launch Automated Flows"
            description="Deploy your first automation. Set triggers based on keywords or user behavior to start engaging with customers 24/7."
            screenshotAlt="Live automation example"
            screenshotSrc="/screenshots/automation.png"
            reversed
          />
        </div>
      </SectionBlock>

      <SectionBlock 
        title="Common Tasks" 
        subtitle="Explore specific guides for advanced use cases."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Settings, title: "Session Config", desc: "Fine-tune connectivity." },
            { icon: MessageSquare, title: "Template Design", desc: "Create high-converting messages." },
            { icon: Zap, title: "Webhook Integration", desc: "Connect your CRM tools." },
            { icon: LayoutDashboard, title: "Analytics Export", desc: "Generate custom reports." }
          ].map((task, i) => (
            <div key={i} className="p-6 rounded-xl glass-panel border border-border/50 hover:bg-card transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <task.icon size={20} />
              </div>
              <h4 className="font-bold mb-2">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.desc}</p>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
