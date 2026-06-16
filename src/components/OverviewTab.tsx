import React, { useState, useEffect } from "react";
import { Listing, ListingStatus } from "../types";
import { getFallbackImage } from "../lib/imageUtils";
import { INITIAL_LISTINGS } from "../data";
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
  ArrowUpRight,
  Database,
  Download,
  Upload,
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  CloudOff,
  CloudLightning,
  Trash2,
  ShieldAlert,
  Check
} from "lucide-react";
import { motion } from "motion/react";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  listBackups, 
  searchBackupFile, 
  createBackupFile, 
  updateBackupFileContent, 
  deleteBackupFile, 
  downloadBackupFile,
  DriveFile
} from "../lib/gdrive";

interface OverviewTabProps {
  listings: Listing[];
  onTabChange: (tab: string) => void;
  onSelectListingForScript: (listingId: string) => void;
  comments: { id: string; text: string; author: string; timestamp: number }[];
  setComments: React.Dispatch<React.SetStateAction<{ id: string; text: string; author: string; timestamp: number }[]>>;
  onRestoreBackup: (importedData: { listings: Listing[]; comments: any[]; exchangeRate?: number }) => void;
}

export default function OverviewTab({ 
  listings, 
  onTabChange, 
  onSelectListingForScript,
  comments,
  setComments,
  onRestoreBackup
}: OverviewTabProps) {
  // Backup / Restore states
  const [backupFileContent, setBackupFileContent] = useState<{ listings: Listing[]; comments: any[]; exchangeRate?: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Google Drive states
  const [gdriveUser, setGdriveUser] = useState<any>(null);
  const [gdriveToken, setGdriveToken] = useState<string | null>(null);
  const [gdriveBackups, setGdriveBackups] = useState<DriveFile[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(() => {
    return localStorage.getItem("bge_gdrive_auto_backup") === "true";
  });
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    return localStorage.getItem("bge_gdrive_last_backup");
  });
  const [gdriveError, setGdriveError] = useState<string | null>(null);
  const [gdriveSuccess, setGdriveSuccess] = useState<string | null>(null);

  // Load and subscribe to Firebase OAuth status
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGdriveUser(user);
        setGdriveToken(token);
        fetchDriveBackups(token);
      },
      () => {
        setGdriveUser(null);
        setGdriveToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchDriveBackups = async (token: string) => {
    setIsDriveLoading(true);
    setGdriveError(null);
    try {
      const list = await listBackups(token);
      setGdriveBackups(list);
    } catch (err: any) {
      setGdriveError(err.message || "載入雲端備份列表失敗。");
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleDriveLogin = async () => {
    setIsDriveLoading(true);
    setGdriveError(null);
    setGdriveSuccess(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGdriveUser(res.user);
        setGdriveToken(res.accessToken);
        setGdriveSuccess("🔓 成功與 Google Drive 建立安全通道！已驗證權限。");
        await fetchDriveBackups(res.accessToken);
        
        // Execute an initial backup on manual join if auto backup is active
        if (autoBackupEnabled) {
          await triggerDriveBackup(res.accessToken, true);
        }
      }
    } catch (err: any) {
      setGdriveError("與 Google Drive 連結失敗，請檢查網頁彈出視窗與網路連線。");
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleDriveLogout = async () => {
    try {
      await logout();
      setGdriveUser(null);
      setGdriveToken(null);
      setGdriveBackups([]);
      setGdriveSuccess("🔒 已中斷 Google Drive 的連結安全通道。");
    } catch (err: any) {
      setGdriveError("登出雲端發生錯誤。");
    }
  };

  const triggerDriveBackup = async (token: string, isSilent = false) => {
    if (!token) return;
    setIsSyncingDrive(true);
    if (!isSilent) {
      setGdriveError(null);
      setGdriveSuccess(null);
    }
    try {
      const backupData = {
        version: "2.0-cloud",
        exportTime: new Date().toISOString(),
        listings: listings,
        comments: comments,
        exchangeRate: parseFloat(localStorage.getItem("bge_exchange_rate") || "0.05")
      };
      
      const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filename = `bge_backup_${dateStr}.json`;
      
      // Update/Create Daily File
      const existingFile = await searchBackupFile(token, filename);
      if (existingFile) {
        await updateBackupFileContent(token, existingFile.id, backupData);
      } else {
        await createBackupFile(token, filename, backupData);
      }
      
      // Update/Create latest file
      const latestFilename = "bge_backup_latest.json";
      const existingLatestFile = await searchBackupFile(token, latestFilename);
      if (existingLatestFile) {
        await updateBackupFileContent(token, existingLatestFile.id, backupData);
      } else {
        await createBackupFile(token, latestFilename, backupData);
      }
      
      const nowTimeStr = new Date().toLocaleString();
      setLastBackupTime(nowTimeStr);
      localStorage.setItem("bge_gdrive_last_backup", nowTimeStr);
      localStorage.setItem("bge_gdrive_last_backup_date", dateStr);
      
      if (!isSilent) {
        setGdriveSuccess(`☁️ 成功備份最新數據至 Google Drive！(已同步至當日檔 [${filename}] 與最新檔 [bge_backup_latest.json])`);
      }
      
      // Refresh listing list
      await fetchDriveBackups(token);
    } catch (err: any) {
      if (!isSilent) {
        setGdriveError(err.message || "上傳雲端備份時發生錯誤。");
      }
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Automatic background daily backup check
  useEffect(() => {
    if (!gdriveToken || !autoBackupEnabled) return;
    
    const checkAndAutoBackup = async () => {
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const lastBackupDate = localStorage.getItem("bge_gdrive_last_backup_date");
      
      if (lastBackupDate !== todayStr) {
        await triggerDriveBackup(gdriveToken, true);
      }
    };
    
    checkAndAutoBackup();
  }, [gdriveToken, autoBackupEnabled, listings, comments]);

  const handleRestoreFromDrive = async (fileId: string, filename: string) => {
    if (!gdriveToken) return;
    const confirmed = window.confirm(`⚠️ 是否確認從雲端備份 [${filename}] 還原數據？\n這將完全覆蓋您目前的研究工作區盤源、留言板及預設匯率！`);
    if (!confirmed) return;
    
    setIsDriveLoading(true);
    setGdriveError(null);
    setGdriveSuccess(null);
    try {
      const content = await downloadBackupFile(gdriveToken, fileId);
      if (content && (content.listings || content.bge_listings_v2)) {
        onRestoreBackup({
          listings: content.listings || content.bge_listings_v2,
          comments: Array.isArray(content.comments || content.bge_comments) ? (content.comments || content.bge_comments) : [],
          exchangeRate: content.exchangeRate || content.bge_exchange_rate
        });
        setGdriveSuccess(`🎉 已成功自 Google Drive 還原備份：${filename}！`);
      } else {
        throw new Error("無效的雲端備份文件格式。");
      }
    } catch (err: any) {
      setGdriveError(err.message || "下載與還原雲端備份失敗。");
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleDeleteFromDrive = async (fileId: string, filename: string) => {
    if (!gdriveToken) return;
    const confirmed = window.confirm(`🗑️ 確定要從 Google Drive 永久刪除備份 [${filename}] 嗎？這個動作將無法復原。`);
    if (!confirmed) return;
    
    setIsDriveLoading(true);
    setGdriveError(null);
    setGdriveSuccess(null);
    try {
      await deleteBackupFile(gdriveToken, fileId);
      setGdriveSuccess(`🗑️ 已成功自雲端刪除備份：${filename}`);
      await fetchDriveBackups(gdriveToken);
    } catch (err: any) {
      setGdriveError(err.message || "雲端刪除失敗。");
    } finally {
      setIsDriveLoading(false);
    }
  };

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
    setComments(prev => prev.filter(c => c.id !== id));
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
            哈囉 B哥！今天準備做哪一個樓盤？
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
                    className={`flex gap-2.5 ${isBGe ? "flex-row" : "flex-row-reverse"}`}
                    id={`comment-item-${comment.id}`}
                  >
                    {/* Circle Initial Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border select-none ${
                      isBGe 
                        ? "bg-[#fdf9ef] text-[#b5952d] border-[#f0e3bc]" 
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}>
                      {isBGe ? "B" : "剪"}
                    </div>

                    <div className="flex-1 max-w-[80%] space-y-1">
                      <div className={`flex items-baseline gap-2 ${isBGe ? "justify-start" : "justify-end"}`}>
                        <span className={`text-[10px] font-bold ${isBGe ? "text-[#b5952d]" : "text-stone-500"}`}>
                          {comment.author}
                        </span>
                        <span className="text-[9px] text-stone-400">
                          {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`relative px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2 group ${
                        isBGe 
                          ? "bg-[#fdf9ef] border border-[#f0e3bc] text-stone-800 rounded-tl-none text-left" 
                          : "bg-stone-50 border border-stone-200 text-stone-700 rounded-tr-none text-right"
                      }`}>
                        <p className="text-xs leading-relaxed font-medium">{comment.text}</p>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all p-1 shrink-0 ml-1 rounded-full hover:bg-stone-100 cursor-pointer"
                          title="刪除"
                        >
                          ✕
                        </button>
                      </div>
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
              <p className="text-stone-400 text-xs text-center py-8">私房筍盤為空，請立馬導入新物件！</p>
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

      {/* Dynamic Security & Backup Control Center Panel */}
      <div className="bg-white p-6 rounded-xl border border-[#EFEFEA] shadow-xs space-y-6 animate-fadeIn" id="overview-maintenance-section">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h2 className="text-base font-display font-semibold text-stone-850">數據備份與安全維護中心</h2>
              <p className="text-[10px] text-stone-400 font-medium font-sans">B哥工作站數據雙重保險：支援 Google Drive 每日雲端自動備份與本地資料匯出</p>
            </div>
          </div>
          <span className="text-[10px] bg-stone-100 text-stone-500 font-mono px-2 py-0.5 rounded-full">v2.1 Cloud Sync</span>
        </div>

        {/* Global Alert Messages */}
        {(successMsg || gdriveSuccess) && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg || gdriveSuccess}</span>
          </div>
        )}

        {(importError || gdriveError) && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{importError || gdriveError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section 1: Google Drive Automated Backup (Spans 7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4 pb-6 lg:pb-0 lg:border-r border-stone-100 lg:pr-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>Google Drive 智能備份系統</span>
                </h3>
                {gdriveUser ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    已安全連線
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-450 bg-stone-100 px-2.5 py-0.5 rounded-full font-sans font-medium">未啟用雲端</span>
                )}
              </div>

              {/* Connection Status Box */}
              {!gdriveUser ? (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 space-y-3">
                  <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                    啟用 Google Drive 備份後，系統會在您每次啟動或更新資料時，<strong>自動在背景比對並上傳最新數據</strong>，確保您的房產尋盤、文案腳本及對話紀錄安全不遺失。
                  </p>
                  
                  <button
                    onClick={handleDriveLogin}
                    disabled={isDriveLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-all shadow-xs cursor-pointer text-xs font-semibold text-stone-700 font-sans"
                    id="gdrive-connect-btn"
                  >
                    {isDriveLoading ? (
                      <RefreshCw className="w-4 h-4 text-stone-400 animate-spin" />
                    ) : (
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0 font-sans block" style={{ display: "block" }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                    )}
                    <span>{isDriveLoading ? "正在啟動安全模組..." : "登入並連結 Google Drive 雲端碟"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Account detail card */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-150 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {gdriveUser.photoURL ? (
                        <img src={gdriveUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-stone-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase font-sans">
                          {gdriveUser.displayName?.charAt(0) || "G"}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-stone-800 leading-tight font-sans">{gdriveUser.displayName || "Google 雲端帳戶"}</div>
                        <div className="text-[9px] text-stone-400 font-mono leading-tight">{gdriveUser.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleDriveLogout}
                      className="text-[10px] text-stone-500 hover:text-red-600 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-sans font-medium"
                    >
                      中斷連線
                    </button>
                  </div>

                  {/* Settings toggles */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-150 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 cursor-pointer font-sans">
                          <span>每日自動備份 (在背景靜默更新)</span>
                        </label>
                        <p className="text-[9px] text-stone-400 leading-normal font-sans">每次打開工作站，將會在背景全自動對比校驗最新檔與日誌檔</p>
                      </div>
                      <button
                        onClick={() => {
                          const nextVal = !autoBackupEnabled;
                          setAutoBackupEnabled(nextVal);
                          localStorage.setItem("bge_gdrive_auto_backup", nextVal ? "true" : "false");
                          if (nextVal) {
                            setGdriveSuccess("💡 已開啟每日雲端自動備份。");
                          } else {
                            setGdriveSuccess("💡 已關閉自動備份，如欲同步請點擊「立即手動雲端備份」。");
                          }
                        }}
                        className={`w-10 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${autoBackupEnabled ? "bg-emerald-500 justify-end" : "bg-stone-300 justify-start"}`}
                        id="toggle-auto-backup"
                      >
                        <span className="w-5.5 h-5.5 bg-white rounded-full shadow-md transition-all inline-block" />
                      </button>
                    </div>

                    <div className="pt-2.5 border-t border-stone-150 flex flex-wrap gap-2 items-center justify-between text-[10px] text-stone-550 font-mono">
                      <span>上次備份時間：<strong className="text-stone-700">{lastBackupTime || "無備份記錄"}</strong></span>
                      <button
                        onClick={() => triggerDriveBackup(gdriveToken!)}
                        disabled={isSyncingDrive}
                        className="py-1.5 px-3 bg-stone-900 hover:bg-blue-600 text-white hover:text-white font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs text-[10px] font-sans"
                        id="manual-drive-backup-btn"
                      >
                        {isSyncingDrive ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <CloudLightning className="w-3 h-3" />
                        )}
                        <span>{isSyncingDrive ? "正在加密上傳..." : "立即手動雲端備份"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Cloud backups list */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                      雲端備份歷史紀錄 (Google Drive 磁碟存檔)
                    </h4>
                    
                    {isDriveLoading ? (
                      <div className="text-center py-4 text-stone-450 text-xs flex items-center justify-center gap-1.5 font-sans">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                        <span>正在讀取 Google Drive 特有應用程序目錄...</span>
                      </div>
                    ) : gdriveBackups.length === 0 ? (
                      <div className="p-3 text-center text-[10px] text-stone-400 bg-stone-50 rounded-xl border border-stone-150 border-dashed font-sans">
                        目前在雲端尚未建立任何 `.json` 備份，點以上按鈕建立首筆數據存檔吧 ☁️
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                        {gdriveBackups.map((file) => (
                          <div key={file.id} className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-150 rounded-lg flex items-center justify-between text-xs transition-colors font-mono">
                            <div className="space-y-0.5">
                              <div className="text-[11px] font-bold text-stone-700 truncate max-w-xs">{file.name}</div>
                              <div className="text-[9px] text-stone-400">
                                時間：{file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : "未知"}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleRestoreFromDrive(file.id, file.name)}
                                className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-600 border border-stone-200 hover:border-emerald-250 rounded text-[9px] font-bold transition-all cursor-pointer font-sans"
                              >
                                還原
                              </button>
                              <button
                                onClick={() => handleDeleteFromDrive(file.id, file.name)}
                                className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded transition-all cursor-pointer border border-transparent hover:border-red-100"
                                title="刪除備份"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Local File Backup & Hard Reset (Spans 5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Download/Upload Module */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-[#b5952d]" />
                <span>本地硬碟備份檔管理</span>
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                您可以將數據下載保存在客製化 JSON 檔案中，之後能直接自此檔案手動覆蓋回工作站中。
              </p>
              
              <div className="flex flex-col gap-2">
                {/* Download Backup Button */}
                <button
                  onClick={() => {
                    setSuccessMsg(null);
                    setImportError(null);
                    const backupData = {
                      version: "2.0",
                      exportTime: new Date().toISOString(),
                      listings: listings,
                      comments: comments,
                      exchangeRate: parseFloat(localStorage.getItem("bge_exchange_rate") || "0.05")
                    };
                    
                    try {
                      const jsonStr = JSON.stringify(backupData, null, 2);
                      const blob = new Blob([jsonStr], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", url);
                      downloadAnchor.setAttribute("download", `bge_listings_backup_${new Date().toISOString().slice(0, 10)}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      URL.revokeObjectURL(url);
                      setSuccessMsg("🎉 成功導出備份 JSON 檔案！");
                    } catch (e) {
                      setImportError("資料導出失敗。");
                    }
                  }}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer font-sans"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>馬上下載 JSON 備份檔</span>
                </button>

                {/* Import local file container */}
                <div className="border border-dashed border-stone-200 p-2.5 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 block font-sans">導入備份檔案以還原數據：</span>
                  <input
                    type="file"
                    id="backup-file-input"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setImportError(null);
                      setSuccessMsg(null);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const text = event.target?.result as string;
                          const parsed = JSON.parse(text);
                          
                          if (!parsed || typeof parsed !== 'object') {
                            throw new Error('無效的 JSON 結構。');
                          }
                          
                          const lists = parsed.listings || parsed.bge_listings_v2;
                          const comms = parsed.comments || parsed.bge_comments;
                          const rate = parsed.exchangeRate || parsed.bge_exchange_rate;
                          
                          if (!lists || !Array.isArray(lists)) {
                            throw new Error('未在檔案中找到合法的房產/盤源列表 (listings)。');
                          }
                          
                          setBackupFileContent({
                            listings: lists,
                            comments: Array.isArray(comms) ? comms : [],
                            exchangeRate: typeof rate === 'number' ? rate : undefined
                          });
                        } catch (err: any) {
                          setImportError(err.message || '無法解析備份檔案，請確保檔案格式正確。');
                          setBackupFileContent(null);
                        }
                      };
                      reader.readAsText(file);
                    }}
                    className="w-full text-[10px] file:mr-2 file:py-1.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer text-stone-500 font-mono"
                  />

                  {backupFileContent && (
                    <div className="bg-amber-50 p-2 rounded border border-amber-200 text-[10px] space-y-1.5 animate-fadeIn">
                      <div className="font-bold text-amber-800 flex items-center gap-1 font-sans">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>偵測到合法的本地備份檔案</span>
                      </div>
                      <div className="font-mono text-amber-700">
                        • 盤源：{backupFileContent.listings.length} 筆 / • 留言：{backupFileContent.comments.length} 條
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => {
                            if (!backupFileContent) return;
                            onRestoreBackup(backupFileContent);
                            setSuccessMsg('✨ 客製化工作環境已成功從本地備份包還原！');
                            setBackupFileContent(null);
                            const fileInput = document.getElementById('backup-file-input') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="flex-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[9px] cursor-pointer transition-colors font-sans"
                        >
                          確認還原
                        </button>
                        <button 
                          onClick={() => setBackupFileContent(null)}
                          className="py-1 px-1.5 bg-stone-200 text-stone-700 font-semibold rounded text-[9px] cursor-pointer hover:bg-stone-300 transition-colors font-sans"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Factory Red Reset Module */}
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <h3 className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-red-500" />
                <span>初始化面板狀態</span>
              </h3>
              
              {isResetConfirmOpen ? (
                <div className="bg-red-50 p-3 border border-red-200 rounded-lg text-[10px] text-red-700 space-y-2 animate-fadeIn">
                  <p className="font-semibold leading-relaxed font-sans">⚠️ 確定清除嗎？這將永久刪除您所有自訂的物件與批註留言，回復至出廠預設示範數據。</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onRestoreBackup({
                          listings: INITIAL_LISTINGS,
                          comments: [
                            { id: "msg-1", text: "昨天的大阪民宿盤腳本已經寫好，請你今晚開始剪，另外開頭記得幫我加個爆款音樂。", author: "B哥", timestamp: Date.now() - 86400000 },
                            { id: "msg-2", text: "收到！我會配上比較輕快的 Lofi 節奏。背景影片素材我會用那套現成的模板嗎？", author: "剪片師", timestamp: Date.now() - 82400000 },
                            { id: "msg-3", text: "對，就用上禮拜那套京都風格的片頭，片尾加上我們的微信 QR code。", author: "B哥", timestamp: Date.now() - 40000000 }
                          ],
                          exchangeRate: 0.05
                        });
                        setSuccessMsg('✨ 已成功恢復出廠預設示範狀態！');
                        setIsResetConfirmOpen(false);
                      }}
                      className="flex-1 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded cursor-pointer text-[9px] transition-colors font-sans"
                    >
                      是的，確定清除並恢復
                    </button>
                    <button
                      onClick={() => setIsResetConfirmOpen(false)}
                      className="py-1.5 px-2 bg-stone-200 text-stone-700 font-semibold rounded cursor-pointer text-[9px] hover:bg-stone-300 transition-colors font-sans"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="w-full py-2 px-3 border border-red-200 hover:bg-red-50 text-red-600 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>恢復出廠預設狀態</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
