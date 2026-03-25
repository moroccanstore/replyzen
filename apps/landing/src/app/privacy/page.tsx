"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { FadeIn } from "@/components/ui/Animations";

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col">
      <PageHeader 
        title="Privacy Policy" 
        subtitle="How we handle your data at Daki.pro. Transparency and privacy are our top priorities."
        effect="support"
      />

      <SectionBlock>
        <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
          <FadeIn>
            <p className="text-muted-foreground mb-8 text-xl">
              Last Updated: {lastUpdated}
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">1. Introduction</h2>
            <p className="mb-8">
              Welcome to Daki.pro ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our website (Daki.pro), and/or any related services, sales, marketing, or events.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">2. Information We Collect</h2>
            <p className="mb-4">
              We collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Register on the website</li>
              <li>Express an interest in obtaining information about us or our products</li>
              <li>Participate in activities on the website</li>
              <li>Contact us directly via email (contact@Daki.pro)</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6 text-foreground">3. How We Use Your Information</h2>
            <p className="mb-4">
              We use personal information collected via our website for a variety of business purposes, including:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To send administrative information to you.</li>
              <li>To fulfill and manage your orders.</li>
              <li>To protect our services and users.</li>
              <li>To enable user-to-user communications.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6 text-foreground">4. Data Processing (Self-Hosting)</h2>
            <p className="mb-8">
              At AUTOWHATS, we prioritize your data sovereignty. Many of our services allow for self-hosting. In such cases, the data processed by the AUTOWHATS application remains on your infrastructure and is not transmitted to Daki Agency servers unless explicitly configured by you for cloud-based sync or error reporting.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">5. Your Privacy Rights</h2>
            <p className="mb-8">
              Depending on your location (e.g., GDPR in Europe), you may have certain rights regarding your personal information, including the right to access, correct, or delete your data.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">6. Contact Us</h2>
            <p className="mb-8">
              If you have questions or comments about this policy, you may email us at: <span className="text-primary font-bold">contact@Daki.pro</span>
            </p>

            <div className="p-6 rounded-2xl glass-panel border border-primary/20 bg-primary/5 mt-12 italic text-sm text-muted-foreground">
              Disclaimer: This template is provided for informational purposes only and does not constitute legal advice. We recommend consulting with a legal professional to ensure full compliance with your local laws.
            </div>
          </FadeIn>
        </div>
      </SectionBlock>
    </div>
  );
}
