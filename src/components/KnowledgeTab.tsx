import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Layers, 
  Compass, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  Smile, 
  MessageSquare, 
  Plus, 
  Send, 
  Hash, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Flame, 
  Grid, 
  Sparkles,
  Search,
  Check,
  RefreshCw,
  HelpCircle,
  Building2,
  Tv
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Structure of knowledge items
export interface ArchiveItem {
  id: string;
  category: "real-estate" | "media" | "tax-danger";
  floor: number; // 1, 2, or 3
  title: string;
  shortDesc: string;
  detail: string;
  bBroComment: string;
  hotHashtags: string[];
  visualMetric?: { label: string; value: string; color: string };
  difficulty: "🌟" | "🌟🌟" | "🌟🌟🌟";
}

// 12 Premium Japanese real-estate and media knowledge entries
const ARCHIVE_DATA: ArchiveItem[] = [
  // Floor 1: Real Estate Basics
  {
    id: "f1-re-1",
    category: "real-estate",
    floor: 1,
    title: "🏠 陽台露台其實係「免費贈送」？",
    shortDesc: "日本房產登記面積唔計陽台！",
    detail: "在日本買樓，大樓登記上的「專有面積」只計算室內牆壁內側面積（又稱「內法」）。所有露台、露天平台或陽台，在法律上均歸其作大樓的「共用部分」。但是，業主會配對擁有「專有使用權」。因此，你支付的房屋稅是不包含露台面積的，露台基本上等同於全免費贈送！",
    bBroComment: "B哥溫馨提示：唔好以為露台係你就可以隨便加建或者堆滿垃圾！日本露台是法定的「緊急安全通道」，如果不配合隨時會被管委會控告，到時真係得不償失！",
    hotHashtags: ["日本露台", "內法面積", "買樓送陽台"],
    visualMetric: { label: "實用增值", value: "+15% 空間", color: "text-amber-500" },
    difficulty: "🌟"
  },
  {
    id: "f1-re-2",
    category: "real-estate",
    floor: 1,
    title: "🧱 舊耐震 vs 新耐震大分水嶺",
    shortDesc: "1981年6月1日決定大樓身價！",
    detail: "1981年（昭和56年）6月1日，日本大修《建築基準法》，實施極嚴苛的「新耐震設計基準」。此基準要求建物能承受震度6強至7級的強震而不倒。而在此之前的「舊耐震」建物，銀行極難審理按揭，買家日後轉移也極為艱難。",
    bBroComment: "B哥老實說：有啲無良中介用極低價誘惑你，望下建築年份，1980年嘅平樓9成係舊耐震，未來想轉手或者搵租客分分鐘砸喺自己手度，千祈唔好貪平！",
    hotHashtags: ["新耐震基準", "日本地震安全", "避坑指南"],
    visualMetric: { label: "安全性高", value: "震度 7 級", color: "text-red-500" },
    difficulty: "🌟🌟"
  },
  {
    id: "f1-re-3",
    category: "real-estate",
    floor: 1,
    title: "📏 「壁芯」與「內法」大有乾坤",
    shortDesc: "廣告面積其實是吹出來的？",
    detail: "在日本不動產廣告（如 SUUMO 或是中介宣傳冊上）展示的面積，通常是「壁芯面積」（即從牆壁中心線開始算）。但是你拿到不動產登記薄（登記謄本）時，上面寫的面積又是「內法面積」（即牆壁內側淨實用面積），兩者差距通常在 5% 到 10% 之間！",
    bBroComment: "B哥教你算：尤其係買小套房（一房/Studio）最好問清內法。否則你諗住買25平米，結果登記簿得22平米，向銀行貸款分分鐘會因為「不符合低限25平米標準」而被拒啊！",
    hotHashtags: ["壁芯面積", "內法面積", "SUUMO廣告細節"],
    visualMetric: { label: "面積落差", value: "高達 10%", color: "text-amber-500" },
    difficulty: "🌟🌟"
  },
  {
    id: "f1-re-4",
    category: "real-estate",
    floor: 1,
    title: "💀 「事故物件」的真實申報潛規則",
    shortDesc: "第二任租客就唔使交代？",
    detail: "日本國土交通省規定，屋內發生過孤獨死、自殺或刑事案件（事故物件），業者有告知義務。但業界潛規則通常只針對「事發後半年的第一位租客或買家」，當有了第二位租屋人或拉長時間後，中介極有可能會洗白並模糊該告知責任！",
    bBroComment: "B哥精明眼：買舊樓最好查日本最大的事故屋地圖『大島てる』(Ooshima Teru)。自己核實過才落訂，否則傻乎乎住進大凶宅，連喊都無路呀！",
    hotHashtags: ["事故物件", "大島てる", "凶宅洗白"],
    visualMetric: { label: "心理瑕疵", value: "房價折半", color: "text-stone-500" },
    difficulty: "🌟🌟"
  },

  // Floor 2: Media Marketing Tactics
  {
    id: "f2-me-1",
    category: "media",
    floor: 2,
    title: "⚡ 影片爆點：黃金3秒極速勾魂",
    shortDesc: "開口一講「大家好」，觀眾肯定滑走！",
    detail: "短影音時代前3秒決定大局。千萬不能用「大家好，我是XX，今天我為大家準備...」作為開頭。必須第一秒上來就是極具視覺或數字衝突的爭議句。例如「月收5厘息？今天我來告訴你，扣完日本隱形稅費你分分鐘要倒貼！」來引發痛點。",
    bBroComment: "B哥金句：自媒體要做得好，就要做個「有態度的說書人」，寧可有實言得罪部分人，也不要溫吞討好所有人。記住，爭議先代表流量！",
    hotHashtags: ["黃金3秒", "自媒體獲客", "流量密法"],
    visualMetric: { label: "留存率", value: "+300%", color: "text-emerald-500" },
    difficulty: "🌟"
  },
  {
    id: "f2-me-2",
    category: "media",
    floor: 2,
    title: "📣 缺點先暴露，反而更容易成交？",
    shortDesc: "老實講缺點，建立無敵「避坑人設」！",
    detail: "傳統房產代理一味講好話，觀眾早已產生免疫。反而在影片中段，主動披露該物業的缺點（例如附近有高壓電塔、鐵路太嘈雜、或者是大樓修繕基金太貴），不僅不會嚇退準買家，反而能樹立難得的實話誠實人設，令私域諮詢轉化率暴增！",
    bBroComment: "B哥肺腑之言：誠實才是成本最低的營銷！你率先幫粉絲排雷，粉絲未來才敢放心把血汗錢交給你幫他看日本盤嘛！",
    hotHashtags: ["誠實行銷", "爆款人設", "粉絲黏性"],
    visualMetric: { label: "私域諮詢", value: "+50% 轉化", color: "text-emerald-500" },
    difficulty: "🌟🌟"
  },
  {
    id: "f2-me-3",
    category: "media",
    floor: 2,
    title: "🎯 結尾私域引流 Hook 「誘餌機制」",
    shortDesc: "不要只講「下次見」就關機！",
    detail: "做自媒體的終極目的是為了精準獲客與流量變現。因此投教視頻結尾必須設精準發福利誘餌，引導粉絲在評論區扣字或私信。例如「評論區扣『東京10』，B哥發給你我們團隊整理的、最新2026年東京精選折價回報盤源PDF表！」",
    bBroComment: "B哥出招：我們不要做廉價的網紅，我們要做的是高回報專案的顧問！後置的禮物一定要價值足，自然源源不絕有人私聊勾引！",
    hotHashtags: ["私域池引流", "自媒體變現", "轉化鉤子"],
    visualMetric: { label: "獲客量", value: "+120% 每週", color: "text-emerald-500" },
    difficulty: "🌟🌟"
  },
  {
    id: "f2-me-4",
    category: "media",
    floor: 2,
    title: "🎨 封面「心機配色學」與高點擊",
    shortDesc: "熒光黃 + 暴跌數字 = 點擊爆棚",
    detail: "日本房產視頻的封面直接決定了點擊率上限。主圖一定要使用日本原木風的淡雅盤源背景，但標題字必須採用極亮的高對比色，如黑邊大粗熒光黃/熒光綠，並且直接在封面上標註「B哥警告」、「現折300萬」、「回報8.2%騙局」等大字！",
    bBroComment: "B哥秘傳：千萬不要把視頻封面弄得像宣傳單那樣整齊，越是土味而刺眼的手寫標語、越是有懸念的實況街景，點選率和曝光回報往往越高！",
    hotHashtags: ["爆款封面", "心機配色", "CTR神操作"],
    visualMetric: { label: "點擊率 CTR", value: "達 8.5%", color: "text-emerald-500" },
    difficulty: "🌟🌟🌟"
  },
  {
    id: "f3-tx-1",
    category: "tax-danger",
    floor: 3,
    title: "💸 每年漲不停的「修繕積立金」",
    shortDesc: "第一年管理費平多數係誘餌！",
    detail: "不少海外買家買日本新樓，見每個月修繕金、管理費極平就即刻入手。但日本法律強制規定，大樓通常有三十年定期大維修計劃（外牆、電梯），落成5年和10年後，修繕金基本會翻2-3倍！更有甚者大修時可能直接要求業主一次性集資幾十萬日圓！",
    bBroComment: "B哥排雷：買二手大宅或公寓時，一定要叫中介拿一份日語叫「重要事項說明書」的報表，上面記錄了大樓修繕金的累積總額和長期調升計劃，如果款項儲備太少，買進去就是直接當『接盤俠』供人維修！",
    hotHashtags: ["修繕積立金", "隱形持有成本", "重事說明書"],
    visualMetric: { label: "持有損益", value: "回報縮水", color: "text-rose-500" },
    difficulty: "🌟"
  },
  {
    id: "f3-tx-2",
    category: "tax-danger",
    floor: 3,
    title: "❌ 便宜到可怕的「再建築不可」",
    shortDesc: "買咗等同買到整張廢紙？",
    detail: "日本法律《建築基準法》規定，「道路接道義務」：建築地塊必須與寬度大於2米的法定道路接軌，且接道面長度不能少於2米。如果不符合該標準（常見於京都、東京墨田區、台東區等古老町屋與一戶建），一經拆除、火燒、震倒，法律禁止重新建造任何防雨建築，只能荒廢！",
    bBroComment: "B哥警告：呢類垃圾盤銀行是完全不會批下任何貸款的，一世只收少少租金，未來要高價套現轉讓，下家只能付現全款，根本沒人接，直接砸死在手裏！",
    hotHashtags: ["再建築不可", "町屋地雷", "一戶建陷阱"],
    visualMetric: { label: "貸款機率", value: "0% 拒貸", color: "text-rose-500" },
    difficulty: "🌟🌟🌟"
  },
  {
    id: "f3-tx-3",
    category: "tax-danger",
    floor: 3,
    title: "🏢 租约中的「普通借家契約」大陷阱",
    shortDesc: "買樓收租，結果請走尊貴的「太上皇」？",
    detail: "日本房屋租賃協議主要分為「普通借家契約」與「定期借家契約」。在普通借家契約下，日本法律對租客實施接近病態的偏袒！業主只要租客不欠租，在租約期滿時是「無權」拒絕續約、強制加租、或收回自住的。否則會判定需要支付極其昂貴（通常是半年到一年房租）的遣散費！",
    bBroComment: "B哥肺腑言：買『帶租約』的房子時（即空降業主），千原要看清合約是不是「普通借家」！如果是普通借家而租客是個老賴，你買了這房子自己甚至沒法入住，真係一肚子氣！",
    hotHashtags: ["普通借家", "定期借家", "租客偏袒法"],
    visualMetric: { label: "趕人代價", value: "百萬日圓", color: "text-rose-500" },
    difficulty: "🌟🌟"
  },
  {
    id: "f3-tx-4",
    category: "tax-danger",
    floor: 3,
    title: "🗺️ 「市街化調整區域」與非都計劃地雷",
    shortDesc: "買塊大荒地，結果水電都不通？",
    detail: "有些海外廣告宣傳「在北海道、沖繩買100坪農地別墅僅需100萬日元，完全自由！」。這類土地大多劃在「市街化調整區域」（Non-urbanization areas），日本法律對該區域定義是「抑制都市化，不進行基礎設施配套」。原則上在這裡是不允許任何商業開發及新建住宅的，甚至無法引入市政污水與電網網絡！",
    bBroComment: "B哥實話：有些買家貪圖便宜，打算在這裡建日本民宿或泡泡屋。到頭來申請許可不批，水電工程報價比買地費還貴，真係買低頭荒山，欲哭無淚！",
    hotHashtags: ["市街化調整區域", "日本土地投資", "非都市地雷"],
    visualMetric: { label: "基礎設施", value: "水電不通", color: "text-rose-500" },
    difficulty: "🌟🌟"
  }
];

// Seeded active discussions
export interface ForumComment {
  id: string;
  topicId: string; // matches ArchiveItem id or "general"
  author: string;
  role: "香港買家" | "自媒體剪片師" | "日本物業代理" | "B哥" | "B哥愛徒";
  content: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  bBroCritique?: string; // B-bro's custom sass comment
}

const SEEDED_COMMENTS: ForumComment[] = [];

export default function KnowledgeTab() {
  // 3D Perspective options
  const [rotateY, setRotateY] = useState<number>(-22);
  const [tiltX, setTiltX] = useState<number>(18);
  const [zoom, setZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [xRayMode, setXRayMode] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Archive States
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<ArchiveItem>(ARCHIVE_DATA[0]);
  const [isCopied, setIsCopied] = useState<{[key: string]: boolean}>({});

  // Forum States
  const [comments, setComments] = useState<ForumComment[]>(() => {
    const saved = localStorage.getItem("bge_forum_conversations_v3");
    return saved ? JSON.parse(saved) : SEEDED_COMMENTS;
  });
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentRole, setNewCommentRole] = useState<ForumComment["role"]>("自媒體剪片師");
  const [askBgeRobot, setAskBgeRobot] = useState(true);
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // B-Bro & Editor custom reply states (B哥和剪片師用)
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [customReplyTexts, setCustomReplyTexts] = useState<{[key: string]: string}>({});

  // Trigger auto or custom reply for a specific comment (B哥和剪片師用)
  const handleBBroReplySubmit = (commentId: string, text: string) => {
    if (!text.trim()) return;
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          bBroCritique: text.trim()
        };
      }
      return c;
    }));
    setReplyingCommentId(null);
    setCustomReplyTexts(prev => ({ ...prev, [commentId]: "" }));
  };

  // DOM Ref for 3D spin loop
  const timerRef = useRef<number | null>(null);

  // Auto rotate trigger
  useEffect(() => {
    if (autoRotate) {
      const step = () => {
        setRotateY(prev => {
          const next = prev + 0.15;
          return next > 180 ? -180 : next;
        });
        timerRef.current = requestAnimationFrame(step);
      };
      timerRef.current = requestAnimationFrame(step);
    } else {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [autoRotate]);

  // Persist Comments
  useEffect(() => {
    localStorage.setItem("bge_forum_conversations_v3", JSON.stringify(comments));
  }, [comments]);

  // Handle Hash Copy
  const handleCopyHash = (textId: string, tags: string[]) => {
    const copyText = tags.map(t => `#${t}`).join(" ");
    navigator.clipboard.writeText(copyText);
    setIsCopied(prev => ({ ...prev, [textId]: true }));
    setTimeout(() => {
      setIsCopied(prev => ({ ...prev, [textId]: false }));
    }, 1500);
  };

  // Upvote/Downvote comments
  const handleVote = (id: string, isLike: boolean) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          likes: isLike ? c.likes + 1 : c.likes,
          dislikes: !isLike ? c.dislikes + 1 : c.dislikes
        };
      }
      return c;
    }));
  };

  // Generate Cantonese responsive roast/critique
  const generateBProReply = (userComment: string, topicTitle: string): string => {
    const cleanComment = userComment.trim().toLowerCase();
    
    // Check if the comment is just a simple "test" or low-substantive test noise
    const isTestPattern = /^(test|testing|123|456|789|abc|def|hi|hello|hello world|測試|測|啊|喔|哦|嗯|啦|哈|no|yes|ok|okay|\.|\?|\!)$/i.test(cleanComment);
    if (isTestPattern || cleanComment.length < 4) {
      return "B哥白眼：「老鐵，提問要認真！打個『test』叫我點評啲咩？問啲日本買樓或者自媒體實務啦！」";
    }

    const defaultCantoneseRoasts = [
      "B哥一針血：「呢個諗法真係太天真！如果買日本樓咁易發大達，中介仲自資開直播sell你？一早自己收埋收租啦。好睇實你本合約，唔好做下個接盤老襯！」",
      "B哥大聲笑：「哈！你想得美，露台封窗做太陽房？喺大板東京全棟投訴你，隨時警察上門。建議你返去看一次大樓重要事項說明書，唔好諗住執小便宜！」",
      "B哥精算盤：「拿，呢個回報看起來很美：8.5厘息！但每個月日本源泉徵收稅、固都稅、管理修繕大樓金一扣，分分鐘淨翻3.5厘。投資自媒體切記講真話，唔好畫大餅！」",
      "B哥直斥地雷：「再建築不可這類物件，買咗等同資產送葬！就算開價幾平幾靚都好，一震或者一火燒就連屋帶地變零，仲有遺產稅同拆除費等緊你，不如去食幾塊和牛好過！」",
      "B哥肺腑叮囑：「做房產自媒體影片最忌諱『大家好歡迎收睇』。爆款前3秒就要打中業主同買家大痛點！黃金3秒，B哥喺大廳，一齊學習一齊轉化，一定會爆流！」",
      "B哥無奈吐槽：「老鐵，你想用普通借家隨便趕走租客？租客喺日本簡直係業主嘅爹！普通借家約你趕人要俾幾十萬円遣散費，仲要看人臉色。乖乖改簽定期借家約啦！」"
    ];

    const commentLower = userComment.toLowerCase();
    
    // 1. Direct user question/comment matching (Highest priority)
    if (commentLower.includes("垃圾") || commentLower.includes("丟") || commentLower.includes("棄") || commentLower.includes("分類") || commentLower.includes("清理") || commentLower.includes("大掃除") || commentLower.includes("gomibako") || commentLower.includes("gomi")) {
      return "B哥大叫：「老鐵，日本丟垃圾絕對係一整年嘅神聖大學問！一般公寓同町屋都有極嚴格嘅日程表：星期一三五收普通可燃垃圾、星期二收瓶罐資源、星期四收膠塑（樽蓋、招紙要分拆洗好），仲一定要喺朝早8點前放好，遲一分鐘都冇人理！如果你偷雞亂丟，有手尾跟呀，日本鄰居特別熱心檢舉，管理處隨時翻查CCTV，甚至退回你門口！除非你買嘅高級Mansion自帶『24時間內置垃圾房』可以隨時丟，否則日日都要睇住張表做人，千祈唔好帶住『點都得』嘅思維去日本啊老鐵！」";
    }
    if (commentLower.includes("再建築") || commentLower.includes("地雷物件")) {
      return "B哥大罵：「『再建築不可』四個字你分開讀好似沒關係，合起來簡直是資產送葬！下家想全款接手的人萬中無一，銀行見到就落閘。貪平買完你一世都要當祖產，真係邊個買邊個就係水魚！」";
    }
    if (commentLower.includes("修繕") || commentLower.includes("管理費") || commentLower.includes("大樓基金")) {
      return "B哥拍案：「好多買房新人，只鍾意望淨投報率。管理修繕三十年計劃一大修，修繕金翻幾倍。大修完直接扣除你半個月租金，利潤全貼大堂，切記買之前要查看重要說明書！」";
    }
    if (commentLower.includes("自媒體") || commentLower.includes("流量") || commentLower.includes("粉絲")) {
      return "B哥拍拍你肩膀：「做自媒體短片最重要就係 honesty (誠實)！揭發缺點先至有公信力！講缺點不但唔會趕走客，反而更能幫你建立無敵『排雷避坑大師』人設，私域客源接唔停！」";
    }
    if (commentLower.includes("陽台") || commentLower.includes("露台") || commentLower.includes("封陽台") || commentLower.includes("封露台")) {
      return "B哥溫馨警示：「免費露台係大樓走火通道，千祈唔好封！日本鄰里舉報文化好盛行，你朝早封，下晝大樓組合理事長就拍你門寄警告信，唔好帶住中國思維去日本玩啦老鐵！」";
    }

    // 2. Fallbacks based on Topic title context if comment has no direct keyword match
    if (topicTitle.includes("再建築")) {
      return "B哥大罵：「『再建築不可』四個字你分開讀好似沒關係，合起來簡直是資產送葬！下家想全款接手的人萬中無一，銀行見到就落閘。貪平買完你一世都要當祖產，真係邊個買邊個就係水魚！」";
    }
    if (topicTitle.includes("修繕")) {
      return "B哥拍案：「好多買房新人，只鍾意望淨投報率。管理修繕三十年計劃一大修，修繕金翻幾倍。大修完直接扣除你半個月租金，利潤全貼大堂，切記買之前要查看重要說明書！」";
    }
    if (topicTitle.includes("自媒體") || topicTitle.includes("黃金")) {
      return "B哥拍拍你肩膀：「做自媒體短片最重要就係 honesty (誠實)！揭發缺點先至有公信力！講缺點不但唔會趕走客，反而更能幫你建立無敵『排雷避坑大師』人設，私域客源接唔停！」";
    }
    if (topicTitle.includes("陽台") || topicTitle.includes("露台")) {
      return "B哥溫馨警示：「免費露台係大樓走火通道，千祈唔好封！日本鄰里舉報文化好盛行，你朝早封，下晝大樓組合理事長就拍你門寄警告信，唔好帶住中國思維去日本玩啦老鐵！」";
    }

    // Pick random robust Cantonese B-Bro roar
    const randIdx = Math.floor(Math.random() * defaultCantoneseRoasts.length);
    return defaultCantoneseRoasts[randIdx];
  };

  // Submit Comments
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = newCommentAuthor.trim() || "神秘香港粉絲";
    setIsSubmitting(true);

    const userCommentId = `comment-${Date.now()}`;
    const userTopic = selectedItem;

    const userComment: ForumComment = {
      id: userCommentId,
      topicId: userTopic.id,
      author: authorName,
      role: newCommentRole,
      content: newCommentText,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0
    };

    // If Tag BGE is checked, generate mock/AI response from B-Bro
    if (askBgeRobot) {
      setComments(prev => [userComment, ...prev]);
      
      const cleanInput = newCommentText.trim().toLowerCase();
      const isTestPatternInput = /^(test|testing|123|456|789|abc|def|hi|hello|hello world|測試|測|啊|喔|哦|嗯|啦|哈|no|yes|ok|okay|\.|\?|\!)$/i.test(cleanInput);
      const isTooShortInput = cleanInput.length < 4;

      if (isTestPatternInput || isTooShortInput) {
        // If it's a test comment or low quality noise, DO NOT trigger BB-Bro automatic reply (打test沒有理由回覆)
        setIsSubmitting(false);
      } else {
        // Delay response a bit for organic feeling
        setTimeout(() => {
          const critique = generateBProReply(newCommentText, userTopic.title);
          
          setComments(prev => prev.map(c => {
            if (c.id === userCommentId) {
              return {
                ...c,
                bBroCritique: critique
              };
            }
            return c;
          }));
          setIsSubmitting(false);
        }, 1200);
      }

    } else {
      setComments(prev => [userComment, ...prev]);
      setIsSubmitting(false);
    }

    setNewCommentText("");
  };

  // Filter items in archive based on Search Query and select levels
  const filteredArchive = ARCHIVE_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.bBroComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.hotHashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && item.floor === selectedFloor;
  });

  return (
    <div className="space-y-8" id="knowledge-tab-container">
      {/* Visual Hub Introduction */}
      <div className="bg-white p-6 rounded-xl border border-[#EFEFEA] shadow-xs space-y-4" id="knowledge-intro-header">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-display font-medium text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <span>互動式三維房產與自媒體知識檔案庫</span>
            </h1>
            <p className="text-stone-500 text-xs mt-0.5">
              探索大師級的日本搵樓規避地雷法則與爆流量行銷奧義，結合 B 哥的香港語音風格叮嚀與實時社群答疑。
            </p>
          </div>
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
            <button 
              onClick={() => { setSelectedFloor(1); }}
              className={`px-3 py-1 text-xs rounded transition-all font-semibold cursor-pointer ${selectedFloor === 1 ? "bg-stone-900 text-[#ebd281] shadow-2xs" : "text-stone-500 hover:text-stone-850"}`}
            >
              1F 房產常識
            </button>
            <button 
              onClick={() => { setSelectedFloor(2); }}
              className={`px-3 py-1 text-xs rounded transition-all font-semibold cursor-pointer ${selectedFloor === 2 ? "bg-stone-900 text-[#ebd281] shadow-2xs" : "text-stone-500 hover:text-stone-850"}`}
            >
              2F 自媒體課目
            </button>
            <button 
              onClick={() => { setSelectedFloor(3); }}
              className={`px-3 py-1 text-xs rounded transition-all font-semibold cursor-pointer ${selectedFloor === 3 ? "bg-stone-900 text-[#ebd281] shadow-2xs" : "text-stone-500 hover:text-stone-850"}`}
            >
              3F 避稅防詐
            </button>
          </div>
        </div>
      </div>

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5/12): Interactive 3D Perspective Cabinet & Interactive Controls */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
          
          {/* Glassmorphism Space for the 3D Building Tower */}
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 text-stone-100 flex flex-col items-center justify-center relative overflow-hidden select-none min-h-[460px] shadow-lg" id="perspective-cabinet">
            
            {/* Hologram abstract ambient lines */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[#ebd281]">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span className="text-[10px] font-mono tracking-wider font-semibold">B-BRO TOWER 3D ARCHIVE</span>
            </div>

            <div className="absolute top-2 right-3 text-[9px] text-stone-400 font-mono text-right">
              Y-orbit: {Math.round(rotateY)}° | X-tilt: {Math.round(tiltX)}°
            </div>

            {/* Simulated 3D Viewport Box */}
            <div className="w-full flex-1 flex items-center justify-center py-6" style={{ perspective: "1500px" }}>
              
              {/* Spinning 3D CSS Building Tower */}
              <div 
                className="relative cursor-grab active:cursor-grabbing"
                style={{
                  width: "180px",
                  height: "280px",
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${tiltX}deg) rotateY(${rotateY}deg) scale(${zoom})`,
                  transition: isRotating ? "none" : "transform 0.15s ease-out"
                }}
                onMouseDown={() => setIsRotating(true)}
                onMouseLeave={() => setIsRotating(false)}
                onMouseUp={() => setIsRotating(false)}
              >
                
                {/* Level 3: Safe Taxation & Anti-Trap (Rose/Red theme) */}
                <div 
                  className={`absolute w-full h-[80px] transition-all cursor-pointer`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateY(0px)",
                    zIndex: 3
                  }}
                  onClick={() => { setSelectedFloor(3); setAutoRotate(false); }}
                >
                  <div className={`absolute inset-0 bg-rose-600/10 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${selectedFloor === 3 ? "border-rose-400 bg-rose-500/25 shadow-[0_0_20px_rgba(244,63,94,0.4)]" : "border-rose-900/40 hover:border-rose-500/50 hover:bg-rose-500/15"}`}>
                    <span className="text-[10px] font-mono text-rose-300 font-semibold tracking-wider">3F . SAFE TAX & TRAP</span>
                    <span className="text-[10px] font-medium text-white/95 mt-0.5">⚠️ 避坑防詐防雷層</span>
                  </div>
                  {/* Subtle 3D plate thickness back lid */}
                  <div className="absolute inset-0 border border-stone-800 bg-stone-900/10 rounded-lg pointer-events-none" style={{ transform: "translateZ(-15px)" }} />
                </div>

                {/* Level 2: Media Marketing (Emerald theme) */}
                <div 
                  className={`absolute w-full h-[80px] transition-all cursor-pointer`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateY(90px)",
                    zIndex: 2
                  }}
                  onClick={() => { setSelectedFloor(2); setAutoRotate(false); }}
                >
                  <div className={`absolute inset-0 bg-emerald-600/10 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${selectedFloor === 2 ? "border-emerald-400 bg-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "border-emerald-900/40 hover:border-emerald-500/50 hover:bg-emerald-500/15"}`}>
                    <span className="text-[10px] font-mono text-emerald-300 font-semibold tracking-wider">2F . MEDIA ACADEMY</span>
                    <span className="text-[10px] font-medium text-white/95 mt-0.5">⚡ 爆款自媒體行銷</span>
                  </div>
                  <div className="absolute inset-0 border border-stone-800 bg-stone-900/10 rounded-lg pointer-events-none" style={{ transform: "translateZ(-15px)" }} />
                </div>

                {/* Level 1: Property Basics (Amber/Gold theme) */}
                <div 
                  className={`absolute w-full h-[80px] transition-all cursor-pointer`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateY(180px)",
                    zIndex: 1
                  }}
                  onClick={() => { setSelectedFloor(1); setAutoRotate(false); }}
                >
                  <div className={`absolute inset-0 bg-amber-600/10 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${selectedFloor === 1 ? "border-amber-400 bg-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "border-amber-900/40 hover:border-amber-500/50 hover:bg-amber-500/15"}`}>
                    <span className="text-[10px] font-mono text-amber-300 font-semibold tracking-wider">1F . REAL ESTATE INSIGHT</span>
                    <span className="text-[10px] font-medium text-white/95 mt-0.5">🏠 日本揀樓基本法</span>
                  </div>
                  <div className="absolute inset-0 border border-stone-800 bg-stone-900/10 rounded-lg pointer-events-none" style={{ transform: "translateZ(-15px)" }} />
                </div>

              </div>

            </div>

            {/* X-Ray Cut-section description */}
            <div className={`w-full p-3 rounded-lg border text-center transition-all text-stone-300 ${xRayMode ? "bg-amber-500/10 border-amber-500/30" : "bg-stone-950/40 border-stone-800"}`}>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-[11px]">
                  <Layers className={`w-3.5 h-3.5 ${xRayMode ? "text-amber-400" : "text-stone-400"}`} />
                  <span>{selectedFloor}F 核心單元已定位：{selectedFloor === 1 ? "日本房地產法律常識" : selectedFloor === 2 ? "流量翻倍自媒體技巧" : "買樓防爆雷高階指南"}</span>
                </span>
                <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-[#ebd281] font-mono">
                  {ARCHIVE_DATA.filter(a => a.floor === selectedFloor).length} 個硬核知識點
                </span>
              </div>
            </div>
          </div>

          {/* Orbit and Visualization Controls panel */}
          <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#d4af37]" />
              <span>3D 三維全景手動微調控制</span>
            </h4>

            <div className="space-y-3.5 text-xs text-stone-600">
              
              {/* Yaw Orbit Y rotation slider */}
              <div>
                <div className="flex justify-between text-[11px] text-stone-500 font-semibold mb-1">
                  <span>水平旋轉 Y (Yaw)</span>
                  <span className="font-mono text-[#b5952d]">{Math.round(rotateY)}°</span>
                </div>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  value={rotateY} 
                  onChange={(e) => { setRotateY(parseInt(e.target.value)); setAutoRotate(false); }}
                  className="w-full accent-[#d4af37]"
                />
              </div>

              {/* Pitch Tilt X rotation slider */}
              <div>
                <div className="flex justify-between text-[11px] text-stone-500 font-semibold mb-1">
                  <span>垂直俯仰 X (Pitch)</span>
                  <span className="font-mono text-[#b5952d]">{Math.round(tiltX)}°</span>
                </div>
                <input 
                  type="range" 
                  min="-45" 
                  max="45" 
                  value={tiltX} 
                  onChange={(e) => { setTiltX(parseInt(e.target.value)); setAutoRotate(false); }}
                  className="w-full accent-[#d4af37]"
                />
              </div>

              {/* Toggle switch for auto-orbiting */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-700">伺服器自律旋轉展示</span>
                <button 
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${autoRotate ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-stone-100 text-stone-500 border border-stone-200"}`}
                >
                  {autoRotate ? "ON (自動旋轉中)" : "OFF"}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (7/12): Knowledge Browsing Cards Directory & Collaborative Forum */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Floor Selected Directory files */}
          <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-50 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
                <div>
                  <h3 className="text-xs font-bold text-stone-800">
                    {selectedFloor}F 知識單元目錄表
                  </h3>
                  <p className="text-[10px] text-stone-400">點擊卡片，下方的詳細避坑秘笈與自媒體討論版將自適性聯動</p>
                </div>
              </div>

              {/* Live Keyword Quick Search */}
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="搜尋本層避坑法..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg pl-8 pr-3 py-1 text-[11px] bg-stone-50 focus:bg-white focus:outline-hidden focus:border-[#d4af37]"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Flat cards grid matching filtered selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredArchive.length > 0 ? (
                filteredArchive.map((item) => {
                  const isSelected = selectedItem.id === item.id;
                  const borderCol = item.category === "real-estate" ? "hover:border-amber-400" : item.category === "media" ? "hover:border-emerald-400" : "hover:border-rose-400";
                  const activeBg = item.category === "real-estate" ? "border-amber-400 bg-amber-50/20" : item.category === "media" ? "border-emerald-400 bg-emerald-50/20" : "border-rose-400 bg-rose-50/20";
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 border rounded-xl transition-all cursor-pointer ${isSelected ? activeBg : "border-stone-150 bg-white " + borderCol}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono font-medium">
                          Difficulty: {item.difficulty}
                        </span>
                        {item.visualMetric && (
                          <span className={`text-[9px] font-bold ${item.visualMetric.color}`}>
                            {item.visualMetric.label}: {item.visualMetric.value}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[11px] font-bold text-stone-850 line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">{item.shortDesc}</p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8 text-stone-400 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-xs">找不到您搜尋的關鍵字內容喔！</p>
                </div>
              )}
            </div>
          </div>

          {/* Focused Document Viewer with B-Bro Speech bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-[#EFEFEA] overflow-hidden shadow-xs"
            >
              <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>知識點深度剖析檔案夾</span>
                </span>
                <span className="text-[10px] font-mono text-stone-400">ID: {selectedItem.id}</span>
              </div>

              {/* Main Content Detail block */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-stone-900">{selectedItem.title}</h2>
                  <p className="text-xs text-[#b5952d] font-semibold">{selectedItem.shortDesc}</p>
                </div>

                <div className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-150 font-sans whitespace-pre-line">
                  {selectedItem.detail}
                </div>

                {/* Cantonese Speech Bubble of B-bro */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#d4af37] text-stone-950 font-bold font-display rounded-full flex items-center justify-center text-[10px] border border-[#ebd281] shadow-xs">
                      B哥
                    </div>
                    <span className="text-xs font-bold text-[#b5952d] block">B哥肺腑心血碎碎念：</span>
                  </div>
                  <p className="text-xs italic text-stone-800 leading-relaxed font-sans font-medium pl-1 select-none">
                    「 {selectedItem.bBroComment} 」
                  </p>
                </div>

                {/* Hashtags & Share controls row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.hotHashtags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] bg-stone-100 border border-stone-200 font-mono text-stone-500 px-2.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Hash className="w-3 h-3 text-stone-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopyHash(selectedItem.id, selectedItem.hotHashtags)}
                    className="text-stone-700 hover:text-white border border-stone-200 hover:bg-stone-950 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isCopied[selectedItem.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">已複製爆款標籤!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>一鍵複製影片 Tag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Seeded & Live Collaborative Forum */}
          <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs space-y-5" id="forum-discuss-section">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                <div>
                  <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5 flex-wrap">
                    <span>小知識交流區</span>
                    <span className="text-[9.5px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-1.5 py-0.5 rounded">
                      B哥和剪片師用
                    </span>
                  </h3>
                  <p className="text-[9px] text-stone-400">目前共有 {comments.length} 條真理交鋒辯論</p>
                </div>
              </div>

              {/* Topic level filters */}
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="border border-stone-200 rounded-lg p-1.5 text-[10px] bg-stone-50 font-medium text-stone-700"
              >
                <option value="all">🌐 全體討論區</option>
                <option value="f1-re-1">🏠 露台陽台免費送</option>
                <option value="f1-re-2">🧱 新舊耐震大分水嶺</option>
                <option value="f2-me-1">⚡ 影片爆點黃金3秒</option>
                <option value="f3-tx-1">💸 漲不停修繕積立金</option>
                <option value="f3-tx-2">❌ 致命再建築不可</option>
              </select>
            </div>

            {/* Add discussion comment post form */}
            <form onSubmit={handleAddComment} className="space-y-4 bg-stone-50 p-4 border border-stone-150 rounded-xl">
              <span className="text-[10px] font-semibold text-[#b5952d] uppercase tracking-wider block">✍️ 加入避坑大講堂辯論：</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-500 mb-1">您的暱稱 (Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：油麻地買家"
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 text-xs bg-white focus:outline-hidden focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 mb-1">您的業界角色</label>
                  <select
                    value={newCommentRole}
                    onChange={(e) => setNewCommentRole(e.target.value as any)}
                    className="w-full border border-stone-200 rounded-lg p-2 text-xs bg-white focus:outline-hidden focus:border-[#d4af37]"
                  >
                    <option value="自媒體剪片師">🎥 自媒體剪片師 (幕後內容主編)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 mb-1">
                  討論/提問內容 (配對樓層為目前的選取項目：{selectedItem.title})
                </label>
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  placeholder={`請輸入您的論點或提問... (限 180 字)`}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-xs bg-white focus:outline-hidden focus:border-[#d4af37] leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <label className="flex items-center gap-2 text-[10px] text-stone-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={askBgeRobot}
                    onChange={(e) => setAskBgeRobot(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#d4af37] rounded"
                  />
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    <span>艾特 B哥 AI 毒舌即時點評回覆 (強烈建議！)</span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2 bg-stone-900 disabled:bg-stone-300 text-[#ebd281] disabled:text-stone-500 font-semibold rounded-lg text-xs hover:bg-[#d4af37] hover:text-stone-950 transition-colors cursor-pointer inline-flex items-center gap-1 justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>B哥執筆回應中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>送出言論</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Conversation Flow Feed items list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {comments
                .filter(c => filterTopic === "all" || c.topicId === filterTopic)
                .map((comment) => {
                  const correlatedTopic = ARCHIVE_DATA.find(a => a.id === comment.topicId);
                  
                  return (
                    <div key={comment.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0 space-y-2.5 animate-fadeIn">
                      
                      {/* Comment User info row */}
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800">{comment.author}</span>
                          <span className="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium">
                            {comment.role}
                          </span>
                          {correlatedTopic && (
                            <span className="text-stone-400 font-mono hidden sm:inline">
                              • 聯動冷知識：{correlatedTopic.title.slice(0, 15)}...
                            </span>
                          )}
                        </div>
                        <span className="text-stone-400 font-mono">
                          {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Content text */}
                      <p className="text-xs text-stone-700 leading-relaxed pl-1 font-sans">
                        {comment.content}
                      </p>

                      {/* Vote & reply trigger buttons */}
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 flex-wrap">
                        <button 
                          onClick={() => handleVote(comment.id, true)}
                          className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{comment.likes} B哥點讚</span>
                        </button>
                        <button 
                          onClick={() => handleVote(comment.id, false)}
                          className="hover:text-amber-700 transition-colors inline-flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>{comment.dislikes} 吐槽</span>
                        </button>
                        <button 
                          onClick={() => {
                            setReplyingCommentId(replyingCommentId === comment.id ? null : comment.id);
                            if (comment.bBroCritique) {
                              setCustomReplyTexts(prev => ({ ...prev, [comment.id]: comment.bBroCritique || "" }));
                            }
                          }}
                          className="text-[#b5952d] hover:text-[#ebd281] transition-colors inline-flex items-center gap-1 cursor-pointer font-sans ml-2 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded font-semibold border border-amber-500/10"
                        >
                          <MessageSquare className="w-3 h-3 text-[#d4af37]" />
                          <span>🎙️ B哥回覆 (自媒體編輯專用)</span>
                        </button>
                      </div>

                      {/* For B哥和剪片師: Inline Custom Reply Controls */}
                      {replyingCommentId === comment.id && (
                        <div className="mt-2.5 bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-[#b5952d]">🎙️ 撰寫/微調 B哥黃金回應</span>
                            <button 
                              type="button" 
                              onClick={() => {
                                const autoCritique = generateBProReply(comment.content, correlatedTopic?.title || "撿樓防地雷");
                                setCustomReplyTexts(prev => ({ ...prev, [comment.id]: autoCritique }));
                              }}
                              className="text-[10px] text-stone-600 bg-stone-200/60 hover:bg-stone-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              🤖 AI 自動生成毒舌點評
                            </button>
                          </div>
                          
                          <textarea
                            rows={3}
                            value={customReplyTexts[comment.id] || ""}
                            onChange={(e) => setCustomReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                            placeholder="請填入 B 哥的經典毒舌、大實話或點評台詞..."
                            className="w-full border border-stone-200 rounded-lg p-2 text-xs bg-white text-stone-800 focus:outline-hidden focus:border-[#d4af37] leading-relaxed resize-none"
                          />

                          <div className="flex justify-end gap-2 text-[10px]">
                            <button 
                              type="button"
                              onClick={() => setReplyingCommentId(null)}
                              className="px-2.5 py-1 text-stone-500 hover:text-stone-800"
                            >
                              取消
                            </button>
                            <button 
                              type="button"
                              disabled={!customReplyTexts[comment.id]?.trim()}
                              onClick={() => handleBBroReplySubmit(comment.id, customReplyTexts[comment.id] || "")}
                              className="px-3.5 py-1 bg-stone-900 text-[#ebd281] font-bold rounded-md hover:bg-[#d4af37] hover:text-stone-950 transition-colors disabled:bg-stone-100 disabled:text-stone-400"
                            >
                              確認送出
                            </button>
                          </div>
                        </div>
                      )}

                      {/* AI B-Bro real comments sasses */}
                      {comment.bBroCritique && (
                        <div className="bg-amber-100/40 border-l-2 border-[#d4af37] p-3 rounded-r-lg space-y-1.5 text-xs text-stone-800 leading-normal pl-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#b5952d]">🔥 B哥 (AI) 毒舌解答</span>
                            <span className="text-[9px] bg-[#d4af37]/20 text-[#907119] px-1.5 py-0.5 rounded font-mono">Verified Influencer</span>
                          </div>
                          <p className="italic font-medium font-sans">「 {comment.bBroCritique} 」</p>
                        </div>
                      )}

                    </div>
                  );
                })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
