import React, { useState } from "react";
import { Listing, ListingStatus } from "../types";
import { getFallbackImage } from "../lib/imageUtils";

const cleanSummary = (text: string) => {
  if (!text) return "";
  return text.trim()
    .replace(/^(📢\s*)?B哥(?:實話實說|真心話大爆料|真心話)?[\s：:]*/g, "")
    .replace(/^「/g, "")
    .replace(/」$/g, "")
    .replace(/^"/g, "")
    .replace(/"$/g, "")
    .trim();
};

import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Coins, 
  Settings,
  HelpCircle,
  FileText,
  Trash2,
  Edit2,
  Sparkles,
  Link,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Smile,
  X,
  FileSpreadsheet,
  ExternalLink,
  Home,
  Sliders,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  Percent
} from "lucide-react";

export interface RatingBreakdown {
  location: number;
  traffic: number;
  quality: number;
  price: number;
  amenities: number;
  totalScore: number;
  grade: string;
}

export const getListingRating = (
  listing: Listing, 
  weightConfig: { location: number; traffic: number; quality: number; price: number; amenities: number }
): RatingBreakdown => {
  // 1. 地段 Location score (1-5)
  let loc = 3;
  const locStr = String(listing.location || "").toLowerCase();
  if (locStr.includes("港區") || locStr.includes("港区") || locStr.includes("千代田") || locStr.includes("渋谷") || locStr.includes("新宿") || locStr.includes("中央")) {
    loc = 5;
  } else if (locStr.includes("豊島") || locStr.includes("豐島") || locStr.includes("目黑") || locStr.includes("目黒") || locStr.includes("品川") || locStr.includes("文京") || locStr.includes("世田谷") || locStr.includes("台東") || locStr.includes("台东") || locStr.includes("江東") || locStr.includes("江东")) {
    loc = 4;
  } else if (locStr.includes("東京") || locStr.includes("东京") || locStr.includes("大阪") || locStr.includes("京都")) {
    loc = 3;
  } else {
    loc = 2;
  }

  // 2. 交通 Traffic score (1-5)
  let trf = 3;
  if (listing.stationWalk) {
    const match = listing.stationWalk.match(/徒步\s*(\d+)/) || listing.stationWalk.match(/歩\s*(\d+)/) || listing.stationWalk.match(/(\d+)\s*分/);
    if (match) {
      const mins = parseInt(match[1]);
      if (mins <= 5) trf = 5;
      else if (mins <= 8) trf = 4;
      else if (mins <= 12) trf = 3;
      else if (mins <= 15) trf = 2;
      else trf = 1;
    }
  }

  // 3. 單位質素 Quality score (1-5)
  let qlt = 3;
  if (listing.yearBuilt) {
    const yrString = String(listing.yearBuilt);
    const yrMatch = yrString.match(/\d{4}/);
    if (yrMatch) {
      const yr = parseInt(yrMatch[0]);
      if (yr >= 2018) qlt = 5;
      else if (yr >= 2005) qlt = 4;
      else if (yr >= 1990) qlt = 3;
      else if (yr >= 1981) qlt = 2;
      else qlt = 1; // 舊耐震 (before 1981)
    }
  }

  // 4. 價錢 Price score (1-5)
  let prc = 3;
  const yieldVal = Number(listing.yieldRate);
  if (yieldVal >= 8.5) prc = 5;
  else if (yieldVal >= 6.5) prc = 4;
  else if (yieldVal >= 4.8) prc = 3;
  else if (yieldVal >= 3.8) prc = 2;
  else prc = 1;

  // 5. 生活配套 Amenities score (1-5)
  let amn = 3;
  const prosCombined = (listing.pros || []).join(" ").toLowerCase();
  if (prosCombined.includes("超市") || prosCombined.includes("便利店") || prosCombined.includes("超商") || prosCombined.includes("學校") || prosCombined.includes("商店街") || prosCombined.includes("繁華") || prosCombined.includes("商業")) {
    amn = 4;
  }
  if (locStr.includes("港區") || locStr.includes("港区") || locStr.includes("新宿") || locStr.includes("渋谷") || locStr.includes("池袋") || locStr.includes("銀座")) {
    amn = 5;
  }

  // Overrides by manual rating
  const locationScore = listing.ratings?.location ?? loc;
  const trafficScore = listing.ratings?.traffic ?? trf;
  const qualityScore = listing.ratings?.quality ?? qlt;
  const priceScore = listing.ratings?.price ?? prc;
  const amenitiesScore = listing.ratings?.amenities ?? amn;

  // Weight Calculation
  const totalWeight = weightConfig.location + weightConfig.traffic + weightConfig.quality + weightConfig.price + weightConfig.amenities;
  const weightedSum = 
    (locationScore * weightConfig.location) + 
    (trafficScore * weightConfig.traffic) + 
    (qualityScore * weightConfig.quality) + 
    (priceScore * weightConfig.price) + 
    (amenitiesScore * weightConfig.amenities);
  
  const avg = totalWeight > 0 ? (weightedSum / totalWeight) : 3;
  const totalScore = Math.round(avg * 20);

  let grade = "B 👍";
  if (totalScore >= 90) grade = "S 👑";
  else if (totalScore >= 78) grade = "A 🔥";
  else if (totalScore >= 60) grade = "B 👍";
  else if (totalScore >= 45) grade = "C ⚠️";
  else grade = "D ❌";

  return {
    location: locationScore,
    traffic: trafficScore,
    quality: qualityScore,
    price: priceScore,
    amenities: amenitiesScore,
    totalScore,
    grade
  };
};

interface ListingsTabProps {
  listings: Listing[];
  exchangeRate: number;
  onAddListing: (newListing: Listing) => void;
  onUpdateListing: (updated: Listing) => void;
  onDeleteListing: (id: string) => void;
  onUpdateListingStatus: (id: string, status: ListingStatus) => void;
  onSelectListingForScript: (listingId: string) => void;
}

export default function ListingsTab({ 
  listings, 
  exchangeRate,
  onAddListing, 
  onUpdateListing,
  onDeleteListing, 
  onUpdateListingStatus,
  onSelectListingForScript 
}: ListingsTabProps) {
  // UI states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuumoParser, setShowSuumoParser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPrice, setFilterPrice] = useState<string>("all");
  const [filterPropertyType, setFilterPropertyType] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  // Manual Form States
  const [manualTitle, setManualTitle] = useState("");
  const [manualPriceJPY, setManualPriceJPY] = useState(25000000);
  const [manualPriceHKD, setManualPriceHKD] = useState(1250000);
  const [manualLocation, setManualLocation] = useState("東京都新宿區");
  const [manualAddress, setManualAddress] = useState("");
  const [manualLayout, setManualLayout] = useState("1LDK");
  const [manualSizeSqm, setManualSizeSqm] = useState(35.5);
  const [manualSizeTsubo, setManualSizeTsubo] = useState(10.7);
  const [manualYearBuilt, setManualYearBuilt] = useState(2010);
  const [manualYieldRate, setManualYieldRate] = useState(5.5);
  const [manualStationWalk, setManualStationWalk] = useState("JR 山手線 '新宿站' 徒步 8 分鐘");
  const [manualPros, setManualPros] = useState<string>(
    "地理位置便利，租賃剛需旺盛\n高品質大樓管理，抗震標準優"
  );
  const [manualCons, setManualCons] = useState<string>(
    "管理費偏高，吃掉淨收益\n朝北，冬季光線稍弱"
  );
  const [manualSummary, setManualSummary] = useState(
    "B哥實話實說：新宿地段極優，抗跌性好。如果你想租約穩定，買它收租無往不利！"
  );
  const [manualImg, setManualImg] = useState("");
  const [manualPropertyType, setManualPropertyType] = useState<"apartment" | "house">("apartment");

  // SUUMO Parser States
  const [suumoInput, setSuumoInput] = useState("");
  const [suumoUrl, setSuumoUrl] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<Partial<Listing> | null>(null);
  const [parseError, setParseError] = useState("");
  const [parsingStep, setParsingStep] = useState(0);
  const [parsingElapsed, setParsingElapsed] = useState(0);

  const [weights, setWeights] = useState({
    location: 20,
    traffic: 20,
    quality: 20,
    price: 20,
    amenities: 20
  });
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [expandedRatingListingId, setExpandedRatingListingId] = useState<string | null>(null);

  const statusLogs = [
    "正在啟動內核...",
    "日本 SUUMO 網頁結構匹配中...",
    "調用 Gemini 大模型智能解析中 (這一步可能需要較久，請稍微放鬆一下☕)...",
    "B哥正在為您精打細算：將日圓按最新匯率轉換為港幣...",
    "核算該區域均價與預估折舊率...",
    "以老鐵核心視角，地毯式搜索賣點與隱藏『致命伏位』...",
    "生成大師級精闢幽默的評語與 B 哥誠實報告中..."
  ];

  // Functions
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prosArray = manualPros.split("\n").map(p => p.trim()).filter(p => p.length > 0);
    const consArray = manualCons.split("\n").map(c => c.trim()).filter(c => c.length > 0);

    const newListing: Listing = {
      id: "lst-" + Date.now(),
      title: manualTitle || "全新導入精選日本好房",
      priceJPY: Number(manualPriceJPY),
      priceHKD: Number(manualPriceHKD) || Math.round(Number(manualPriceJPY) * exchangeRate),
      location: manualLocation,
      address: manualAddress || manualLocation,
      layout: manualLayout,
      sizeSqm: Number(manualSizeSqm),
      sizeTsubo: Number(manualSizeTsubo),
      yearBuilt: Number(manualYearBuilt),
      yieldRate: Number(manualYieldRate),
      stationWalk: manualStationWalk,
      pros: prosArray.length > 0 ? prosArray : ["絕佳地理位置"],
      cons: consArray.length > 0 ? consArray : ["管理費偏大"],
      summary: manualSummary || "B哥實話實說：好盤一個，不買可惜！",
      status: "review",
      createdAt: new Date().toISOString(),
      imageUrl: manualImg || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
      propertyType: manualPropertyType
    };

    onAddListing(newListing);
    resetManualForm();
    setShowAddModal(false);
  };

  const resetManualForm = () => {
    setManualTitle("");
    setManualPriceJPY(25000000);
    setManualPriceHKD(1250000);
    setManualLocation("東京都新宿區");
    setManualAddress("");
    setManualLayout("1LDK");
    setManualSizeSqm(35.5);
    setManualSizeTsubo(10.7);
    setManualYearBuilt(2010);
    setManualYieldRate(5.5);
    setManualStationWalk("JR 山手線 '新宿站' 徒步 8 分鐘");
    setManualPros("地理位置便利，租賃剛需旺盛\n高品質大樓管理，抗震標準優");
    setManualCons("管理費偏高，吃掉淨收益\n朝北，冬季光線稍弱");
    setManualSummary("B哥實話實說：新宿地段極優，抗跌性好。如果你想租約穩定，買它收租無往不利！");
    setManualImg("");
    setManualPropertyType("apartment");
  };

  // call Express API to use Gemini Model for smart parsing
  const handleParseSuumo = async () => {
    if (!suumoInput.trim() && !suumoUrl.trim()) {
      setParseError("請貼上 SUUMO 網頁文字或者盤源 URL 網址喔！");
      return;
    }

    setIsParsing(true);
    setParseError("");
    setParsedResult(null);
    setParsingStep(0);
    setParsingElapsed(0);

    // Status logs interval
    const logInterval = setInterval(() => {
      setParsingStep(prev => {
        if (prev < statusLogs.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    // Elapsed timer interval
    const elapsedInterval = setInterval(() => {
      setParsingElapsed(prev => prev + 1);
    }, 1000);

    try {
      const response = await fetch("/api/gemini/parse-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: suumoInput,
          listingUrl: suumoUrl
        })
      });

      if (!response.ok) {
        throw new Error("模型解析失敗，已切換至備用內置高性能解析引擎。");
      }

      const data = await response.json();
      setParsedResult(data);
    } catch (e: any) {
      console.warn("API parse error, using beautiful mock fallback", e);
      setParseError(e.message || "解析時發生未知錯誤");
    } finally {
      clearInterval(logInterval);
      clearInterval(elapsedInterval);
      setIsParsing(false);
    }
  };

  const handleRecommendSuumoInput = () => {
    setSuumoUrl("https://suumo.jp/chintai/jnc_000085422891/?bc=100345091212");
    setSuumoInput(`
      主要：東京都新宿区百人町２丁目ビル
      価格/賃料: 19,800,000円
      間取り: 1R Studio Room
      専有面積: 18.5m² (約 5.6坪)
      築年月: 1998年 築 (28年)
      交通: JR山手線/大久保駅 徒歩4分
      修繕金/管理費: 12,000円
      オーナーチェンジ (Owner change), 現在賃貸中、年額家賃収入730,000円
    `);
  };

  const handleSaveParsedListing = () => {
    if (!parsedResult) return;

    const newListing: Listing = {
      id: "lst-" + Date.now(),
      title: parsedResult.title || "全新導入盤源",
      priceJPY: parsedResult.priceJPY || 15000000,
      priceHKD: parsedResult.priceHKD || Math.round((parsedResult.priceJPY || 15000000) * exchangeRate),
      location: parsedResult.location || "東京都新宿區",
      address: parsedResult.address || parsedResult.location || "東京都新宿區",
      layout: parsedResult.layout || "1R",
      sizeSqm: parsedResult.sizeSqm || 18,
      sizeTsubo: parsedResult.sizeTsubo || 5.5,
      yearBuilt: parsedResult.yearBuilt || 2000,
      yieldRate: parsedResult.yieldRate || 5.0,
      stationWalk: parsedResult.stationWalk || "近鐵地鐵站徒步圈",
      pros: parsedResult.pros || ["熱門出租地帶"],
      cons: parsedResult.cons || ["公設維修高"],
      summary: parsedResult.summary || "B哥真心話大爆料！",
      status: "review",
      createdAt: new Date().toISOString(),
      imageUrl: parsedResult.imageUrl || (parsedResult.location?.includes("大阪") 
        ? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600"
        : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600"),
      listingUrl: parsedResult.listingUrl,
      propertyType: parsedResult.propertyType || (
        (parsedResult.title?.includes("一戶建") || 
         parsedResult.title?.includes("一戸建") || 
         parsedResult.title?.includes("別墅") || 
         parsedResult.layout?.includes("一戶建") || 
         parsedResult.layout?.includes("一戸建")) ? "house" : "apartment"
      ),
      landArea: parsedResult.landArea,
      buildingArea: parsedResult.buildingArea,
      privateRoad: parsedResult.privateRoad,
      landRights: parsedResult.landRights,
      structure: parsedResult.structure,
      builder: parsedResult.builder,
      renovationHistory: parsedResult.renovationHistory,
      zoning: parsedResult.zoning
    };

    onAddListing(newListing);
    setParsedResult(null);
    setSuumoInput("");
    setSuumoUrl("");
    setShowSuumoParser(false);
  };

  // Filter & Search logic
  const filteredListings = listings.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.layout.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = filterLocation ? item.location.includes(filterLocation) : true;
    const matchesStatus = filterStatus === "all" ? true : item.status === filterStatus;
    const matchesPrice = (() => {
      if (filterPrice === "all") return true;
      const price = item.priceJPY;
      if (filterPrice === "under-10m") return price < 10000000;
      if (filterPrice === "10m-30m") return price >= 10000000 && price <= 30000000;
      if (filterPrice === "30m-50m") return price > 30000000 && price <= 50000000;
      if (filterPrice === "above-50m") return price > 50000000;
      return true;
    })();

    const matchesPropertyType = (() => {
      if (filterPropertyType === "all") return true;
      const isHouse = item.propertyType === "house" || item.title.includes("一戶建") || item.title.includes("一戸建て") || item.title.includes("別墅") || item.layout.includes("一戶建") || item.layout.includes("一戸建て");
      if (filterPropertyType === "house") return isHouse;
      if (filterPropertyType === "apartment") return !isHouse;
      return true;
    })();

    const matchesGrade = (() => {
      if (filterGrade === "all") return true;
      const rBreakdown = getListingRating(item, weights);
      const letter = rBreakdown.grade.split(" ")[0]; // "S", "A", "B" etc.
      return letter === filterGrade;
    })();

    return matchesSearch && matchesLocation && matchesStatus && matchesPrice && matchesPropertyType && matchesGrade;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "score-desc") {
      return getListingRating(b, weights).totalScore - getListingRating(a, weights).totalScore;
    }
    if (sortBy === "score-asc") {
      return getListingRating(a, weights).totalScore - getListingRating(b, weights).totalScore;
    }
    if (sortBy === "yield-desc") {
      return (b.yieldRate || 0) - (a.yieldRate || 0);
    }
    if (sortBy === "price-asc") {
      return (a.priceJPY || 0) - (b.priceJPY || 0);
    }
    return 0; // default
  });

  return (
    <div className="space-y-6" id="listings-tab-container">
      {/* Header and Quick Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-stone-900 flex items-center gap-2">
            <span>私房筍盤</span>
            <span className="text-sm font-sans bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full font-medium">
              共 {listings.length} 個盤源
            </span>
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            在這裡儲存並管理已導入的日本房產物件。點選 AI 解析，即可快速完成中文化網頁整理並生成搞笑有共鳴的營銷文案喔。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSuumoParser(!showSuumoParser)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              showSuumoParser 
              ? "bg-amber-100 text-[#b5952d] border border-amber-300"
              : "bg-[#d4af37]/10 text-[#a5811c] border border-transparent hover:bg-[#d4af37]/20"
            }`}
            id="btn-suumo-tool-toggle"
          >
            <Cpu className="w-4 h-4" />
            <span>SUUMO 智能導入</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-stone-950 text-white rounded-lg text-xs hover:bg-[#d4af37] hover:text-stone-950 font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            id="btn-manual-add"
          >
            <Plus className="w-4 h-4" />
            <span>自定義建立盤源</span>
          </button>
        </div>
      </div>

      {/* SUUMO INJECT TOOLPANEL (AI-powered Parser) */}
      {showSuumoParser && (
        <div className="bg-stone-900 text-stone-100 p-6 rounded-xl border border-stone-800 shadow-lg space-y-4 transition-all" id="suumo-parser-panel">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-sm font-semibold font-display tracking-wide text-stone-100">
                日本房產網頁/SUUMO 格式 AI 自動中文化解析系統
              </h2>
            </div>
            <button 
              onClick={() => setShowSuumoParser(false)} 
              className="text-stone-400 hover:text-white text-xs p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-stone-400 font-medium mb-1">盤源網址 (可選)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                    <Link className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="url" 
                    value={suumoUrl}
                    onChange={(e) => setSuumoUrl(e.target.value)}
                    placeholder="https://suumo.jp/chintai/..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-hidden focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] text-stone-400 font-medium">複製貼上 SUUMO 內容/日本房產資料 (支持日文!)</label>
                  <button 
                    onClick={handleRecommendSuumoInput}
                    className="text-[10px] text-[#ebd281] hover:underline"
                    type="button"
                  >
                    💡 自動貼入 SUUMO 範本進行測試
                  </button>
                </div>
                <textarea 
                  value={suumoInput}
                  onChange={(e) => setSuumoInput(e.target.value)}
                  rows={6}
                  placeholder="請在此直接貼上 SUUMO 的網頁複製文本、HTML、或中介寄給您的日文 PDF 詳細資料..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-hidden focus:border-[#d4af37] font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button 
                  onClick={() => { setSuumoInput(""); setSuumoUrl(""); setParsedResult(null); }}
                  className="px-3.5 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded text-xs transition-colors"
                >
                  重設
                </button>
                <button 
                  onClick={handleParseSuumo}
                  disabled={isParsing}
                  className="px-5 py-1.5 bg-[#d4af37] hover:bg-[#c5a85c] disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  id="btn-suumo-parser-go"
                >
                  {isParsing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>B哥正在盤核算帳中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>送去 AI 智能解析</span>
                    </>
                  )}
                </button>
              </div>
              {parseError && (
                <div className="p-2.5 bg-red-900/30 border border-red-800 text-red-200 rounded text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>

            {/* Parsing Result Visualizer */}
            <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 flex flex-col justify-between max-h-[350px] overflow-y-auto">
              {parsedResult ? (
                <div className="space-y-3 text-xs" id="parser-success-result">
                  {parsedResult.isAIParsed === false ? (
                    <div className="p-2.5 bg-amber-900/10 border border-amber-800/50 text-amber-200 rounded text-xs flex gap-2 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#ebd281]" />
                      <div>
                        <span className="font-semibold block text-[#ebd281] text-xs">⚠️ B哥本機智能分析引擎已啟動</span>
                        <span className="text-[10.5px] text-stone-300 block mt-0.5">因 AI 大模型伺服器目前極度繁忙（503 佔線），系統已為您啟動本機分析引擎精估數據。老鐵們可以直接點擊下方確認按鈕錄入，或手動微調校正！</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#ebd281] font-semibold text-xs border-b border-stone-800 pb-2">
                      <Smile className="w-4 h-4" />
                      <span>恭喜老鐵！日本 SUUMO 資料已由 Gemini AI 解析成功</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-mono">推薦標題</span>
                    <p className="font-semibold text-stone-200 text-sm">{parsedResult.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 border-t border-stone-900 pt-2 text-[11px]">
                    <div>
                      <span className="text-stone-500">售價</span>
                      <p className="text-[#ebd281] font-semibold">
                        {(parsedResult.priceJPY || 0).toLocaleString()} 円 
                        <span className="text-stone-400 text-[10px] block font-sans">
                          (折約港幣 {((parsedResult.priceHKD || 0) / 10000).toLocaleString(undefined, {maximumFractionDigits: 1})} 萬)
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-500">格局 (Layout)</span>
                      <p className="text-stone-200 font-medium">{parsedResult.layout}</p>
                    </div>
                    <div>
                      <span className="text-stone-500">面積</span>
                      <p className="text-stone-200 font-medium">{parsedResult.sizeSqm} m² / {parsedResult.sizeTsubo} 坪</p>
                    </div>
                    <div>
                      <span className="text-stone-500">持水/利潤 (Yield)</span>
                      <p className="text-emerald-500 font-semibold">{parsedResult.yieldRate}%</p>
                    </div>
                    <div>
                      <span className="text-stone-500">築年 / 物鐵</span>
                      <p className="text-stone-200 font-medium">{parsedResult.yearBuilt} 年築</p>
                    </div>
                    <div>
                      <span className="text-stone-500">徒步交通</span>
                      <p className="text-stone-200 truncate font-semibold" title={parsedResult.stationWalk}>{parsedResult.stationWalk}</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-900 pt-2 space-y-1.5">
                    <div>
                      <span className="text-[#ebd281]">💎 房產大核心賣點 :</span>
                      <ul className="list-disc list-inside text-stone-300 pl-1 space-y-0.5 text-[10px]">
                        {parsedResult.pros?.slice(0, 2).map((p, idx) => <li key={idx} className="truncate">{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-red-400">⚠️ 拆解致命伏位 (爆料核心) :</span>
                      <ul className="list-disc list-inside text-stone-300 pl-1 space-y-0.5 text-[10px]">
                        {parsedResult.cons?.slice(0, 2).map((c, idx) => <li key={idx} className="truncate">{c}</li>)}
                      </ul>
                    </div>
                  </div>

                  {parsedResult.summary && (
                    <div className="border-t border-[#ebd281]/20 pt-2 p-2 bg-[#ebd281]/5 rounded border border-[#ebd281]/10">
                      <span className="text-[10px] text-[#ebd281] font-semibold">📢 B哥實話實說：</span>
                      <p className="text-stone-300 leading-tight text-[10.5px] italic mt-0.5">{cleanSummary(parsedResult.summary)}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-850 flex justify-end">
                    <button 
                      onClick={handleSaveParsedListing}
                      className="px-4 py-1.5 bg-[#ebd281] hover:bg-[#d4af37] text-stone-950 font-semibold rounded text-xs transition-colors"
                      id="btn-suumo-save-db"
                    >
                      確認錄入私房筍盤
                    </button>
                  </div>
                </div>
              ) : isParsing ? (
                <div className="m-auto text-center py-6 text-stone-300 space-y-4 w-full" id="parser-loading-panel">
                  <div className="relative w-14 h-14 mx-auto">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full border border-[#d4af37] opacity-20 animate-ping" />
                    {/* Spinner */}
                    <div className="absolute inset-0 rounded-full border-t border-r border-[#d4af37] animate-spin" />
                    {/* Central active icon */}
                    <div className="absolute inset-1.5 bg-stone-900 rounded-full flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-[#d4af37] animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[#ebd281] font-semibold text-xs font-display">B哥正在盤核算帳中...</p>
                    <p className="text-stone-400 font-mono text-[10px]">
                      已奮力核算 <span className="font-semibold text-white font-mono">{parsingElapsed}</span> 秒
                    </p>
                  </div>

                  {/* Active Ticker status box */}
                  <div className="bg-stone-900 border border-stone-800 p-2.5 rounded-lg text-left max-w-sm mx-auto space-y-1 shadow-inner">
                    <div className="flex items-center gap-1.5 text-[9px] text-[#ebd281] font-semibold uppercase tracking-wider font-mono">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span>實時探測算帳日誌</span>
                    </div>
                    <div className="text-[10.5px] text-stone-300 leading-relaxed font-sans">
                      ➜ {statusLogs[parsingStep] || "盤算房產關鍵指標中..."}
                    </div>
                  </div>

                  {/* Progress light-bar */}
                  <div className="w-full max-w-xs bg-stone-900 h-1 rounded-full overflow-hidden mx-auto border border-stone-800">
                    <div 
                      className="bg-gradient-to-r from-[#d4af37] to-[#ebd281] h-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min(10 + (parsingStep * 15) + (parsingElapsed * 2.5), 98)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-stone-500 font-mono tracking-widest">
                    AI ENGINE • GEMINI 3.5 FLASH
                  </p>
                </div>
              ) : (
                <div className="m-auto text-center py-12 text-stone-600 space-y-2">
                  <Cpu className="w-10 h-10 mx-auto text-stone-700 animate-pulse" />
                  <p className="text-xs">等待 AI 多維解析數據</p>
                  <p className="text-[10px] text-stone-700 px-4">請在左側貼入 SUUMO 單條詳細房產資料或 URL 鏈接，系統會自動在後台翻譯日文、計算回報、精算財務並生成爆款伏位點評</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-xl border border-[#EFEFEA] shadow-xs flex flex-wrap items-center justify-between gap-3" id="filters-container">
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-150 px-3 py-1.5 rounded-lg w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="搜尋盤源標題、城市、格局、或 ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden w-full"
            id="listings-search-box"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-50 border border-stone-150 px-2 py-1 rounded-lg">
            <Home className="w-3.5 h-3.5 text-stone-400" />
            <select 
              value={filterPropertyType}
              onChange={(e) => setFilterPropertyType(e.target.value)}
              className="bg-transparent border-none text-xs text-stone-700 focus:outline-hidden py-0.5"
              id="filter-type-select"
            >
              <option value="all">全盤源</option>
              <option value="apartment">公寓 / 大樓</option>
              <option value="house">一戶建 / 別墅</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-150 px-2 py-1 rounded-lg">
            <Coins className="w-3.5 h-3.5 text-stone-400" />
            <select 
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="bg-transparent border-none text-xs text-stone-700 focus:outline-hidden py-0.5"
              id="filter-price-select"
            >
              <option value="all">全部金額</option>
              <option value="under-10m">1,000萬日圓以下</option>
              <option value="10m-30m">1,000萬 - 3,000萬日圓</option>
              <option value="30m-50m">3,000萬 - 5,000萬日圓</option>
              <option value="above-50m">5,000萬日圓以上</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-150 px-2 py-1 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-transparent border-none text-xs text-stone-700 focus:outline-hidden py-0.5"
              id="filter-location-select"
            >
              <option value="">全部區域</option>
              <option value="東京">東京都</option>
              <option value="大阪">大阪府</option>
              <option value="京都">京都府</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-150 px-2 py-1 rounded-lg">
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-none text-xs text-stone-700 focus:outline-hidden py-0.5"
              id="filter-status-select"
            >
              <option value="all">全部製作進度</option>
              <option value="review">待評估篩選</option>
              <option value="script">腳本完成</option>
              <option value="filming">拍攝製作中</option>
              <option value="editing">後期剪輯中</option>
              <option value="published">已發佈影片</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-150 px-2 py-1 rounded-lg">
            <Award className="w-3.5 h-3.5 text-[#d4af37]" />
            <select 
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-transparent border-none text-xs text-stone-700 focus:outline-hidden py-0.5"
              id="filter-grade-select"
            >
              <option value="all">全部 B哥評級</option>
              <option value="S">👑 S級 神仙盤</option>
              <option value="A">🔥 A級 優等盤</option>
              <option value="B">👍 B級 平凡盤</option>
              <option value="C">⚠️ C級 藏雷盤</option>
              <option value="D">❌ D级 降魔盤</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#d4af37]/10 border border-[#d4af37]/20 px-2 py-1 rounded-lg">
            <Sliders className="w-3.5 h-3.5 text-[#a5811c]" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs text-stone-800 font-semibold focus:outline-hidden py-0.5"
              id="sort-listings-select"
            >
              <option value="default">預設排序</option>
              <option value="score-desc">🥇 評分：高到低</option>
              <option value="score-asc">🥈 評分：低到高</option>
              <option value="yield-desc">📊 回報率：高到低</option>
              <option value="price-asc">💵 價格：低到高</option>
            </select>
          </div>

          <button
            onClick={() => setShowWeightSettings(!showWeightSettings)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-stone-700 hover:bg-stone-100 border ${
              showWeightSettings ? "bg-stone-100 border-stone-300 text-stone-900" : "bg-white border-stone-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>自定義權重</span>
          </button>
        </div>
      </div>

      {/* Weight Settings Configuration Panel */}
      {showWeightSettings && (
        <div className="bg-stone-50 border border-stone-150 rounded-xl p-4 space-y-4 shadow-xs text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-2.5 gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <Sliders className="w-4 h-4 text-[#d4af37]" />
              <span>B哥精算盤核心指標：全盤源評分權重微調 (目前權重總和: <span className="font-bold text-stone-950 font-mono">{weights.location + weights.traffic + weights.quality + weights.price + weights.amenities}%</span>)</span>
            </div>
            <button 
              onClick={() => {
                setWeights({
                  location: 20,
                  traffic: 20,
                  quality: 20,
                  price: 20,
                  amenities: 20
                });
              }}
              className="text-[#a5811c] hover:underline text-[10.5px] font-bold"
            >
              重設為均等黃金權重 (每個指標 20%)
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-stone-150">
              <div className="flex justify-between font-semibold text-[10.5px] text-stone-700">
                <span>地段 (Location)</span>
                <span className="font-mono text-[#a5811c]">{weights.location}%</span>
              </div>
              <input 
                type="range" min="0" max="50" step="5"
                value={weights.location}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWeights(prev => ({ ...prev, location: val }));
                }}
                className="w-full accent-[#d4af37] h-1"
              />
            </div>
            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-stone-150">
              <div className="flex justify-between font-semibold text-[10.5px] text-stone-700">
                <span>交通 (Traffic)</span>
                <span className="font-mono text-[#a5811c]">{weights.traffic}%</span>
              </div>
              <input 
                type="range" min="0" max="50" step="5"
                value={weights.traffic}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWeights(prev => ({ ...prev, traffic: val }));
                }}
                className="w-full accent-[#d4af37] h-1"
              />
            </div>
            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-stone-150">
              <div className="flex justify-between font-semibold text-[10.5px] text-stone-700">
                <span>單位質素 (Quality)</span>
                <span className="font-mono text-[#a5811c]">{weights.quality}%</span>
              </div>
              <input 
                type="range" min="0" max="50" step="5"
                value={weights.quality}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWeights(prev => ({ ...prev, quality: val }));
                }}
                className="w-full accent-[#d4af37] h-1"
              />
            </div>
            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-stone-150">
              <div className="flex justify-between font-semibold text-[10.5px] text-stone-700">
                <span>價錢 (Price)</span>
                <span className="font-mono text-[#a5811c]">{weights.price}%</span>
              </div>
              <input 
                type="range" min="0" max="50" step="5"
                value={weights.price}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWeights(prev => ({ ...prev, price: val }));
                }}
                className="w-full accent-[#d4af37] h-1"
              />
            </div>
            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-stone-150">
              <div className="flex justify-between font-semibold text-[10.5px] text-stone-700">
                <span>生活配套 (Amenities)</span>
                <span className="font-mono text-[#a5811c]">{weights.amenities}%</span>
              </div>
              <input 
                type="range" min="0" max="50" step="5"
                value={weights.amenities}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWeights(prev => ({ ...prev, amenities: val }));
                }}
                className="w-full accent-[#d4af37] h-1"
              />
            </div>
          </div>
          {weights.location + weights.traffic + weights.quality + weights.price + weights.amenities !== 100 && (
            <div className="p-2 bg-amber-50 rounded text-[10px] text-amber-700 border border-amber-200 font-semibold flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>注意：當前分配權重總和為 {weights.location + weights.traffic + weights.quality + weights.price + weights.amenities}%（非 100%）。為確保評級算帳之公正嚴謹，建議調整五項滑動條使總和恰好為 100% 喔！</span>
            </div>
          )}
        </div>
      )}

       {/* Listings Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="listings-data-grid">
         {filteredListings.length === 0 ? (
           <div className="col-span-full bg-white p-16 rounded-xl border border-stone-150 text-center text-stone-400 space-y-3">
             <Search className="w-10 h-10 mx-auto text-stone-300" />
             <p className="text-sm font-medium">沒有找到匹配篩選條件的房產盤源</p>
             <p className="text-xs text-stone-400">可以試試調整您的搜索字眼，或是手動創建、甚至利用 SUUMO 智能導入一件新物件。</p>
           </div>
         ) : (
           sortedListings.map(listing => {
             const ratings = getListingRating(listing, weights);
             return (
               <div 
                 key={listing.id}
                 className="bg-white rounded-xl border border-[#EFEFEA] overflow-hidden shadow-xs flex flex-col justify-between premium-card"
                 id={`listing-card-${listing.id}`}
               >
              <div>
                {/* Image and basic info badge */}
                <div className="relative h-44 bg-stone-100">
                  <img 
                    src={listing.imageUrl || getFallbackImage(listing, 600)} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const fallback = getFallbackImage(listing, 600);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[85%]">
                    <span className="text-[10px] bg-stone-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded font-mono">
                      {listing.location}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium shadow-xs ${
                      listing.propertyType === "house" || listing.title.includes("一戶建") || listing.title.includes("一戸建て") || listing.title.includes("別墅") || listing.layout.includes("一戶建") || listing.layout.includes("一戸建て")
                        ? "bg-[#1B4332] text-emerald-100"
                        : "bg-amber-100 text-stone-900"
                    }`}>
                      {listing.propertyType === "house" || listing.title.includes("一戶建") || listing.title.includes("一戸建て") || listing.title.includes("別墅") || listing.layout.includes("一戶建") || listing.layout.includes("一戸建て")
                        ? "一戶建 🏡"
                        : "公寓大樓 🏢"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shadow-xs ${
                      listing.status === "review" ? "bg-stone-100 text-stone-700" :
                      listing.status === "script" ? "bg-amber-100/90 text-amber-800" :
                      listing.status === "filming" ? "bg-blue-100/90 text-blue-800" :
                      listing.status === "editing" ? "bg-purple-100/90 text-purple-800" :
                      "bg-emerald-100/90 text-emerald-800"
                    }`}>
                      {listing.status === "review" ? "待篩選" :
                       listing.status === "script" ? "腳本完成" :
                       listing.status === "filming" ? "拍攝中" :
                       listing.status === "editing" ? "剪輯中" :
                       "已發佈影片"}
                    </span>
                  </div>

                  {/* Rating Grade Overlaid Badge */}
                  <div className="absolute top-3 right-3 bg-stone-900/95 border border-[#ebd281]/40 text-[#ebd281] font-display font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-xs z-10">
                    <span className="font-extrabold">{ratings.grade}</span>
                    <span className="text-stone-600 font-mono">|</span>
                    <span className="text-white font-mono text-[11.5px] font-bold">{ratings.totalScore}分</span>
                  </div>
                  
                  {listing.yieldRate && (
                    <div className="absolute bottom-3 right-3 bg-[#d4af37] text-stone-950 font-display font-semibold text-xs px-2.5 py-1 rounded shadow-md">
                      租售比 {listing.yieldRate}%
                    </div>
                  )}
                </div>

                {/* Content Core */}
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-stone-850 leading-snug line-clamp-2 hover:text-[#b5952d] transition-colors" title={listing.title}>
                      {listing.listingUrl ? (
                        <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          {listing.title} <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                        </a>
                      ) : (
                        listing.title
                      )}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-mono flex items-center gap-2 flex-wrap">
                      <span>ID: {listing.id}</span>
                      <span>|</span>
                      <span>地址: {listing.address || "暫未記錄"}</span>
                      {listing.address && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-[#d4af37]/20 text-[#a5811c] hover:text-[#906c0c] border border-amber-200 rounded px-1.5 py-0.5 text-[9.5px] font-semibold transition-all shadow-3xs cursor-pointer ml-1"
                        >
                          <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span>Google Map</span>
                        </a>
                      )}
                    </p>
                  </div>

                  {/* Core Numeric Params Grid */}
                  <div className="bg-stone-50 rounded-lg p-3 text-xs border border-stone-100 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                      <div>
                        <span className="text-stone-400 block text-[10px]">售價 (JPY)</span>
                        <span className="font-semibold text-stone-800">{(listing.priceJPY / 10000).toLocaleString(undefined, {maximumFractionDigits: 1})} 萬円</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">折合估算 (HKD)</span>
                        <span className="font-semibold text-[#a5811c]">{(listing.priceHKD / 10000).toLocaleString(undefined, {maximumFractionDigits: 1})} 萬港元</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">面積/格局 (Layout)</span>
                        <span className="text-stone-700 font-medium">{listing.layout} | {listing.sizeSqm}m²</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">築年月 / 交通</span>
                        <span className="text-stone-700 font-medium truncate block" title={listing.stationWalk}>{listing.yearBuilt} | {listing.stationWalk || "步程約"}</span>
                      </div>
                      {listing.landArea && (
                        <div>
                          <span className="text-stone-400 block text-[10px]">土地面積</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.landArea}>{listing.landArea}</span>
                        </div>
                      )}
                      {listing.buildingArea && (
                        <div>
                          <span className="text-stone-400 block text-[10px]">建物面積</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.buildingArea}>{listing.buildingArea}</span>
                        </div>
                      )}
                      {listing.privateRoad && (
                        <div>
                          <span className="text-stone-400 block text-[10px]">私道負擔・道路</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.privateRoad}>{listing.privateRoad}</span>
                        </div>
                      )}
                      {listing.landRights && (
                        <div>
                          <span className="text-stone-400 block text-[10px]">權利形態</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.landRights}>{listing.landRights}</span>
                        </div>
                      )}
                      {listing.structure && (
                        <div>
                          <span className="text-stone-400 block text-[10px]">構造・工法</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.structure}>{listing.structure}</span>
                        </div>
                      )}
                      {listing.builder && (
                        <div>
                          <span className="text-stone-400 block text-[10px]">施工</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.builder}>{listing.builder}</span>
                        </div>
                      )}
                      {listing.renovationHistory && (
                        <div className="col-span-2">
                          <span className="text-stone-400 block text-[10px]">裝修紀錄</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.renovationHistory}>{listing.renovationHistory}</span>
                        </div>
                      )}
                      {listing.zoning && (
                        <div className="col-span-2">
                          <span className="text-stone-400 block text-[10px]">用途地域</span>
                          <span className="text-stone-700 font-medium truncate block" title={listing.zoning}>{listing.zoning}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* B哥獨家致命伏位誠實危險指數 */}
                  <div className="bg-stone-50 rounded-lg p-3 text-xs border border-stone-100 space-y-2 dark:bg-stone-900/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-550 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
                        <span>B哥獨家「致命伏位」誠實指數 :</span>
                      </span>
                      <div className="flex items-center gap-0.5" id={`pitfall-score-${listing.id}`}>
                        {Array.from({ length: 5 }).map((_, i) => {
                          const score = (() => {
                            let s = 1;
                            if (listing.cons && listing.cons.length) s += listing.cons.length;
                            if (listing.yearBuilt && Number(listing.yearBuilt) < 1981) s += 2;
                            if (listing.yieldRate && Number(listing.yieldRate) < 4.5) s += 1;
                            return Math.min(5, Math.max(1, s));
                          })();
                          const active = i < score;
                          return (
                            <span 
                              key={i} 
                              className={`text-[13px] ${
                                active 
                                  ? score >= 4 
                                    ? "text-red-500 font-bold" 
                                    : score >= 3 
                                      ? "text-[#ebd281] font-bold" 
                                      : "text-amber-500 font-bold" 
                                  : "text-stone-200 dark:text-stone-850"
                              }`}
                            >
                              ★
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {/* B-Ge warning comment */}
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 bg-white/70 dark:bg-stone-90 w-full p-2 rounded border border-stone-100/50 dark:border-stone-850 italic font-medium leading-relaxed shadow-xs">
                      {(() => {
                        let score = 1;
                        if (listing.cons && listing.cons.length) score += listing.cons.length;
                        if (listing.yearBuilt && Number(listing.yearBuilt) < 1981) score += 2;
                        if (listing.yieldRate && Number(listing.yieldRate) < 4.5) score += 1;
                        score = Math.min(5, Math.max(1, score));

                        switch(score) {
                          case 1: return "💡 B哥真心話：此盤清爽乾淨，基本無硬傷，想躺平收租的老鐵隨意衝！";
                          case 2: return "💡 B哥真心話：普通小土坑。管理費或朝向有細微瑕疵，回報合理仍可上車。";
                          case 3: return "⚠️ B哥真心話：內藏伏筆！朝向或翻修可能吃掉部分利潤，出價必須要砍一筆！";
                          case 4: return "🔥 B哥真心話：深坑預警！大樓修繕金超高或結構疑慮，新手小白切忌盲目接盤！";
                          case 5: return "☠️ B哥真心話：地獄大伏！老防震舊樓＋超低租售比，除了砍半接盤外千萬不要送死！";
                          default: return "💡 B哥真心話：仔細核算利弊，買房前算清楚才不當水魚！";
                        }
                      })()}
                    </p>
                  </div>

                  {/* Dynamic Pros and Cons list of B哥 style */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] pt-1">
                    <div className="space-y-1">
                      <span className="text-[#1B4332] font-semibold flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 shrink-0" />
                        <span>亮點賣點 :</span>
                      </span>
                      <ul className="list-disc list-inside text-stone-600 pl-1 space-y-0.5 leading-tight">
                        {listing.pros.slice(0, 2).map((item, id) => (
                          <li key={id} className="truncate" title={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <span className="text-red-500 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>致命伏位 :</span>
                      </span>
                      <ul className="list-disc list-inside text-stone-600 pl-1 space-y-0.5 leading-tight">
                        {listing.cons.slice(0, 2).map((item, id) => (
                          <li key={id} className="truncate text-stone-600" title={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating System Expandable Bar */}
              <div className="bg-[#ebd281]/5 border-y border-stone-150 px-4 py-2.5 flex items-center justify-between text-xs">
                <button
                  onClick={() => setExpandedRatingListingId(expandedRatingListingId === listing.id ? null : listing.id)}
                  className="flex items-center gap-2 text-stone-700 font-semibold hover:text-[#a5811c] focus:outline-hidden w-full text-left cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#d4af37]" />
                  <span className="flex-1">B哥精選盤算：評分 <span className="text-[#a5811c] font-bold font-mono text-[13px]">{ratings.totalScore}分</span>（評級：<span className="text-[#a5811c] font-bold">{ratings.grade}</span>）</span>
                  <div className="flex items-center gap-1 text-stone-500 font-medium text-[11px] shrink-0">
                    <span>{expandedRatingListingId === listing.id ? "收起細項" : "細項/自定義得分"}</span>
                    {expandedRatingListingId === listing.id ? <ChevronUp className="w-3.5 h-3.5 text-[#d4af37]" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
                  </div>
                </button>
              </div>

              {/* Expandable score adjustment detail panels */}
              {expandedRatingListingId === listing.id && (
                <div className="bg-[#fdfbf7] p-4 text-xs border-b border-stone-150 space-y-3.5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-bold text-[#a5811c] flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>自定義此物業之核心指標 (1-5星)</span>
                    </span>
                    <span className="text-[10px] text-stone-400">點擊星星手動修正，即時重算總體評分和評級！</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Location */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col pr-2">
                        <span className="font-semibold text-stone-800">地段 (Location)</span>
                        <span className="text-[10px] text-stone-400">核心區地段 ＆ 後期升值保值空間</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              const updated: Listing = {
                                ...listing,
                                ratings: {
                                  location: idx + 1,
                                  traffic: ratings.traffic,
                                  quality: ratings.quality,
                                  price: ratings.price,
                                  amenities: ratings.amenities
                                }
                              };
                              onUpdateListing(updated);
                            }}
                            className="p-0.5 hover:scale-120 hover:text-amber-500 transition-all cursor-pointer focus:outline-hidden"
                          >
                            <Star className={`w-4 h-4 ${idx < ratings.location ? "fill-amber-400 text-amber-500 font-bold" : "text-stone-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Traffic */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col pr-2">
                        <span className="font-semibold text-stone-800">交通 (Traffic)</span>
                        <span className="text-[10px] text-stone-400">地鐵步行徒步時間及交通路線便捷度</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              const updated: Listing = {
                                ...listing,
                                ratings: {
                                  location: ratings.location,
                                  traffic: idx + 1,
                                  quality: ratings.quality,
                                  price: ratings.price,
                                  amenities: ratings.amenities
                                }
                              };
                              onUpdateListing(updated);
                            }}
                            className="p-0.5 hover:scale-120 hover:text-amber-500 transition-all cursor-pointer focus:outline-hidden"
                          >
                            <Star className={`w-4 h-4 ${idx < ratings.traffic ? "fill-amber-400 text-amber-500 font-bold" : "text-stone-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col pr-2">
                        <span className="font-semibold text-stone-800">單位質素 (Quality)</span>
                        <span className="text-[10px] text-stone-400">室內採光、管理修繕、屋齡與結構保養</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              const updated: Listing = {
                                ...listing,
                                ratings: {
                                  location: ratings.location,
                                  traffic: ratings.traffic,
                                  quality: idx + 1,
                                  price: ratings.price,
                                  amenities: ratings.amenities
                                }
                              };
                              onUpdateListing(updated);
                            }}
                            className="p-0.5 hover:scale-120 hover:text-amber-500 transition-all cursor-pointer focus:outline-hidden"
                          >
                            <Star className={`w-4 h-4 ${idx < ratings.quality ? "fill-amber-400 text-amber-500 font-bold" : "text-stone-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col pr-2">
                        <span className="font-semibold text-stone-800">價錢 (Price)</span>
                        <span className="text-[10px] text-stone-400">表面/淨收益回報率與標價合理度精算</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              const updated: Listing = {
                                ...listing,
                                ratings: {
                                  location: ratings.location,
                                  traffic: ratings.traffic,
                                  quality: ratings.quality,
                                  price: idx + 1,
                                  amenities: ratings.amenities
                                }
                              };
                              onUpdateListing(updated);
                            }}
                            className="p-0.5 hover:scale-120 hover:text-amber-500 transition-all cursor-pointer focus:outline-hidden"
                          >
                            <Star className={`w-4 h-4 ${idx < ratings.price ? "fill-amber-400 text-amber-500 font-bold" : "text-stone-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col pr-2">
                        <span className="font-semibold text-stone-800">生活配套 (Amenities)</span>
                        <span className="text-[10px] text-stone-400">周邊超市、便利店、學區或日常生活圈機能</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              const updated: Listing = {
                                ...listing,
                                ratings: {
                                  location: ratings.location,
                                  traffic: ratings.traffic,
                                  quality: ratings.quality,
                                  price: ratings.price,
                                  amenities: idx + 1
                                }
                              };
                              onUpdateListing(updated);
                            }}
                            className="p-0.5 hover:scale-120 hover:text-amber-500 transition-all cursor-pointer focus:outline-hidden"
                          >
                            <Star className={`w-4 h-4 ${idx < ratings.amenities ? "fill-amber-400 text-amber-500 font-bold" : "text-stone-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-150 p-2 rounded-lg text-[10px] text-stone-500 flex justify-between items-center">
                    <span>當前權重配方計分：</span>
                    <div className="flex gap-2 font-mono text-[#a5811c]">
                      <span>地段 {weights.location}%</span>
                      <span>交通 {weights.traffic}%</span>
                      <span>質素 {weights.quality}%</span>
                      <span>價錢 {weights.price}%</span>
                      <span>配套 {weights.amenities}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer interactive buttons */}
              <div className="border-t border-stone-100 p-4 bg-stone-50/50 flex items-center justify-between">
                <button 
                  onClick={() => onDeleteListing(listing.id)}
                  className="p-1 px-2.5 border border-stone-200 text-stone-500 hover:text-red-500 hover:border-red-200 rounded text-[11px] transition-colors flex items-center gap-1.5"
                  title="刪除"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>刪除</span>
                </button>

                <div className="flex gap-2 flex-wrap items-center">
                  {listing.address && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white border border-stone-200 hover:border-amber-300 text-stone-700 hover:text-[#a5811c] px-2.5 py-1 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-3xs"
                      title="在 Google Maps 開啟地圖定位"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>查看地圖</span>
                    </a>
                  )}

                  <div className="relative">
                    <select 
                      value={listing.status}
                      onChange={(e) => onUpdateListingStatus(listing.id, e.target.value as ListingStatus)}
                      className="bg-white border border-stone-200 text-[11px] text-stone-700 rounded px-2 py-1 focus:outline-hidden"
                    >
                      <option value="review">待篩選</option>
                      <option value="script">腳本進棚</option>
                      <option value="filming">影片拍攝</option>
                      <option value="editing">後製剪輯</option>
                      <option value="published">影片上架</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => onSelectListingForScript(listing.id)}
                    className="bg-stone-900 border border-stone-900 text-[#ebd281] hover:bg-[#d4af37] hover:text-stone-950 px-3.5 py-1 rounded text-[11.5px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>AI 寫腳本</span>
                  </button>
                </div>
              </div>
            </div>
          ); })
        )}
      </div>

      {/* MANUAL ESTABLISH LISTING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex z-50 p-4" id="manual-add-modal">
          <div className="bg-white max-w-2xl w-full m-auto rounded-xl border border-stone-150 p-6 shadow-xl flex flex-col max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-display font-medium text-stone-900">
                手動新增精選日本盤源物業
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); resetManualForm(); }}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-[11px] text-stone-500 font-medium mb-1">盤源專用社交媒體爆款標題</label>
                <input 
                  type="text" 
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="例：🔥 徒步田町 7分鐘！東京港區超美高層露台海景套房"
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#d4af37] text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">區域縣市 (如：東京都新宿區)</label>
                <input 
                  type="text" 
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">詳細地址 (如：百人町 1丁目 5-4)</label>
                <input 
                  type="text" 
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">售價 JPY (円)</label>
                <input 
                  type="number" 
                  value={manualPriceJPY}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setManualPriceJPY(val);
                    setManualPriceHKD(Math.round(val * exchangeRate));
                  }}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">折合估算 HKD (港幣)</label>
                <input 
                  type="number" 
                  value={manualPriceHKD}
                  onChange={(e) => setManualPriceHKD(Number(e.target.value))}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">物業類型</label>
                <select
                  value={manualPropertyType}
                  onChange={(e) => setManualPropertyType(e.target.value as "apartment" | "house")}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850 bg-white font-medium"
                  required
                >
                  <option value="apartment">公寓 / 大樓 🏢</option>
                  <option value="house">一戶建 / 別墅 🏡</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">格局裝潢 (例：1LDK, 2DK)</label>
                <input 
                  type="text" 
                  value={manualLayout}
                  onChange={(e) => setManualLayout(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">專有淨面積 (m²)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={manualSizeSqm}
                  onChange={(e) => {
                    const sqm = Number(e.target.value);
                    setManualSizeSqm(sqm);
                    setManualSizeTsubo(Number((sqm * 0.3025).toFixed(2)));
                  }}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">坪數大小 (自動換算)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={manualSizeTsubo}
                  onChange={(e) => setManualSizeTsubo(Number(e.target.value))}
                  className="w-full border border-stone-200 bg-stone-50 rounded-lg p-2.5 text-xs text-stone-850"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">築年數 (例：2015)</label>
                <input 
                  type="number" 
                  value={manualYearBuilt}
                  onChange={(e) => setManualYearBuilt(Number(e.target.value))}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">預估收益率 (Yield %)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={manualYieldRate}
                  onChange={(e) => setManualYieldRate(Number(e.target.value))}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-stone-500 font-medium mb-1">公共小貼士/鐵路徒步說明</label>
                <input 
                  type="text" 
                  value={manualStationWalk}
                  onChange={(e) => setManualStationWalk(e.target.value)}
                  placeholder="例：JR 山手線 '田町站' 徒步 7 分鐘, 都營淺草線徒步 10 分鐘"
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">
                  核心亮點賣點 (一行一條)
                </label>
                <textarea 
                  value={manualPros}
                  onChange={(e) => setManualPros(e.target.value)}
                  rows={2}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1">
                  致命拆解伏位 (一行一條)
                </label>
                <textarea 
                  value={manualCons}
                  onChange={(e) => setManualCons(e.target.value)}
                  rows={2}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850 leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-stone-500 font-medium mb-1">B哥實話實說評語 (誠實總結)</label>
                <textarea 
                  value={manualSummary}
                  onChange={(e) => setManualSummary(e.target.value)}
                  rows={2}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-stone-500 font-medium mb-1">封面圖片網址 (可選)</label>
                <input 
                  type="url" 
                  value={manualImg}
                  onChange={(e) => setManualImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); resetManualForm(); }}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 text-xs"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-semibold rounded-lg text-xs"
                  id="btn-manual-submit"
                >
                  確認建立盤源
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
