import React from "react";
import { PlatformMetric, TrendData } from "../types";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  Heart, 
  Eye, 
  MessageSquare, 
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  Briefcase
} from "lucide-react";

interface AnalyticsTabProps {
  metrics: PlatformMetric[];
  trendData: TrendData[];
}

export default function AnalyticsTab({ metrics, trendData }: AnalyticsTabProps) {
  // Aggregate Metrics Calculations
  const totals = metrics.reduce(
    (acc, m) => {
      acc.views += m.views;
      acc.likes += m.likes;
      acc.inquiries += m.inquiries;
      acc.converted += m.converted;
      return acc;
    },
    { views: 0, likes: 0, inquiries: 0, converted: 0 }
  );

  // Highest Performing platform calculation
  const topPlatform = [...metrics].sort((a,b) => b.views - a.views)[0];

  return (
    <div className="space-y-6" id="analytics-tab-container">
      {/* Header Summary */}
      <div>
        <h1 className="text-2xl font-display font-medium text-stone-900">
          自媒體爆款轉換效能與流量營運分析
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          B哥專屬爆款房產視頻轉化數據。此處統計所有發佈內容為您的私域（預約及成交）帶來的增量效能。
        </p>
      </div>

      {/* Aggregate metrics bento style cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="analytics-overview-kpis">
        {/* KPI: Views */}
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="analytic-kpi-views">
          <div className="flex justify-between items-start">
            <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider block">全網總播放量</span>
            <div className="p-1.5 bg-stone-100 rounded text-stone-700">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2.5xl font-display font-bold text-stone-900">{(totals.views / 10000).toFixed(1)} 萬</span>
            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[10px] font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>較上週 +12.4%</span>
            </div>
          </div>
        </div>

        {/* KPI: Likes */}
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="analytic-kpi-likes">
          <div className="flex justify-between items-start">
            <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider block">點讚與收藏數</span>
            <div className="p-1.5 bg-stone-100 rounded text-stone-700">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2.5xl font-display font-bold text-stone-900">{(totals.likes / 10000).toFixed(1)} 萬</span>
            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[10px] font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>互動率 9.1%</span>
            </div>
          </div>
        </div>

        {/* KPI: Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="analytic-kpi-inquiries">
          <div className="flex justify-between items-start">
            <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider block">私域諮詢量 (+1)</span>
            <div className="p-1.5 bg-[#d4af37]/10 rounded text-[#a5811c]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2.5xl font-display font-bold text-stone-900">{totals.inquiries.toLocaleString()} 次</span>
            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[10px] font-semibold">
              <span>轉化轉骨率 0.12%</span>
            </div>
          </div>
        </div>

        {/* KPI: Deals */}
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs premium-card" id="analytic-kpi-deals">
          <div className="flex justify-between items-start">
            <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider block">成功促成交易件數</span>
            <div className="p-1.5 bg-[#1B4332]/10 rounded text-[#1B4332]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2.5xl font-display font-bold text-stone-900">{totals.converted} 件</span>
            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[10px] font-semibold">
              <Sparkles className="w-3 h-3 mr-1"/>
              <span>最佳留存: {topPlatform?.platform || "無"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic recharts graphs block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-charts-grid">
        {/* Trend line chart: views vs inquiries */}
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs flex flex-col space-y-4" id="analytic-chart-trend">
          <div>
            <h3 className="text-xs font-semibold text-stone-850 uppercase tracking-wider">最近 15 天播放量與諮詢轉化趨勢圖</h3>
            <p className="text-stone-400 text-[10px]">隨著 B哥 誠實避坑短片持續發酵，播放數和精準客戶諮詢量呈指數上升</p>
          </div>
          <div className="h-64 w-full text-[10px] font-sans" id="trend-line-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f3" />
                <XAxis dataKey="date" stroke="#888888" tickLine={false} />
                <YAxis yAxisId="left" stroke="#888888" orientation="left" label={{ value: '宣傳播放', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" stroke="#d4af37" orientation="right" label={{ value: '客戶諮詢', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="views" name="全網播放次" stroke="#1B4332" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="inquiries" name="買家諮詢(+1)" stroke="#d4af37" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart: platform comparison */}
        <div className="bg-white p-5 rounded-xl border border-[#EFEFEA] shadow-xs flex flex-col space-y-4" id="analytic-chart-platforms">
          <div>
            <h3 className="text-xs font-semibold text-stone-850 uppercase tracking-wider">社群平台曝光與留存效能對比</h3>
            <p className="text-stone-400 text-[10px]">對比不同社群管道的私域轉化深度，優化視頻長度比例與風格搭配</p>
          </div>
          <div className="h-64 w-full text-[10px] font-sans" id="platform-bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f3" />
                <XAxis dataKey="platform" stroke="#888888" tickLine={false} />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" name="曝光播放次 (Views)" fill="#2F4F4F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inquiries" name="獲得意向諮詢 (Inquires)" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Structured metrics analytical table */}
      <div className="bg-white rounded-xl border border-[#EFEFEA] overflow-hidden shadow-xs" id="analytics-table-box">
        <div className="p-4 bg-stone-50 border-b border-[#EFEFEA] flex justify-between items-center">
          <h3 className="text-xs font-semibold text-stone-850 uppercase tracking-wider">分發管道核心 ROI 精算報表</h3>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
            綜合爆款 ROI: +217.5% 平均高效回報
          </span>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/50 text-stone-500 font-medium border-b border-stone-200">
                <th className="p-3.5 pl-5">投放管道</th>
                <th className="p-3.5">全網播放量</th>
                <th className="p-3.5">點讚收藏</th>
                <th className="p-3.5">意向客戶諮詢</th>
                <th className="p-3.5">促成交易 (Deals)</th>
                <th className="p-3.5">點閱轉化比 (CTR)</th>
                <th className="p-3.5 pr-5 text-right">投報能率 (ROI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {metrics.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-3.5 pl-5 font-semibold text-stone-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                    <span>{row.platform}</span>
                  </td>
                  <td className="p-3.5">{row.views.toLocaleString()} 次</td>
                  <td className="p-3.5">{row.likes.toLocaleString()} 次</td>
                  <td className="p-3.5 font-mono font-medium text-[#a5811c]">{row.inquiries} 次</td>
                  <td className="p-3.5 font-bold text-emerald-800">{row.converted} 件</td>
                  <td className="p-3.5 font-mono">{row.ctr}%</td>
                  <td className="p-3.5 pr-5 font-bold text-right font-mono text-[#a5811c]">+{row.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic actionable recommendation summary */}
      <div className="p-4 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          <Sparkles className="w-5 h-5 text-[#ebd281] shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="text-xs font-semibold text-[#ebd281] block">📢 B哥 AI 智慧媒體策略師對策 :</span>
            <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed max-w-2xl">
              「數據顯示，**小紅書**的實體精緻高格調風格點讚收藏率最高，而 **YouTube 長影片**則是精準客戶諮詢留存『+1』的主力渠道（每 23 次諮詢就能促成一件高價值交易，轉化率傲視全群）。建議接下來的新大阪民宿盤，採用 YouTube 12分鐘『毒舌吐槽風』深度講帳，並搭配小紅書 1分鐘『侘寂小資房產開箱』，進行全方位爆款交叉分攤投射，引爆私域流量！」
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-stone-950 px-3 py-1.5 rounded-lg text-emerald-500 font-bold tracking-wider uppercase">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>建議加大投入</span>
        </div>
      </div>
    </div>
  );
}
