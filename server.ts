import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini SDK lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Features running on Gemini will fail safely.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "dummy_key",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Parse Japanese/SUUMO Property using Gemini
app.post("/api/gemini/parse-listing", async (req, res) => {
  try {
    const { rawText, listingUrl } = req.body;
    if (!rawText && !listingUrl) {
      return res.status(400).json({ error: "Please provide either rawText or listingUrl to parse." });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      // Return a mocked mock-up for local offline safety if no key is provided
      return res.json(getMockParsedProperty(rawText || listingUrl));
    }

    const prompt = `
      You are B哥 (B-Ge), a premium real estate content creator specializing in Japanese property investments for HK/Taiwan buyers.
      Your signature is honesty, humor, and a sharp eye for "伏位" (cons/traps/hidden defects) as well as "賣點" (pros/selling points).
      
      Analyze the following real estate text or link and extract the structured values in Traditional Chinese (Hong Kong/Taiwan terminology, e.g. "呎" for area, "LDK", "投報率", "築年數").
      If the text is in Japanese (like from SUUMO), parse it accurately and translate JPY to HKD (using a current rate of approx 1 JPY = 0.05 HKD).
      
      Extract values to match this JSON schema.
      
      --- INPUT CONTENT ---
      ${rawText || `URL: ${listingUrl}`}
      --- END INPUT CONTENT ---
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "priceJPY", "priceHKD", "location", "address", "layout", "sizeSqm", "sizeTsubo", "yearBuilt", "yieldRate", "stationWalk", "pros", "cons", "summary"],
          properties: {
            title: { type: Type.STRING, description: "A catchy, appealing Chinese title for social media (e.g., '新宿黃金地段 1LDK 投報超高小豪宅')" },
            priceJPY: { type: Type.INTEGER, description: "Price in JPY (e.g. 28000000)" },
            priceHKD: { type: Type.INTEGER, description: "Calculated Price in HKD (e.g. 1400000)" },
            location: { type: Type.STRING, description: "Major area/city (e.g., '東京都新宿區', '大阪府中央區')" },
            address: { type: Type.STRING, description: "Full address if available or localized descriptive address" },
            layout: { type: Type.STRING, description: "Room Layout (e.g. '1LDK', '2DK', '套房 Studio')" },
            sizeSqm: { type: Type.NUMBER, description: "Property net size in square meters" },
            sizeTsubo: { type: Type.NUMBER, description: "Property size in square feet or Japanese tsubo (坪)" },
            yearBuilt: { type: Type.INTEGER, description: "Year built as a number (e.g. 1998, 2012)" },
            yieldRate: { type: Type.NUMBER, description: "Estimated gross yield percentage (e.g. 5.8)" },
            stationWalk: { type: Type.STRING, description: "Station and walking distance in minutes (e.g., '山手線 新宿站 徒步 6分')" },
            imageUrl: { type: Type.STRING, description: "Extract the URL of the main property photo or image if present in the raw text/URL. For SUUMO, it might look like 'https://img.suumo.jp/...' or similar." },
            pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 3-4 positive highlights / selling points (e.g. '管理費便宜', '地鐵線路多', '租客穩定')"
            },
            cons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 2-3 traps / cons (e.g. '無梯公寓', '朝北採光弱', '臨近大馬路噪音')"
            },
            summary: { type: Type.STRING, description: "A short, honest and humorous expert rating/verdict written in B哥's tone" }
          }
        },
        systemInstruction: "You are an expert real estate analyzer. Extract data strictly into JSON matches the schema. Provide output in highly-readable Traditional Chinese (HK/TW)."
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error parsing property with Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to parse property." });
  }
});

// 2. API: Generate Script using Gemini
app.post("/api/gemini/generate-script", async (req, res) => {
  try {
    const { title, price, layout, size, location, yieldRate, pros, cons, style, platform } = req.body;

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      // Fallback response for offline/fallback environment
      return res.json(getMockScript(title, style, platform));
    }

    const styleDescriptions = {
      comedy: "自嘲幽默與毒舌吐槽風格（一邊爆笑搞笑，一邊揭露致命弱點；直言不諱）",
      luxury: "尊尊高端、夢幻感風格（強調高尚享受、美耐度、空間奢侈感與極致細節）",
      investor: "超級數據控、理性投資風格（主打精細算帳、投報率試算、區域未來升值空間分析）",
      warning: "避坑排雷與警告風格（以超級爆料者身分，指出如果不看這條片會虧損多少錢）"
    };

    const platformDescriptions = {
      "youtube-long": "YouTube 長影片（10-15分鐘，講述更詳細，有深度的盤源特質與財務規劃）",
      "tiktok-short": "TikTok/IG Reels 短視頻（60秒，節奏極度緊湊，第一秒就要暴扣吸引，金句頻出）",
      "red-book": "小紅書影片（3分鐘，圖文穿插感強，主打精緻精緻包裝、避坑點與日式生活感）"
    };

    const prompt = `
      You are B哥 (B-Ge), a famous real estate influencer. Generate a highly customized video script for the following property listing:
      
      - TITLE: ${title}
      - LOCATION: ${location}
      - PRICE: ${price}
      - LAYOUT & SIZE: ${layout}, ${size}
      - YIELD: ${yieldRate}%
      - PROS (優勢): ${Array.isArray(pros) ? pros.join(", ") : pros}
      - CONS (致命伏位): ${Array.isArray(cons) ? cons.join(", ") : cons}
      
      - SCRIPT STYLE: ${styleDescriptions[style as keyof typeof styleDescriptions] || style}
      - TARGET PLATFORM: ${platformDescriptions[platform as keyof typeof platformDescriptions] || platform}
      
      Generate a scene-by-scene storyboard structure in JSON. Each scene should have:
      1. sceneName (e.g. "😂 黃金3秒開頭", "📍 核心賣點剖析", "⚠️ 伏位大踢爆", "💸 投資財務試算", "📢 引導私域行動")
      2. narration (The actual spoken lines by B哥, written in fluent colloquial Cantonese or warm, humorous Traditional Chinese. Must fit the ${style} tone perfectly with catchy catchphrases like '哈囉大家，我係B哥', '唔使驚，B哥喺大廳!', '呢度個伏位真係...', '好啦，算帳時間!')
      3. visual (B-roll background visual ideas / camera direction)
      4. textOsd (Captions (OSD) to display on screen)
      5. durationSec (Estimated scene duration in seconds)
      
      The prompt output must strictly be a JSON array of scenes matching the schema:
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["sceneName", "narration", "visual", "textOsd", "durationSec"],
            properties: {
              sceneName: { type: Type.STRING },
              narration: { type: Type.STRING },
              visual: { type: Type.STRING },
              textOsd: { type: Type.STRING },
              durationSec: { type: Type.INTEGER }
            }
          }
        },
        systemInstruction: "You are a professional video scriptwriter for property self-media. Write scripts that are practical, engaging, funny, and native to HK/Taiwan social media platforms."
      }
    });

    const parsedScript = JSON.parse(response.text?.trim() || "[]");
    res.json(parsedScript);
  } catch (error: any) {
    console.error("Error generating script with Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to generate script." });
  }
});

// Helper generators for simulated fallback if key is missing/inactive
app.get("/api/image-proxy", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("No url provided");
  }

  try {
    const fetchedResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://suumo.jp/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!fetchedResponse.ok) {
      return res.status(fetchedResponse.status).send(`Failed to fetch image: ${fetchedResponse.statusText}`);
    }

    const contentType = fetchedResponse.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    
    res.setHeader("Cache-Control", "public, max-age=86400");
    
    const arrayBuffer = await fetchedResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    res.status(500).send("Server error fetching image");
  }
});

function getMockParsedProperty(input: string): any {
  const isOsaka = input.toLowerCase().includes("osaka") || input.includes("大阪");
  
  if (isOsaka) {
    return {
      title: "🔥 大阪難波商圈 穩賺民宿房！高達 8.4% 投報的高CP選擇",
      priceJPY: 19800000,
      priceHKD: 990000,
      location: "大阪府中央区難波",
      address: "大阪府中央區千日前2丁目-X-X",
      layout: "1DK (民宿契)",
      sizeSqm: 28.5,
      sizeTsubo: 8.6,
      yearBuilt: 2008,
      yieldRate: 8.4,
      stationWalk: "地下鐵 御堂筋線 '難波站' 徒步 4 分鐘",
      pros: [
        "位於熱門遊客商圈千日前，民宿執照現成，出租率極高",
        "難波核心地段，徒步圈內即可到達心齋橋與道頓堀",
        "管理維護費低，大阪物業管理效率成熟"
      ],
      cons: [
        "室內格局偏小，如果是多人家庭入住會有擁擠感",
        "臨近商業鬧區，夜晚街道稍微有些喧鬧噪音",
        "築年數中等，未來折舊率比新樓高"
      ],
      summary: "B哥實話實說：呢個難波民宿盤簡直係投資狂熱者嘅恩物！難波徒步4分鐘係神級位置，8.4%嘅回報喺東京根本諗都唔使諗。雖然夜晚有啲鬧區噪音，但遊客來大阪就係要熱鬧，邊個會喺10點前瞓覺？如果你搵緊高現金流、唔介意樓齡比較中等，呢個直接執照現成嘅民宿絕對係極品！",
      imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600"
    };
  }

  // Tokyo default
  return {
    title: "✨ 東京港區芝浦 海景1LDK！高淨值白領最愛，山手線沿線神盤",
    priceJPY: 49800000,
    priceHKD: 2490000,
    location: "東京都港区芝浦",
    address: "東京都港區芝浦3-XXX",
    layout: "1LDK",
    sizeSqm: 42.1,
    sizeTsubo: 12.7,
    yearBuilt: 2015,
    yieldRate: 5.2,
    stationWalk: "JR 山手線 '田町站' 徒步 7 分鐘",
    pros: [
      "港區核心黃金地段，租客全屬東京高收入白領，幾乎零空置期",
      "2015年高標準抗震建造，外觀大氣奢華，物業管理極度完善",
      "高樓層通風、採光極佳，可眺望部分運河景觀"
    ],
    cons: [
      "港區物價與管理費高昂，淨投報率會被管理成本壓縮",
      "臨近港灣，梅雨或颱風季節海風濕度較高，空調除濕要常開",
      "售價較高，適合預算充裕且追求高資產保值性的買家"
    ],
    summary: "B哥實話實說：港區芝浦一直係東京白領嘅心頭好。雖然5.2%投報看似唔算頂級，但港區嘅保值能力係『神級』。臨海濕氣雖然重，但物業管理好到你唔信，而且開窗有運河景，帶女仔返黎直接加100分。如果你預算夠、追求穩健、想喺東京買個優雅又抗通脹嘅心水盤，呢個精緻1LDK閉眼買就係了！",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600"
  };
}

function getMockScript(title: string, style: string, platform: string): any[] {
  return [
    {
      sceneName: "😂 黃金3秒開頭",
      narration: "哈囉大家，我係B哥！買樓唔好做水魚，今日同大家開箱呢個最新爆款：『" + title + "』。好多人同我講呢間屋完美？今日B哥就帶你真話實說，一腳踢爆佢嘅底細！",
      visual: "B哥對鏡頭拍胸脯，表情帶點挑釁與幽默，背景切換至日本街景與精美房產外觀",
      textOsd: "買房不做水魚！💥 B哥誠實開箱",
      durationSec: 8
    },
    {
      sceneName: "📍 核心亮點剖析",
      narration: "先講好聽嘅！呢個盤真係有三大神級賣點。首先，位置喺精華區，大堂乾淨漂亮，重點係附近生活配套多到爆，搭地鐵無敵方便！高收入白領搶住租，基本上買咗就躺平收租！",
      visual: "快速切換剪輯：精緻的房產內部大堂、明亮寬敞的客廳、廚房設施，以及地鐵站人潮速拍",
      textOsd: "💎 黃金地段 & 頂級配套！收租躺平選擇",
      durationSec: 15
    },
    {
      sceneName: "⚠️ 致命伏位大踢爆",
      narration: "好啦！糖衣食完，B哥時間到，我哋嚟踢爆佢嘅致命『伏位』！好多中介唔會話你知，呢間屋採光其實有啲美中不足，而且管理費要吃掉你一部分回報！如果係朝北或者樓低，回南天你開除濕機會開到手軟！",
      visual: "音效叮咚一聲！B哥表情變得搞笑而嚴肅，手指著房間採光死角，或是突出展示道路車流或細節缺陷",
      textOsd: "😱 致命伏位！聽完再下決定",
      durationSec: 15
    },
    {
      sceneName: "💸 投資財務試算",
      narration: "嚟，B哥幫你算一帳！雖然扣埋管理費、修繕金淨投報少咗，但計入資產增值空間同這區的剛性租客，這價錢月供扣掉租金，每個月仲有得賺！簡直係用日本租客嘅血汗錢幫你供美宅，性價比真係抵到爛！",
      visual: "畫面出現簡約科技感的iPad或數字虛擬浮現，快速列出：售價、租金、管理費、淨收入與回報",
      textOsd: "📊 算帳時間！精準財務回報拆解",
      durationSec: 15
    },
    {
      sceneName: "📢 引導私域行動",
      narration: "想知道詳細地址、獲取我們團隊整理的獨家 SUUMO 隱藏折價評估報告？唔使猶豫，即刻點下方連結，或者私信我『+1』，B哥一對一發比你，再拉你入我們內部東京日本房地產避坑俱樂部！下期見，拜拜！",
      visual: "B哥指向螢幕下方聯絡按鈕，畫面有二維碼浮動和訂閱動效",
      textOsd: "👇 點擊下方或私信「+1」 搶先看報告",
      durationSec: 10
    }
  ];
}

// Vite and static asset integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
