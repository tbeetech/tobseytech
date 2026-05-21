export interface FeaturedUseCase {
  month: string;
  title: string;
  problem: string;
  solution: string;
  facts: string;
  workScope: string;
  coverImage?: string;
}

export const featuredUseCase: FeaturedUseCase = {
  month: "June 2026",
  title: "AI Automation for a Retail Business",
  problem: "Manual inventory tracking causing 30% stock errors and costly overstock situations",
  solution:
    "Built a custom AI pipeline to automate stock alerts and reorder triggers integrated with the client's existing POS system",
  facts: "Reduced stock errors by 85% in 6 weeks · Saved 12 hrs/week of manual labor",
  workScope: "4-week build · REST API · Python + Node.js",
  coverImage:
    "https://images.unsplash.com/photo-1601598851547-4302969d0614?w=800&q=80",
};
