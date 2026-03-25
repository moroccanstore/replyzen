import { getDictionary } from "@/i18n/get-dictionary";
import { LandingContent } from "@/components/landing/LandingContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM WhatsApp Maroc — Solution CRM WhatsApp Immobiler & E-commerce",
  description: "Le meilleur CRM WhatsApp Maroc pour votre entreprise. Logiciel WhatsApp Business Maroc, gestion client et outil WhatsApp marketing. Automatisez vos ventes dès aujourd'hui.",
  keywords: [
    "crm whatsapp maroc", "gestion clients whatsapp maroc", "outil crm simple maroc", 
    "whatsapp crm pour entreprises", "solution whatsapp entreprise maroc", 
    "crm whatsapp pour e-commerce", "crm whatsapp pour immobilier", 
    "logiciel chatbot whatsapp maroc", "assistant virtuel whatsapp maroc", 
    "whatsapp pour business maroc", "outil vente whatsapp maroc", 
    "automatisation pme maroc"
  ]
};

export default async function CrmMarocPage() {
  const dict = await getDictionary("fr");
  
  return <LandingContent dict={dict} lang="fr" />;
}
