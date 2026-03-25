import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { 
  Check, 
  Zap, 
  Shield, 
  Crown,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small teams getting started with automation.",
    features: [
      "1 WhatsApp Session",
      "Basic AI Responses",
      "3 Team Members",
      "5 Automation Flows",
      "Email Support"
    ],
    button: "Start Free Trial",
    highlight: false
  },
  {
    name: "Professional",
    price: "$149",
    description: "The most popular plan for growing businesses.",
    features: [
      "5 WhatsApp Sessions",
      "Advanced AI Training (KB)",
      "10 Team Members",
      "Unlimited Automations",
      "Priority WhatsApp Support",
      "Analytics Dashboard"
    ],
    button: "Get Started",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Scale with confidence and total data control.",
    features: [
      "Unlimited Sessions",
      "Custom AI Engineering",
      "Unlimited Team Members",
      "Self-Hosted Deployment",
      "Dedicated Account Manager",
      "SLA Guarantee"
    ],
    button: "Contact Sales",
    highlight: false
  }
];

export default function PricingPage() {
  return (
    <div>
      <PageHeader 
        title="Simple, Transparent Pricing" 
        subtitle="Choose the plan that fits your business. No hidden fees, no long-term contracts."
        effect="pricing"
      />

      <SectionBlock>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={cn(
                "relative p-8 rounded-3xl transition-all duration-300",
                plan.highlight 
                  ? "bg-card border-2 border-primary shadow-2xl shadow-primary/20 scale-105 z-10" 
                  : "glass-panel border border-border/50 hover:border-primary/30"
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-lg transition-all",
                  plan.highlight 
                    ? "bg-gradient-primary text-white shadow-lg shadow-primary/20 hover:opacity-90" 
                    : "glass-panel border border-border/50 hover:bg-muted/50"
                )}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 glass-panel p-6 rounded-2xl border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="font-bold">Annual billing discount</h4>
              <p className="text-sm text-muted-foreground">Save 20% on all plans when you choose annual payments.</p>
            </div>
          </div>
          <button className="text-primary font-bold px-6 py-2 rounded-xl bg-primary/10 hover:bg-primary hover:text-white transition-all whitespace-nowrap">
            Switch to Annual
          </button>
        </div>
      </SectionBlock>

      <SectionBlock className="bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Shield className="text-primary" size={24} />
            <h2 className="text-3xl font-bold tracking-tight">Enterprise Compliance</h2>
          </div>
          <p className="text-center text-muted-foreground mb-12">
            For large organizations with strict data sovereignty requirements, we offer custom 
            on-premise deployment options and dedicated security auditing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl glass-panel border border-border/30">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">SOC2 Type II Compliant</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl glass-panel border border-border/30">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Full Data Sovereignty</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl glass-panel border border-border/30">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl glass-panel border border-border/30">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">24/7 Monitoring</span>
            </div>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}
