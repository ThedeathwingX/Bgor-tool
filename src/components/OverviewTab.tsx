import React, { useState, useEffect } from "react";
import { Listing, ListingStatus } from "../types";
import { getFallbackImage } from "../lib/imageUtils";
import { 
  Home, 
  Video, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  ChevronRight, 
  Award,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { motion } from "motion/react";

interface OverviewTabProps {
  listings: Listing[];
  onTabChange: (tab: string) => void;
  onSelectListingForScript: (listingId: string) => void;
}

export default function OverviewTab({ listings, onTabChange, onSelectListingForScript }: OverviewTabProps) {
  const [comments, setComments] = useState<{ id: string; text: string; author: string; timestamp: number }[]>(() => {
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

  useEffect(() => {
    localStorage.setItem("bge_comments", JSON.stringify(comments));
  }, [comments]);

  const handleAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("commentText") as HTMLInputElement;
    const authorSelect = form.elements.namedItem("commentAuthor") as HTMLSelectElement;
    if (!input.value.trim()) return;
    
    setComments(prev => [
      ...prev,
      { id: "msg-" + Date.now(), text: input.value.trim(), author: authorSelect.value, timestamp: Date.now() }
    ]);
    input.value = "";
  };

  const handleDeleteComment = (id: string) => {
    if (confirm("確定要刪除這則留言嗎？")) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  // Calculations
  const counts = {
    total: listings.length,
    review: listings.filter(l => l.status === "review").length,
    script: listings.filter(l => l.status === "script").length,
    filming: listings.filter(l => l.status === "filming").length,
    editing: listings.filter(l => l.status === "editing").length,
    published: listings.filter(l => l.status === "published").length,
  };

  // Get active status percentage
  const totalWithScript = listings.filter(l => l.script || l.status !== "review").length;
  const scriptProgress = listings.length ? Math.round((totalWithScript / listings.length) * 100) : 0;

  return (
    <div className="space-y-6" id="overview-tab-container">
      {/* Welcome Hero Banner */}
      <div className="p-6 md:p-8 rounded-2xl champagne-gradient text-white relative overflow-hidden shadow-lg border border-[#e5c158]/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Home className="w-64 h-64 text-amber-400 rotate-12" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1 rounded-full text-xs text-[#ebd281]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>B哥高智效工作站</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
            哈囉 B哥！今天準備做哪一個神級爆款？
          </h1>
          <p className="text-stone-300 max-w-2xl text-sm md:text-base">
            在這裡，盤源解析不求人、腳本構思有 AI。今日計有 <span className="text-[#ebd281] font-semibold">{counts.script}</span> 個盤源急需撰寫腳本，已發佈影片正帶來穩定私域諮詢。
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onTabChange("listings")}
              className="px-5 py-2.5 bg-[#d4af37] text-stone-950 font-medium rounded-lg text-sm transition-all hover:bg-[#c5a85c] inline-flex items-center gap-2 shadow-md hover:shadow-lg"
              id="btn-overview-import"
            >
              <Zap className="w-4 h-4 fill-current" />
              智能導入 SUUMO 盤源
            </button>
            <button 
              onClick={() => onTabChange("kanban")}
              className="px-5 py-2.5 bg-stone-900 border border-stone-700 text-stone-200 font-medium rounded-lg text-sm transition-all hover:bg-stone-850 inline-flex items-center gap-2"
              id="btn-overview-pipeline"
            >
              <span>查看內容製作看板</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="overview-kpis-grid">
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="kpi-total-listings">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-medium">總儲備盤源數</span>
            <div className="p-2 bg-stone-100 rounded-lg text-stone-700">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-semibold text-stone-900">{counts.total}</span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-600 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>持續累計中</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="kpi-scripting">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-medium">腳本工作室進度</span>
            <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#b5952d]">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-semibold text-stone-900">{scriptProgress}%</span>
            <div className="flex items-center gap-1.5 mt-1 text-stone-500 text-xs">
              <span>覆蓋率 ({totalWithScript}/{counts.total} 盤源)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="kpi-production">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-medium">拍攝製作中</span>
            <div className="p-2 bg-[#1B4332]/10 rounded-lg text-[#1B4332]">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-semibold text-stone-900">{counts.filming + counts.editing}</span>
            <div className="flex items-center gap-1.5 mt-1 text-amber-600 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>急需產出新片</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="kpi-published">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 text-xs font-medium">已發佈爆款房產</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-display font-semibold text-stone-900">{counts.published}</span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-600 text-xs font-medium font-mono">
              <span>+1,550+ 諮詢留存</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: To-do List vs Urgent Process listings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-secondary-grid">
        {/* Left Column: Interactive To-Do List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#EFEFEA] shadow-xs flex flex-col space-y-4" id="overview-todo-box">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-lg font-display font-medium text-stone-850">留言區</h2>
            </div>
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
              共計 {comments.length} 則
            </span>
          </div>

          {/* Quick Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2" id="comment-add-form">
            <select 
              name="commentAuthor" 
              className="px-2.5 py-2 border border-[#EFEFEA] bg-stone-50 text-stone-600 rounded-lg text-xs w-24 shrink-0"
              defaultValue="B哥"
            >
              <option value="B哥">B哥</option>
              <option value="剪片師">剪片師</option>
            </select>
            <input 
              type="text" 
              name="commentText" 
              placeholder="新增留言..." 
              className="flex-1 px-3 py-2 border border-[#EFEFEA] bg-stone-50 rounded-lg text-sm focus:outline-hidden focus:border-[#d4af37] focus:bg-white transition-all text-stone-800"
              required
            />
            <button 
              type="submit" 
              className="px-3.5 bg-stone-900 text-white rounded-lg text-xs hover:bg-[#d4af37] hover:text-stone-950 font-medium transition-all"
            >
              送出
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 flex-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-stone-400 text-xs text-center py-8">目前沒有任何留言！</p>
            ) : (
              comments.map(comment => {
                const isBGe = comment.author === "B哥";
                return (
                  <div 
                    key={comment.id} 
                    className={`flex flex-col space-y-1 ${isBGe ? "items-start" : "items-end"}`}
                    id={`comment-item-${comment.id}`}
                  >
                    <div className="flex items-baseline gap-2 px-1">
                      <span className={`text-[10px] font-bold ${isBGe ? "text-[#b5952d]" : "text-stone-500"}`}>
                        {comment.author}
                      </span>
                      <span className="text-[9px] text-stone-400">
                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`relative px-4 py-2.5 rounded-2xl max-w-[85%] flex items-center justify-between gap-2 group ${
                      isBGe 
                        ? "bg-[#fdf9ef] border border-[#f0e3bc] text-stone-800 rounded-tl-none" 
                        : "bg-white border border-stone-200 text-stone-700 rounded-tr-none"
                    }`}>
                      <p className="text-sm leading-relaxed">{comment.text}</p>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-opacity p-1 shrink-0"
                        title="刪除"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Key Urgent Listings needing Scripts / Active Filming */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#EFEFEA] shadow-xs flex flex-col space-y-4" id="overview-urgent-listings">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-lg font-display font-medium text-stone-850">推薦急動工盤源列表</h2>
            <button 
              onClick={() => onTabChange("listings")}
              className="text-[#b5952d] text-xs hover:underline flex items-center gap-0.5"
            >
              <span>查看全部</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {listings.filter(l => l.status !== "published").length === 0 ? (
              <p className="text-stone-400 text-xs text-center py-8">盤源庫為空，請立馬導入新物件！</p>
            ) : (
              listings.filter(l => l.status !== "published").slice(0, 3).map(listing => (
                <div 
                  key={listing.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 cursor-pointer transition-all premium-card"
                  onClick={() => onSelectListingForScript(listing.id)}
                  id={`review-listing-item-${listing.id}`}
                >
                  <img 
                    src={listing.imageUrl || getFallbackImage(listing, 150)} 
                    alt={listing.title} 
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const fallback = getFallbackImage(listing, 150);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-mono">{listing.location}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        listing.status === "review" ? "bg-stone-100 text-stone-600" :
                        listing.status === "script" ? "bg-amber-100 text-amber-800" :
                        listing.status === "filming" ? "bg-blue-100 text-blue-800" :
                        listing.status === "editing" ? "bg-purple-100 text-purple-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {listing.status === "review" ? "待篩選" :
                         listing.status === "script" ? "腳本撰寫中" :
                         listing.status === "filming" ? "影片拍攝中" :
                         listing.status === "editing" ? "影片剪輯中" :
                         "已發佈影片"}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-stone-850 truncate leading-tight hover:text-[#b5952d] transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                      <span>租售比 {listing.yieldRate}%</span>
                      <span className="text-[#a5811c] font-semibold">{listing.priceHKD ? `${(listing.priceHKD / 10000).toFixed(0)} 萬 HKD` : `${(listing.priceJPY / 10000).toFixed(0)} 萬日圓`}</span>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectListingForScript(listing.id);
                        }}
                        className="text-[10px] bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 font-medium"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI 生成腳本</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
