const supportEmail = "support@entrixalgo.com";

export const siteConfig = {
  name: "EntrixAlgo",
  url: "https://entrixalgo.com",
  getStartedUrl: "https://entrixalgo.com/sign-up",
  ogImage: "https://entrixalgo.com/dashboard.png",
  description:
    "AI-powered chart analysis, trade journal, and risk management tools for traders. Upload a chart, get instant AI-driven signals with entry, exit, and risk levels.",
  supportEmail,
  links: {
    email: `mailto:${supportEmail}`,
  },
};

export type SiteConfig = typeof siteConfig;
