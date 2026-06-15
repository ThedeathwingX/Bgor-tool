export type ListingStatus = "review" | "script" | "filming" | "editing" | "published";

export interface Listing {
  id: string;
  title: string;
  priceJPY: number;
  priceHKD: number;
  location: string;
  address: string;
  layout: string;
  sizeSqm: number;
  sizeTsubo: number;
  yearBuilt: number;
  yieldRate: number;
  stationWalk: string;
  pros: string[];
  cons: string[]; // "伏位"
  summary: string; // "B哥實話實說"
  status: ListingStatus;
  createdAt: string;
  imageUrl?: string;
  script?: Script;
}

export interface ScriptScene {
  sceneName: string;
  narration: string;
  visual: string;
  textOsd: string;
  durationSec: number;
}

export interface Script {
  style: "comedy" | "luxury" | "investor" | "warning";
  platform: "youtube-long" | "tiktok-short" | "red-book";
  scenes: ScriptScene[];
  lastUpdated: string;
}

export interface PlatformMetric {
  platform: string;
  views: number;
  likes: number;
  inquiries: number;
  converted: number;
  ctr: number;
  roi: number;
}

export interface TrendData {
  date: string;
  views: number;
  inquiries: number;
}
