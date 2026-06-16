import React, { useState, useEffect } from "react";
import { Listing, ListingStatus, Script } from "./types";
import { INITIAL_LISTINGS, INITIAL_METRICS, TREND_DATA } from "./data";
import OverviewTab from "./components/OverviewTab";
import ListingsTab from "./components/ListingsTab";
import ScriptStudioTab from "./components/ScriptStudioTab";
import KanbanTab from "./components/KanbanTab";
import AnalyticsTab from "./components/AnalyticsTab";
import KnowledgeTab from "./components/KnowledgeTab";
import { 
  Home, 
  Layers, 
  FileText, 
  Video, 
  TrendingUp, 
  Sparkles,
  Menu,
  ChevronDown,
  Globe,
  Coins,
  Tv2,
  Sun,
  Moon,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Tab state: "overview" | "listings" | "script" | "kanban" | "analytics"
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Dark mode state with persistent storage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("bge_dark_mode") === "true";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("bge_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("bge_dark_mode", "false");
    }
  }, [isDarkMode]);

  // Multi-column global listings state
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem("bge_listings_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Listing[];
        return parsed.map(item => {
          if (!item.propertyType) {
            const isHouse = !!(
              item.title?.includes("一戶建") || 
              item.title?.includes("一戸建て") || 
              item.title?.includes("別墅") || 
              item.layout?.includes("一戶建") || 
              item.layout?.includes("一戸建て")
            );
            return {
              ...item,
              propertyType: isHouse ? "house" : "apartment"
            };
          }
          return item;
        });
      } catch (e) { /* ignore */ }
    }
    return INITIAL_LISTINGS;
  });

  // Flow sync states
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem("bge_exchange_rate");
    return saved ? parseFloat(saved) : 0.05;
  });
  const [tempExchangeRate, setTempExchangeRate] = useState<string>(exchangeRate.toString());

  // Lifted comments state
  const [comments, setComments] = useState<any[]>(() => {
    const saved = localStorage.getItem("bge_comments");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: "msg-1", text: "昨天的大阪民宿盤腳本已經寫好，請你今晚開始剪，另外開頭記得幫我加個爆款音樂。", author: "B哥", timestamp: Date.now() - 86400000 },
      { id: "msg-2", text: "收到！我會配上比較輕快的 Lofi 節奏。背景影片素材我會用那套現成的模板嗎？", author: "剪片師", timestamp: Date.now() - 82400000 },
      { id: "msg-3", text: "對，就用上禮拜那套京都風格的片頭，片尾加上我們的微信 QR code。", author: "B哥", timestamp: Date.now() - 40000000 }
    ];
  });

  // Sync to database
  useEffect(() => {
    localStorage.setItem("bge_listings_v2", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem("bge_comments", JSON.stringify(comments));
  }, [comments]);

  // Handle local storage backup restoration
  const handleRestoreBackup = (importedData: { listings: Listing[]; comments: any[]; exchangeRate?: number }) => {
    if (importedData.listings && Array.isArray(importedData.listings)) {
      setListings(importedData.listings);
    }
    if (importedData.comments && Array.isArray(importedData.comments)) {
      setComments(importedData.comments);
    }
    if (importedData.exchangeRate) {
      const rate = importedData.exchangeRate;
      setExchangeRate(rate);
      localStorage.setItem("bge_exchange_rate", rate.toString());
    }
  };

  // Actions
  const handleAddListing = (newListing: Listing) => {
    setListings(prev => [newListing, ...prev]);
  };

  const handleUpdateListing = (updated: Listing) => {
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const handleUpdateListingStatus = (id: string, status: ListingStatus) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleDeleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleSaveListingScript = (id: string, script: Script) => {
    setListings(prev => prev.map(l => {
      if (l.id === id) {
        // When script is successfully generated/saved, auto-advance its status to "script written" pipeline
        const newStatus: ListingStatus = l.status === "review" ? "script" : l.status;
        return { ...l, script, status: newStatus };
      }
      return l;
    }));
  };

  // Nav helper to bridge listings to AI script generator
  const handleSelectListingForScript = (listingId: string) => {
    setSelectedListingId(listingId);
    setActiveTab("script");
  };

  const handleSaveExchangeRate = () => {
    const parsed = parseFloat(tempExchangeRate);
    if (!isNaN(parsed) && parsed > 0) {
      setExchangeRate(parsed);
      localStorage.setItem("bge_exchange_rate", parsed.toString());
      setListings(prev => prev.map(l => ({
        ...l,
        priceHKD: Math.round(l.priceJPY * parsed)
      })));
      setIsExchangeModalOpen(false);
    }
  };

  // Navigation Links definition
  const tabMetadata = [
    { id: "overview", label: "工作概覽", icon: Home },
    { id: "listings", label: "私房筍盤", icon: Globe },
    { id: "script", label: "AI 腳本工作室", icon: Sparkles },
    { id: "knowledge", label: "3D 知識庫", icon: BookOpen },
    { id: "kanban", label: "製作看板", icon: Layers },
    { id: "analytics", label: "數據統計", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-stone-800 flex flex-col font-sans selection:bg-[#d4af37]/20 selection:text-stone-900" id="bge-app-shell">
      {/* Top Premium Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EFEFEA] backdrop-blur-md px-6 py-3.5 flex items-center justify-between" id="app-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#d4af37] text-stone-950 font-display font-black text-sm uppercase rounded-xl tracking-wider shadow-sm select-none">
            B哥 2.0
          </div>
          <div>
            <span className="text-sm font-semibold text-stone-900 font-display">B哥高智效工作站</span>
          </div>
        </div>

        {/* Desktop navigation tabs */}
        <nav className="hidden lg:flex items-center gap-1.5" id="desktop-nav">
          {tabMetadata.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isActive 
                  ? "bg-stone-900 text-[#ebd281] shadow-xs" 
                  : "bg-transparent text-stone-500 hover:text-stone-850 hover:bg-stone-100"
                }`}
                id={`tab-nav-btn-${tab.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#d4af37]" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Currency exchange indicator for easy reference */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs font-semibold text-stone-600" id="header-rates">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all cursor-pointer text-stone-600"
            title={isDarkMode ? "切換至淺色模式" : "深夜護眼深色模式"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          <button 
            onClick={() => { setTempExchangeRate(exchangeRate.toString()); setIsExchangeModalOpen(true); }}
            className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium hover:border-[#ebd281]"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>目前匯率參考：1 JPY ≈ {exchangeRate} HKD</span>
          </button>
        </div>

        {/* Mobile trigger & dark mode toggle row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="sm:hidden p-2 text-stone-600 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all"
            title={isDarkMode ? "切換至淺色模式" : "深夜護眼深色模式"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200"
            id="btn-mobile-menu-trigger"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile responsive navigation drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden bg-white border-b border-stone-200 shadow-lg px-6 py-4 space-y-2 absolute top-[64px] left-0 right-0 z-50 flex flex-col"
            id="mobile-nav-panel"
          >
            {tabMetadata.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-left transition-all flex items-center gap-2 ${
                    isActive 
                    ? "bg-stone-900 text-[#ebd281]" 
                    : "bg-transparent text-stone-600 hover:bg-stone-50"
                  }`}
                  id={`mobile-nav-btn-${tab.id}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            
            <div className="pt-3 border-t border-stone-150 flex flex-col gap-2">
              <button 
                onClick={() => { setTempExchangeRate(exchangeRate.toString()); setMobileMenuOpen(false); setIsExchangeModalOpen(true); }}
                className="flex items-center gap-1.5 text-stone-500 text-[10px] pl-1 font-semibold hover:text-stone-800 transition-colors cursor-pointer text-left w-full"
              >
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>日元匯率基準: 1 JPY = {exchangeRate} HKD (點擊修改)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8" id="main-content-workspace">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="w-full"
          >
            {activeTab === "overview" && (
              <OverviewTab 
                listings={listings} 
                onTabChange={setActiveTab} 
                onSelectListingForScript={handleSelectListingForScript}
                comments={comments}
                setComments={setComments}
                onRestoreBackup={handleRestoreBackup}
              />
            )}

            {activeTab === "listings" && (
              <ListingsTab 
                listings={listings} 
                exchangeRate={exchangeRate}
                onAddListing={handleAddListing}
                onUpdateListing={handleUpdateListing}
                onDeleteListing={handleDeleteListing}
                onUpdateListingStatus={handleUpdateListingStatus}
                onSelectListingForScript={handleSelectListingForScript}
              />
            )}

            {activeTab === "script" && (
              <ScriptStudioTab 
                listings={listings}
                selectedListingId={selectedListingId}
                onSaveScript={handleSaveListingScript}
              />
            )}

            {activeTab === "knowledge" && (
              <KnowledgeTab />
            )}

            {activeTab === "kanban" && (
              <KanbanTab 
                listings={listings}
                onUpdateStatus={handleUpdateListingStatus}
                onSelectListingForScript={handleSelectListingForScript}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsTab 
                metrics={INITIAL_METRICS} 
                trendData={TREND_DATA}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Humble Footer credits line */}
      <footer className="border-t border-[#EFEFEA] bg-white py-6 text-center text-xs text-stone-400 font-sans" id="app-footer-bar">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>© 2026 B哥自媒體房產工作室 版權所有 | 專為日本房地產自媒體創作者打造</span>
          <span className="text-[10px] bg-stone-100 text-[#b5952d] px-2.5 py-1 rounded font-medium">智能中文化運營系統</span>
        </div>
      </footer>

      {/* Exchange Rate Setting Modal */}
      <AnimatePresence>
        {isExchangeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#d4af37]" />
                  <span>全局匯率設置</span>
                </h3>
                <button 
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-stone-500 leading-relaxed">
                  請輸入您目前想要使用的日元兌港元匯率。<br/>
                  <span className="text-amber-600 font-medium tracking-wide">注意：修改後將自動重新計算所有庫存盤源的港幣售價估值。</span>
                </p>
                <div>
                  <label className="block text-[11px] text-stone-500 font-semibold mb-1">1 JPY = ? HKD</label>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.001"
                      value={tempExchangeRate}
                      onChange={(e) => setTempExchangeRate(e.target.value)}
                      className="w-full border border-stone-200 rounded-lg p-2.5 pl-8 text-sm bg-white focus:outline-hidden focus:border-[#d4af37] font-mono"
                    />
                    <Coins className="w-4 h-4 text-stone-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-2 text-xs">
                <button 
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg bg-white text-stone-600 font-medium hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveExchangeRate}
                  className="px-4 py-2 rounded-lg bg-stone-900 text-[#ebd281] font-semibold hover:bg-stone-800 transition-colors"
                >
                  儲存並更新計算
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
