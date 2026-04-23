export type BillSource = "STATE" | "FEDERAL" | "LOCAL";

export interface Bill {
  id: string;
  title: string;
  source: BillSource;
  date: string;
  summary: string;
  fullText: string;
  relevanceScore?: number;
}

export interface PersonaParams {
  occupation: string[];
  occupationOther: string;
  familyType: string[];
  familyTypeOther: string;
  location: string;
  demographicFocus: string;
  naturalLanguage: string;
  actionBias: "inform" | "action";
  contentMode: "educate" | "advocate";
  platforms: Platform[];
}

export type Platform = "instagram" | "twitter" | "sms";

export interface InstagramContent {
  slide1: string;
  slide2: string;
  slide3: string;
  caption: string;
}

export interface GeneratedCampaign {
  relevanceScore: number;
  relevanceSummary: string;
  instagram: InstagramContent;
  tweet: string[];
  sms: string;
  sms_es?: string;
}
