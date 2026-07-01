import { Listing, PlatformMetric, TrendData } from "./types";

export const INITIAL_LISTINGS: Listing[] = [];

export const INITIAL_METRICS: PlatformMetric[] = [
  { platform: "YouTube 長影片", views: 245000, likes: 18400, inquiries: 420, converted: 18, ctr: 9.2, roi: 312 },
  { platform: "YouTube Shorts", views: 420000, likes: 35000, inquiries: 300, converted: 11, ctr: 7.5, roi: 180 },
  { platform: "Instagram Reels", views: 312000, likes: 29500, inquiries: 240, converted: 9, ctr: 8.8, roi: 215 },
];

export const TREND_DATA: TrendData[] = [
  { date: "06-01", views: 28000, inquiries: 15 },
  { date: "06-03", views: 32000, inquiries: 22 },
  { date: "06-05", views: 45000, inquiries: 32 },
  { date: "06-07", views: 52000, inquiries: 38 },
  { date: "06-09", views: 61000, inquiries: 45 },
  { date: "06-11", views: 89000, inquiries: 67 },
  { date: "06-13", views: 110000, inquiries: 84 },
  { date: "06-15", views: 135000, inquiries: 104 },
];
