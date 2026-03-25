import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { StepBlock } from "@/components/ui/StepBlock";
import { 
  Terminal, 
  Server, 
  Database, 
  ShieldCheck 
} from "lucide-react";

export default function InstallPage() {
  return (
    <div>
      <PageHeader 
        title="Get Up and Running" 
        subtitle="Step-by-step instructions to deploy AUTOWHATS on your own infrastructure."
        effect="install"
      />

      <SectionBlock 
        title="Choose your deployment method" 
        subtitle="We support various environments to fit your infrastructure needs."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Terminal, 
              title: "Docker (Recommended)", 
              desc: "The fastest way to deploy. Single command setup with Docker Compose." 
            },
            { 
              icon: Server, 
              title: "PM2 / Node.js", 
              desc: "Deploy directly on any Linux server with Node.js and PM2." 
            },
            { 
              icon: ShieldCheck, 
              title: "Managed Cloud", 
              desc: "Let us handle the infrastructure. 99.9% uptime guaranteed." 
            }
          ].map((method, i) => (
            <div key={i} className="p-8 rounded-2xl glass-panel border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <method.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{method.title}</h3>
              <p className="text-muted-foreground">{method.desc}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock className="bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Standard Installation Flow</h2>
          
          <StepBlock 
            number={1}
            title="Clone the repository"
            description="Start by cloning the official AUTOWHATS repository to your server. Ensure you have Git installed."
            screenshotAlt="Git clone command"
            screenshotSrc="/screenshots/install-git-clone.png"
          />

          <StepBlock 
            number={2}
            title="Configure Environment"
            description="Copy the .env.example file and update it with your database credentials, WhatsApp session keys, and AI configuration."
            screenshotAlt="Environment configuration"
            screenshotSrc="/screenshots/install-env-config.png"
            reversed
          />

          <StepBlock 
            number={3}
            title="Run Database Migrations"
            description="Initialize your database schema using our built-in migration tools. This sets up your collections and default roles."
            screenshotAlt="Prisma migration flow"
            screenshotSrc="/screenshots/install-db-migration.png"
          />

          <StepBlock 
            number={4}
            title="Start the Application"
            description="Launch the server using npm start or through Docker Compose. Once active, the dashboard will be available at port 3000."
            screenshotAlt="App startup logs"
            screenshotSrc="/screenshots/install-app-startup.png"
            reversed
          />
        </div>
      </SectionBlock>

      <SectionBlock title="Requirements">
        <div className="glass-panel p-8 rounded-2xl border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Server size={20} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Server</h4>
                <p className="text-sm text-muted-foreground">Ubuntu 20.04+ Recommended. Min 2GB RAM, 1 vCPU.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Database size={20} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Database</h4>
                <p className="text-sm text-muted-foreground">PostgreSQL 13+ or MongoDB 5.0 (depending on version).</p>
              </div>
            </div>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}
