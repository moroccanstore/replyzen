import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle,
  ChevronRight
} from "lucide-react";

const faqs = [
  {
    q: "Is AUTOWHATS really self-hosted?",
    a: "Yes. You receive the full source code (depending on your license) and can deploy it on your own servers for 100% data privacy."
  },
  {
    q: "Do I need a WhatsApp Business API account?",
    a: "No, AUTOWHATS works with standard WhatsApp numbers using our advanced session management. No expensive API fees are required."
  },
  {
    q: "Can I use multiple WhatsApp numbers?",
    a: "Absolutely. You can connect and manage multiple sessions simultaneously from a single dashboard."
  },
  {
    q: "Does the AI learn from my specific business?",
    a: "Yes, you can train your AI agent by uploading PDFs, text files, or providing website URLs. It will only answer based on your data."
  },
  {
    q: "What are the server requirements?",
    a: "A basic Linux server with 2GB RAM and 1 vCPU is enough to start. For high-volume teams, we recommend 4GB+ RAM."
  },
  {
    q: "Is there a limit to how many messages I can send?",
    a: "AUTOWHATS doesn't impose limits, but you must follow WhatsApp's fair use policies to protect your number from being banned."
  }
];

export default function SupportPage() {
  return (
    <div>
      <PageHeader 
        title="Support & Community" 
        subtitle="Get help from our experts or join the conversation with other AUTOWHATS users."
        effect="support"
      />

      <SectionBlock 
        title="Frequently Asked Questions" 
        subtitle="Quick answers to the most common inquiries from our community."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, i) => (
            <div key={i} className="p-8 rounded-2xl glass-panel border border-border/50 hover:bg-card/50 transition-colors">
              <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                <HelpCircle className="text-primary mt-1 shrink-0" size={18} />
                {faq.q}
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock className="bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground">Contact our team directly through your preferred channel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { 
              icon: MessageCircle, 
              title: "Live Chat", 
              desc: "Talk to us on WhatsApp right now.", 
              action: "Start Chat" 
            },
            { 
              icon: Mail, 
              title: "Email Support", 
              desc: "For technical queries and partnerships.", 
              action: "Send Email" 
            },
            { 
              icon: Phone, 
              title: "Priority Call", 
              desc: "Available for Enterprise customers.", 
              action: "Request Call" 
            }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-2xl glass-panel border border-border/50 text-center flex flex-col items-center group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-8">{item.desc}</p>
              <button className="mt-auto w-full py-3 rounded-xl border border-primary/30 text-primary font-bold hover:bg-primary hover:text-white transition-all">
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-primary text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-extrabold mb-4">Join our Community</h2>
              <p className="text-white/80">Connect with 10,000+ developers and business owners on our Discord.</p>
            </div>
            <button className="px-8 py-4 rounded-xl bg-white text-primary font-bold shadow-2xl hover:scale-105 transition-transform whitespace-nowrap">
              Join Discord Server
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        </div>
      </SectionBlock>
    </div>
  );
}
