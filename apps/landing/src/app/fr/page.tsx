import { getDictionary } from "@/i18n/get-dictionary";
import { LandingContent } from "@/components/landing/LandingContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM WhatsApp Maroc & France — Automatisation WhatsApp IA",
  description: "Le meilleur logiciel WhatsApp Business Maroc. Automatisez vos ventes avec un CRM WhatsApp pour e-commerce, immobilier et agences. Solution WhatsApp marketing avec assistant IA.",
  keywords: [
    "crm whatsapp maroc", "crm whatsapp france", "logiciel whatsapp business maroc", 
    "outil whatsapp marketing maroc", "automatisation whatsapp entreprise", 
    "whatsapp crm pour entreprises", "plateforme whatsapp marketing", 
    "solution whatsapp entreprise maroc", "crm whatsapp pour e-commerce", 
    "whatsapp crm pour agence", "whatsapp automation tool france", 
    "logiciel réponse automatique whatsapp", "outil suivi client whatsapp", 
    "gestion clients whatsapp maroc", "logiciel prospection whatsapp", 
    "whatsapp marketing tool france", "crm whatsapp pas cher", 
    "whatsapp crm cloud", "whatsapp crm self hosted", 
    "solution whatsapp vente automatique", "whatsapp business automation maroc", 
    "outil conversion leads whatsapp", "système whatsapp automatisé", 
    "crm whatsapp avec ai", "whatsapp ai assistant entreprise", 
    "automatisation messages whatsapp", "logiciel chatbot whatsapp maroc", 
    "whatsapp lead generation tool", "crm whatsapp pour immobilier", 
    "crm whatsapp pour coach"
  ]
};

export default async function HomeFR() {
  const dict = await getDictionary("fr");
  
  return <LandingContent dict={dict} lang="fr" />;
}
