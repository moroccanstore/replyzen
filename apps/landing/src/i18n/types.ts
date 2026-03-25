export interface Dictionary {
  nav: {
    home: string;
    product: string;
    install: string;
    howToUse: string;
    docs: string;
    pricing: string;
    support: string;
    tryDashboard: string;
  };
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  benefits: {
    title: string;
    subtitle: string;
    features: Array<{
      title: string;
      description: string;
    }>;
  };
  showcase: {
    label: string;
    title: string;
    description: string;
    items: string[];
    cta: string;
  };
  cta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
    trustLine: string;
  };
  footer: {
    description: string;
    product: string;
    support: string;
    legal: string;
    privacy: string;
    terms: string;
  };
}
