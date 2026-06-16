export type ListingStatus = "review" | "script" | "filming" | "editing" | "published";

export interface PropertyRating {
  location: number;      // 地段 (1-5)
  traffic: number;       // 交通 (1-5)
  quality: number;       // 單位質素 (1-5)
  price: number;         // 價錢 (1-5)
  amenities: number;     // 生活配套 (1-5)
}

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
  yearBuilt: number | string;
  yieldRate: number;
  stationWalk: string;
  pros: string[];
  cons: string[]; // "伏位"
  summary: string; // "B哥實話實說"
  status: ListingStatus;
  createdAt: string;
  imageUrl?: string;
  script?: Script;
  
  listingUrl?: string;
  landArea?: string;
  buildingArea?: string;
  privateRoad?: string;
  landRights?: string;
  structure?: string;
  builder?: string;
  renovationHistory?: string;
  zoning?: string;
  propertyType?: "apartment" | "house";
  ratings?: PropertyRating;
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
  platform: "youtube-long" | "youtube-shorts" | "instagram-reels";
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
