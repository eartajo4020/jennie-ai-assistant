
export type BusinessConfig = {
  id: string;
  businessName: string;
  assistantName: string;
  industry: string;
  greeting: string;
  businessDescription: string;
  services: string[];
  qualificationQuestions: string[];
  notificationEmail: string;
  primaryColor: string;
};

export const businesses: Record<string, BusinessConfig> = {
  "homes-with-jennie": {
    id: "homes-with-jennie",
    businessName: "Homes With Jennie",
    assistantName: "Online Assistant",
    industry: "real-estate",
    greeting:
      "Hi! I'm your online assistant. How may I help you today?",
    businessDescription:
      "Jennie Artajo is a real estate agent with Berkshire Hathaway HomeServices Starck Real Estate.",
    services: [
      "Buying homes",
      "Selling homes",
      "Real estate inquiries",
    ],
    qualificationQuestions: [
      "Are you looking to buy or sell?",
      "What area are you interested in?",
      "What is your budget or price range?",
      "What is your timeline?",
    ],
    notificationEmail: "Jartajo@StarckRE.com",
    primaryColor: "#2d2925",
  },
};

export function getBusiness(
  businessId: string
): BusinessConfig | null {
  return businesses[businessId] ?? null;
}
