import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════════════
   시스템 프롬프트
══════════════════════════════════════════════ */
const COMIC_SYSTEM = `당신은 '장사생각' 4컷 만화 작가입니다.
'광수생각' 스타일 — 소박하고 따뜻한 그림체, 소상공인의 일상과 감정을 공감 가득하게 담아내는 만화입니다.

반드시 순수 JSON만 응답 (코드블록 없이).

만화 작성 원칙:
- 소상공인(사장님)의 현실적이고 공감되는 하루
- 웃음 속에 위로, 쓴웃음과 따뜻함이 공존
- 1컷: 상황 설정 (문제나 기대)
- 2컷: 갈등 or 전개
- 3컷: 반전 or 절정
- 4컷: 마무리 (따뜻한 결말 or 씁쓸한 공감)
- 캐릭터: 사장님(중년, 앞치마), 손님, 직원 등
- 감성 태그: 공감/웃음/위로/희망 중 택1`;

const NEWS_SYSTEM = `당신은 소상공인 전문 뉴스 에디터입니다.
복잡한 정책·경제 뉴스를 소상공인 사장님이 바로 이해하고 행동할 수 있도록 재편집합니다.

뉴스 재편집 원칙:
- "사장님에게 뭐가 좋아지나요?" 관점
- 어려운 용어 → 쉬운 말로
- 신청 방법·기한 명확히
- 실질적 금액·혜택 강조
- 3줄 요약 반드시 포함
- 말투: 친근하고 신뢰감 있는 (예: "~입니다", "~하세요")

반드시 순수 JSON만 응답.`;

const NEWSLETTER_SYSTEM = `당신은 소상공인 뉴스레터 편집장입니다.
매주 소상공인을 위한 따뜻하고 실용적인 뉴스레터를 발행합니다.
현재 날짜 기준 최신 소상공인 정책·트렌드·생존 팁을 담아 재편집합니다.
반드시 순수 JSON만 응답.`;

/* ══════════════════════════════════════════════
   뉴스 카테고리 (실제 소상공인 관심사 기반)
══════════════════════════════════════════════ */
const NEWS_TOPICS = [
  { id:"policy",  label:"지원금·보조금",  icon:"💰", color:"#059669" },
  { id:"tax",     label:"세금·절세",       icon:"🧾", color:"#2563eb" },
  { id:"rent",    label:"임대료·상권",     icon:"🏪", color:"#d97706" },
  { id:"labor",   label:"고용·인건비",     icon:"👥", color:"#7c3aed" },
  { id:"digital", label:"디지털·마케팅",   icon:"📱", color:"#06b6d4" },
  { id:"trend",   label:"소비트렌드",      icon:"📊", color:"#e11d48" },
];

const COMIC_THEMES = [
  "배달 앱 수수료에 분노하는 사장님",
  "손님이 없는 평일 오후",
  "리뷰 하나에 하루가 달라지는 사장님",
  "최저임금 인상 공지를 보는 사장님",
  "단골손님이 오랜만에 찾아온 날",
  "폭우에도 문 여는 사장님",
  "음식 사진 찍는 손님과 사장님",
  "직원이 갑자기 그만두는 날",
  "정부 지원금 신청하다 포기하는 사장님",
  "장사 잘 되는 옆집을 보는 사장님",
];

/* ══════════════════════════════════════════════
   SVG 만화 캐릭터 (광수생각 스타일 간략화)
══════════════════════════════════════════════ */
function ComicCharacter({ type = "boss", expression = "normal", size = 60 }) {
  const expressions = {
    normal:  { eyes: "😐", offset: 0 },
    happy:   { eyes: "😊", offset: 0 },
    sad:     { eyes: "😢", offset: 0 },
    angry:   { eyes: "😤", offset: 0 },
    shock:   { eyes: "😲", offset: 0 },
    smile:   { eyes: "🙂", offset: 0 },
    cry:     { eyes: "😭", offset: 0 },
    sigh:    { eyes: "😔", offset: 0 },
    laugh:   { eyes: "😄", offset: 0 },
    worried: { eyes: "😟", offset: 0 },
  };
  const exp = expressions[expression] || expressions.normal;

  const chars = {
    boss:     { body: "#f97316", head: "#fbbf24", item: "앞치마" },
    customer: { body: "#3b82f6", head: "#93c5fd", item: "" },
    staff:    { body: "#10b981", head: "#6ee7b7", item: "" },
    wife:     { body: "#ec4899", head: "#fbcfe8", item: "" },
  };
  const char = chars[type] || chars.boss;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      {/* 머리 */}
      <div style={{ width: size * 0.55, height: size * 0.55, borderRadius: "50%", background: char.head, border: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, position: "relative" }}>
        {exp.eyes}
      </div>
      {/* 몸 */}
      <div style={{ width: size * 0.5, height: size * 0.6, borderRadius: "8px 8px 4px 4px", background: char.body, border: "2px solid #1a1a1a", position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "3px" }}>
        {type === "boss" && <div style={{ fontSize: size * 0.13, color: "#fff", fontWeight: "700" }}>앞치마</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   4컷 만화 패널
══════════════════════════════════════════════ */
function ComicPanel({ panel, index }) {
  if (!panel) return null;
  const { scene, dialogue, expression = "normal", characters = ["boss"], bg = "#fffbeb", sfx = "" } = panel;

  const bgColors = ["#fffbeb","#f0fdf4","#eff6ff","#fdf4ff"];
  const panelBg = bg || bgColors[index % 4];

  return (
    <div style={{ border: "2.5px solid #1a1a1a", borderRadius: index === 0 ? "12px 4px 4px 4px" : index === 1 ? "4px 12px 4px 4px" : index === 2 ? "4px 4px 4px 12px" : "4px 4px 12px 4px", background: panelBg, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* 컷 번호 */}
      <div style={{ position: "absolute", top: "5px", left: "7px", width: "18px", height: "18px", borderRadius: "50%", background: "#1a1a1a", color: "#fff", fontSize: "10px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>{index + 1}</div>

      {/* 배경 장면 묘사 */}
      <div style={{ fontSize: "9px", color: "#92400e", textAlign: "center", padding: "18px 6px 4px", fontStyle: "italic", minHeight: "24px" }}>{scene}</div>

      {/* 캐릭터 영역 */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "8px", padding: "4px 8px", minHeight: "70px" }}>
        {characters.map((c, i) => (
          <ComicCharacter key={i} type={c} expression={expression} size={52} />
        ))}
      </div>

      {/* 효과음 */}
      {sfx && (
        <div style={{ position: "absolute", top: "20px", right: "6px", fontSize: "11px", fontWeight: "900", color: "#dc2626", transform: "rotate(5deg)", textShadow: "1px 1px 0 #fff" }}>{sfx}</div>
      )}

      {/* 말풍선 */}
      {dialogue && (
        <div style={{ margin: "4px 7px 7px", background: "#fff", border: "2px solid #1a1a1a", borderRadius: "10px", padding: "5px 8px", fontSize: "11px", fontWeight: "600", color: "#1a1a1a", lineHeight: "1.5", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "-7px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "7px", background: "#fff", borderLeft: "2px solid #1a1a1a", borderTop: "2px solid #1a1a1a", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
          {dialogue}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   뉴스 카드
══════════════════════════════════════════════ */
function NewsCard({ news, index }) {
  const { title, summary, threeLines, category, importance, actionTip, deadline, amount } = news;
  const catInfo = NEWS_TOPICS.find(t => t.id === category) || NEWS_TOPICS[0];

  return (
    <div style={{ background: "#fff", border: `1px solid ${catInfo.color}33`, borderLeft: `4px solid ${catInfo.color}`, borderRadius: "12px", padding: "14px", marginBottom: "11px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>{catInfo.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ background: `${catInfo.color}18`, color: catInfo.color, borderRadius: "20px", padding: "1px 8px", fontSize: "10px", fontWeight: "700" }}>{catInfo.label}</span>
            {importance === "high" && <span style={{ background: "#fef2f2", color: "#dc2626", borderRadius: "20px", padding: "1px 8px", fontSize: "10px", fontWeight: "700" }}>🔥 중요</span>}
            {deadline && <span style={{ background: "#fffbeb", color: "#d97706", borderRadius: "20px", padding: "1px 8px", fontSize: "10px", fontWeight: "700" }}>⏰ {deadline}</span>}
          </div>
          <div style={{ fontWeight: "800", fontSize: "14px", color: "#111827", lineHeight: "1.4" }}>{title}</div>
        </div>
      </div>

      {/* 3줄 요약 */}
      {threeLines && (
        <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 12px", marginBottom: "9px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>📌 핵심 3줄 요약</div>
          {threeLines.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "3px", fontSize: "12px", color: "#374151" }}>
              <span style={{ color: catInfo.color, fontWeight: "700", flexShrink: 0 }}>{i + 1}.</span>{line}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: "12.5px", color: "#4b5563", lineHeight: "1.75", marginBottom: amount || actionTip ? "9px" : 0 }}>{summary}</div>

      {amount && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "7px 11px", marginBottom: "7px", display: "flex", gap: "7px", alignItems: "center" }}>
          <span style={{ fontSize: "14px" }}>💵</span>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#065f46" }}>{amount}</span>
        </div>
      )}

      {actionTip && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "7px 11px", display: "flex", gap: "7px", alignItems: "center" }}>
          <span style={{ fontSize: "13px" }}>👉</span>
          <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: "600" }}>{actionTip}</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   메인 앱
══════════════════════════════════════════════ */
export default function NewsletterBot() {
  const [phase, setPhase]           = useState("setup"); // setup | generating | result
  const [activeTab, setActiveTab]   = useState("preview"); // preview | comic | news | chat
  const [loading, setLoading]       = useState({ comic: false, news: false, all: false });
  const [comic, setComic]           = useState(null);
  const [newsItems, setNewsItems]   = useState([]);
  const [nlData, setNlData]         = useState(null); // 뉴스레터 메타
  const [chatHistory, setChat]      = useState([]);
  const [chatInput, setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef                  = useRef();
  const printRef                    = useRef();

  /* 설정 상태 */
  const [editorName, setEditorName] = useState("커리어포레스트");
  const [issueNo, setIssueNo]       = useState("1");
  const [comicTheme, setComicTheme] = useState(COMIC_THEMES[0]);
  const [customTheme, setCustomTheme]= useState("");
  const [selCategories, setSelCats] = useState(["policy","tax","digital"]);
  const [targetReader, setTargetReader] = useState("소상공인 사장님");

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, chatLoading]);

  const toggleCat = (id) => setSelCats(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  /* ── 4컷 만화 생성 ── */
  const generateComic = async () => {
    setLoading(p => ({ ...p, comic: true }));
    const theme = customTheme || comicTheme;
    const prompt = `소상공인 4컷 만화 '장사생각' 주제: "${theme}"

광수생각 스타일로 따뜻하고 공감되는 4컷 만화를 JSON으로 작성하세요.

{
  "title": "이번 화 제목",
  "emotion": "공감/웃음/위로/희망 중 하나",
  "tagline": "한 줄 감성 문구",
  "panels": [
    {
      "scene": "장면 배경 설명 (15자 이내)",
      "characters": ["boss"],
      "expression": "normal/happy/sad/angry/shock/smile/cry/sigh/laugh/worried 중 하나",
      "dialogue": "대사 또는 독백 (30자 이내)",
      "sfx": "효과음 (선택, 예: 땡그랑~, 쾅!, 훌쩍..)",
      "bg": "#hex 배경색"
    },
    { "scene":"...", "characters":["boss","customer"], "expression":"...", "dialogue":"...", "sfx":"", "bg":"#hex" },
    { "scene":"...", "characters":["boss"], "expression":"...", "dialogue":"...", "sfx":"", "bg":"#hex" },
    { "scene":"...", "characters":["boss"], "expression":"...", "dialogue":"...", "sfx":"", "bg":"#hex" }
  ]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: COMIC_SYSTEM, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      let text = data.content?.[0]?.text || "{}";
      text = text.replace(/```json|```/g, "").trim();
      setComic(JSON.parse(text));
    } catch (e) { console.error(e); }
    finally { setLoading(p => ({ ...p, comic: false })); }
  };

  /* ── 뉴스 생성 ── */
  const generateNews = async () => {
    setLoading(p => ({ ...p, news: true }));
    const catLabels = selCategories.map(id => NEWS_TOPICS.find(t => t.id === id)?.label).join(", ");
    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

    const prompt = `오늘(${today}) 기준 소상공인 관련 최신 정책·지원·뉴스를 재편집하세요.
분야: ${catLabels}
대상 독자: ${targetReader}

현실적으로 ${today} 시점에 소상공인에게 중요한 다음 정책·뉴스들을 바탕으로 재편집:
- 2026년 희망리턴패키지 (사업정리컨설팅, 전직장려수당 최대 100만원, 점포철거비)
- 소상공인 전기요금 특례 할인
- 최저임금 인상 관련 소상공인 지원 방안
- 배달앱 수수료 관련 정책
- 소상공인 디지털화 지원사업
- 노란우산공제 세금혜택
- 소상공인 저금리 대출 (소진공)
- 중소기업 간이과세 기준 상향
위 주제 중 선택한 분야(${catLabels})에 맞게 3~4개 뉴스 재편집.

JSON:
{
  "newsletterTitle": "뉴스레터 제목 (감성적으로)",
  "editorNote": "편집장 인사말 (2~3문장, 따뜻하게)",
  "weeklyWord": "이주의 사장님 한마디 (짧은 명언/격언)",
  "news": [
    {
      "title": "소상공인 관점 제목",
      "category": "policy/tax/rent/labor/digital/trend 중 하나",
      "importance": "high/normal",
      "threeLines": ["핵심1","핵심2","핵심3"],
      "summary": "2~3문장 재편집 내용",
      "amount": "금액·혜택 (있으면)",
      "actionTip": "지금 바로 할 수 있는 행동",
      "deadline": "기한 (있으면)"
    }
  ]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: NEWS_SYSTEM, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      let text = data.content?.[0]?.text || "{}";
      text = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setNlData({ title: parsed.newsletterTitle, editorNote: parsed.editorNote, weeklyWord: parsed.weeklyWord });
      setNewsItems(parsed.news || []);
    } catch (e) { console.error(e); }
    finally { setLoading(p => ({ ...p, news: false })); }
  };

  /* ── 전체 생성 ── */
  const generateAll = async () => {
    setLoading(p => ({ ...p, all: true }));
    setPhase("result");
    setActiveTab("preview");
    await Promise.all([generateComic(), generateNews()]);
    setLoading(p => ({ ...p, all: false }));
    setChat([{ role: "assistant", content: `🗞️ **${editorName}** 제${issueNo}호 뉴스레터가 완성됐어요!\n\n📰 만화·뉴스 탭에서 각각 확인하고, 수정이 필요하면 말씀해 주세요.\n\n💡 "만화 다시 만들어줘", "뉴스 추가해줘", "편집장 인사말 수정" 등 자유롭게 요청하세요!` }]);
  };

  /* ── 채팅 ── */
  const sendChat = async (msg) => {
    const text = msg || chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    const newH = [...chatHistory, { role: "user", content: text }];
    setChat(newH);
    setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `당신은 소상공인 뉴스레터 편집 어시스턴트입니다. 현재 뉴스레터: ${JSON.stringify({ comic: comic?.title, news: newsItems.map(n => n.title), editor: editorName, issue: issueNo })}. 수정 요청에 친절하게 답변하고, 필요한 경우 새 내용을 제안하세요.`,
          messages: newH.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setChat([...newH, { role: "assistant", content: data.content?.[0]?.text || "오류" }]);
    } catch { setChat(h => [...h, { role: "assistant", content: "오류가 발생했습니다." }]); }
    finally { setChatLoading(false); }
  };

  /* ── PDF/출력 ── */
  const handlePrint = () => {
    const w = window.open("", "_blank");
    const comicPanels = (comic?.panels || []).map((p, i) => `
      <div style="border:2.5px solid #1a1a1a;border-radius:8px;padding:10px;background:${p.bg||"#fffbeb"};position:relative">
        <div style="position:absolute;top:4px;left:6px;width:16px;height:16px;background:#1a1a1a;color:#fff;border-radius:50%;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center">${i + 1}</div>
        <div style="font-size:9px;color:#92400e;text-align:center;margin:14px 0 6px;font-style:italic">${p.scene}</div>
        <div style="min-height:60px;display:flex;align-items:center;justify-content:center;font-size:28px">${p.expression === "happy" ? "😊" : p.expression === "sad" ? "😢" : p.expression === "angry" ? "😤" : p.expression === "shock" ? "😲" : p.expression === "cry" ? "😭" : p.expression === "laugh" ? "😄" : p.expression === "sigh" ? "😔" : p.expression === "worried" ? "😟" : "🙂"}</div>
        ${p.dialogue ? `<div style="background:#fff;border:2px solid #1a1a1a;border-radius:8px;padding:5px 8px;font-size:11px;font-weight:600;text-align:center;margin-top:4px">${p.dialogue}</div>` : ""}
      </div>
    `).join("");

    const newsHtml = newsItems.map(n => {
      const cat = NEWS_TOPICS.find(t => t.id === n.category) || NEWS_TOPICS[0];
      return `<div style="border:1px solid ${cat.color}33;border-left:4px solid ${cat.color};border-radius:8px;padding:12px;margin-bottom:10px">
        <div style="font-size:10px;color:${cat.color};font-weight:700;margin-bottom:5px">${cat.icon} ${cat.label}${n.importance === "high" ? " 🔥 중요" : ""}${n.deadline ? ` ⏰ ${n.deadline}` : ""}</div>
        <div style="font-weight:800;font-size:13px;margin-bottom:7px">${n.title}</div>
        ${n.threeLines ? `<div style="background:#f8fafc;padding:8px 10px;border-radius:6px;margin-bottom:7px;font-size:11px"><b style="color:#64748b">📌 핵심 3줄</b><br>${n.threeLines.map((l, i) => `${i + 1}. ${l}`).join("<br>")}</div>` : ""}
        <div style="font-size:12px;color:#4b5563;line-height:1.7">${n.summary}</div>
        ${n.amount ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:5px 9px;margin-top:6px;font-size:11px;font-weight:700;color:#065f46">💵 ${n.amount}</div>` : ""}
        ${n.actionTip ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:5px 9px;margin-top:5px;font-size:11px;color:#1d4ed8;font-weight:600">👉 ${n.actionTip}</div>` : ""}
      </div>`;
    }).join("");

    w.document.write(`<html><head><title>${editorName} 제${issueNo}호</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');
      *{box-sizing:border-box} body{font-family:'Noto Sans KR',sans-serif;font-size:13px;line-height:1.8;color:#111;max-width:680px;margin:0 auto;padding:20px}
      h1{font-size:24px;font-weight:900} h2{font-size:16px;font-weight:800;border-left:4px solid #f59e0b;padding-left:9px;margin:20px 0 10px}
      .header{background:linear-gradient(135deg,#f97316,#fbbf24);padding:20px;border-radius:14px;color:#fff;text-align:center;margin-bottom:18px}
      .comic-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px}
      .footer{margin-top:24px;text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:12px}
      @media print{body{padding:10px}}
    </style></head>
    <body>
      <div class="header">
        <div style="font-size:12px;margin-bottom:4px">제${issueNo}호 · ${new Date().toLocaleDateString("ko-KR")}</div>
        <h1>🛖 ${editorName} 소상공인 뉴스레터</h1>
        <div style="font-size:12px;margin-top:5px">${nlData?.title || ""}</div>
      </div>
      ${nlData?.editorNote ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:#78350f;line-height:1.8">✏️ <b>편집장 인사말</b><br>${nlData.editorNote}</div>` : ""}
      ${nlData?.weeklyWord ? `<div style="text-align:center;font-style:italic;color:#6b7280;font-size:13px;margin-bottom:18px;padding:10px;border-top:1px dashed #e5e7eb;border-bottom:1px dashed #e5e7eb">"${nlData.weeklyWord}"</div>` : ""}
      <h2>🎨 장사생각 — ${comic?.title || ""}</h2>
      <div class="comic-grid">${comicPanels}</div>
      ${comic?.tagline ? `<div style="text-align:center;color:#f97316;font-weight:700;font-size:13px;margin-bottom:18px">${comic.tagline}</div>` : ""}
      <h2>📰 이주의 소상공인 뉴스</h2>
      ${newsHtml}
      <div class="footer">${editorName} · 소상공인 뉴스레터 제${issueNo}호 · ${new Date().toLocaleDateString("ko-KR")}<br>본 뉴스레터는 참고용이며 정확한 내용은 소상공인24(sbiz24.kr) 확인 바랍니다.</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  /* ══════ 스타일 ══════ */
  const INPUT = { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "9px", fontSize: "13px", color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const LABEL = { fontSize: "11px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "4px" };
  const CARD = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "15px", marginBottom: "12px", boxShadow: "0 1px 6px rgba(0,0,0,.05)" };
  const isLoading = loading.all || loading.comic || loading.news;

  const fmtChat = (text) => text.split("\n").map((l, i) => {
    const b = l.replace(/\*\*(.*?)\*\*/g, "<strong style='color:#f97316'>$1</strong>");
    if (!l.trim()) return <div key={i} style={{ height: "5px" }} />;
    return <p key={i} style={{ margin: "2px 0", fontSize: "12.5px", lineHeight: "1.75", color: "#1f2937" }} dangerouslySetInnerHTML={{ __html: b }} />;
  });

  /* ══════ 설정 화면 ══════ */
  if (phase === "setup") return (
    <div style={{ fontFamily: "'Noto Sans KR',sans-serif", background: "#fff7ed", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Black+Han+Sans&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#fbbf24;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .fade{animation:fadeUp .4s ease}
        input:focus,textarea:focus,select:focus{border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
        input::placeholder,textarea::placeholder{color:#d1d5db}
        select option{background:#fff;color:#111}
      `}</style>

      {/* 헤더 */}
      <div style={{ background: "linear-gradient(135deg,#92400e,#b45309,#d97706)", padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "28px", animation: "float 3s ease infinite" }}>🗞️</div>
        <div>
          <div style={{ fontWeight: "900", fontSize: "17px", color: "#fef9c3", fontFamily: "'Black Han Sans',sans-serif", letterSpacing: "-.5px" }}>소상공인 뉴스레터 발행소</div>
          <div style={{ fontSize: "11px", color: "#fde68a" }}>장사생각 4컷 만화 + 정책뉴스 재편집 + 발행</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }} className="fade">
        {/* 히어로 */}
        <div style={{ background: "linear-gradient(135deg,#fef3c7,#ffedd5)", border: "2px dashed #f97316", borderRadius: "16px", padding: "20px 16px", textAlign: "center", marginBottom: "14px" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎨📰</div>
          <div style={{ fontWeight: "900", fontSize: "18px", color: "#78350f", marginBottom: "5px", fontFamily: "'Black Han Sans',sans-serif" }}>장사생각 × 소상공인 뉴스</div>
          <div style={{ fontSize: "12px", color: "#92400e", lineHeight: "1.9" }}>
            매주 사장님을 위한 특별한 뉴스레터<br/>
            <strong>4컷 공감 만화</strong> + <strong>정책뉴스 쉽게 재편집</strong><br/>
            PDF 출력 · 이메일 발송 준비 완료
          </div>
        </div>

        {/* 발행 설정 */}
        <div style={CARD}>
          <div style={{ fontWeight: "800", fontSize: "13px", color: "#78350f", marginBottom: "12px" }}>📋 발행 설정</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label style={LABEL}>발행처·채널명</label>
              <input style={INPUT} type="text" placeholder="예: 커리어포레스트" value={editorName} onChange={e => setEditorName(e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>호수</label>
              <input style={INPUT} type="number" placeholder="1" value={issueNo} onChange={e => setIssueNo(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={LABEL}>주요 독자</label>
            <input style={INPUT} type="text" placeholder="예: 소상공인 사장님, 폐업 예정 소상공인" value={targetReader} onChange={e => setTargetReader(e.target.value)} />
          </div>
        </div>

        {/* 4컷 만화 설정 */}
        <div style={CARD}>
          <div style={{ fontWeight: "800", fontSize: "13px", color: "#78350f", marginBottom: "4px" }}>🎨 장사생각 4컷 만화 주제</div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>광수생각 스타일 — 소상공인 일상 공감 만화</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
            {COMIC_THEMES.map(t => (
              <button key={t} onClick={() => { setComicTheme(t); setCustomTheme(""); }} style={{ padding: "8px 12px", border: `1.5px solid ${comicTheme === t && !customTheme ? "#f97316" : "#e5e7eb"}`, borderRadius: "9px", cursor: "pointer", background: comicTheme === t && !customTheme ? "#fff7ed" : "#fff", color: comicTheme === t && !customTheme ? "#c2410c" : "#374151", fontSize: "12px", textAlign: "left", fontFamily: "inherit", fontWeight: comicTheme === t && !customTheme ? "700" : "400", transition: "all .15s" }}>
                {t}
              </button>
            ))}
          </div>
          <div>
            <label style={LABEL}>또는 직접 입력</label>
            <input style={{ ...INPUT, borderColor: customTheme ? "#f97316" : "#e5e7eb" }} type="text" placeholder="직접 주제 입력 (예: 명절 연휴에 혼자 문 여는 사장님)" value={customTheme} onChange={e => setCustomTheme(e.target.value)} />
          </div>
        </div>

        {/* 뉴스 카테고리 */}
        <div style={CARD}>
          <div style={{ fontWeight: "800", fontSize: "13px", color: "#78350f", marginBottom: "4px" }}>📰 뉴스 분야 선택</div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>소상공인 관련 최신 정책·뉴스를 쉽게 재편집합니다</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "7px" }}>
            {NEWS_TOPICS.map(cat => (
              <button key={cat.id} onClick={() => toggleCat(cat.id)} style={{ padding: "10px 6px", border: `1.5px solid ${selCategories.includes(cat.id) ? cat.color : "#e5e7eb"}`, borderRadius: "10px", cursor: "pointer", background: selCategories.includes(cat.id) ? `${cat.color}12` : "#fff", fontFamily: "inherit", transition: "all .18s" }}>
                <div style={{ fontSize: "18px", marginBottom: "3px" }}>{cat.icon}</div>
                <div style={{ fontSize: "10px", fontWeight: "700", color: selCategories.includes(cat.id) ? cat.color : "#6b7280" }}>{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={generateAll} style={{ background: "linear-gradient(135deg,#b45309,#d97706)", color: "#fff", border: "none", borderRadius: "12px", padding: "15px", fontSize: "16px", fontWeight: "900", cursor: "pointer", width: "100%", fontFamily: "'Black Han Sans',sans-serif", letterSpacing: ".5px" }}>
          🗞️ 뉴스레터 발행하기
        </button>
        <div style={{ textAlign: "center", fontSize: "11px", color: "#d1d5db", marginTop: "7px", paddingBottom: "14px" }}>
          4컷 만화 + 정책뉴스 재편집 + PDF 출력까지 한 번에
        </div>
      </div>
    </div>
  );

  /* ══════ 결과 화면 ══════ */
  return (
    <div style={{ fontFamily: "'Noto Sans KR',sans-serif", background: "#fff7ed", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Black+Han+Sans&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#fbbf24;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        .fade{animation:fadeUp .35s ease}
        input:focus,textarea:focus{border-color:#f97316!important}
        input::placeholder,textarea::placeholder{color:#d1d5db}
      `}</style>

      {/* 헤더 */}
      <div style={{ background: "linear-gradient(135deg,#92400e,#b45309)", padding: "11px 15px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "20px" }}>🗞️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "900", fontSize: "14px", color: "#fef9c3", fontFamily: "'Black Han Sans',sans-serif" }}>{editorName} 제{issueNo}호</div>
          <div style={{ fontSize: "10px", color: "#fde68a" }}>{nlData?.title || "소상공인 뉴스레터"}</div>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <button onClick={handlePrint} style={{ background: "#fef9c3", color: "#78350f", border: "none", borderRadius: "8px", padding: "5px 12px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>🖨️ PDF</button>
          <button onClick={() => setPhase("setup")} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: "8px", padding: "5px 10px", color: "#fde68a", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}>← 설정</button>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #fde68a" }}>
        {[["preview","🗞️ 전체 미리보기"],["comic","🎨 장사생각"],["news","📰 뉴스"],["chat","💬 편집 상담"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: "9px 4px", border: "none", cursor: "pointer", background: activeTab === id ? "#fff7ed" : "transparent", color: activeTab === id ? "#c2410c" : "#9ca3af", fontWeight: activeTab === id ? "700" : "400", borderBottom: activeTab === id ? "2px solid #f97316" : "2px solid transparent", fontSize: "10px", fontFamily: "inherit", transition: "all .15s" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "13px" }}>

        {/* 로딩 */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "50px 20px" }}>
            <div style={{ fontSize: "40px", animation: "spin 2s linear infinite" }}>🗞️</div>
            <div style={{ fontWeight: "800", fontSize: "15px", color: "#b45309", fontFamily: "'Black Han Sans',sans-serif" }}>뉴스레터 발행 중...</div>
            {["4컷 만화 스크립트 작성 중...","소상공인 정책뉴스 수집 중...","쉬운 언어로 재편집 중...","레이아웃 구성 중..."].map((t, i) => (
              <div key={t} style={{ fontSize: "12px", color: "#a8a29e", animation: `pulse 1.5s ${i * .3}s infinite` }}>▸ {t}</div>
            ))}
          </div>
        )}

        {/* ═══ 탭: 전체 미리보기 ═══ */}
        {!isLoading && activeTab === "preview" && (
          <div className="fade" ref={printRef}>
            {/* 뉴스레터 헤더 */}
            <div style={{ background: "linear-gradient(135deg,#f97316,#fbbf24)", borderRadius: "16px", padding: "18px", textAlign: "center", marginBottom: "13px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -16, right: -16, width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,.8)", marginBottom: "4px" }}>제{issueNo}호 · {new Date().toLocaleDateString("ko-KR")}</div>
              <div style={{ fontWeight: "900", fontSize: "20px", color: "#fff", fontFamily: "'Black Han Sans',sans-serif", marginBottom: "4px" }}>🛖 {editorName}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,.9)", fontWeight: "600" }}>{nlData?.title || "소상공인 뉴스레터"}</div>
            </div>

            {/* 편집장 인사말 */}
            {nlData?.editorNote && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "13px 15px", marginBottom: "13px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400e", marginBottom: "5px" }}>✏️ 편집장 한마디</div>
                <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.8" }}>{nlData.editorNote}</div>
              </div>
            )}

            {/* 이주의 명언 */}
            {nlData?.weeklyWord && (
              <div style={{ textAlign: "center", padding: "10px 0", borderTop: "1px dashed #fde68a", borderBottom: "1px dashed #fde68a", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontStyle: "italic", color: "#92400e", fontWeight: "600" }}>💬 "{nlData.weeklyWord}"</div>
              </div>
            )}

            {/* 4컷 만화 */}
            {comic && (
              <div style={{ background: "#fff", border: "2px solid #fbbf24", borderRadius: "14px", padding: "13px", marginBottom: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🎨</span>
                  <div>
                    <div style={{ fontWeight: "900", fontSize: "14px", color: "#78350f", fontFamily: "'Black Han Sans',sans-serif" }}>장사생각</div>
                    <div style={{ fontSize: "11px", color: "#f97316", fontWeight: "700" }}>{comic.title}</div>
                  </div>
                  {comic.emotion && <span style={{ marginLeft: "auto", background: "#fef3c7", color: "#92400e", borderRadius: "20px", padding: "2px 10px", fontSize: "10px", fontWeight: "700" }}>{comic.emotion}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                  {(comic.panels || []).map((panel, i) => <ComicPanel key={i} panel={panel} index={i} />)}
                </div>
                {comic.tagline && (
                  <div style={{ textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#f97316", paddingTop: "6px", borderTop: "1px dashed #fde68a" }}>
                    ✦ {comic.tagline} ✦
                  </div>
                )}
              </div>
            )}

            {/* 뉴스 */}
            {newsItems.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "11px" }}>
                  <span style={{ fontSize: "18px" }}>📰</span>
                  <div style={{ fontWeight: "900", fontSize: "14px", color: "#78350f", fontFamily: "'Black Han Sans',sans-serif" }}>이주의 소상공인 뉴스</div>
                </div>
                {newsItems.map((news, i) => <NewsCard key={i} news={news} index={i} />)}
              </div>
            )}

            {/* 푸터 */}
            <div style={{ textAlign: "center", padding: "12px 0", borderTop: "1px solid #fde68a", marginTop: "8px" }}>
              <div style={{ fontSize: "10px", color: "#a8a29e" }}>
                {editorName} · 소상공인 뉴스레터 제{issueNo}호 · {new Date().toLocaleDateString("ko-KR")}<br />
                📞 sbiz24.kr | 소상공인시장진흥공단 1357
              </div>
            </div>
          </div>
        )}

        {/* ═══ 탭: 만화만 ═══ */}
        {!isLoading && activeTab === "comic" && (
          <div className="fade">
            {comic ? (
              <div style={{ background: "#fff", border: "2px solid #fbbf24", borderRadius: "16px", padding: "16px" }}>
                <div style={{ fontWeight: "900", fontSize: "18px", color: "#78350f", fontFamily: "'Black Han Sans',sans-serif", marginBottom: "4px" }}>장사생각 — {comic.title}</div>
                <div style={{ fontSize: "12px", color: "#f97316", marginBottom: "12px", fontWeight: "600" }}>{comic.emotion} | {comic.tagline}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  {(comic.panels || []).map((panel, i) => <ComicPanel key={i} panel={panel} index={i} />)}
                </div>
                <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#f97316", padding: "8px", borderTop: "2px dashed #fde68a" }}>✦ {comic.tagline} ✦</div>
              </div>
            ) : <div style={{ textAlign: "center", padding: "40px", color: "#d1d5db" }}>생성 중...</div>}
            <div style={{ display: "flex", gap: "7px", marginTop: "12px" }}>
              <button onClick={generateComic} disabled={loading.comic} style={{ flex: 1, background: "linear-gradient(135deg,#f97316,#fbbf24)", color: "#fff", border: "none", borderRadius: "10px", padding: "11px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                {loading.comic ? "⏳ 생성 중..." : "🎨 만화 다시 생성"}
              </button>
            </div>
          </div>
        )}

        {/* ═══ 탭: 뉴스만 ═══ */}
        {!isLoading && activeTab === "news" && (
          <div className="fade">
            {newsItems.length > 0 ? newsItems.map((news, i) => <NewsCard key={i} news={news} index={i} />) : <div style={{ textAlign: "center", padding: "40px", color: "#d1d5db" }}>생성 중...</div>}
            <button onClick={generateNews} disabled={loading.news} style={{ width: "100%", background: "linear-gradient(135deg,#f97316,#fbbf24)", color: "#fff", border: "none", borderRadius: "10px", padding: "11px", fontSize: "13px", fontWeight: "700", cursor: "pointer", marginTop: "8px" }}>
              {loading.news ? "⏳ 뉴스 수집 중..." : "📰 뉴스 다시 재편집"}
            </button>
          </div>
        )}

        {/* ═══ 탭: 채팅 ═══ */}
        {!isLoading && activeTab === "chat" && (
          <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {["만화 다시 만들어줘","뉴스 추가해줘","편집장 인사말 수정","다음 호 주제 추천","이메일 제목 뭐가 좋을까"].map(q => (
                <button key={q} onClick={() => sendChat(q)} style={{ padding: "5px 11px", border: "1px solid #fde68a", borderRadius: "20px", cursor: "pointer", background: "#fff", color: "#92400e", fontSize: "11px", fontFamily: "inherit" }}>{q}</button>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #fde68a", borderRadius: "13px", padding: "13px", minHeight: "300px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatHistory.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: "7px", alignItems: "flex-start" }} className="fade">
                  {m.role === "assistant" && <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#f97316,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🗞️</div>}
                  <div style={{ maxWidth: "84%", padding: "9px 13px", borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", background: m.role === "user" ? "#f97316" : "#fff7ed", color: m.role === "user" ? "#fff" : "#1f2937", border: m.role === "user" ? "none" : "1px solid #fde68a", fontSize: "13px", lineHeight: "1.7" }}>
                    {m.role === "assistant" ? <div>{fmtChat(m.content)}</div> : <p style={{ margin: 0 }}>{m.content}</p>}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: "7px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#f97316,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🗞️</div>
                  <div style={{ background: "#fff7ed", border: "1px solid #fde68a", borderRadius: "4px 14px 14px 14px", padding: "9px 13px", display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map(j => <div key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", animation: `pulse 1.2s ${j * .2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: "7px", alignItems: "flex-end" }}>
              <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="수정 요청을 입력하세요... (만화 주제 변경, 뉴스 추가, 문체 수정 등)"
                rows={2} style={{ flex: 1, padding: "9px 12px", border: "1.5px solid #fde68a", borderRadius: "11px", fontSize: "13px", color: "#111", background: "#fff", outline: "none", fontFamily: "inherit", resize: "none", lineHeight: "1.5" }}
              />
              <button onClick={() => sendChat()} disabled={chatLoading || !chatInput.trim()} style={{ width: "40px", height: "40px", background: chatInput.trim() && !chatLoading ? "#f97316" : "#e5e7eb", border: "none", borderRadius: "10px", color: chatInput.trim() && !chatLoading ? "#fff" : "#9ca3af", fontSize: "18px", cursor: "pointer", flexShrink: 0 }}>↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
