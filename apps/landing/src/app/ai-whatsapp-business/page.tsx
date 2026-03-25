import { getDictionary } from "@/i18n/get-dictionary";
import { LandingContent } from "@/components/landing/LandingContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI WhatsApp Business Maroc — Assistant Virtuel & Chatbot Intélligent",
  description: "L'intelligence artificielle WhatsApp pour votre business. Assistant AI WhatsApp, chatbot intelligent et automation IA au Maroc. Qualifiez vos leads automatiquement dès maintenant.",
  keywords: [
    "ai whatsapp maroc", "intelligence artificielle whatsapp", "assistant ai whatsapp", 
    "chatbot ai whatsapp", "whatsapp ai reply", "ai auto reply whatsapp", 
    "whatsapp ai automation", "ai agent whatsapp", "whatsapp sales ai", 
    "ai follow up whatsapp", "ai conversation whatsapp", "ai customer support whatsapp", 
    "whatsapp ai maroc", "chatbot intelligent whatsapp", "ai pour whatsapp business", 
    "automatisation ai whatsapp", "ai pour service client whatsapp", 
    "assistant virtuel whatsapp maroc", "ai lead qualification whatsapp", 
    "ai messaging whatsapp"
  ]
};

export default async function AiBusinessPage() {
  const dict = await getDictionary("fr");
  
  return <LandingContent dict={dict} lang="fr" />;
}
