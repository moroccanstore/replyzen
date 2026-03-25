import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { 
  FileText, 
  Code2, 
  Settings2, 
  Puzzle, 
  Box, 
  Lock 
} from "lucide-react";
import Link from "next/link";

const docSections = [
  {
    icon: Box,
    title: "Core Architecture",
    links: ["System Overview", "Database Schema", "Message Flow", "Queue Management"]
  },
  {
    icon: Code2,
    title: "API Reference",
    links: ["Authentication", "Session Endpoints", "Messaging API", "Webhook Specs"]
  },
  {
    icon: Settings2,
    title: "Configuration",
    links: ["Environment Variables", "Feature Flags", "Scaling Settings", "Logging"]
  },
  {
    icon: Puzzle,
    title: "Integrations",
    links: ["Zapier Guide", "Make.com (Integromat)", "Custom Webhooks", "CRM Sync"]
  },
  {
    icon: Lock,
    title: "Security & Compliance",
    links: ["Data Sovereignty", "Encryption", "Session Privacy", "GDPR/Compliance"]
  },
  {
    icon: FileText,
    title: "Release Notes",
    links: ["V3.2.0 (Latest)", "Migration Guide", "Past Versions", "Roadmap"]
  }
];

export default function DocsPage() {
  return (
    <div>
      <PageHeader 
        title="Documentation & API" 
        subtitle="Everything you need to integrate, extend, and customize your AUTOWHATS experience."
        effect="docs"
      />

      <SectionBlock>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {docSections.map((section, i) => (
            <div key={i} className="p-8 rounded-2xl glass-panel border border-border/50 group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <section.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-6">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      href="#" 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group/link"
                    >
                      <div className="w-1 h-1 rounded-full bg-border group-hover/link:bg-primary transition-colors" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock className="bg-primary/5 border-y border-primary/10">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Need the full API Spec?</h3>
          <p className="text-muted-foreground mb-8">Download our Swagger/OpenAPI documentation for local testing.</p>
          <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
            Download OpenAPI Spec
          </button>
        </div>
      </SectionBlock>
    </div>
  );
}
