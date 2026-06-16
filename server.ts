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

// Helper to race any promise against a timeout to prevent gateway drops (HTTP 000)
async function callGeminiWithTimeout<T>(apiCall: Promise<T>, timeoutMs: number = 25000): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([apiCall, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

// Helper to call Gemini with retries and alternate fallback models to bypass any 503/UNAVAILABLE or heavy demand errors
async function callGeminiWithRetryAndFallback(
  ai: GoogleGenAI,
  params: { contents: any; config?: any },
  timeoutMs: number = 30000
): Promise<any> {
  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
  let lastError: any = null;

  for (const model of models) {
    let attempts = 2; // Try up to 2 times for each model
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`[Gemini SDK] Trying model "${model}" (Attempt ${attempt}/${attempts})...`);
        const apiCall = ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        const response = await callGeminiWithTimeout(apiCall, timeoutMs);
        if (response && response.text) {
          console.log(`[Gemini SDK] Success using model: ${model} on attempt ${attempt}`);
          return response;
        }
        throw new Error("Received empty response from the model");
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini SDK] Error for model "${model}" on attempt ${attempt}:`, err?.message || err);
        
        // Wait a longer exponential-style backoff delay (1000ms to 2500ms) to allow the rate limit/load spike to subside
        if (attempt < attempts) {
          const delay = 1200 * attempt;
          console.log(`[Gemini SDK] Retrying ${model} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    // Give a short delay before trying the next model
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw lastError || new Error("All fallback models and retries failed");
}

// 1. API: Parse Japanese/SUUMO Property using Gemini
app.post("/api/gemini/parse-listing", async (req, res) => {
  const { rawText, listingUrl } = req.body;
  try {
    if (!rawText && !listingUrl) {
      return res.status(400).json({ error: "Please provide either rawText or listingUrl to parse." });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      // Return a mocked mock-up for local offline safety if no key is provided
      return res.json(getMockParsedProperty(rawText || listingUrl));
    }

    let inputContent = rawText;
    if (!inputContent && listingUrl) {
      try {
        console.log(`[Parser] Fetching page content for ${listingUrl} directly...`);
        const fetchRes = await fetch(listingUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8"
          }
        });
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          const bodyStart = html.indexOf("<body");
          const bodyEnd = html.indexOf("</body>");
          let cleanedHtml = html;
          if (bodyStart !== -1 && bodyEnd !== -1) {
            cleanedHtml = html.substring(bodyStart, bodyEnd + 7);
          }
          // Remove scripts, styles, iframe, and other bulky tags
          cleanedHtml = cleanedHtml
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
          
          // Truncate to save tokens (approx 35k chars)
          if (cleanedHtml.length > 35000) {
            cleanedHtml = cleanedHtml.substring(0, 35000);
          }
          inputContent = `Source URL: ${listingUrl}\n\nWebpage content HTML:\n${cleanedHtml}`;
          console.log(`[Parser] Successfully fetched and prepared HTML content (${cleanedHtml.length} chars)`);
        } else {
          console.warn(`[Parser] Direct fetch failed: ${fetchRes.status} ${fetchRes.statusText}`);
          inputContent = `URL: ${listingUrl}`;
        }
      } catch (fetchErr) {
        console.warn("[Parser] Direct fetch error, sending URL only:", fetchErr);
        inputContent = `URL: ${listingUrl}`;
      }
    }

    const prompt = `
      You are B哥 (B-Ge), a premium real estate content creator specializing in Japanese property investments for HK/Taiwan buyers.
      Your signature is honesty, humor, and a sharp eye for "伏位" (cons/traps/hidden defects) as well as "賣點" (pros/selling points).
      
      Analyze the following real estate text, HTML, or webpage details and extract the structured values in Traditional Chinese (Hong Kong/Taiwan terminology, e.g. "呎" or "坪" for area, LDK, layout, 投報率, 建立築年).
      If the text is in Japanese (like from SUUMO), parse it accurately and translate JPY to HKD (using a current rate of approx 1 JPY = 0.05 HKD).
      
      Extract values to match this JSON schema. Under no circumstances should you omit any required fields. If a required field cannot be found, provide a realistic estimated value based on similar listings.
      
      --- INPUT CONTENT ---
      ${inputContent}
      --- END INPUT CONTENT ---
    `;

    const response = await callGeminiWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "priceJPY", "location", "pros", "cons", "summary"],
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
            listingUrl: { type: Type.STRING, description: "The original listing URL if provided" },
            landArea: { type: Type.STRING, description: "Land area (土地面積) if it's a house/land, e.g. '120.5m2'" },
            buildingArea: { type: Type.STRING, description: "Building area (建物面積), e.g. '100m2'" },
            privateRoad: { type: Type.STRING, description: "Private road burden / road access (私道負担・道路)" },
            landRights: { type: Type.STRING, description: "Land rights (土地の権利形態), e.g. '所有權', '借地權'" },
            structure: { type: Type.STRING, description: "Structure / Construction method (構造・工法), e.g. '木造', 'RC造'" },
            builder: { type: Type.STRING, description: "Builder / Construction company (施工会社)" },
            renovationHistory: { type: Type.STRING, description: "Renovation history / details (リフォーム履歴)" },
            zoning: { type: Type.STRING, description: "Zoning / Use district (用途地域), e.g. '商業地域', '第一種低層住居専用地域'" },
            propertyType: { type: Type.STRING, description: "The type of the property. Must be 'apartment' if it is an apartment/condominium/mansion, or 'house' if it is a detached house/single-family home/villa/townhouse." },
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
        systemInstruction: "You are an expert real estate analyzer. Extract data strictly into JSON matches the schema. Provide output in highly-readable Traditional Chinese (HK/TW). Keep pros, cons and summary extremely short and punchy (1-2 sentences max each) to prevent generation latency."
      }
    });
    let parsedData: any = JSON.parse(response.text?.trim() || "{}");
    // Ensure listingUrl is carried over
    if (listingUrl && !parsedData.listingUrl) {
      parsedData.listingUrl = listingUrl;
    }
    parsedData.isAIParsed = true;
    res.json(parsedData);
  } catch (error: any) {
    console.warn("Parse API experienced error or timeout, running fail-safe local property parser:", error);
    try {
      const fallbackResult = getMockParsedProperty(rawText || listingUrl);
      fallbackResult.isAIParsed = false;
      res.json(fallbackResult);
    } catch (fallbackError: any) {
      console.error("Critical fallback failure:", fallbackError);
      res.status(500).json({ error: "Failed to parse listing due to internal error." });
    }
  }
});

// 2. API: Generate Script using Gemini
app.post("/api/gemini/generate-script", async (req, res) => {
  const { title, price, layout, size, location, yieldRate, pros, cons, style, platform } = req.body;
  try {
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
      "youtube-shorts": "YouTube Shorts (60秒以內，強烈吸睛，節奏緊湊的直式短視頻)",
      "instagram-reels": "Instagram Reels 視頻（60秒，節奏極度緊湊，第一秒就要暴扣吸引，金句頻出）"
    };

    const prompt = `
      You are B哥 (B-Ge), a famous real estate influencer. Generate a highly customized video script for the following property listing:
      
      - TITLE: ${title || "精選優質日本房產"}
      - LOCATION: ${location || "熱門日本精華段"}
      - PRICE: ${price || "價格合理"}
      - LAYOUT & SIZE: ${layout || "1LDK"}, ${size || "實用坪效高"}
      - YIELD: ${yieldRate || "5.0"}%
      - PROS (優勢): ${Array.isArray(pros) ? pros.join(", ") : (pros || "絕佳地段")}
      - CONS (致命伏位): ${Array.isArray(cons) ? cons.join(", ") : (cons || "修繕積金較高")}
      
      - SCRIPT STYLE: ${styleDescriptions[style as keyof typeof styleDescriptions] || style || "comedy"}
      - TARGET PLATFORM: ${platformDescriptions[platform as keyof typeof platformDescriptions] || platform || "youtube-long"}
      
      Generate a scene-by-scene storyboard structure in JSON. Each scene should have:
      1. sceneName (e.g. "😂 黃金3秒開頭", "📍 核心賣點剖析", "⚠️ 伏位大踢爆", "💸 投資財務試算", "📢 引導私域行動")
      2. narration (The actual spoken lines by B哥, written in fluent colloquial Cantonese or warm, humorous Traditional Chinese. Must fit the style tone perfectly with catchy catchphrases like '哈囉大家，我係B哥', '唔使驚，B哥喺大廳!', '呢度個伏位真係...', '好啦，算帳時間!')
      3. visual (B-roll background visual ideas / camera direction)
      4. textOsd (Captions (OSD) to display on screen)
      5. durationSec (Estimated scene duration in seconds)
      
      CRITICAL: Write extremely punchy, direct and short script lines. Keep each scene's narration to around 2 split, powerful sentences so it runs incredibly fast. Provide exactly 4 to 5 key storyboard scenes in total.
    `;

    const response = await callGeminiWithRetryAndFallback(ai, {
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
        systemInstruction: "You are a professional video scriptwriter for property self-media. Write scripts that are practical, engaging, funny, and native to HK/Taiwan social media platforms. Keep your response extremely brief, tidy and fast."
      }
    });
    const parsedScript = JSON.parse(response.text?.trim() || "[]");
    res.json(parsedScript);
  } catch (error: any) {
    console.warn("Script generation experienced error or timeout, running fail-safe local script generator:", error);
    try {
      const fallbackScript = getMockScript(title || "精選好房", style || "comedy", platform || "youtube-long");
      res.json(fallbackScript);
    } catch (fallbackError: any) {
      console.error("Critical script fallback failure:", fallbackError);
      res.status(500).json({ error: "Failed to generate script due to internal error." });
    }
  }
});

function getMockParsedProperty(input: string): any {
  const cleanInput = input || "";
  
  // 1. Detect location signals
  const isOsaka = cleanInput.toLowerCase().includes("osaka") || cleanInput.includes("大阪");
  const isKyoto = cleanInput.toLowerCase().includes("kyoto") || cleanInput.includes("京都");
  const isHouse = cleanInput.includes("一戶建") || cleanInput.includes("一戸建て") || cleanInput.includes("別墅") || cleanInput.includes("戶建") || cleanInput.includes("戸建");

  // 2. Extract Price JPY
  let priceJPY = 28000000; // sensible default
  const priceMatch = cleanInput.match(/価格[\s：:]*([0-9,]+)\s*万/i) || 
                     cleanInput.match(/([0-9,]+)\s*万円/i) || 
                     cleanInput.match(/([0-9,.]+)\s*万/);
  if (priceMatch) {
    const val = parseFloat(priceMatch[1].replace(/,/g, ''));
    if (val) priceJPY = val * 10000;
  } else {
    // Try absolute price if any
    const priceAbsMatch = cleanInput.match(/(?:價格|価格|賃料)[\s：:]*([0-9,]{5,11})/);
    if (priceAbsMatch) {
      const val = parseFloat(priceAbsMatch[1].replace(/,/g, ''));
      if (val) priceJPY = val;
    }
  }

  // 3. Calculated Price HKD
  const priceHKD = Math.round(priceJPY * 0.05);

  // 4. Extract Layout
  let layout = "1LDK";
  const layoutMatch = cleanInput.match(/間取り[\s：:]*([A-Za-z0-9+#]+)/) || 
                      cleanInput.match(/間取[\s：:]*([A-Za-z0-9+#]+)/) ||
                      cleanInput.match(/([1-4]\s*[LDKR]+|1R|1K|2K|3K)/i);
  if (layoutMatch) {
    layout = layoutMatch[1].trim();
  } else if (isHouse) {
    layout = "4LDK (一戶建)";
  }

  // 5. Extract Size SQM
  let sizeSqm = 35.5;
  const sizeMatch = cleanInput.match(/(?:専有面積|建物面積|床面積|面積)[\s：:]*([0-9,.]+)\s*(?:m2|㎡|平米)/i) || 
                    cleanInput.match(/([0-9,.]+)\s*(?:m2|㎡|平米)/i);
  if (sizeMatch) {
    sizeSqm = parseFloat(sizeMatch[1]);
  }

  // 6. Calculate Size Tsubo
  const sizeTsubo = Number((sizeSqm * 0.3025).toFixed(1));

  // 7. Extract Year Built
  let yearBuilt = 2012;
  const yearMatch = cleanInput.match(/(?:築年月|築|建築)[\s：:]*(?:平成|昭和|令和)?\s*(\d{4})年/) || 
                    cleanInput.match(/(\d{4})年/);
  if (yearMatch) {
    yearBuilt = parseInt(yearMatch[1]);
  } else {
    const ageMatch = cleanInput.match(/築\s*(\d+)\s*年/);
    if (ageMatch) {
      const age = parseInt(ageMatch[1]);
      if (age < 120 && age > 0) {
        yearBuilt = 2026 - age;
      }
    }
  }

  // 8. Extract Address & Location
  let address = isOsaka ? "大阪府中央區" : isKyoto ? "京都府京都市" : "東京都港區";
  let location = isOsaka ? "大阪府中央區" : isKyoto ? "京都府" : "東京都港區";
  
  const addressMatch = cleanInput.match(/(?:所在地|住所)[\s：:]*([^\n\r]+)/);
  if (addressMatch) {
    address = addressMatch[1].trim();
    const locMatch = address.match(/^.*?[都道府県](?:.*?區|.*?区|.*?市|.*?町|.*?村)?/);
    if (locMatch) {
      location = locMatch[0];
    } else {
      location = address.slice(0, 8);
    }
  }

  // 9. Extract Station Walk
  let stationWalk = "地鐵沿線 徒步圈內";
  const stationMatch = cleanInput.match(/(?:交通|沿線)[\s：:]*([^\n\r]+)/) || 
                       cleanInput.match(/([^\n\r]*?駅[^\n\r]*?徒歩\s*\d+\s*分)/) ||
                       cleanInput.match(/([^\n\r]*?駅[^\n\r]*?\d+\s*分)/);
  if (stationMatch) {
    stationWalk = stationMatch[1].trim();
  }

  // 10. Extract Yield Rate
  let yieldRate = 5.2;
  const yieldMatch = cleanInput.match(/(?:利回り|投報率|收益率|返還率)[\s：:]*([0-9.]+)\s*%/i) || 
                     cleanInput.match(/([0-9.]+)\s*%/);
  if (yieldMatch) {
    yieldRate = parseFloat(yieldMatch[1]);
  } else {
    if (isOsaka) yieldRate = 8.4;
    else if (isHouse) yieldRate = 4.5;
    else yieldRate = 5.2;
  }

  // 11. Catchy custom B哥 style title
  const priceWans = Math.round(priceJPY / 10000);
  const locationShort = location.replace(/東京都|大阪府|京都府/, "");
  const title = `🔥 ${locationShort || "日本精選"} ${layout} 實用性極高特色盤（約 ${priceWans.toLocaleString()} 萬円）`;

  // 12. Dynamic Pros, Cons & Summary based on detected properties
  const pros = [
    `位於 ${locationShort || "熱門區域"} 核心地帶，${stationWalk}，交通生活機能好`,
    `格局為 ${layout}，專有面積達 ${sizeSqm} m²，整體格局極佳`,
    `租賃剛需旺盛，資產折舊合理，保值抗通脹能力優良`
  ];

  const cons = [
    `築年為 ${yearBuilt} 年，購買時需合理考量長期折舊`,
    `管理維護費與大樓修繕基金等維護成本需計入投資帳單`,
  ];
  if (isHouse) {
    cons.push("無大樓物業統一管理，需自行維持外牆與綠化");
  } else {
    cons.push("高樓層臨近海風或低樓層採光需留意空調除濕");
  }

  const priceFriendlyHKD = `${(priceHKD / 10000).toFixed(0)}萬`;
  const summary = `B哥實話實說：呢個位於${locationShort}嘅盤，售價大約 ${priceWans}萬円（折合大約港幣 ${priceFriendlyHKD} ），配上 ${yieldRate}% 回報真係算唔錯！雖然樓齡到咗${2026 - yearBuilt}年，但勝在位置靚，租客源源不絕。對低門檻、想安全穩定收租收息嘅老鐵嚟講，呢個直頭係好車！`;

  const imageUrl = isOsaka 
    ? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600"
    : isHouse
    ? "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600"
    : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600";

  return {
    title,
    priceJPY,
    priceHKD,
    location,
    address,
    layout,
    sizeSqm,
    sizeTsubo,
    yearBuilt,
    yieldRate,
    stationWalk,
    pros,
    cons,
    summary,
    imageUrl,
    propertyType: isHouse ? "house" : "apartment"
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
