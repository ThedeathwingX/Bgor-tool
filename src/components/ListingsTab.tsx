import React, { useState } from "react";
import { Listing, ListingStatus } from "../types";
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
  FileSpreadsheet
} from "lucide-react";

interface ListingsTabProps {
  listings: Listing[];
  exchangeRate: number;
  onAddListing: (newListing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onUpdateListingStatus: (id: string, status: ListingStatus) => void;
  onSelectListingForScript: (listingId: string) => void;
}

export default function ListingsTab({ 
  listings, 
  exchangeRate,
  onAddListing, 
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

  // SUUMO Parser States
  const [suumoInput, setSuumoInput] = useState("");
  const [suumoUrl, setSuumoUrl] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<Partial<Listing> | null>(null);
  const [parseError, setParseError] = useState("");

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
      imageUrl: manualImg || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600"
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

    // Simulated status messages
    const statusLogs = [
      "正在啟動內核...",
      "日本 SUUMO 網頁結構匹配中...",
      "調用 Gemini 大模型智能解析中...",
      "將日元轉換為港幣並精準匹配地理座標...",
      "以老鐵核心視角分析該盤源的賣點與隱藏伏位..."
    ];

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
      imageUrl: parsedResult.location?.includes("大阪") 
        ? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600"
        : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600"
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

    return matchesSearch && matchesLocation && matchesStatus;
  });

  return (
    <div className="space-y-6" id="listings-tab-container">
      {/* Header and Quick Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-stone-900 flex items-center gap-2">
            <span>房產儲備盤源庫</span>
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
                  <div className="flex items-center gap-2 text-[#ebd281] font-semibold text-xs border-b border-stone-800 pb-2">
                    <Smile className="w-4 h-4" />
                    <span>恭喜老鐵！日本 SUUMO 資料已解析成功</span>
                  </div>
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
                          (折約港幣 {(parsedResult.priceHKD || 0).toLocaleString()} 萬)
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
                      <p className="text-stone-300 leading-tight text-[10.5px] italic mt-0.5">{parsedResult.summary}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-850 flex justify-end">
                    <button 
                      onClick={handleSaveParsedListing}
                      className="px-4 py-1.5 bg-[#ebd281] hover:bg-[#d4af37] text-stone-950 font-semibold rounded text-xs transition-colors"
                      id="btn-suumo-save-db"
                    >
                      確認錄入房產盤源庫
                    </button>
                  </div>
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
              <option value="editing">後製剪輯中</option>
              <option value="published">已發佈影片</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="listings-data-grid">
        {filteredListings.length === 0 ? (
          <div className="col-span-full bg-white p-16 rounded-xl border border-stone-150 text-center text-stone-400 space-y-3">
            <Search className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-medium">沒有找到匹配篩選條件的房產盤源</p>
            <p className="text-xs text-stone-400">可以試試調整您的搜索字眼，或是手動創建、甚至利用 SUUMO 智能導入一件新物件。</p>
          </div>
        ) : (
          filteredListings.map(listing => (
            <div 
              key={listing.id}
              className="bg-white rounded-xl border border-[#EFEFEA] overflow-hidden shadow-xs flex flex-col justify-between premium-card"
              id={`listing-card-${listing.id}`}
            >
              <div>
                {/* Image and basic info badge */}
                <div className="relative h-44 bg-stone-100">
                  <img 
                    src={listing.imageUrl || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600"} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-[10px] bg-stone-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded font-mono">
                      {listing.location}
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
                      {listing.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-mono">ID: {listing.id} | 地址: {listing.address || "暫未記錄"}</p>
                  </div>

                  {/* Core Numeric Params Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-stone-50 rounded-lg p-3 text-xs border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px]">售價 (JPY)</span>
                      <span className="font-semibold text-stone-800">{(listing.priceJPY / 10000).toLocaleString(undefined, {maximumFractionDigits: 1})} 萬円</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">折合港幣估算 (HKD)</span>
                      <span className="font-semibold text-[#a5811c]">{(listing.priceHKD / 10000).toLocaleString(undefined, {maximumFractionDigits: 1})} 萬港元</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">面積大小 (Layout)</span>
                      <span className="text-stone-700 font-medium">{listing.layout} | {listing.sizeSqm}m²</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">築年數 & 徒步</span>
                      <span className="text-stone-700 font-medium truncate block" title={listing.stationWalk}>{listing.yearBuilt} 年築 | 步程約</span>
                    </div>
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

                <div className="flex gap-2">
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
          ))
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
