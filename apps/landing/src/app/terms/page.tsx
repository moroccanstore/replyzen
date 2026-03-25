"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionBlock } from "@/components/ui/SectionBlock";
import { FadeIn } from "@/components/ui/Animations";

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col">
      <PageHeader 
        title="Terms of Service" 
        subtitle="The rules of the game. Understanding your rights and responsibilities when using Daki.pro."
        effect="docs"
      />

      <SectionBlock>
        <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
          <FadeIn>
            <p className="text-muted-foreground mb-8 text-xl">
              Last Updated: {lastUpdated}
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">1. Agreement to Terms</h2>
            <p className="mb-8">
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Daki Agency (“we”, “us”, or “our”), concerning your access to and use of the Daki.pro website and any other related services.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">2. Intellectual Property Rights</h2>
            <p className="mb-8">
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">3. User Representations</h2>
            <p className="mb-8">
              By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information; (3) you have the legal capacity and you agree to comply with these Terms of Service.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">4. Prohibited Activities</h2>
            <p className="mb-4">
              You may not access or use the Site for any purpose other than that for which we make the Site available. Prohibited activity includes:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Systematically retrieving data to create a collection or database.</li>
              <li>Making any unauthorized use of the Site.</li>
              <li>Circumventing, disabling, or otherwise interfering with security-related features.</li>
              <li>Engaging in unauthorized framing of or linking to the Site.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6 text-foreground">5. Software Licensing</h2>
            <p className="mb-8">
              AUTOWHATS is provided under specific licensing terms. If you self-host the application, you agree to abide by the licensing agreement attached to the specific version of the software you have acquired. Daki Agency reserves all rights not expressly granted to you.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">6. Limitation of Liability</h2>
            <p className="mb-8">
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the site.
            </p>

            <h2 className="text-3xl font-bold mb-6 text-foreground">7. Contact Us</h2>
            <p className="mb-8">
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <span className="text-primary font-bold">contact@Daki.pro</span>
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
