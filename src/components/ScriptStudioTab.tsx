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
  Flame,
  Lightbulb,
  BookOpen,
  Hash,
  HelpCircle,
  Printer
} from "lucide-react";

export interface TriviaItem {
  id: string;
  category: "real-estate" | "media" | "tax-danger";
  title: string;
  shortDesc: string;
  detail: string;
  bBroComment: string;
  hotHashtags: string[];
}

const TRIVIA_DATA: TriviaItem[] = [
  {
    id: "re-1",
    category: "real-estate",
    title: "🏠 陽台露台其實係「免費贈送」？",
    shortDesc: "日本房產登記面積唔計陽台！",
    detail: "在日本，買樓登記嘅「專有面積」只計算室內牆壁內側面積（內法）。所有露台、露天平台或陽台，在法律上均歸類為大樓的「共用部分」，但是會與該套房配對擁有「專用使用權」！所以你交嘅稅不包含露台面積，露台基本等同免費贈送！",
    bBroComment: "B哥溫馨提示：唔好以為露台係你就可以隨便改建，日本露台係法定的「防災避難通道」，堆滿雜物被投訴就搞笑喇！",
    hotHashtags: ["日本露台", "專有面積", "日本買樓常識"]
  },
  {
    id: "re-2",
    category: "real-estate",
    title: "🧱 舊耐震 vs 新耐震大分水嶺",
    shortDesc: "1981年6月1日決定大樓身價！",
    detail: "1981年（昭和56年）6月1日日本政府實施了極為嚴苛的「新耐震設計基準」。這一天之後通過審批的建築，可保證在震度6強至7級強震中不倒塌。而在此之前的舊耐震建築，銀行多數不願意批出貸款，未來轉手極度艱難！",
    bBroComment: "B哥精明眼：有啲無良中介用平價誘惑你，望下建築年份，1980年嘅平樓分分鐘係舊耐震，未來想轉手或者搵租客分分鐘砸喺自己手度！",
    hotHashtags: ["新耐震基準", "舊耐震", "日本地震安全", "避坑指南"]
  },
  {
    id: "re-3",
    category: "real-estate",
    title: "💀 「事故物件」的真實申報考驗",
    shortDesc: "第二任租客就唔使交代？",
    detail: "日本法律規定，房屋內發生過非自然死亡案件（如自殺、兇殺）必須在合約中主動標註。但業界有個半公開的潛規則：通常此告知義務只針對「事發後的首位租客/買家」，等到第二個租客入住或時間過去多年，告知義務的標準就會大幅模糊鬆綁！",
    bBroComment: "B哥老實說：買樓最好查大島てる（日本事故地圖網），否則信晒中介，中咗招都唔知！",
    hotHashtags: ["事故物件", "大島てる", "日本租務地雷"]
  },
  {
    id: "media-1",
    category: "media",
    title: "⚡ 影片爆點：黃金3秒極速勾魂",
    shortDesc: "開場越刺耳，流量越高！",
    detail: "做自媒體短視頻，前3s如果唔能夠抓住觀眾，就注定失敗。一開口就要拋出極致衝突或反差。例如「買東京套房月收5厘息？我今日就來同你算算，扣完稅費你分分鐘要倒貼！」",
    bBroComment: "B哥金句：唔好一嚟就『大家好，今日介紹...』，咁樣大把人直接滑走啦！一開口就要痛點直擊，觀眾先會坐定定睇完！",
    hotHashtags: ["自媒體行銷", "黃金3秒", "流量密碼"]
  },
  {
    id: "media-2",
    category: "media",
    title: "📣 缺點先揭露建立百萬信任",
    shortDesc: "老實講缺點，反而更成交！",
    detail: "傳統銷售只講優點，新時代自媒體觀眾最厭惡這種套路。在腳本的開場或中段，主動揭發房子的不完美（如修繕基金太貴、鄰近鐵路嘈雜等），不但不會趕走意向買家，反而會建立無可替代的專業與誠實人設，大幅提高私域諮詢轉化率！",
    bBroComment: "B哥肺腑之言：誠實先係最強嘅營銷。你幫粉絲排雷，粉絲先敢安心將血汗錢交畀你搵樓！",
    hotHashtags: ["誠實營銷", "房產自媒體", "避坑人設"]
  },
  {
    id: "media-3",
    category: "media",
    title: "🎯 結尾私域池「勾引」機制",
    shortDesc: "千祈唔好只係講「拜拜」！",
    detail: "影片最後一定要設置高誘惑力的「Call to Action」引流。用一份「不公開的SUUMO折價精選表」或「東京高純回報避坑報告」作為鉤子。引導觀眾在評論區扣某個關鍵字，或直接私信B哥，將粉絲沉澱至你的私域微信或WhatsApp群！",
    bBroComment: "B哥出招：我地做影片唔係為咗做KOL，而係要精準獲客！後段小禮物送得大方，回報一定正！",
    hotHashtags: ["私域引流", "獲客轉化", "自媒體變現"]
  },
  {
    id: "tax-1",
    category: "tax-danger",
    title: "💸 漲不完的「修繕積立金」",
    shortDesc: "新大樓第一年便宜的誘餌！",
    detail: "好多海外買家買日本樓，只睇目前回報率。見到每個月管理費、修繕金好平就即刻入手。但日本落成 5-10 年後，修繕金大多會翻幾倍！因為大樓一般有「三十年大修繕計劃」，如果修繕金不夠用，隨時還會要求業主一次性集資幾十萬日圓，回報率直接縮水！",
    bBroComment: "B哥排雷：買二手大樓，記住要問中介要一份單詞叫「重要事項說明書」同「修繕積立金總額」，睇下大樓儲蓄夠唔夠錢，唔好做接盤俠！",
    hotHashtags: ["修繕積立金", "隱形持有成本", "日本買樓避坑"]
  },
  {
    id: "tax-2",
    category: "tax-danger",
    title: "❌ 便宜得可怕的「再建築不可」",
    shortDesc: "買咗等同買整張廢紙？",
    detail: "在 SUUMO 上，有時會見到有些獨立屋（一戶建）便宜到難以置信。這類極大概率屬於「再建築不可」物業。根據日本建築基準法，如果地塊前方的道路寬度低於2米，或者與道路接壤長度不足2米，這棟屋一旦拆除或燒毀，法律禁止重新建造任何建築物！",
    bBroComment: "B哥警告：呢類物業銀行完全唔批貸款，只能全款。就算有租金回報，未來根本無地產商或者買家肯接手，真正做到傳子傳孫一世砸手！",
    hotHashtags: ["再建築不可", "日本一戶建地雷", "法律規定避坑"]
  }
];

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
  const [platform, setPlatform] = useState<"youtube-long" | "youtube-shorts" | "instagram-reels">("youtube-long");

  // Loaded/Generated Script State
  const [scenes, setScenes] = useState<ScriptScene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trivia states
  const [activeTriviaCategory, setActiveTriviaCategory] = useState<"real-estate" | "media" | "tax-danger">("real-estate");
  const [expandedTriviaId, setExpandedTriviaId] = useState<string | null>("re-1");
  const [hashCopiedMap, setHashCopiedMap] = useState<{[key: string]: boolean}>({});
  const [featuredTrivia, setFeaturedTrivia] = useState<TriviaItem | null>(null);

  // Pick random featured trivia on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TRIVIA_DATA.length);
    setFeaturedTrivia(TRIVIA_DATA[randomIndex]);
  }, []);

  const handleRollFeatured = () => {
    let nextIndex = Math.floor(Math.random() * TRIVIA_DATA.length);
    if (featuredTrivia && TRIVIA_DATA[nextIndex].id === featuredTrivia.id) {
      nextIndex = (nextIndex + 1) % TRIVIA_DATA.length;
    }
    setFeaturedTrivia(TRIVIA_DATA[nextIndex]);
  };

  const handleCopyTags = (triviaId: string, tags: string[]) => {
    const textToCopy = tags.map(tag => `#${tag}`).join(" ");
    navigator.clipboard.writeText(textToCopy);
    setHashCopiedMap(prev => ({ ...prev, [triviaId]: true }));
    setTimeout(() => {
      setHashCopiedMap(prev => ({ ...prev, [triviaId]: false }));
    }, 1500);
  };

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

  // Compile and export script into a formatted PDF via high-fidelity print template
  const handleExportPDF = () => {
    if (!activeListing || scenes.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("請允許網屬彈出視窗，以開啟大字體專用錄影提詞 PDF 生成頁面！");
      return;
    }

    const styleLabels = {
      comedy: "😂 B哥吐槽風 (自嘲搞笑/最吸粉)",
      luxury: "✨ 奢華高貴風 (開箱名流豪宅感)",
      investor: "📊 理性算帳風 (數據控與純回報)",
      warning: "🚨 爆料排雷風 (避坑重中之重警告)"
    };
    const compiledStyleName = styleLabels[style] || style;

    const platformLabels = {
      "youtube-long": "📹 YouTube 長影 (有深度分析)",
      "youtube-shorts": "⚡ YouTube Shorts (強烈吸睛/直式短片)",
      "instagram-reels": "📱 Instagram Reels (黃金3秒/金句橫飛)"
    };
    const compiledPlatformName = platformLabels[platform] || platform;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>【B哥自媒體】${activeListing.title} - 錄影專用提詞腳本</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+TC:wght@400;500;700;900&display=swap');
          
          body {
            font-family: 'Noto Sans TC', 'Inter', sans-serif;
            color: #0f172a;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.6;
          }

          /* General layout wrapper container */
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }

          /* Print optimizations */
          @media print {
            body {
              background-color: #ffffff;
              padding: 0;
            }
            .container {
              max-width: 100%;
              padding: 0;
              box-shadow: none;
              border: none;
            }
            .no-print {
              display: none !important;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
            }
          }

          /* Modern Control Toolbar */
          .toolbar {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            padding: 20px 28px;
            border-radius: 12px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 15px rgba(15, 23, 42, 0.15);
          }
          .toolbar-title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .toolbar h2 {
            margin: 0;
            font-size: 17px;
            font-weight: 700;
            color: #38bdf8;
          }
          .toolbar p {
            margin: 4px 0 0 0;
            font-size: 11px;
            color: #94a3b8;
          }
          .toolbar .btn {
            background-color: #06b6d4;
            color: #ffffff;
            border: none;
            padding: 12px 22px;
            font-size: 13.5px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(6, 182, 212, 0.25);
          }
          .toolbar .btn:hover {
            background-color: #0891b2;
            transform: translateY(-1px);
          }

          /* Script Header block */
          .script-header {
            border-bottom: 3px double #e2e8f0;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .script-header h1 {
            font-size: 26px;
            font-weight: 900;
            margin-top: 0;
            margin-bottom: 14px;
            color: #0f172a;
          }
          .meta-grid {
            display: grid;
            grid-template-cols: repeat(2, 1fr);
            gap: 16px;
            font-size: 13px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
            background: #f8fafc;
            padding: 10px 14px;
            border-radius: 6px;
            border-left: 3px solid #06b6d4;
          }
          .meta-label {
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .meta-value {
            color: #0f172a;
            font-weight: 600;
          }

          /* B哥避坑亮點 */
          .highlights-box {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            padding: 18px;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          .highlights-title {
            color: #b45309;
            font-weight: 800;
            font-size: 14px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          /* Statistical row */
          .scenes-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f1f5f9;
            padding: 14px 20px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 30px;
          }

          /* Custom Script Teleprompter Table */
          .script-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .script-table th {
            background-color: #0f172a;
            color: #ffffff;
            text-align: left;
            padding: 14px 16px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .script-table td {
            padding: 20px 16px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
          }
          
          /* Column layout sizing */
          .col-scene { width: 18%; }
          .col-narration { width: 44%; }
          .col-visual { width: 20%; }
          .col-osd { width: 18%; }

          .scene-badge {
            background-color: #0f172a;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10.5px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 6px;
            font-family: monospace;
          }
          .scene-name {
            font-size: 13.5px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.4;
          }
          .scene-duration {
            font-size: 11px;
            color: #64748b;
            margin-top: 6px;
            font-weight: 600;
          }

          /* Narration script field - designed for easy reading at distance */
          .narration-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 14px 18px;
            border-radius: 6px;
            font-size: 16px; /* Teleprompter size scaling */
            font-weight: 500;
            color: #1e293b;
            white-space: pre-wrap;
            line-height: 1.7;
          }
          .narration-label {
            font-size: 11px;
            color: #d97706;
            font-weight: 800;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Visual Empty Cue */
          .visual-box {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 12px 14px;
            border-radius: 6px;
            font-size: 13px;
            color: #166534;
            line-height: 1.5;
          }
          .visual-box strong {
            color: #15803d;
            font-size: 11px;
            text-transform: uppercase;
            display: block;
            margin-bottom: 4px;
          }

          /* On Screen Captions Box */
          .osd-box {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 12px 14px;
            border-radius: 6px;
            font-size: 12.5px;
            font-weight: 600;
            color: #1e40af;
            line-height: 1.5;
          }
          .osd-box strong {
            color: #1d4ed8;
            font-size: 11px;
            text-transform: uppercase;
            display: block;
            margin-bottom: 4px;
          }

          /* Footer Copyright layout */
          .script-footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #94a3b8;
            font-size: 11.5px;
            font-weight: 500;
          }
          .brand {
            font-weight: 800;
            color: #0f172a;
          }
          .brand span {
            color: #06b6d4;
          }
        </style>
      </head>
      <body>
        <!-- Printable controls (disappears on output PDF) -->
        <div class="container no-print" style="margin-bottom: 24px; padding: 0; box-shadow: none; border: none; background: transparent;">
          <div class="toolbar">
            <div class="toolbar-title">
              <svg style="width: 28px; height: 28px; color: #38bdf8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div>
                <h2>B哥實話實說自媒體 ── 錄影大字體提詞腳本</h2>
                <p>已根據您選擇的「${compiledStyleName}」特調風格完成渲染，支援高解析度向量 PDF 列印成冊！</p>
              </div>
            </div>
            <button class="btn" onclick="window.print()">
              <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>匯出 PDF / 一鍵列印</span>
            </button>
          </div>
        </div>

        <!-- Master Sheet container -->
        <div class="container">
          <div class="script-header">
            <h1>📝 影片錄製專用 ── 自媒體腳本提詞稿</h1>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">關聯日本盤源</span>
                <span class="meta-value">${activeListing.location} ── JPY ${activeListing.priceJPY.toLocaleString()} | HKD ${(activeListing.priceHKD/10000).toFixed(0)}萬 (${activeListing.layout})</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">目標平台平台</span>
                <span class="meta-value">${compiledPlatformName}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">影片定位風格</span>
                <span class="meta-value">${compiledStyleName}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">生成更新時間</span>
                <span class="meta-value">${new Date().toLocaleString('zh-HK', { timeZoneName: 'short' })}</span>
              </div>
            </div>
          </div>

          <!-- Highlight list -->
          <div class="highlights-box">
            <div class="highlights-title">
              <svg style="width: 16px; height: 16px; color: #b45309;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                <line x1="12" y1="22" x2="12" y2="12"></line>
                <line x1="12" y1="12" x2="22" y2="8.5"></line>
                <line x1="12" y1="12" x2="2" y2="8.5"></line>
              </svg>
              <span>錄影重點摘要：盤源優勢與吐槽（致命伏位）避坑指南</span>
            </div>
            <div style="font-size: 13px; color: #78350f; line-height: 1.6; padding-left: 6px;">
              <div style="margin-bottom: 6px;">🟢 <strong>B哥力推亮點：</strong>${activeListing.pros && activeListing.pros.length > 0 ? activeListing.pros.join(' | ') : "依地段、機能卓越優勢"}</div>
              <div>🔴 <strong>B哥防雷吐槽（致命伏位）：</strong>${activeListing.cons && activeListing.cons.length > 0 ? activeListing.cons.join(' | ') : "無明顯地段硬傷"}</div>
            </div>
          </div>

          <!-- Quick counts -->
          <div class="scenes-summary">
            <span>📊 分鏡場景總計：${scenes.length} 個 Scenes</span>
            <span>⏱️ 估算發聲總時長：約 ${totalDuration} 秒</span>
          </div>

          <!-- Complete Teleprompter Table -->
          <table class="script-table">
            <thead>
              <tr>
                <th class="col-scene">場次與時間</th>
                <th class="col-narration">🎙️ B哥口語旁白/核心台詞</th>
                <th class="col-visual">🎥 分鏡空鏡鏡頭動作</th>
                <th class="col-osd">💬 貼圖與螢幕字幕 (OSD)</th>
              </tr>
            </thead>
            <tbody>
              ${scenes.map((scene, idx) => `
                <tr>
                  <td class="col-scene">
                    <span class="scene-badge">SCENE ${idx + 1}</span>
                    <div class="scene-name">${scene.sceneName}</div>
                    <div class="scene-duration">⏱️ ${scene.durationSec} 秒</div>
                  </td>
                  <td class="col-narration">
                    <div class="narration-box">
                      <div class="narration-label">B哥旁白台詞：</div>
                      ${scene.narration}
                    </div>
                  </td>
                  <td class="col-visual">
                    <div class="visual-box">
                      <strong>CAMERA / B-ROLL</strong>
                      ${scene.visual}
                    </div>
                  </td>
                  <td class="col-osd">
                    <div class="osd-box">
                      <strong>SUBTITLE / GFX</strong>
                      ${scene.textOsd}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Watermark -->
          <div class="script-footer">
            <div class="brand">
              B哥 <span>日本房產避坑指南 2.0</span> ── 智慧自媒體工作環境
            </div>
            <div>錄製現場提詞專用 ─ 智慧列印系統</div>
          </div>
        </div>

        <script>
          // Instantly trigger printing layout compilation for maximum frictionless save-to-pdf UX
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.print();
            }, 600);
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="script-studio-container">
      {/* Left Column: AI Scripting Controls & Workspace Storyboard */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-6">
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
                <option value="youtube-shorts">⚡ YouTube Shorts (強烈吸睛、直式短片)</option>
                <option value="instagram-reels">📱 Instagram Reels (黃金3秒、金句橫飛)</option>
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
                      {platform === "youtube-long" ? "YouTube 長影" : platform === "youtube-shorts" ? "YouTube Shorts" : "Instagram Reels"}
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
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 bg-stone-950 text-cyan-400 hover:text-white rounded text-xs transition-colors inline-flex items-center gap-1 border border-stone-800"
                  id="btn-export-pdf"
                  title="匯出高對比、大字體錄影用 PDF/列印稿"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>匯出 PDF 提詞稿</span>
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

      {/* Right Column: AI Scripting & Real Estate Trivia Corner */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-6" id="script-trivia-sidebar">
        {/* Featured Trivia Spotlight Widget */}
        {featuredTrivia && (
          <div className="bg-stone-950 p-5 rounded-xl border border-stone-800 text-stone-100 space-y-4 shadow-sm animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 bg-amber-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#ebd281] text-xs font-bold font-display">
                <Lightbulb className="w-4 h-4 text-[#ebd281] animate-pulse" />
                <span>B哥每日營銷神預言</span>
              </div>
              <button 
                onClick={handleRollFeatured}
                className="text-[10px] text-stone-300 hover:text-[#ebd281] bg-stone-900 hover:bg-stone-850 px-2 py-0.5 rounded-md transition-all cursor-pointer border border-stone-800 inline-flex items-center gap-1 font-sans"
                title="換一個秘笈"
                id="btn-roll-featured-trivia"
              >
                <span>🎲 換一條</span>
              </button>
            </div>

            <div className="space-y-2 relative z-10">
              <h4 className="text-xs font-bold text-white line-clamp-1">{featuredTrivia.title}</h4>
              <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-900/50 p-3 rounded-lg border border-stone-850">
                {featuredTrivia.detail.slice(0, 80)}...
              </p>
            </div>

            <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 p-3 rounded-lg text-[11px] text-[#ebd281]/95">
              <span className="font-bold block mb-1">💬 B哥私房話：</span>
              <p className="italic leading-normal select-none">「{featuredTrivia.bBroComment}」</p>
            </div>
          </div>
        )}

        {/* Categories Tabs & Main Trivia Directory */}
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs space-y-4">
          <div className="flex items-center gap-1.5 border-b border-stone-100 pb-3">
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            <div>
              <h3 className="text-xs font-bold text-stone-800">日本搵樓 & 自媒體避坑笈</h3>
              <p className="text-[9px] text-stone-400">專用登記面積冷常識與吸粉宣傳技巧</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-50 rounded-lg text-[9px] font-semibold border border-stone-150">
            <button
              onClick={() => {
                setActiveTriviaCategory("real-estate");
                const firstId = TRIVIA_DATA.find(t => t.category === "real-estate")?.id || null;
                setExpandedTriviaId(firstId);
              }}
              className={`py-1.5 rounded-md text-center transition-all cursor-pointer ${activeTriviaCategory === "real-estate" ? "bg-white text-[#b5952d] shadow-2xs font-bold border border-stone-150" : "text-stone-500 hover:text-stone-850"}`}
            >
              🏠 房產冷知識
            </button>
            <button
              onClick={() => {
                setActiveTriviaCategory("media");
                const firstId = TRIVIA_DATA.find(t => t.category === "media")?.id || null;
                setExpandedTriviaId(firstId);
              }}
              className={`py-1.5 rounded-md text-center transition-all cursor-pointer ${activeTriviaCategory === "media" ? "bg-white text-[#b5952d] shadow-2xs font-bold border border-stone-150" : "text-stone-500 hover:text-stone-850"}`}
            >
              ⚡ 爆款自媒體
            </button>
            <button
              onClick={() => {
                setActiveTriviaCategory("tax-danger");
                const firstId = TRIVIA_DATA.find(t => t.category === "tax-danger")?.id || null;
                setExpandedTriviaId(firstId);
              }}
              className={`py-1.5 rounded-md text-center transition-all cursor-pointer ${activeTriviaCategory === "tax-danger" ? "bg-white text-[#b5952d] shadow-2xs font-bold border border-stone-150" : "text-stone-500 hover:text-stone-850"}`}
            >
              💸 避坑防爆雷
            </button>
          </div>

          {/* List matching the category */}
          <div className="space-y-2">
            {TRIVIA_DATA.filter(t => t.category === activeTriviaCategory).map((trivia) => {
              const isExpanded = expandedTriviaId === trivia.id;
              return (
                <div 
                  key={trivia.id}
                  className={`border rounded-lg transition-all overflow-hidden ${isExpanded ? "border-[#d4af37] bg-amber-50/5" : "border-stone-150 hover:border-stone-250 bg-white"}`}
                >
                  {/* Click header to expand */}
                  <button
                    onClick={() => setExpandedTriviaId(isExpanded ? null : trivia.id)}
                    className="w-full text-left p-3 flex items-center justify-between gap-2 cursor-pointer focus:outline-hidden"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-stone-800 block leading-tight">{trivia.title}</span>
                      <span className="text-[9px] text-[#b5952d] font-semibold block">{trivia.shortDesc}</span>
                    </div>
                    <span className="text-xs text-stone-400 font-mono select-none">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Expanded Body Panel */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-stone-100 space-y-3 animate-fadeIn text-xs text-stone-600 leading-relaxed font-sans">
                      <p className="text-[11px] text-stone-550 leading-relaxed font-sans">{trivia.detail}</p>
                      
                      {/* B-bro's voice */}
                      <div className="bg-amber-50/75 border border-amber-200/60 p-2.5 rounded-lg text-stone-850 text-[10px] space-y-0.5 relative">
                        <span className="font-bold text-[#b5952d] flex items-center gap-1">
                          <Smile className="w-3.5 h-3.5 font-bold text-[#b5952d]" />
                          <span>B哥實戰避坑碎碎念：</span>
                        </span>
                        <p className="italic leading-normal font-medium mt-0.5">「 {trivia.bBroComment} 」</p>
                      </div>

                      {/* Hashtags copy bar */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2.5">
                        <div className="flex flex-wrap gap-1">
                          {trivia.hotHashtags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[9px] bg-stone-50 border border-stone-150 text-stone-500 font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Hash className="w-2.5 h-2.5 shrink-0 text-stone-400" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleCopyTags(trivia.id, trivia.hotHashtags)}
                          className="px-2 py-1 bg-white hover:bg-stone-900 hover:text-white border border-stone-200 text-stone-600 text-[10px] font-bold rounded-md transition-all cursor-pointer shrink-0 inline-flex items-center gap-0.5 font-sans"
                          title="一鍵複製自媒體 Hashtags"
                        >
                          {hashCopiedMap[trivia.id] ? (
                            <span className="text-emerald-600 font-bold">已複製！</span>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>複製標籤</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary self-promotion banner */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-xl border border-amber-150/40 space-y-2">
          <span className="text-[9px] font-bold text-[#b5952d] uppercase tracking-wider block font-sans">📺 B哥專屬自媒體頻道指南</span>
          <p className="text-[10px] text-stone-550 leading-relaxed font-sans">
            每週持續上新東京最新高收益投資物件、大阪民宿空置率大踢爆！如果你在編輯腳本時感到不知所措，隨時翻閱小知識或是點選 <strong>「✨ 智能生成 AI 腳本分鏡」</strong> 開啟爆款之旅！
          </p>
        </div>
      </div>
    </div>
  );
}
