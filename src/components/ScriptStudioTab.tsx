import React, { useState, useEffect } from "react";
import { Listing, Script, ScriptScene } from "../types";
import { 
  Sparkles, 
  FileText, 
  Video, 
  Save, 
  Copy, 
  Check, 
  Cpu, 
  Layers, 
  Smile, 
  Trash2,
  RefreshCw,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Flame
} from "lucide-react";

interface ScriptStudioTabProps {
  listings: Listing[];
  selectedListingId: string;
  onSaveScript: (listingId: string, script: Script) => void;
}

export default function ScriptStudioTab({ 
  listings, 
  selectedListingId, 
  onSaveScript 
}: ScriptStudioTabProps) {
  // Selector State
  const [currentListingId, setCurrentListingId] = useState(selectedListingId || "");
  const [style, setStyle] = useState<"comedy" | "luxury" | "investor" | "warning">("comedy");
  const [platform, setPlatform] = useState<"youtube-long" | "tiktok-short" | "red-book">("youtube-long");

  // Loaded/Generated Script State
  const [scenes, setScenes] = useState<ScriptScene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync with selected property listing
  const activeListing = listings.find(l => l.id === currentListingId);

  useEffect(() => {
    if (selectedListingId) {
      setCurrentListingId(selectedListingId);
    }
  }, [selectedListingId]);

  // Load existing script when listing selection changes
  useEffect(() => {
    if (activeListing && activeListing.script) {
      setScenes(activeListing.script.scenes);
      setStyle(activeListing.script.style);
      setPlatform(activeListing.script.platform);
    } else {
      setScenes([]);
    }
  }, [currentListingId, activeListing]);

  // Trigger Gemini API to generate professional script
  const handleGenerateScript = async () => {
    if (!activeListing) return;

    setIsGenerating(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/gemini/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeListing.title,
          location: activeListing.location,
          price: `${activeListing.priceJPY}日圓 (${activeListing.priceHKD}HKD)`,
          layout: activeListing.layout,
          size: `${activeListing.sizeSqm}m² (${activeListing.sizeTsubo}坪)`,
          yieldRate: activeListing.yieldRate,
          pros: activeListing.pros,
          cons: activeListing.cons,
          style: style,
          platform: platform
        })
      });

      if (!response.ok) {
        throw new Error("腳本生成失敗，請稍候重試。已啟動本地高效率腳本引擎幫你應急！");
      }

      const scriptData = await response.json();
      setScenes(scriptData);
    } catch (e) {
      console.warn("Using offline script template as fallback", e);
      // Fallback
      setScenes(getFallbackScript(activeListing.title, style));
    } finally {
      setIsGenerating(false);
    }
  };

  // Scene editing handler
  const handleSceneChange = (index: number, field: keyof ScriptScene, value: any) => {
    setScenes(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === "durationSec" ? Number(value) : value };
      return copy;
    });
  };

  const handleAddScene = () => {
    setScenes(prev => [
      ...prev,
      {
        sceneName: "👉 自定義新分鏡",
        narration: "（在此貼上或寫下客製化的 B 哥口語旁白...）",
        visual: "特寫鏡頭或相機方向建議",
        textOsd: "螢幕字幕 caption",
        durationSec: 10
      }
    ]);
  };

  const handleDeleteScene = (index: number) => {
    setScenes(prev => prev.filter((_, idx) => idx !== index));
  };

  // Convert script to clipboard-friendly text block
  const handleCopyText = () => {
    if (scenes.length === 0) return;

    const textBlock = scenes.map((scene, idx) => {
      return `【分鏡 ${idx + 1}】${scene.sceneName} (${scene.durationSec} 秒)
🎥 畫面視覺：${scene.visual}
🎙️ B哥台詞：${scene.narration}
💬 字幕貼圖：${scene.textOsd}
--------------------------------------------------`;
    }).join("\n\n");

    navigator.clipboard.writeText(textBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save the modified script locally and sync it back to property
  const handleSave = () => {
    if (!currentListingId || scenes.length === 0) return;

    const finalizedScript: Script = {
      style,
      platform,
      scenes,
      lastUpdated: new Date().toISOString()
    };

    onSaveScript(currentListingId, finalizedScript);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Calculations
  const totalDuration = scenes.reduce((sum, s) => sum + s.durationSec, 0);

  // Helper mock generator
  const getFallbackScript = (title: string, selectedStyle: string) => {
    return [
      {
        sceneName: "😂 黃金3秒開頭",
        narration: "哈囉大家，我係B哥！買日本樓最怕做水魚，今日同大家開箱爆款：『" + title + "』。唔使驚，B哥喺大廳！大家吹佢係十全十美，但我偏偏今日就要唱反調，同你真話實說！",
        visual: "B哥面向相機，擺出自嘲或誇張手勢。背景有文字特效：「誠實避坑大開箱」",
        textOsd: "不做水魚！💥 B哥實話實說開箱",
        durationSec: 8
      },
      {
        sceneName: "📍 核心亮點剖析",
        narration: "先說好的！這間房子真的有兩大亮點。首先是地段極優，生活機能無敵，出門就是商店街。租客主力都是東京大阪的高薪白領，幾乎不愁出租，每個月妥妥躺平收租！",
        visual: "快節奏大樓公設展示、精裝小套房全景、附近熱鬧商圈步行鏡頭",
        textOsd: "💎 水岸美景 & 黃金交通地鐵盤",
        durationSec: 15
      },
      {
        sceneName: "⚠️ 致命伏位大踢爆",
        narration: "好喇，B哥時間到了，甜話說完，我哋嚟踢爆致命『伏位』！這朝向採光有些死角，冬季容易有些寒冷。而且管理維修大樓金比一般房屋稍貴，要是你自己來住，一定會嫌空間有點擠！",
        visual: "音效砸落。B哥表情變得凝重或者指向死角、道路噪聲大。紅字「致命伏位！」",
        textOsd: "😱 致命伏位！買之前中介絕不告訴你",
        durationSec: 15
      },
      {
        sceneName: "💸 投資財務比例試算",
        narration: "來，我們算過數。買進價折合港幣很實惠。假設扣掉固定稅、管理託管費，預估淨收益依然在理想水準。相當於每個月都有日本租客用血汗錢幫你供樓！划不划算，聰明人自己懂！",
        visual: "畫面列出精美科技感的帳目表格算式數字浮動",
        textOsd: "📊 算帳時間：資產月供與純利潤試算",
        durationSec: 15
      },
      {
        sceneName: "📢 引導私域行動",
        narration: "想要獲取我們團隊整理的該地區 SUUMO 折價清單，或者想進入我們老鐵專屬的避坑俱樂部？即刻點下方連結或者私信我『套房』，B哥親自一對一發給你！下期見，拜拜！",
        visual: "B哥手指指向下方二維碼，畫面上閃爍點擊按鈕效果",
        textOsd: "👇 私信「套房」免費領取避坑報告",
        durationSec: 8
      }
    ];
  };

  return (
    <div className="space-y-6" id="script-studio-container">
      {/* Configuration Header Panel */}
      <div className="bg-white p-6 rounded-xl border border-[#EFEFEA] shadow-xs space-y-4" id="script-config-panel">
        <div>
          <h1 className="text-xl font-display font-medium text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
            <span>AI 房產自媒體腳本工作室</span>
          </h1>
          <p className="text-stone-500 text-xs mt-0.5">
            選擇任意盤源物件，定制您的影片風格及平台，由 Gemini 全自動為您設計極富 B哥特色 (句句真話、包含吐槽致命伏位) 的影片台詞與拍攝分鏡。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* 1. Property Selector */}
          <div className="md:col-span-2">
            <label className="block text-[11px] text-stone-500 font-semibold mb-1">選擇要配對的物業</label>
            <select 
              value={currentListingId}
              onChange={(e) => setCurrentListingId(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-xs bg-stone-50 font-medium text-stone-800 focus:outline-hidden focus:border-[#d4af37]"
              id="listing-script-select"
            >
              <option value="">-- 請先選擇日本房產盤源 --</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>
                  [{l.location}] - {l.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          {/* 2. Style Selector */}
          <div>
            <label className="block text-[11px] text-stone-500 font-semibold mb-1">自媒體影片定位風格</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-xs bg-stone-50 font-medium text-stone-850 focus:outline-hidden focus:border-[#d4af37]"
              id="style-script-select"
            >
              <option value="comedy">😂 B哥吐槽風 (自嘲搞笑/最吸粉)</option>
              <option value="luxury">✨ 奢華高貴風 (開箱名流豪宅感)</option>
              <option value="investor">📊 理性算帳風 (數據控與純回報試算)</option>
              <option value="warning">🚨 爆料排雷風 (避坑重中之重警告)</option>
            </select>
          </div>

          {/* 3. Platform Selector */}
          <div>
            <label className="block text-[11px] text-stone-500 font-semibold mb-1">目標發佈社群平台</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-xs bg-stone-50 font-medium text-stone-850 focus:outline-hidden focus:border-[#d4af37]"
              id="platform-script-select"
            >
              <option value="youtube-long">📹 YouTube 長片 (有深度、細分析)</option>
              <option value="tiktok-short">📱 短視頻 Reels (黃金3秒、金句橫飛)</option>
              <option value="red-book">📕 小紅書視頻 (小資極簡、侘寂生活風)</option>
            </select>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex justify-between items-center border-t border-stone-100 pt-4">
          <div className="text-xs text-stone-400">
            {activeListing ? (
              <span className="flex items-center gap-1">
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>已錨定：{activeListing.layout} - {(activeListing.priceHKD/10000).toFixed(0)}萬港幣盤源</span>
              </span>
            ) : (
              <span>請先在上方選擇盤源，以注入參數</span>
            )}
          </div>

          <button 
            onClick={handleGenerateScript}
            disabled={!currentListingId || isGenerating}
            className="px-6 py-2 bg-[#d4af37] disabled:bg-stone-100 disabled:text-stone-400 text-stone-950 font-semibold rounded-lg text-xs hover:bg-[#c5a85c] hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            id="btn-trigger-script-generate"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>B哥正在構思爆款金句中...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 fill-current" />
                <span>✨ 智能生成 AI 腳本分鏡</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Script Storyboard workspace */}
      {scenes.length > 0 ? (
        <div className="space-y-4" id="storyboard-workspace">
          {/* Workspace Status and Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 border border-stone-850 p-4 rounded-xl text-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#ebd281] rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#ebd281] font-display">腳本分鏡板 (可編輯)</span>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                    {platform === "youtube-long" ? "YouTube 長影" : platform === "tiktok-short" ? "IG / TikTok 短片" : "小紅書影片"}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5 font-mono">
                  共 {scenes.length} 個場景分鏡 | 估計時長約 {totalDuration} 秒
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                onClick={handleAddScene}
                className="px-3 py-1.5 border border-stone-800 bg-stone-950 text-stone-300 rounded text-xs hover:text-white transition-all inline-flex items-center gap-1"
                title="追加場景"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>追加場景</span>
              </button>
              <button 
                onClick={handleCopyText}
                className="px-3 py-1.5 bg-stone-950 text-[#ebd281] hover:text-white rounded text-xs transition-colors inline-flex items-center gap-1 border border-stone-800"
                id="btn-copy-script"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "已複製到剪貼簿" : "複製文字稿"}</span>
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#d4af37] text-stone-950 font-semibold rounded text-xs hover:bg-[#c5a85c] transition-colors inline-flex items-center gap-1"
                id="btn-save-script-local"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? "保存成功" : "保存至盤源"}</span>
              </button>
            </div>
          </div>

          {/* Staggered Storyboard Cards list */}
          <div className="space-y-4" id="scenes-storyboard-editor">
            {scenes.map((scene, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-[#EFEFEA] p-5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 relative md:pl-10"
                id={`scene-editor-card-${idx}`}
              >
                {/* Index badge counter */}
                <div className="absolute top-5 left-4 md:left-3 bg-stone-100 border border-stone-200 text-stone-800 text-xs w-6 h-6 rounded-full flex items-center justify-center font-display font-medium">
                  {idx + 1}
                </div>

                {/* Left col: Title, Duration edit */}
                <div className="md:col-span-3 space-y-3">
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold block uppercase">分鏡流程段落</span>
                    <input 
                      type="text" 
                      value={scene.sceneName}
                      onChange={(e) => handleSceneChange(idx, "sceneName", e.target.value)}
                      className="w-full border-b border-stone-200 text-stone-850 focus:outline-hidden focus:border-[#d4af37] font-semibold py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold block uppercase">預計拍攝時長 (秒)</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        value={scene.durationSec}
                        onChange={(e) => handleSceneChange(idx, "durationSec", e.target.value)}
                        className="w-16 border-b border-stone-200 text-stone-850 font-mono font-semibold focus:outline-hidden focus:border-[#d4af37] py-0.5 text-xs"
                      />
                      <span className="text-stone-400 text-[10px]">secs</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => handleDeleteScene(idx)}
                      className="text-stone-300 hover:text-red-500 text-[10px] inline-flex items-center gap-1 p-1 hover:bg-stone-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>刪除此分鏡</span>
                    </button>
                  </div>
                </div>

                {/* Mid col: Narrative Script text */}
                <div className="md:col-span-5">
                  <span className="text-[10px] text-[#b5952d] font-semibold flex items-center gap-1 mb-1">
                    <Smile className="w-3.5 h-3.5" />
                    <span>🎙️ B哥口語旁白/台詞內容 (Colloquial Cantonese / Traditional Chinese)</span>
                  </span>
                  <textarea 
                    value={scene.narration}
                    onChange={(e) => handleSceneChange(idx, "narration", e.target.value)}
                    rows={4}
                    className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-850 leading-relaxed font-sans bg-amber-50/20 focus:bg-white focus:outline-hidden focus:border-[#d4af37]"
                    placeholder="台詞旁白..."
                  />
                </div>

                {/* Right col: Visual suggest & OSD captions */}
                <div className="md:col-span-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1 mb-1">
                      <Video className="w-3.5 h-3.5" />
                      <span>🎥 鏡頭畫面/空鏡視覺設計建議</span>
                    </span>
                    <input 
                      type="text" 
                      value={scene.visual}
                      onChange={(e) => handleSceneChange(idx, "visual", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg p-1.5 text-xs text-stone-600 focus:outline-hidden focus:border-[#d4af37] bg-stone-50"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold mb-1 block">💬 螢幕字幕 (OSD) / 爆款貼紙提示</span>
                    <input 
                      type="text" 
                      value={scene.textOsd}
                      onChange={(e) => handleSceneChange(idx, "textOsd", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg p-1.5 text-xs text-stone-600 focus:outline-hidden focus:border-[#d4af37] bg-stone-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick info about next steps */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <Flame className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="text-xs font-semibold text-[#1B4332] block">🎯 今日自媒體進棚指南</span>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  腳本已成功配對盤源！點選「保存至盤源」，大廳看板進度將自動鎖定，您可以直接複製文字前往任意題詞器，或是點選看板直接拖放至拍攝任務！ B哥祝您流量破表！
                </p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              className="text-stone-900 border border-stone-300 font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-emerald-900 hover:text-white hover:border-emerald-950 transition-colors shrink-0"
            >
              一鍵同步看板
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 rounded-xl border border-stone-150 text-center text-stone-400 space-y-4" id="empty-storyboard-editor">
          <FileText className="w-12 h-12 mx-auto text-stone-300" />
          <h2 className="text-sm font-semibold text-stone-850">這裡還沒有生成的 2.0 營銷腳本喔</h2>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            {activeListing 
              ? "物業已準備就緒！請選擇自媒體影片定位風格（如：B哥吐槽風），然後點選右上角的「✨ 智能生成 AI 腳本分鏡」按鈕直接調用 Gemini 獲取量身定制的傳統實用劇本。"
              : "請在上方下拉選單中「選擇盤源物業」以開啟腳本工作室。"}
          </p>
          {activeListing && (
            <button 
              onClick={handleGenerateScript}
              className="px-5 py-2 bg-stone-900 text-[#ebd281] hover:bg-[#d4af37] hover:text-stone-950 font-semibold text-xs rounded-lg transition-all inline-flex items-center gap-2"
              id="empty-studio-btn-generate"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>立即啟動 Gemini 生成腳本</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
