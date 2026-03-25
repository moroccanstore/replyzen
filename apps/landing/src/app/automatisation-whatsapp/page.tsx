import { getDictionary } from "@/i18n/get-dictionary";
import { LandingContent } from "@/components/landing/LandingContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automatisation WhatsApp Entreprise — Automatiser Messages & Relances",
  description: "Comment automatiser WhatsApp Business ? Logiciel de réponse automatique WhatsApp et relance automatique prospects. Améliorez votre conversion WhatsApp dès aujourd'hui.",
  keywords: [
    "automatisation whatsapp entreprise", "automatisation messages whatsapp", 
    "logiciel réponse automatique whatsapp", "relance automatique prospects whatsapp", 
    "comment automatiser whatsapp", "automatisation messages whatsapp business", 
    "automatisation relance clients whatsapp", "envoyer messages automatiques whatsapp", 
    "automatiser réponses clients whatsapp", "automatisation whatsapp sans code", 
    "automatisation marketing whatsapp", "automatisation whatsapp ecommerce", 
    "relance clients automatique whatsapp", "automatiser support client whatsapp"
  ]
};

export default async function AutomatisationPage() {
  const dict = await getDictionary("fr");
  
  return <LandingContent dict={dict} lang="fr" />;
}
