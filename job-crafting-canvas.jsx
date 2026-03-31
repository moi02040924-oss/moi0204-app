import { useState, useCallback } from "react";
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

// ── Icons (inline SVG components) ──────────────────────────────────────────
const Sparkles = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" /><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
  </svg>
);
const ArrowRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);
const ArrowLeft = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
);
const CheckCircle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
);
const Loader = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
);
const Trophy = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4a2 2 0 01-2-2V5h4m10 4h2a2 2 0 002-2V5h-4M6 9a6 6 0 0012 0M6 9v3a6 6 0 0012 0V9M9 21h6M12 17v4"/></svg>
);
const Settings = ({ className = "" }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
);
const Users = ({ className = "" }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
);
const Lightbulb = ({ className = "" }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.9V17a1 1 0 001 1h6a1 1 0 001-1v-2.1A7 7 0 0012 2z"/></svg>
);

// ── Constants ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "과업 조각 (Work)", icon: <Settings className="text-blue-500" />, desc: "사장님의 눈으로 업무를 어떻게 바꿀까요?", key: "task", placeholder: "예: 단순 서무 업무를 넘어, 엑셀 수식을 활용해 주간 보고서 양식을 자동화하여 팀원들의 업무 속도를 높이겠습니다." },
  { id: 2, title: "관계 조각 (People)", icon: <Users className="text-rose-500" />, desc: "동료와 상사를 어떤 파트너로 만들까요?", key: "relation", placeholder: "예: 까다로운 상사를 '단골 사장님'으로 생각하고 매일 아침 컨디션을 먼저 살피며 필요한 자료를 미리 준비하겠습니다." },
  { id: 3, title: "의미 조각 (Mind)", icon: <Lightbulb className="text-amber-500" />, desc: "이 일의 진짜 주인공은 누구인가요?", key: "meaning", placeholder: "예: 나는 단순히 밥을 짓는 사람이 아니라, 누군가의 활기찬 오후를 디자인하는 '에너지 셰프'입니다." },
];

// ── Anthropic API call ──────────────────────────────────────────────────────
async function analyzeJobCrafting(data) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `당신은 'Gilbert'라는 세계적인 비즈니스 코치입니다. 소상공인을 위한 잡크래프팅(Job Crafting) 전문가입니다. 
반드시 다음 JSON 형식만 반환하세요 (다른 텍스트 없이):
{
  "scores": { "innovation": 숫자(0-100), "social": 숫자(0-100), "identity": 숫자(0-100) },
  "summary": "전체 계획 핵심 요약 (2-3문장)",
  "advice": "전략적 조언 (1-2문장)",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`,
      messages: [{
        role: "user",
        content: `사용자의 잡크래프팅 계획을 분석해주세요:
1. 과업 조각(Task): ${data.task}
2. 관계 조각(People): ${data.relation}
3. 의미 조각(Mind): ${data.meaning}

JSON만 반환하세요.`
      }]
    })
  });
  const result = await response.json();
  const text = result.content?.[0]?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Radar Chart ─────────────────────────────────────────────────────────────
function RadarViz({ data }) {
  const chartData = [
    { subject: "Innovation", A: data.innovation, fullMark: 100 },
    { subject: "Social", A: data.social, fullMark: 100 },
    { subject: "Identity", A: data.identity, fullMark: 100 },
  ];
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
          <Radar name="분석" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.55} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ task: "", relation: "", meaning: "" });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const currentStepData = STEPS.find(s => s.id === step);

  const handleNext = async () => {
    if (step < 3) { setStep(step + 1); return; }
    setLoading(true); setError(null);
    try {
      const result = await analyzeJobCrafting(data);
      setAnalysis(result);
      setStep(4);
    } catch (e) {
      setError("분석 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setData({ task: "", relation: "", meaning: "" });
    setAnalysis(null);
    setStep(1);
    setError(null);
  };

  const currentKey = currentStepData?.key || "task";
  const canProceed = step === 4 || (data[currentKey] && data[currentKey].trim().length > 0);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "24px 16px", fontFamily: "'Pretendard', sans-serif", color: "#1e293b" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Noto Sans KR', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-in { animation: fadeIn 0.4s ease both; }
        textarea:focus { outline: none; }
        button { cursor: pointer; font-family: inherit; }
        button:disabled { cursor: not-allowed; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 80 }}>

        {/* Header */}
        <header className="fade-up" style={{ textAlign: "center", paddingTop: 32, marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", padding: "8px 20px", borderRadius: 999, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <Sparkles size={18} className="text-yellow-400" style={{ color: "#FBBF24" }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", letterSpacing: "0.25em", textTransform: "uppercase" }}>AI 커리어숲 · Job Crafting Canvas</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: "#0f172a", lineHeight: 1.2, marginBottom: 10 }}>
            사장님의 <span style={{ color: "#2563eb" }}>잡크래프팅</span> 캔버스
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500, fontStyle: "italic" }}>
            "당신의 평범한 업무를 명품 비즈니스로 조각하는 시간"
          </p>
        </header>

        {/* Progress */}
        {step !== 4 && (
          <div className="fade-up" style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 32 }}>
            {STEPS.map(s => (
              <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div onClick={() => step !== 4 && setStep(s.id)} style={{
                  width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
                  background: step === s.id ? "#2563eb" : step > s.id ? "#10b981" : "#fff",
                  color: step >= s.id ? "#fff" : "#cbd5e1",
                  border: step === s.id ? "none" : step > s.id ? "none" : "1px solid #e2e8f0",
                  boxShadow: step === s.id ? "0 4px 14px rgba(37,99,235,0.35)" : "0 1px 3px rgba(0,0,0,0.05)",
                  transform: step === s.id ? "scale(1.1)" : "scale(1)"
                }}>
                  {step > s.id ? <CheckCircle size={20} /> : s.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: step === s.id ? "#2563eb" : "#94a3b8", textTransform: "uppercase" }}>
                  {s.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        {step <= 3 && currentStepData && (
          <div className="fade-up" key={step} style={{ background: "#fff", borderRadius: 32, padding: "clamp(28px, 5vw, 48px)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.8)" }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, background: "#f1f5f9", color: "#64748b", fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                Step 0{step}
              </div>
              <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, color: "#0f172a", lineHeight: 1.3, marginBottom: 6 }}>
                {currentStepData.title}
              </h2>
              <p style={{ color: "#64748b", fontSize: 15, fontWeight: 500 }}>{currentStepData.desc}</p>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 24, border: "1px solid #e2e8f0", padding: "20px 24px", marginBottom: 28, transition: "border-color 0.2s" }}>
              <textarea
                style={{ width: "100%", background: "transparent", border: "none", fontSize: 16, color: "#334155", fontWeight: 500, lineHeight: 1.7, minHeight: 150, resize: "none", fontFamily: "inherit" }}
                placeholder={currentStepData.placeholder}
                value={data[currentKey]}
                onChange={e => setData(prev => ({ ...prev, [currentKey]: e.target.value }))}
              />
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌸</div>
                <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, lineHeight: 1.5 }}>
                  사장님의 진심을<br /><strong style={{ color: "#475569" }}>자유롭게 조각해보세요!</strong>
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 14 }}>
                    <ArrowLeft size={16} /> 이전
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed || loading}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 16, border: "none", background: canProceed && !loading ? "#2563eb" : "#e2e8f0", color: canProceed && !loading ? "#fff" : "#94a3b8", fontWeight: 900, fontSize: 15, boxShadow: canProceed && !loading ? "0 4px 16px rgba(37,99,235,0.3)" : "none", transition: "all 0.2s" }}
                >
                  {loading ? <><Loader size={18} /> 분석 중...</> : <>{step === 3 ? "캔버스 완성하기" : "다음 단계로"} <ArrowRight size={18} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {step === 4 && analysis && (
          <div className="fade-in">
            {/* Main result card */}
            <div style={{ background: "#0f172a", borderRadius: 40, padding: "clamp(28px, 5vw, 48px)", color: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", marginBottom: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, padding: 40, opacity: 0.04, fontSize: 160 }}>🏆</div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32, position: "relative" }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(59,130,246,0.3)", fontSize: 22 }}>🛡️</div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 900, color: "#60a5fa", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 2 }}>Gilbert's Expert Analysis</p>
                  <h3 style={{ fontSize: 22, fontWeight: 900 }}>사장님의 잡크래프팅 진단서</h3>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "center" }}>
                {/* Radar */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 28, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 8px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.15em", textTransform: "uppercase" }}>Growth Matrix</span>
                    <span style={{ fontSize: 14, color: "#60a5fa" }}>🎯</span>
                  </div>
                  <RadarViz data={analysis.scores} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12, textAlign: "center" }}>
                    <div><p style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Task</p><p style={{ fontSize: 18, fontWeight: 900, color: "#60a5fa" }}>{analysis.scores.innovation}</p></div>
                    <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)" }}><p style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Social</p><p style={{ fontSize: 18, fontWeight: 900, color: "#fb7185" }}>{analysis.scores.social}</p></div>
                    <div><p style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Mind</p><p style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24" }}>{analysis.scores.identity}</p></div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {(analysis.keywords || []).map((k, i) => (
                        <span key={i} style={{ padding: "3px 10px", background: "rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 10, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase" }}>#{k}</span>
                      ))}
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8, fontStyle: "italic" }}>💬 전체적인 계획의 핵심</h4>
                    <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75 }}>{analysis.summary}</p>
                  </div>
                  <div style={{ padding: 16, background: "rgba(37,99,235,0.1)", borderRadius: 20, border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "#60a5fa", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>
                      <Trophy size={14} /> Gilbert's Strategic Tip
                    </div>
                    <p style={{ fontSize: 13, color: "#e2e8f0", fontStyle: "italic", lineHeight: 1.7 }}>"{analysis.advice}"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={reset} style={{ background: "#fff", color: "#1e293b", border: "1px solid #e2e8f0", padding: "14px 32px", borderRadius: 20, fontWeight: 900, fontSize: 15, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                새로운 캔버스 작성하기
              </button>
              <button onClick={() => window.print()} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 20, fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
                진단서 저장하기 <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ textAlign: "center", paddingTop: 60 }}>
          <div style={{ width: 40, height: 3, background: "#e2e8f0", margin: "0 auto 16px", borderRadius: 999 }} />
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase" }}>
            AI 커리어숲 · Powered by Claude
          </p>
        </footer>
      </div>
    </div>
  );
}
