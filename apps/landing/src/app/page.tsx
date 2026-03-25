import { getDictionary } from "@/i18n/get-dictionary";
import { LandingContent } from "@/components/landing/LandingContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AUTOWHATS — AI-Powered WhatsApp CRM",
  description: "The ultimate marketing, automation, and documentation platform for WhatsApp sales.",
};

export default async function Home() {
  const dict = await getDictionary("en");
  
  return <LandingContent dict={dict} lang="en" />;
}
