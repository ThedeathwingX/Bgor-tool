import React, { useState, useEffect } from "react";
import { Listing, ListingStatus } from "../types";
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
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean; category: string }[]>(() => {
    const saved = localStorage.getItem("bge_todos");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: "todo-1", text: "評估新宿歌舞伎町套房賣點與伏位", done: false, category: "AI 腳本" },
      { id: "todo-2", text: "導入新抓取的 SUUMO 東京港區公寓網頁", done: false, category: "盤源" },
      { id: "todo-3", text: "拍攝大阪民宿長視頻腳本（10分鐘精緻風）", done: false, category: "影片拍攝" },
      { id: "todo-4", text: "回信覆核 YouTube 留言區的 12 位有興趣買家諮詢", done: true, category: "私域客戶" },
      { id: "todo-5", text: "更新上架小紅書日本避坑指南短視頻", done: false, category: "發佈運營" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("bge_todos", JSON.stringify(todos));
  }, [todos]);

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("todoText") as HTMLInputElement;
    const cat = form.elements.namedItem("todoCategory") as HTMLSelectElement;
    if (!input.value.trim()) return;
    
    setTodos(prev => [
      ...prev,
      { id: "todo-" + Date.now(), text: input.value.trim(), done: false, category: cat.value || "一般" }
    ]);
    input.value = "";
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
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
            <span>2.0 版本單人高智效工作站</span>
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
              <h2 className="text-lg font-display font-medium text-stone-850">今日營運核對清單 (自媒體運作看板)</h2>
            </div>
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
              待辦 {todos.filter(t => !t.done).length} / 總計 {todos.length}
            </span>
          </div>

          {/* Quick Add Todo Form */}
          <form onSubmit={handleAddTodo} className="flex gap-2" id="todo-add-form">
            <input 
              type="text" 
              name="todoText" 
              placeholder="新增今日自媒體營運任務..." 
              className="flex-1 px-3 py-2 border border-[#EFEFEA] bg-stone-50 rounded-lg text-sm focus:outline-hidden focus:border-[#d4af37] focus:bg-white transition-all text-stone-800"
              required
            />
            <select 
              name="todoCategory" 
              className="px-2.5 py-2 border border-[#EFEFEA] bg-stone-50 text-stone-600 rounded-lg text-xs"
            >
              <option value="AI 腳本">AI 腳本</option>
              <option value="盤源">盤源</option>
              <option value="影片拍攝">影片拍攝</option>
              <option value="私域客戶">私域客戶</option>
              <option value="一般">一般</option>
            </select>
            <button 
              type="submit" 
              className="px-3.5 bg-stone-900 text-white rounded-lg text-xs hover:bg-[#d4af37] hover:text-stone-950 font-medium transition-all"
            >
              新增
            </button>
          </form>

          {/* To-Do Lists */}
          <div className="space-y-2.5 flex-1 max-h-[300px] overflow-y-auto pr-1">
            {todos.length === 0 ? (
              <p className="text-stone-400 text-xs text-center py-8">今天完全沒有任務囉！可以放假泡個咖啡 ☕️</p>
            ) : (
              todos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    todo.done 
                    ? "bg-stone-50/50 border-stone-100 opacity-60" 
                    : "bg-white border-stone-150 hover:border-[#d4af37]/40"
                  }`}
                  id={`todo-item-${todo.id}`}
                >
                  <div className="flex items-center gap-3 pr-2 flex-1">
                    <input 
                      type="checkbox" 
                      checked={todo.done} 
                      onChange={() => toggleTodo(todo.id)}
                      className="w-4 h-4 rounded-sm accent-[#d4af37] text-[#d4af37] cursor-pointer"
                    />
                    <span className={`text-sm ${todo.done ? "line-through text-stone-400" : "text-stone-800 font-medium"}`}>
                      {todo.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-150 text-stone-600 whitespace-nowrap">
                      {todo.category}
                    </span>
                    <button 
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-stone-400 hover:text-red-500 text-xs px-2 transition-all"
                      title="刪除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
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
                    src={listing.imageUrl || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=150"} 
                    alt={listing.title} 
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
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

      {/* Dynamic CTA box for real-estate content tips */}
      <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="overview-strategy-tips">
        <div className="flex gap-3">
          <div className="p-3 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#856512] rounded-xl shrink-0 mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-850">💡 B哥自媒體爆款心法</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              「水能載舟，實話能招粉。日本買樓最怕踩雷，中介掩飾的朝向差、大樓老化和管理費，我們在短片中誠實主動踢爆（伏位），客戶反而會百分之百信任我們，隨後預約私域的成交率比傳統推銷高出十倍！」
            </p>
          </div>
        </div>
        <button 
          onClick={() => onTabChange("analytics")}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs hover:bg-[#d4af37] hover:text-stone-950 font-medium whitespace-nowrap transition-all flex items-center gap-1 self-end md:self-center"
        >
          <span>查看營收效能統計</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
