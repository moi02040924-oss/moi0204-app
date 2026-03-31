import { useState } from "react";

// ── Claude API ──────────────────────────────────────────────────────────────
async function askClaude(systemPrompt, userPrompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || "응답을 받지 못했어요.";
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") throw new Error("요청 시간이 초과됐어요. 다시 시도해주세요.");
    throw e;
  }
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Noto Sans KR', sans-serif", padding: "0 0 80px" },
  header: { background: "linear-gradient(135deg, #1a3a5c 0%, #2a6a5b 100%)", padding: "32px 24px", textAlign: "center", color: "#fff" },
  headerBadge: { display: "inline-block", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "4px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 },
  headerTitle: { fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, lineHeight: 1.3, marginBottom: 8 },
  headerSub: { fontSize: 14, opacity: 0.75, fontStyle: "italic" },
  nav: { display: "flex", overflowX: "auto", gap: 4, padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0", justifyContent: "center", flexWrap: "wrap" },
  navBtn: (active) => ({ padding: "8px 14px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", background: active ? "#2a6a5b" : "#f1f5f9", color: active ? "#fff" : "#64748b", transition: "all 0.2s", whiteSpace: "nowrap" }),
  body: { maxWidth: 780, margin: "0 auto", padding: "24px 16px" },
  card: { background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: 20 },
  stepBadge: (color) => ({ display: "inline-block", padding: "3px 12px", borderRadius: 999, background: color + "18", color: color, fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }),
  h2: { fontSize: "clamp(18px,3vw,24px)", fontWeight: 900, color: "#1e293b", marginBottom: 6, lineHeight: 1.3 },
  desc: { fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.7 },
  label: { fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, display: "block" },
  input: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", color: "#334155", background: "#f8fafc", resize: "vertical", boxSizing: "border-box" },
  btn: (color = "#2a6a5b", disabled = false) => ({ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 14, border: "none", background: disabled ? "#e2e8f0" : color, color: disabled ? "#94a3b8" : "#fff", fontWeight: 900, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : `0 4px 14px ${color}44`, transition: "all 0.2s", fontFamily: "inherit" }),
  resultBox: { background: "linear-gradient(135deg, #1a3a5c 0%, #1e4d40 100%)", borderRadius: 20, padding: "24px", color: "#fff", marginTop: 16, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.85 },
  tag: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 8, background: color + "18", color: color, fontSize: 11, fontWeight: 700, marginRight: 6, marginBottom: 4 }),
  divider: { height: 1, background: "#f1f5f9", margin: "20px 0" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  arrowBox: { display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#2a6a5b", flexShrink: 0 },
  beforeBox: { background: "#f1f5f9", borderRadius: 16, padding: "16px 20px", flex: 1 },
  afterBox: { background: "linear-gradient(135deg, #2a6a5b18, #1a3a5c18)", border: "1px solid #2a6a5b30", borderRadius: 16, padding: "16px 20px", flex: 1 },
};

// ── Loading Spinner ─────────────────────────────────────────────────────────
function Spinner() {
  return <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

// ── Section 1: 역량 도출 (장사 용어 → 직무 용어) ────────────────────────────
function Step1Skill() {
  const [biz, setBiz] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!biz || !target) return;
    setLoading(true);
    try {
      const r = await askClaude(
        "당신은 소상공인의 자영업 경험을 기업 직무 역량으로 변환해주는 전문 커리어 컨설턴트입니다. 장사 용어를 전문적인 직무 용어(HR, 영업관리, SCM 등)로 변환하고 구체적인 예시를 제공합니다. 반드시 한국어로 응답하세요.",
        `다음 자영업 경험을 "${target}" 직무에 맞는 전문 용어로 변환해주세요.\n\n자영업 경험: ${biz}\n\n형식:\n🔄 변환 결과 (3-5개 항목)\n• [장사 용어] → [직무 용어] : 설명\n\n💡 면접 활용 포인트 (2-3개)\n`
      );
      setResult(r);
    } catch (e) { setResult("오류가 발생했어요. 다시 시도해주세요."); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <div style={S.stepBadge("#2a6a5b")}>Step 1 · 역량 도출</div>
      <h2 style={S.h2}>🏪 '장사' 용어를 '직무' 용어로</h2>
      <p style={S.desc}>자영업 경험을 기업이 이해하는 전문 용어로 변환해드려요.<br />매장청소 → 환경안전관리(EHS), 진상 손님응대 → CS위기관리 및 CX개선</p>

      <label style={S.label}>📝 내 자영업 경험 (구체적으로)</label>
      <textarea style={{ ...S.input, minHeight: 100, marginBottom: 14 }}
        placeholder="예: 매일 재고 관리와 아르바이트생 교육, 컴플레인 응대를 했어. 식자재 원가 절감을 위해 공급업체 3곳을 비교했고, 단골 고객 관리를 위해 SNS 운영도 했음."
        value={biz} onChange={e => setBiz(e.target.value)} />

      <label style={S.label}>🎯 지원하려는 직무</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 20 }}
        placeholder="예: 인사총무, 영업관리, 운영관리, 구매SCM"
        value={target} onChange={e => setTarget(e.target.value)} />

      <button style={S.btn("#2a6a5b", !biz || !target || loading)} onClick={run} disabled={!biz || !target || loading}>
        {loading ? <><Spinner /> 변환 중...</> : "⚡ 직무 용어로 변환하기"}
      </button>

      {result && (
        <>
          <div style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "stretch", flexWrap: "wrap" }}>
            <div style={S.beforeBox}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Before · 장사 용어</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>{biz}</div>
            </div>
            <div style={S.arrowBox}>→</div>
            <div style={S.afterBox}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2a6a5b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>After · 직무 용어</div>
              <div style={{ fontSize: 13, color: "#1e3a2a", lineHeight: 1.8 }}>{result}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Section 2: 미래 전망 ─────────────────────────────────────────────────────
function Step2Future() {
  const [jobTitle, setJobTitle] = useState("");
  const [myExp, setMyExp] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!jobTitle) return;
    setLoading(true);
    try {
      const r = await askClaude(
        "당신은 AI 시대의 직무 미래를 분석하는 전문가입니다. 소상공인의 자영업 경험이 AI 도입 이후 어떤 경쟁력을 가지는지 분석합니다. 반드시 한국어로 응답하세요.",
        `직무: ${jobTitle}\n자영업 경험: ${myExp || "소상공인 3년 이상 운영"}\n\nAI 시대 분석을 해주세요:\n\n🔮 향후 5년 이 직무의 변화 (2-3줄)\n🏆 내 자영업 경험의 차별화된 경쟁력 (3가지)\n⚡ AI가 대체 못하는 나만의 강점 (2-3가지)\n`
      );
      setResult(r);
    } catch (e) { setResult("❌ " + (e.message || "오류가 발생했어요. 다시 시도해주세요.")); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <div style={S.stepBadge("#1a3a5c")}>Step 1-B · 미래 전망</div>
      <h2 style={S.h2}>🔮 AI 시대, 내 경험의 경쟁력은?</h2>
      <p style={S.desc}>AI 도입으로 직무가 변화해도 자영업 경험(대면 고객응대, 돌발 상황대처)이 가지는 차별화된 경쟁력을 분석합니다.</p>

      <label style={S.label}>🎯 추천받은 / 지원할 직무</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 14 }}
        placeholder="예: 고객서비스 매니저, 운영지원, 점포개발"
        value={jobTitle} onChange={e => setJobTitle(e.target.value)} />

      <label style={S.label}>💼 내 자영업 경험 핵심 (선택)</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 20 }}
        placeholder="예: 카페 5년, 대면 고객응대, 알바 관리, 재고/원가 관리"
        value={myExp} onChange={e => setMyExp(e.target.value)} />

      <button style={S.btn("#1a3a5c", !jobTitle || loading)} onClick={run} disabled={!jobTitle || loading}>
        {loading ? <><Spinner /> 분석 중...</> : "🔮 AI 시대 경쟁력 분석하기"}
      </button>

      {result && <div style={S.resultBox}>{result}</div>}
    </div>
  );
}

// ── Section 3: 기업 분석 ─────────────────────────────────────────────────────
function Step2BizAnalysis() {
  const [company, setCompany] = useState("");
  const [myStrength, setMyStrength] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!company) return;
    setLoading(true);
    try {
      const r = await askClaude(
        "당신은 기업 분석 전문가입니다. 취업 준비생이 타겟 기업의 도전과제를 파악하고 자신의 경험을 연결하도록 돕습니다. 반드시 한국어로 응답하세요.",
        `기업명: ${company}\n내 자영업 경험: ${myStrength || "소상공인 운영 경험 (매출 관리, 원가절감, 고객관리)"}\n\n다음을 분석해주세요:\n\n🏢 현재 이 회사가 겪고 있는 주요 도전과제 3가지\n💡 내 자영업 경험(매출 하락 방어, 비용절감)으로 기여할 수 있는 구체적 포인트 3가지\n🎯 면접에서 활용할 수 있는 연결 멘트 1개\n`
      );
      setResult(r);
    } catch (e) { setResult("❌ " + (e.message || "오류가 발생했어요. 다시 시도해주세요.")); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <div style={S.stepBadge("#7c3aed")}>Step 2 · 기업 분석</div>
      <h2 style={S.h2}>🔍 회사의 '가려운 곳' 찾기</h2>
      <p style={S.desc}>회사가 겪고 있는 어려움을 파악하고, 내 자영업 경험이 어디서 빛날 수 있는지 찾아드려요.</p>

      <label style={S.label}>🏢 지원할 기업명</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 14 }}
        placeholder="예: 스타벅스코리아, CJ푸드빌, 카카오"
        value={company} onChange={e => setCompany(e.target.value)} />

      <label style={S.label}>💼 내 자영업 핵심 강점 (선택)</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 20 }}
        placeholder="예: 매출 하락 방어 경험, 원가절감, 고객 재방문율 관리"
        value={myStrength} onChange={e => setMyStrength(e.target.value)} />

      <button style={S.btn("#7c3aed", !company || loading)} onClick={run} disabled={!company || loading}>
        {loading ? <><Spinner /> 분석 중...</> : "🔍 기업 가려운 곳 찾기"}
      </button>

      {result && <div style={S.resultBox}>{result}</div>}
    </div>
  );
}

// ── Section 4: 문화 적응 ─────────────────────────────────────────────────────
function Step2Culture() {
  const [company, setCompany] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!company) return;
    setLoading(true);
    try {
      const r = await askClaude(
        "당신은 조직 문화 분석 전문가입니다. 자영업자가 직장인으로 전환할 때 문화 적응 전략을 제시합니다. 반드시 한국어로 응답하세요.",
        `기업명: ${company}\n\n다음을 분석해주세요:\n\n🏛️ 이 회사의 조직문화 특성 (수직적/수평적, 협업방식)\n⚠️ 전직 자영업자가 주의해야 할 문화 충돌 포인트 2-3가지\n✅ 면접에서 어필해야 할 태도와 멘트 (협업, 경청 중심) 3가지\n💬 "사장처럼 행동한다"는 오해를 방지하는 표현 2가지\n`
      );
      setResult(r);
    } catch (e) { setResult("❌ " + (e.message || "오류가 발생했어요. 다시 시도해주세요.")); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <div style={S.stepBadge("#db7706")}>Step 2 · 문화 적응</div>
      <h2 style={S.h2}>🤝 리더에서 팀원으로</h2>
      <p style={S.desc}>사장님 마인드에서 팀원 마인드로 전환하는 법. 조직문화를 파악하고 면접에서 융화될 수 있는 태도를 준비해요.</p>

      <label style={S.label}>🏢 지원할 기업명</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 20 }}
        placeholder="예: 삼성전자, 현대백화점, 이마트"
        value={company} onChange={e => setCompany(e.target.value)} />

      <button style={S.btn("#db7706", !company || loading)} onClick={run} disabled={!company || loading}>
        {loading ? <><Spinner /> 분석 중...</> : "🤝 조직문화 적응 전략 받기"}
      </button>

      {result && <div style={S.resultBox}>{result}</div>}
    </div>
  );
}

// ── Section 5: 이력서 숫자 변환 ──────────────────────────────────────────────
function Step3Resume() {
  const [rawText, setRawText] = useState("");
  const [metrics, setMetrics] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!rawText) return;
    setLoading(true);
    try {
      const r = await askClaude(
        "당신은 이력서 전문 컨설턴트입니다. 자영업자의 단순 업무 나열을 성과 중심의 숫자가 포함된 문장으로 변환합니다. STAR 기법을 활용하세요. 반드시 한국어로 응답하세요.",
        `원본 이력서 내용: ${rawText}\n보유 성과 데이터: ${metrics || "없음"}\n\n다음 형식으로 변환해주세요:\n\n❌ Before (기존 문장)\n✅ After (성과 중심 변환) x 3가지 버전\n\n각 After 버전은 반드시:\n- 구체적인 숫자나 퍼센트 포함\n- 행동 + 결과 구조\n- 10-30단어 내외\n`
      );
      setResult(r);
    } catch (e) { setResult("❌ " + (e.message || "오류가 발생했어요. 다시 시도해주세요.")); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <div style={S.stepBadge("#dc2626")}>Step 3 · 이력서</div>
      <h2 style={S.h2}>📊 '열심히했다' 대신 '숫자'로 증명하라</h2>
      <p style={S.desc}>단순 업무 나열을 성과 중심 문장으로 바꿔드려요. 카페 운영 → 월 평균 고객 3,000명, 매출 20% 증대 달성</p>

      <label style={S.label}>📝 현재 이력서의 운영업무 항목</label>
      <textarea style={{ ...S.input, minHeight: 90, marginBottom: 14 }}
        placeholder="예: 카페 운영 및 커피 제조, 손님 응대. 재고 관리 및 아르바이트생 교육."
        value={rawText} onChange={e => setRawText(e.target.value)} />

      <label style={S.label}>📈 가지고 있는 성과 데이터 (있으면 입력)</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 20 }}
        placeholder="예: 월 매출 2,000만원, 재방문율 40%, 알바 3명 관리, 원가절감 15%"
        value={metrics} onChange={e => setMetrics(e.target.value)} />

      <button style={S.btn("#dc2626", !rawText || loading)} onClick={run} disabled={!rawText || loading}>
        {loading ? <><Spinner /> 변환 중...</> : "📊 숫자로 증명하기"}
      </button>

      {result && <div style={S.resultBox}>{result}</div>}
    </div>
  );
}

// ── Section 6: 타겟 기업 찾기 ────────────────────────────────────────────────
function Step2Target() {
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [myStrength, setMyStrength] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!industry) return;
    setLoading(true);
    try {
      const r = await askClaude(
        "당신은 취업 전문 컨설턴트입니다. 자영업 경험을 가진 구직자에게 '오너십'을 가치있게 여기는 기업을 추천합니다. 반드시 한국어로 응답하세요.",
        `관심 산업군: ${industry}\n선호 지역: ${location || "수도권"}\n나의 강점: ${myStrength || "자영업 운영 경험, 주도적 문제해결"}\n\n다음을 추천해주세요:\n\n🎯 오너십·실무 경험을 우대하는 중소/중견기업 또는 스타트업 5곳\n각 기업마다:\n- 회사명 + 특징 1줄\n- 내 강점이 빛날 수 있는 이유\n- 예상 지원 직무\n`
      );
      setResult(r);
    } catch (e) { setResult("❌ " + (e.message || "오류가 발생했어요. 다시 시도해주세요.")); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <div style={S.stepBadge("#059669")}>Step 2 · 타겟 기업</div>
      <h2 style={S.h2}>🎯 '오너십'을 원석으로 여기는 곳 찾기</h2>
      <p style={S.desc}>신입공채보다 실무경험과 문제해결 능력을 중시하는 기업, 주도적 업무환경을 가진 기업을 찾아드려요.</p>

      <label style={S.label}>🏭 관심 산업군</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 14 }}
        placeholder="예: 식품/외식, 유통/리테일, 프랜차이즈, B2B서비스"
        value={industry} onChange={e => setIndustry(e.target.value)} />

      <div style={S.twoCol}>
        <div>
          <label style={S.label}>📍 선호 지역</label>
          <input style={{ ...S.input, minHeight: "auto", marginBottom: 14 }}
            placeholder="예: 경기 화성, 수도권"
            value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div>
          <label style={S.label}>💪 내 핵심 강점</label>
          <input style={{ ...S.input, minHeight: "auto", marginBottom: 14 }}
            placeholder="예: 원가절감, 고객관리, 위기대처"
            value={myStrength} onChange={e => setMyStrength(e.target.value)} />
        </div>
      </div>

      <button style={S.btn("#059669", !industry || loading)} onClick={run} disabled={!industry || loading}>
        {loading ? <><Spinner /> 탐색 중...</> : "🎯 나에게 맞는 기업 5곳 찾기"}
      </button>

      {result && <div style={S.resultBox}>{result}</div>}
    </div>
  );
}

// ── Section 7: 실전면접 ──────────────────────────────────────────────────────
function StepInterview() {
  const [question, setQuestion] = useState("");
  const [customQ, setCustomQ] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const presetQs = [
    "다시 창업하실 건가요?",
    "회사 생활이 답답하지 않겠어요?",
    "직원이라는 위치에 적응할 수 있을까요?",
    "왜 취업을 선택하셨나요?",
    "상사 지시가 틀렸다고 생각하면 어떻게 하시겠어요?"
  ];

  const run = async () => {
    const q = customQ || question;
    if (!q) return;
    setLoading(true);
    try {
      const r = await askClaude(
        "당신은 면접 코칭 전문가입니다. 전직 자영업자가 기업 면접에서 받는 까다로운 질문에 조직 안정성과 팀워크를 강조하는 현명한 답변을 제시합니다. 반드시 한국어로 응답하세요.",
        `면접 질문: "${q}"\n\n이 질문에 대한 현명한 답변 3가지 버전을 만들어주세요:\n\n🅐 [안정 강조형] - 조직 안정성과 소속감 어필\n🅑 [성장 강조형] - 배움과 기여 의지 어필\n🅒 [경험 연결형] - 자영업 경험이 오히려 강점임을 어필\n\n각 버전은 2-4문장으로 자연스럽게.\n마지막에 ⚠️ 절대 하면 안 되는 말 1가지도 포함해주세요.\n`
      );
      setResult(r);
    } catch (e) { setResult("❌ " + (e.message || "오류가 발생했어요. 다시 시도해주세요.")); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <div style={S.stepBadge("#9333ea")}>실전 면접</div>
      <h2 style={S.h2}>💬 "다시 사업하실 건가요?" 질문 공략</h2>
      <p style={S.desc}>전직 자영업자에게 던지는 까다로운 면접 질문. 조직 안정성과 팀워크를 강조하는 현명한 답변 3가지 버전을 준비하세요.</p>

      <label style={S.label}>자주 나오는 질문 선택</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {presetQs.map(q => (
          <button key={q} onClick={() => { setQuestion(q); setCustomQ(""); }}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${question === q ? "#9333ea" : "#e2e8f0"}`, background: question === q ? "#9333ea15" : "#fff", color: question === q ? "#9333ea" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {q}
          </button>
        ))}
      </div>

      <label style={S.label}>✏️ 직접 입력 (다른 질문이 있다면)</label>
      <input style={{ ...S.input, minHeight: "auto", marginBottom: 20 }}
        placeholder="예: 우리 회사 연봉이 기대에 못 미치면 어떻게 하실 건가요?"
        value={customQ} onChange={e => { setCustomQ(e.target.value); setQuestion(""); }} />

      <button style={S.btn("#9333ea", (!question && !customQ) || loading)} onClick={run} disabled={(!question && !customQ) || loading}>
        {loading ? <><Spinner /> 답변 생성 중...</> : "💬 현명한 답변 3가지 만들기"}
      </button>

      {result && <div style={S.resultBox}>{result}</div>}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "skill", label: "① 역량변환", emoji: "🏪" },
  { id: "future", label: "② AI경쟁력", emoji: "🔮" },
  { id: "biz", label: "③ 기업분석", emoji: "🔍" },
  { id: "culture", label: "④ 문화적응", emoji: "🤝" },
  { id: "target", label: "⑤ 타겟기업", emoji: "🎯" },
  { id: "resume", label: "⑥ 이력서", emoji: "📊" },
  { id: "interview", label: "⑦ 면접공략", emoji: "💬" },
];

export default function App() {
  const [tab, setTab] = useState("skill");

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        input, textarea { font-family: 'Noto Sans KR', sans-serif; }
        textarea:focus, input:focus { outline: 2px solid #2a6a5b; border-color: transparent; }
      `}</style>

      <header style={S.header}>
        <div style={S.headerBadge}>AI 커리어숲 · Human Touch Advantage</div>
        <h1 style={S.headerTitle}>사장님의 역량을<br />조직의 역량으로 🌿</h1>
        <p style={S.headerSub}>"자영업 경험이 곧 경쟁력입니다 — 언어만 바꾸면 됩니다"</p>
      </header>

      <nav style={S.nav}>
        {TABS.map(t => (
          <button key={t.id} style={S.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      <div style={S.body} key={tab} className="fade-up">
        {tab === "skill" && <Step1Skill />}
        {tab === "future" && <Step2Future />}
        {tab === "biz" && <Step2BizAnalysis />}
        {tab === "culture" && <Step2Culture />}
        {tab === "target" && <Step2Target />}
        {tab === "resume" && <Step3Resume />}
        {tab === "interview" && <StepInterview />}

        <div style={{ textAlign: "center", paddingTop: 20 }}>
          <div style={{ width: 32, height: 2, background: "#e2e8f0", margin: "0 auto 10px", borderRadius: 999 }} />
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase" }}>
            AI 커리어숲 · Powered by Claude · careerforest.co.kr
          </p>
        </div>
      </div>
    </div>
  );
}
