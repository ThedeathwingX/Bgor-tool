import React, { useState } from "react";
import { Listing, ListingStatus } from "../types";
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Play, 
  Video, 
  CheckCircle,
  HelpCircle,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Trash2,
  Calendar,
  AlertTriangle,
  X
} from "lucide-react";

interface KanbanTabProps {
  listings: Listing[];
  onUpdateStatus: (id: string, newStatus: ListingStatus) => void;
  onSelectListingForScript: (listingId: string) => void;
}

export default function KanbanTab({ 
  listings, 
  onUpdateStatus, 
  onSelectListingForScript 
}: KanbanTabProps) {
  // Modal State for viewing details
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Column definitions
  const columns: { id: ListingStatus; name: string; color: string; bg: string; icon: any }[] = [
    { id: "review", name: "💡 盤源篩選", color: "text-stone-700 bg-stone-100 border-stone-200", bg: "bg-stone-50/50", icon: HelpCircle },
    { id: "script", name: "📝 腳本撰寫", color: "text-amber-800 bg-amber-100 border-amber-200", bg: "bg-amber-50/25", icon: FileText },
    { id: "filming", name: "🎥 影片拍攝", color: "text-blue-800 bg-blue-100 border-blue-200", bg: "bg-blue-50/25", icon: Video },
    { id: "editing", name: "✂️ 剪輯後製", color: "text-purple-800 bg-purple-100 border-purple-200", bg: "bg-purple-50/25", icon: Play },
    { id: "published", name: "🚀 已上架影片", color: "text-emerald-800 bg-emerald-100 border-emerald-200", bg: "bg-emerald-50/25", icon: CheckCircle },
  ];

  // Helper status changer
  const moveCard = (id: string, currentStatus: ListingStatus, direction: "prev" | "next") => {
    const statusOrder: ListingStatus[] = ["review", "script", "filming", "editing", "published"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (direction === "prev" && currentIndex > 0) {
      onUpdateStatus(id, statusOrder[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < statusOrder.length - 1) {
      onUpdateStatus(id, statusOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6" id="kanban-tab-container">
      {/* Header section with help tip */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display font-medium text-stone-900">
            自媒體內容製作與盤源製作看板
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            專為房產 B 哥單人設計的敏捷運營看板，一目了然從「篩選物件」到「腳本撰寫」、「拍攝製作」至「最終上架影片」的端到端運作進度。
          </p>
        </div>
      </div>

      {/* Main Kanban Columns Scroll wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4" id="kanban-board-grid">
        {columns.map(col => {
          const colListings = listings.filter(l => l.status === col.id);
          const ColIcon = col.icon;
          
          return (
            <div 
              key={col.id} 
              className={`rounded-xl border border-[#EFEFEA] p-4 flex flex-col space-y-4 ${col.bg} min-w-[250px]`}
              id={`kanban-column-${col.id}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                <div className="flex items-center gap-1.5">
                  <ColIcon className="w-4 h-4 text-stone-600" />
                  <span className="text-xs font-semibold text-stone-850 font-display">{col.name}</span>
                </div>
                <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-mono">
                  {colListings.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colListings.length === 0 ? (
                  <div className="border border-dashed border-stone-200 rounded-lg p-8 text-center text-stone-400 text-[10px] space-y-1">
                    <span>暫無此進度物件</span>
                  </div>
                ) : (
                  colListings.map(listing => (
                    <div 
                      key={listing.id}
                      className="bg-white border border-[#EFEFEA] hover:border-stone-400 rounded-xl p-3 shadow-xs space-y-3 transition-colors cursor-pointer relative group premium-card"
                      onClick={() => setSelectedListing(listing)}
                      id={`kanban-card-${listing.id}`}
                    >
                      {/* Image and basic tag in card */}
                      <div className="relative h-20 bg-stone-150 rounded-lg overflow-hidden border border-stone-100">
                        <img 
                          src={listing.imageUrl || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=150"} 
                          alt={listing.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-1 right-1 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                          租售比 {listing.yieldRate}%
                        </div>
                      </div>

                      {/* Info block */}
                      <div className="space-y-1">
                        <h4 className="text-[11.5px] font-bold text-stone-850 line-clamp-2 leading-snug group-hover:text-[#b5952d] transition-colors">
                          {listing.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                          <span>{listing.location}</span>
                          <span className="text-[#a5811c] font-semibold">{(listing.priceHKD / 10000).toFixed(0)} 萬港幣</span>
                        </div>
                      </div>

                      {/* Script Indicator Check badge */}
                      {listing.script ? (
                        <div className="p-1 px-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-[9.5px] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>已生成 AI 腳本 ({listing.script.scenes.length} 個分鏡)</span>
                        </div>
                      ) : (
                        <div className="p-1 px-2 bg-stone-50 text-stone-500 rounded border border-stone-150 text-[9px] flex items-center gap-1 justify-between">
                          <span className="truncate">尚無 AI 腳本分鏡稿</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectListingForScript(listing.id);
                            }}
                            className="bg-stone-900 text-[#ebd281] hover:bg-[#d4af37] hover:text-stone-950 p-0.5 px-1.5 rounded text-[8px] font-medium"
                          >
                            AI 寫
                          </button>
                        </div>
                      )}

                      {/* Quick Move Trigger Controls */}
                      <div className="flex justify-between items-center border-t border-stone-100 pt-2 text-[10px]">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCard(listing.id, col.id, "prev");
                          }}
                          disabled={col.id === "review"}
                          className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-all font-semibold"
                          title="往左移一階"
                        >
                          ←
                        </button>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedListing(listing); }}
                          className="text-stone-400 hover:text-[#b5952d] hover:underline inline-flex items-center gap-0.5 text-[9px] font-medium"
                        >
                          <Eye className="w-3 h-3 text-[#d4af37]" />
                          <span>極致詳情</span>
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCard(listing.id, col.id, "next");
                          }}
                          disabled={col.id === "published"}
                          className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-all font-semibold"
                          title="往右移一階"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL DRAWER OVERLAY */}
      {selectedListing && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex z-50 p-4" id="kanban-detail-modal">
          <div className="bg-white max-w-2xl w-full m-auto rounded-xl border border-stone-150 shadow-xl flex flex-col max-h-[90vh] overflow-hidden" id="kanban-overlay-card">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-100 p-5 bg-stone-50">
              <div>
                <span className="text-[10px] bg-stone-900 text-stone-100 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  {selectedListing.location}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">ID: {selectedListing.id} | 品級: 房產自媒體儲備</span>
              </div>
              <button 
                onClick={() => setSelectedListing(null)}
                className="text-stone-400 hover:text-stone-600 p-1 bg-white border border-stone-200 rounded-lg shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Graphic Banner */}
              <div className="h-44 rounded-lg overflow-hidden border border-stone-100 relative shadow-sm">
                <img 
                  src={selectedListing.imageUrl || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600"} 
                  alt={selectedListing.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#1B4332] text-white font-semibold text-[10px] px-2.5 py-1 rounded">
                  租售比率 {selectedListing.yieldRate}%
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-stone-850 leading-snug">
                  {selectedListing.title}
                </h3>
                <p className="text-stone-500">詳細地址：{selectedListing.address || "東京都東山區祇園四条徒步圈"}</p>
              </div>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 border border-stone-100 rounded-lg p-3text-stone-700">
                <div className="p-2 border-r border-stone-200">
                  <span className="text-stone-400 block text-[9px] uppercase">售價JPY</span>
                  <span className="font-semibold text-stone-800">{(selectedListing.priceJPY / 10000).toLocaleString(undefined, {maximumFractionDigits:1})} 萬円</span>
                </div>
                <div className="p-2 border-r border-stone-100 sm:border-r border-stone-200">
                  <span className="text-stone-400 block text-[9px] uppercase">估算HKD</span>
                  <span className="font-semibold text-[#a5811c]">{(selectedListing.priceHKD / 10000).toLocaleString(undefined, {maximumFractionDigits:1})} 萬港幣</span>
                </div>
                <div className="p-2 border-r border-stone-200">
                  <span className="text-stone-400 block text-[9px] uppercase">室內格局</span>
                  <span className="font-semibold text-stone-800">{selectedListing.layout} | {selectedListing.sizeSqm} m²</span>
                </div>
                <div className="p-2">
                  <span className="text-stone-400 block text-[9px] uppercase">築年數</span>
                  <span className="font-semibold text-stone-800">{selectedListing.yearBuilt} 年築</span>
                </div>
              </div>

              {/* Pros & Cons Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] pt-1">
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-150">
                  <span className="text-[#1B4332] font-semibold flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-800" />
                    <span>核心賣點亮點析 :</span>
                  </span>
                  <ul className="list-decimal list-inside text-stone-600 pl-1 space-y-1">
                    {selectedListing.pros.map((p, idx) => <li key={idx} className="leading-relaxed">{p}</li>)}
                  </ul>
                </div>

                <div className="bg-stone-50 p-3 rounded-lg border border-stone-150">
                  <span className="text-red-500 font-semibold flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>致命避坑伏位對抗 :</span>
                  </span>
                  <ul className="list-decimal list-inside text-stone-600 pl-1 space-y-1">
                    {selectedListing.cons.map((c, idx) => <li key={idx} className="leading-relaxed text-stone-600">{c}</li>)}
                  </ul>
                </div>
              </div>

              {/* B哥實話實說 */}
              <div className="p-4 bg-[#ebd281]/15 rounded-lg border border-[#ebd281]/40">
                <h4 className="text-[#856512] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                  📢 B哥實話實說 (高情商吐槽短評)
                </h4>
                <p className="text-stone-600 font-medium italic leading-relaxed text-[10.5px] mt-1.5 pl-1 border-l-2 border-[#d4af37]">
                  "{selectedListing.summary}"
                </p>
              </div>

              {/* Script Sub-panel in Modal if scripted */}
              {selectedListing.script ? (
                <div className="border border-stone-200 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-[#a5811c] font-semibold text-[11.5px] flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>已配對 AI 工作室分鏡腳本大綱</span>
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedListing(null);
                        onSelectListingForScript(selectedListing.id);
                      }}
                      className="text-stone-900 border border-stone-300 hover:bg-stone-50 px-2 py-0.5 rounded text-[9.5px]"
                    >
                      進棚編輯腳本
                    </button>
                  </div>
                  <div className="space-y-1 text-stone-500 font-mono text-[10px] overflow-y-auto max-h-[150px]">
                    {selectedListing.script.scenes.map((scene, idx) => (
                      <div key={idx} className="p-2 bg-stone-50/50 rounded flex flex-col space-y-0.5">
                        <span className="font-semibold text-stone-800">{idx + 1}. {scene.sceneName} ({scene.durationSec}s)</span>
                        <span className="line-clamp-2">旁白：{scene.narration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-stone-200 rounded-lg p-4 text-center text-stone-400 text-[10.5px] space-y-2 py-6">
                  <span>此物件目前暫時還沒有專利分鏡腳本喔</span>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => {
                        setSelectedListing(null);
                        onSelectListingForScript(selectedListing.id);
                      }}
                      className="bg-stone-900 text-[#ebd281] hover:bg-[#d4af37] hover:text-stone-950 p-1 px-3 rounded text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>現在就讓 B哥 AI 幫你寫腳本</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer actions */}
            <div className="border-t border-stone-100 p-4 bg-stone-50 justify-between flex items-center">
              <span className="text-[10px] font-medium text-stone-400">目前所處進度狀態：{selectedListing.status.toUpperCase()}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedListing(null); }}
                  className="px-4 py-1.5 border border-stone-200 text-stone-500 rounded text-xs hover:bg-stone-100"
                >
                  關閉
                </button>
                <button 
                  onClick={() => {
                    setSelectedListing(null);
                    onSelectListingForScript(selectedListing.id);
                  }}
                  className="px-4 py-1.5 bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-semibold rounded text-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 腳本工作室</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
