export type BillSource = "STATE" | "FEDERAL" | "LOCAL";

export interface Bill {
  id: number;
  code: string;
  title: string;
  source: BillSource;
  score: number;
  date: string;
  tag: string;
  summary: string;
  fullText: string;
}

export interface PersonaParams {
  selections: Record<string, string[]>;
  incomeRange: [number, number];
  location: string;
  platforms: Platform[];
  freeform: string;
  actionBias: boolean;
  description: string;
}

export type Platform = "story" | "image" | "audio" | "sms" | "email";

export interface GeneratedContent {
  relevanceScore: number;
  relevanceSummary: string;
  platforms: {
    story?: StoryContent;
    image?: ImageContent;
    audio?: AudioContent;
    sms?: SMSContent;
    email?: EmailContent;
  };
}

export interface StoryContent {
  slide1: string;
  slide2: string;
  slide3: string;
  caption: string;
}

export interface ImageContent {
  headline: string;
  body: string;
  caption: string;
}

export interface AudioContent {
  intro: string;
  body: string;
  cta: string;
}

export interface SMSContent {
  text: string;
  text_es: string;
}

export interface EmailContent {
  subject: string;
  preview: string;
  body: string;
}
