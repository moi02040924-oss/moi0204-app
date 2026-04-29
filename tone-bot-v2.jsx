import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════
   상수
══════════════════════════════════════ */
const AUDIENCES = ["소상공인","청년구직자","중장년 재취업","경력단절여성","직업상담사","시니어","일반성인","대학생","기업임직원"];
const LECTURE_TYPES = ["워크숍","세미나","직무교육","커리어교육","온라인강의","집단상담","특강"];
const MOOD_TAGS = ["신뢰·전문","따뜻·공감","활기·동기","성장·자연","심플·모던","창의·혁신","차분·안정","밝고경쾌"];

const PRESETS = [
  { id:"trust",    name:"신뢰 블루",    primary:"#1e3a5f", secondary:"#2563eb", accent:"#f59e0b", bg:"#f8fafc", surface:"#e2e8f0", text:"#1e293b", textLight:"#64748b" },
  { id:"warm",     name:"따뜻 오렌지",  primary:"#c2410c", secondary:"#ea580c", accent:"#65a30d", bg:"#fffbeb", surface:"#fef3c7", text:"#1c1917", textLight:"#78716c" },
  { id:"green",    name:"성장 그린",    primary:"#065f46", secondary:"#047857", accent:"#f59e0b", bg:"#f0fdf4", surface:"#dcfce7", text:"#1a2e1a", textLight:"#4b7a4b" },
  { id:"purple",   name:"창의 퍼플",    primary:"#4c1d95", secondary:"#7c3aed", accent:"#06b6d4", bg:"#f5f3ff", surface:"#ede9fe", text:"#1e1b4b", textLight:"#6d28d9" },
  { id:"slate",    name:"심플 슬레이트",primary:"#0f172a", secondary:"#334155", accent:"#e11d48", bg:"#f8fafc", surface:"#f1f5f9", text:"#0f172a", textLight:"#64748b" },
  { id:"teal",     name:"시원 틸",      primary:"#0f766e", secondary:"#0d9488", accent:"#f97316", bg:"#f0fdfa", surface:"#ccfbf1", text:"#134e4a", textLight:"#0f766e" },
];

const SLIDE_TYPES = ["표지","목차","본문","인용구","데이터","활동지","Q&A","마무리"];

const INPUT = {
  width:"100%", padding:"9px 12px", border:"1.5px solid #d1d5db",
  borderRadius:"8px", fontSize:"13px", color:"#111827", background:"#fff",
  outline:"none", fontFamily:"inherit", boxSizing:"border-box",
};
const LABEL = { fontSize:"11px", fontWeight:"700", color:"#374151", display:"block", marginBottom:"4px" };

const SYSTEM = `당신은 교육 콘텐츠 비주얼 디자인 전문가이자 강의안 브랜딩 컨설턴트입니다.
색채심리학, 타이포그래피, 교육 시각디자인 전문 지식을 보유합니다.
반드시 순수 JSON만 응답 (마크다운 코드블록 없이).`;

/* ══════════════════════════════════════
   색상 유틸
══════════════════════════════════════ */
const lum = (hex) => {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return (0.299*r+0.587*g+0.114*b)/255;
};
const textOn = (bg) => lum(bg) > 0.5 ? "#111111" : "#ffffff";

/* ══════════════════════════════════════
   슬라이드 미리보기
══════════════════════════════════════ */
function SlidePreview({ palette, slideType, title, subtitle }) {
  const { primary, secondary, accent, bg, surface, text, textLight } = palette;
  const tx = textOn(primary);

  const slides = {
    "표지": (
      <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${primary},${secondary})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-24,right:-24,width:"100px",height:"100px",borderRadius:"50%",background:accent,opacity:.2}}/>
        <div style={{position:"absolute",bottom:-16,left:-16,width:"70px",height:"70px",borderRadius:"50%",background:"#fff",opacity:.08}}/>
        <div style={{fontSize:"7px",fontWeight:"700",color:`${tx}99`,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"8px"}}>LECTURE</div>
        <div style={{fontSize:"15px",fontWeight:"900",color:tx,lineHeight:"1.3",marginBottom:"6px"}}>{title||"강의 제목"}</div>
        <div style={{width:"28px",height:"2px",background:accent,marginBottom:"6px"}}/>
        <div style={{fontSize:"8px",color:`${tx}cc`}}>{subtitle||"대상 · 날짜"}</div>
      </div>
    ),
    "목차": (
      <div style={{width:"100%",height:"100%",background:bg,display:"flex",padding:"16px",gap:"10px"}}>
        <div style={{width:"3px",background:`linear-gradient(180deg,${primary},${accent})`,borderRadius:"2px",flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:"7px",fontWeight:"700",color:accent,letterSpacing:"2px",marginBottom:"6px"}}>CONTENTS</div>
          <div style={{fontSize:"12px",fontWeight:"900",color:text,marginBottom:"10px"}}>목 차</div>
          {["01. 도입 및 오리엔테이션","02. 핵심 개념 이해","03. 실전 적용","04. 활동 및 실습","05. 정리 및 마무리"].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:"6px",marginBottom:"5px",padding:"4px 7px",borderRadius:"5px",background:i===0?`${primary}15`:"transparent"}}>
              <span style={{fontSize:"7px",fontWeight:"900",color:i===0?primary:textLight,width:"14px"}}>{String(i+1).padStart(2,"0")}</span>
              <span style={{fontSize:"8px",color:i===0?primary:text,fontWeight:i===0?"700":"400"}}>{item.slice(4)}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    "본문": (
      <div style={{width:"100%",height:"100%",background:bg,padding:"16px",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",gap:"5px",marginBottom:"10px",alignItems:"center"}}>
          <div style={{width:"3px",height:"14px",background:primary,borderRadius:"2px"}}/>
          <div style={{fontSize:"11px",fontWeight:"900",color:text}}>{title||"핵심 내용"}</div>
        </div>
        {[["💡","포인트 1","구체적인 설명과 예시가 이 위치에 들어갑니다"],["🎯","포인트 2","참여자가 이해하기 쉬운 내용으로 구성합니다"],["✅","포인트 3","실제 적용 가능한 실용적 내용을 담습니다"]].map(([icon,h,d],i)=>(
          <div key={i} style={{display:"flex",gap:"7px",marginBottom:"7px",padding:"6px 8px",borderRadius:"7px",background:i===0?`${primary}12`:surface}}>
            <span style={{fontSize:"11px"}}>{icon}</span>
            <div>
              <div style={{fontSize:"8px",fontWeight:"700",color:primary,marginBottom:"2px"}}>{h}</div>
              <div style={{fontSize:"7px",color:textLight,lineHeight:"1.5"}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    ),
    "인용구": (
      <div style={{width:"100%",height:"100%",background:`linear-gradient(145deg,${surface},${bg})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center"}}>
        <div style={{fontSize:"32px",color:primary,opacity:.25,lineHeight:1,marginBottom:"4px"}}>"</div>
        <div style={{fontSize:"10px",fontWeight:"700",color:text,lineHeight:"1.6",marginBottom:"8px",fontStyle:"italic"}}>
          성공은 준비된 자가 기회를 만났을 때 탄생합니다. 오늘의 배움이 내일의 기회입니다.
        </div>
        <div style={{width:"20px",height:"2px",background:accent,marginBottom:"6px"}}/>
        <div style={{fontSize:"7px",color:textLight}}>— 강의 핵심 메시지</div>
      </div>
    ),
    "데이터": (
      <div style={{width:"100%",height:"100%",background:bg,padding:"14px",display:"flex",flexDirection:"column"}}>
        <div style={{fontSize:"9px",fontWeight:"900",color:text,marginBottom:"10px"}}>📊 데이터로 보는 현황</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",flex:1}}>
          {[["74%",primary,"관련 비율"],["3.2배",accent,"성장 지수"],["1,200명",secondary,"참여 인원"],["92점",primary,"만족도"]].map(([num,c,label],i)=>(
            <div key={i} style={{background:surface,borderRadius:"7px",padding:"8px",textAlign:"center",border:`1px solid ${c}22`}}>
              <div style={{fontSize:"16px",fontWeight:"900",color:c}}>{num}</div>
              <div style={{fontSize:"7px",color:textLight,marginTop:"2px"}}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    "활동지": (
      <div style={{width:"100%",height:"100%",background:bg,padding:"14px",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"9px"}}>
          <div style={{background:primary,borderRadius:"5px",width:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px"}}>✏️</div>
          <div style={{fontSize:"9px",fontWeight:"900",color:text}}>활동 워크시트</div>
        </div>
        {["나의 현재 상황은?","목표는 무엇인가?","첫 번째 실행 행동은?"].map((q,i)=>(
          <div key={i} style={{marginBottom:"7px"}}>
            <div style={{fontSize:"7px",fontWeight:"700",color:primary,marginBottom:"3px"}}>{i+1}. {q}</div>
            <div style={{height:"18px",borderBottom:`1.5px solid ${primary}33`}}/>
          </div>
        ))}
      </div>
    ),
    "Q&A": (
      <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${surface},${bg})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center"}}>
        <div style={{fontSize:"26px",fontWeight:"900",color:primary,marginBottom:"6px"}}>Q&A</div>
        <div style={{width:"20px",height:"2px",background:accent,marginBottom:"8px"}}/>
        <div style={{fontSize:"8px",color:textLight,lineHeight:"1.7"}}>궁금하신 점을 자유롭게<br/>질문해 주세요</div>
      </div>
    ),
    "마무리": (
      <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${primary},${secondary})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center"}}>
        <div style={{fontSize:"20px",marginBottom:"7px"}}>🙏</div>
        <div style={{fontSize:"13px",fontWeight:"900",color:tx,marginBottom:"4px"}}>감사합니다</div>
        <div style={{width:"20px",height:"2px",background:accent,marginBottom:"7px"}}/>
        <div style={{fontSize:"7px",color:`${tx}cc`,lineHeight:"1.8"}}>오늘 함께해 주셔서 감사합니다<br/>배운 내용을 실천해 보세요</div>
      </div>
    ),
  };
  return slides[slideType] || slides["본문"];
}

/* ══════════════════════════════════════
   메인 앱
══════════════════════════════════════ */
export default function ToneBot() {
  /* 입력 상태 */
  const [topic, setTopic]         = useState("");
  const [audience, setAudience]   = useState("소상공인");
  const [lectureType, setLType]   = useState("워크숍");
  const [mood, setMood]           = useState("");
  const [selectedMoods, setSMoods]= useState([]);
  const [keywords, setKeywords]   = useState("");
  const [avoidColor, setAvoid]    = useState("");
  const [refStyle, setRefStyle]   = useState("");
  const [selectedPreset, setPreset] = useState("");

  /* 결과 상태 */
  const [phase, setPhase]         = useState("input"); // input | result
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [activeSlide, setSlide]   = useState("표지");
  const [activeTab, setTab]       = useState("palette"); // palette | guide | chat
  const [chatHistory, setChat]    = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef();

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatHistory, chatLoading]);

  const toggleMood = (m) => setSMoods(prev => prev.includes(m) ? prev.filter(x=>x!==m) : [...prev, m]);

  /* ── AI 생성 ── */
  const generate = async () => {
    setLoading(true);
    setPhase("result");
    const preset = PRESETS.find(p => p.id === selectedPreset);
    const prompt = `다음 강의안의 비주얼 톤&매너 시스템을 설계하세요.

[강의 정보]
주제: ${topic||"미입력"}
유형: ${lectureType}
대상: ${audience}
분위기: ${[...selectedMoods, mood].filter(Boolean).join(", ")||"미입력"}
키워드: ${keywords||"미입력"}
참고 프리셋: ${preset?.name||"없음"}
피할 색상: ${avoidColor||"없음"}
참고 스타일: ${refStyle||"없음"}

JSON으로만 응답:
{
  "name": "디자인 시스템 이름 (영문+한글, 예: Calm Authority · 차분한 권위)",
  "concept": "디자인 콘셉트 한 문장",
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "bg": "#hex",
    "surface": "#hex",
    "text": "#hex",
    "textLight": "#hex"
  },
  "colorMeaning": {
    "primary": "이 색 선택 이유 (색채심리학 기반)",
    "secondary": "이 색 선택 이유",
    "accent": "이 색 선택 이유"
  },
  "typography": {
    "heading": "제목 폰트명 (Google Fonts 기준)",
    "body": "본문 폰트명",
    "headingWeight": "900",
    "style": "타이포 스타일 설명"
  },
  "layout": {
    "style": "레이아웃 스타일",
    "margin": "여백 원칙",
    "radius": "모서리 반경 (예: 12px)",
    "shadow": "그림자 스타일"
  },
  "imageGuide": {
    "photoStyle": "사진 스타일",
    "filter": "이미지 필터 방향",
    "iconStyle": "아이콘 스타일",
    "avoid": "피해야 할 이미지"
  },
  "slideGuide": {
    "title": "표지 슬라이드 가이드",
    "content": "본문 슬라이드 가이드",
    "data": "데이터 시각화 가이드",
    "activity": "활동 슬라이드 가이드"
  },
  "doList": ["DO 1","DO 2","DO 3","DO 4"],
  "dontList": ["DON'T 1","DON'T 2","DON'T 3"],
  "moodKeywords": ["무드 키워드1","키워드2","키워드3","키워드4","키워드5"],
  "pptTips": ["PPT 팁1","팁2","팁3","팁4"]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM, messages:[{role:"user",content:prompt}] }),
      });
      const data = await res.json();
      let text = data.content?.[0]?.text||"{}";
      text = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(text);
      setResult(parsed);
      setChat([{ role:"assistant", content:`✨ **${parsed.name}** 디자인 시스템이 완성됐어요!\n\n${parsed.concept}\n\n색상 수정, 폰트 변경, 특정 슬라이드 가이드 등 자유롭게 요청해 주세요!` }]);
    } catch(e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  };

  /* ── 채팅 ── */
  const sendChat = async (msg) => {
    const text = msg || chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    const newH = [...chatHistory, { role:"user", content:text }];
    setChat(newH);
    setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system: SYSTEM.replace("순수 JSON만","한국어로 자연스럽게") + `\n현재 디자인: ${JSON.stringify(result)}\n강의: ${topic}/${audience}`,
          messages: newH.map(m=>({role:m.role,content:m.content})),
        }),
      });
      const data = await res.json();
      setChat([...newH, { role:"assistant", content: data.content?.[0]?.text||"오류" }]);
    } catch { setChat(h=>[...h,{role:"assistant",content:"오류가 발생했습니다."}]); }
    finally { setChatLoading(false); }
  };

  /* ── PDF 출력 ── */
  const printGuide = () => {
    if (!result?.palette) return;
    const w = window.open("","_blank");
    const { palette: p, name, concept, doList, dontList, pptTips, colorMeaning } = result;
    const swatches = Object.entries(p).map(([k,v])=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="width:42px;height:42px;border-radius:8px;background:${v};border:1px solid #eee;flex-shrink:0"></div><div><b style="color:${p.primary}">${k}</b><br><span style="color:#666;font-size:11px">${v} · ${colorMeaning?.[k]||""}</span></div></div>`).join("");
    w.document.write(`<html><head><title>${name} 디자인 가이드</title>
    <style>body{font-family:'Malgun Gothic',sans-serif;font-size:12px;line-height:1.9;color:#111;padding:24px 32px;max-width:820px;margin:0 auto}
    h1{font-size:20px;color:${p.primary};border-bottom:2px solid ${p.primary};padding-bottom:7px;margin-bottom:14px}
    h2{font-size:14px;color:#333;margin:16px 0 7px;border-left:4px solid ${p.accent};padding-left:8px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .box{background:${p.surface};border:1px solid ${p.primary}22;border-radius:7px;padding:9px}
    li{margin-bottom:4px}
    .footer{margin-top:32px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:7px;text-align:right}
    @media print{body{padding:12px 18px}}</style></head>
    <body>
    <h1>🎨 ${name} — 강의안 비주얼 가이드</h1>
    <p style="background:${p.surface};padding:9px 13px;border-radius:7px;border-left:3px solid ${p.primary};margin-bottom:14px">${concept}</p>
    <h2>색채 시스템</h2>${swatches}
    <h2>무드 키워드</h2><p>${(result.moodKeywords||[]).join(" · ")}</p>
    <h2>DO ✅ / DON'T ❌</h2>
    <div class="grid">
      <div class="box"><b style="color:#059669">DO</b><ul>${(doList||[]).map(d=>`<li>${d}</li>`).join("")}</ul></div>
      <div class="box"><b style="color:#dc2626">DON'T</b><ul>${(dontList||[]).map(d=>`<li>${d}</li>`).join("")}</ul></div>
    </div>
    <h2>PPT 제작 팁</h2><ul>${(pptTips||[]).map(t=>`<li>${t}</li>`).join("")}</ul>
    <div class="footer">CareerForest 강의설계 AI · ${new Date().toLocaleDateString("ko-KR")}</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  /* ══════ 공통 스타일 ══════ */
  const resultPalette = result?.palette || PRESETS[0];

  const S = {
    card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:"14px", padding:"16px", marginBottom:"12px", boxShadow:"0 1px 6px rgba(0,0,0,.05)" },
    btn: (bg="#6366f1",outline=false) => ({ background:outline?"transparent":`linear-gradient(135deg,${bg},${bg}cc)`, color:outline?bg:"#fff", border:outline?`1.5px solid ${bg}55`:"none", borderRadius:"10px", padding:"10px 20px", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", transition:"all .18s" }),
    tab: (active, color="#6366f1") => ({ padding:"7px 14px", border:"none", cursor:"pointer", background:active?`${color}18`:"transparent", color:active?color:"#9ca3af", fontWeight:active?"700":"400", borderRadius:"20px", fontSize:"11px", fontFamily:"inherit", transition:"all .18s" }),
    chatBubble: (user) => ({ maxWidth:"84%", padding:"9px 13px", borderRadius:user?"14px 4px 14px 14px":"4px 14px 14px 14px", background:user?"#4f46e5":"#f3f4f6", color:user?"#fff":"#111827", fontSize:"13px", lineHeight:"1.7" }),
    resultCard: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:"13px", padding:"15px", marginBottom:"11px" },
  };

  const P = resultPalette;

  /* ══════ 입력 단계 ══════ */
  if (phase === "input") return (
    <div style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", background:"#f5f3ff", minHeight:"100vh", display:"flex", flexDirection:"column", color:"#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp .4s ease}
        input:focus,textarea:focus,select:focus{border-color:#7c3aed!important;box-shadow:0 0 0 3px rgba(124,58,237,.12)}
        input::placeholder,textarea::placeholder{color:#9ca3af}
        select option{background:#fff;color:#111827}
      `}</style>

      {/* 헤더 */}
      <div style={{ background:"linear-gradient(135deg,#4c1d95,#7c3aed)", padding:"14px 18px", display:"flex", alignItems:"center", gap:"12px", boxShadow:"0 2px 12px rgba(76,29,149,.35)" }}>
        <div style={{ width:"40px", height:"40px", background:"rgba(255,255,255,.15)", borderRadius:"11px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>🎨</div>
        <div>
          <div style={{ fontWeight:"900", fontSize:"15px", color:"#ede9fe" }}>강의안 이미지 톤 구성봇</div>
          <div style={{ fontSize:"11px", color:"#c4b5fd" }}>색채 · 레이아웃 · 이미지 방향 · 슬라이드 미리보기</div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px" }} className="fade">
        {/* 히어로 */}
        <div style={{ background:"linear-gradient(135deg,#ede9fe,#dbeafe)", border:"1px solid #c4b5fd", borderRadius:"16px", padding:"20px 18px", textAlign:"center", marginBottom:"14px" }}>
          <div style={{ fontSize:"40px", marginBottom:"7px" }}>🎨</div>
          <div style={{ fontWeight:"900", fontSize:"17px", color:"#1e1b4b", marginBottom:"4px" }}>강의안의 첫인상을 설계하세요</div>
          <div style={{ fontSize:"12px", color:"#4338ca", lineHeight:"1.8" }}>색채 심리학 기반 팔레트 · 슬라이드 실시간 미리보기<br/><strong>디자인 가이드 PDF</strong>까지 한 번에</div>
        </div>

        {/* 프리셋 */}
        <div style={S.card}>
          <div style={{ fontWeight:"800", fontSize:"12px", color:"#1e1b4b", marginBottom:"10px" }}>⚡ 빠른 톤 선택 (선택사항)</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"7px" }}>
            {PRESETS.map(pr => (
              <button key={pr.id} onClick={() => setPreset(selectedPreset===pr.id?"":pr.id)} style={{ padding:"10px 6px", border:`1.5px solid ${selectedPreset===pr.id?"#7c3aed":"#e5e7eb"}`, borderRadius:"10px", cursor:"pointer", background:selectedPreset===pr.id?"#f5f3ff":"#fff", fontFamily:"inherit", transition:"all .18s" }}>
                <div style={{ display:"flex", gap:"3px", justifyContent:"center", marginBottom:"5px" }}>
                  {[pr.primary,pr.secondary,pr.accent,pr.bg].map((c,i)=><div key={i} style={{width:"11px",height:"11px",borderRadius:"50%",background:c,border:"1px solid #e5e7eb"}}/>)}
                </div>
                <div style={{ fontSize:"10px", fontWeight:"700", color:selectedPreset===pr.id?"#7c3aed":"#374151" }}>{pr.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 기본 정보 */}
        <div style={S.card}>
          <div style={{ fontWeight:"800", fontSize:"12px", color:"#1e1b4b", marginBottom:"12px" }}>📋 강의 정보</div>

          <div style={{ marginBottom:"11px" }}>
            <label style={LABEL}>강의 주제 · 제목</label>
            <input style={INPUT} type="text" placeholder="예: AI 활용 소상공인 마케팅 전략 워크숍" value={topic} onChange={e=>setTopic(e.target.value)} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"11px" }}>
            <div>
              <label style={LABEL}>강의 유형</label>
              <select style={INPUT} value={lectureType} onChange={e=>setLType(e.target.value)}>
                {LECTURE_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>교육 대상</label>
              <select style={INPUT} value={audience} onChange={e=>setAudience(e.target.value)}>
                {AUDIENCES.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:"11px" }}>
            <label style={LABEL}>분위기 태그 (복수 선택 가능)</label>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {MOOD_TAGS.map(m=>(
                <button key={m} onClick={()=>toggleMood(m)} style={{ padding:"5px 12px", border:`1.5px solid ${selectedMoods.includes(m)?"#7c3aed":"#e5e7eb"}`, borderRadius:"20px", cursor:"pointer", background:selectedMoods.includes(m)?"#f5f3ff":"#fff", color:selectedMoods.includes(m)?"#7c3aed":"#6b7280", fontSize:"11px", fontWeight:selectedMoods.includes(m)?"700":"400", fontFamily:"inherit", transition:"all .15s" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:"11px" }}>
            <label style={LABEL}>추가 분위기 설명 (자유입력)</label>
            <input style={INPUT} type="text" placeholder="예: 딱딱하지 않으면서도 전문적인, 희망적이고 따뜻한" value={mood} onChange={e=>setMood(e.target.value)} />
          </div>

          <div style={{ marginBottom:"11px" }}>
            <label style={LABEL}>핵심 키워드 (쉼표로 구분)</label>
            <input style={INPUT} type="text" placeholder="예: 성장, 변화, 실용, 희망, 함께" value={keywords} onChange={e=>setKeywords(e.target.value)} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div>
              <label style={LABEL}>피하고 싶은 색상</label>
              <input style={INPUT} type="text" placeholder="예: 빨간색, 어두운 계열" value={avoidColor} onChange={e=>setAvoid(e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>참고 스타일 · 브랜드</label>
              <input style={INPUT} type="text" placeholder="예: Apple, 고용노동부, 미니멀" value={refStyle} onChange={e=>setRefStyle(e.target.value)} />
            </div>
          </div>
        </div>

        <button style={{ ...S.btn(), width:"100%", fontSize:"15px", padding:"14px" }} onClick={generate}>
          🎨 이미지 톤 시스템 생성하기
        </button>
        <div style={{ textAlign:"center", fontSize:"11px", color:"#9ca3af", marginTop:"7px", paddingBottom:"14px" }}>
          색채팔레트 · 슬라이드 미리보기 · 디자인가이드 · PDF 출력
        </div>
      </div>
    </div>
  );

  /* ══════ 결과 단계 ══════ */
  const accent = P.primary || "#4f46e5";

  return (
    <div style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", background:"#f8f7ff", minHeight:"100vh", display:"flex", flexDirection:"column", color:"#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px} ::-webkit-scrollbar-thumb{background:${accent}44;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        .fade{animation:fadeUp .35s ease}
        input:focus,textarea:focus{border-color:${accent}!important;box-shadow:0 0 0 3px ${accent}18}
        input::placeholder,textarea::placeholder{color:#9ca3af}
      `}</style>

      {/* 헤더 */}
      <div style={{ background:`linear-gradient(135deg,${P.primary||"#4c1d95"},${P.secondary||"#7c3aed"})`, padding:"12px 16px", display:"flex", alignItems:"center", gap:"10px", boxShadow:`0 2px 12px ${accent}44` }}>
        <div style={{ width:"36px", height:"36px", background:"rgba(255,255,255,.15)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>🎨</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:"900", fontSize:"14px", color:"#fff" }}>{loading?"분석 중...":result?.name||"톤 구성봇"}</div>
          <div style={{ fontSize:"10px", color:"rgba(255,255,255,.7)" }}>{topic||audience}</div>
        </div>
        {!loading && result && !result.error && (
          <div style={{ display:"flex", gap:"6px" }}>
            <button onClick={printGuide} style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", borderRadius:"8px", padding:"5px 12px", color:"#fff", fontSize:"11px", fontWeight:"700", cursor:"pointer" }}>🖨️ PDF</button>
            <button onClick={()=>{setPhase("input");setResult(null);}} style={{ background:"rgba(255,255,255,.1)", border:"none", borderRadius:"8px", padding:"5px 10px", color:"rgba(255,255,255,.8)", fontSize:"10px", cursor:"pointer", fontFamily:"inherit" }}>← 재설정</button>
          </div>
        )}
      </div>

      {/* 탭 */}
      {!loading && result && !result.error && (
        <div style={{ display:"flex", background:"#fff", borderBottom:"1px solid #e5e7eb" }}>
          {[["palette","🎨 색상 & 미리보기"],["guide","📐 디자인 가이드"],["chat","💬 수정 상담"]].map(([id,label])=>(
            <button key={id} style={S.tab(activeTab===id, accent)} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>

        {/* ── 로딩 ── */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"400px", gap:"14px" }} className="fade">
            <div style={{ width:"52px", height:"52px", border:"3px solid #e0e7ff", borderTop:`3px solid ${accent}`, borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
            <div style={{ fontWeight:"800", fontSize:"14px", color:accent }}>색채 심리학 기반 분석 중...</div>
            {["컬러 팔레트 설계 중...","레이아웃 시스템 구성 중...","슬라이드 가이드 작성 중..."].map((t,i)=>(
              <div key={t} style={{ fontSize:"11px", color:"#9ca3af", animation:`pulse 1.5s ${i*.3}s infinite` }}>▸ {t}</div>
            ))}
          </div>
        )}

        {/* ── 에러 ── */}
        {result?.error && <div style={{ padding:"20px", color:"#ef4444", textAlign:"center" }}>오류: {result.error}</div>}

        {/* ════ 탭: 색상 & 미리보기 ════ */}
        {!loading && result && !result.error && activeTab==="palette" && (
          <div className="fade">
            {/* 팔레트 스와치 */}
            <div style={S.resultCard}>
              <div style={{ fontWeight:"800", fontSize:"12px", color:"#1e1b4b", marginBottom:"10px" }}>{result.name}</div>
              <div style={{ fontSize:"12px", color:"#6b7280", marginBottom:"12px", padding:"8px 11px", background:P.surface||"#f3f4f6", borderRadius:"8px", borderLeft:`3px solid ${accent}` }}>
                {result.concept}
              </div>
              {/* 7색 스와치 */}
              <div style={{ display:"flex", gap:"5px", marginBottom:"10px" }}>
                {Object.entries(P).map(([k,v])=>(
                  <div key={k} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ height:"38px", borderRadius:"8px", background:v, marginBottom:"3px", border:"1px solid #e5e7eb", boxShadow:`0 2px 6px ${v}44` }}/>
                    <div style={{ fontSize:"7px", color:"#6b7280", fontWeight:"600" }}>{k}</div>
                    <div style={{ fontSize:"7px", color:"#9ca3af" }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* 무드 태그 */}
              <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                {(result.moodKeywords||[]).map(kw=>(
                  <span key={kw} style={{ background:`${accent}18`, color:accent, border:`1px solid ${accent}33`, borderRadius:"20px", padding:"2px 9px", fontSize:"10px", fontWeight:"700" }}>{kw}</span>
                ))}
              </div>
            </div>

            {/* 슬라이드 타입 선택 */}
            <div style={{ display:"flex", gap:"5px", marginBottom:"10px", overflowX:"auto", scrollbarWidth:"none", paddingBottom:"2px" }}>
              {SLIDE_TYPES.map(st=>(
                <button key={st} onClick={()=>setSlide(st)} style={{ flexShrink:0, padding:"5px 12px", border:`1.5px solid ${activeSlide===st?accent:"#e5e7eb"}`, borderRadius:"20px", cursor:"pointer", background:activeSlide===st?`${accent}12`:"#fff", color:activeSlide===st?accent:"#9ca3af", fontSize:"11px", fontWeight:activeSlide===st?"700":"400", fontFamily:"inherit", transition:"all .15s" }}>
                  {st}
                </button>
              ))}
            </div>

            {/* 슬라이드 미리보기 */}
            <div style={{ background:"#1e293b", borderRadius:"14px", padding:"12px", marginBottom:"10px", border:`1px solid ${accent}22` }}>
              <div style={{ display:"flex", gap:"4px", marginBottom:"8px" }}>
                {["#ef4444","#f59e0b","#10b981"].map(c=><div key={c} style={{width:"8px",height:"8px",borderRadius:"50%",background:c}}/>)}
                <span style={{ fontSize:"9px", color:"#64748b", marginLeft:"6px" }}>{activeSlide} 슬라이드</span>
              </div>
              <div style={{ width:"100%", aspectRatio:"16/9", borderRadius:"9px", overflow:"hidden", boxShadow:`0 6px 24px ${accent}22` }}>
                <SlidePreview palette={P} slideType={activeSlide} title={topic} subtitle={`${audience} 대상`} />
              </div>
              {/* 폰트 정보 */}
              <div style={{ display:"flex", gap:"7px", marginTop:"9px" }}>
                {[["제목 폰트", result.typography?.heading, result.typography?.headingWeight], ["본문 폰트", result.typography?.body, "400"]].map(([label, font, weight])=>(
                  <div key={label} style={{ flex:1, background:"rgba(255,255,255,.06)", borderRadius:"7px", padding:"7px 9px" }}>
                    <div style={{ fontSize:"8px", color:"#64748b", marginBottom:"1px" }}>{label}</div>
                    <div style={{ fontSize:"10px", fontWeight:"700", color:"#c4b5fd" }}>{font||"Noto Sans KR"}</div>
                    <div style={{ fontSize:"8px", color:"#475569" }}>weight {weight}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 전체 슬라이드 그리드 */}
            <div style={S.resultCard}>
              <div style={{ fontWeight:"700", fontSize:"11px", color:"#6b7280", marginBottom:"9px" }}>🗂️ 전체 슬라이드 미리보기</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px" }}>
                {SLIDE_TYPES.map(st=>(
                  <div key={st} onClick={()=>setSlide(st)} style={{ cursor:"pointer", borderRadius:"7px", overflow:"hidden", border:`1.5px solid ${activeSlide===st?accent:"#e5e7eb"}`, transition:"all .18s" }}>
                    <div style={{ aspectRatio:"16/9", fontSize:"0.3em" }}>
                      <SlidePreview palette={P} slideType={st} title={topic} subtitle={audience} />
                    </div>
                    <div style={{ padding:"3px 5px", fontSize:"8px", color:"#9ca3af", textAlign:"center", background:"#f9fafb" }}>{st}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ 탭: 디자인 가이드 ════ */}
        {!loading && result && !result.error && activeTab==="guide" && (
          <div className="fade">
            {/* 색채 상세 */}
            <div style={S.resultCard}>
              <div style={{ fontWeight:"800", fontSize:"12px", color:"#1e1b4b", marginBottom:"11px" }}>🎨 색채 시스템 & 선택 이유</div>
              {Object.entries(P).slice(0,3).map(([k,v])=>(
                <div key={k} style={{ display:"flex", gap:"10px", marginBottom:"10px", padding:"9px 11px", background:"#f9fafb", borderRadius:"9px" }}>
                  <div style={{ width:"44px", height:"44px", borderRadius:"9px", background:v, flexShrink:0, border:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"700", color:lum(v)>.5?"#111":"#fff" }}>Aa</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:"7px", marginBottom:"2px" }}>
                      <span style={{ fontWeight:"700", fontSize:"11px", color:v }}>{k}</span>
                      <span style={{ fontSize:"10px", color:"#9ca3af", fontFamily:"monospace" }}>{v}</span>
                    </div>
                    <div style={{ fontSize:"11px", color:"#6b7280" }}>{result.colorMeaning?.[k]||""}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 레이아웃 */}
            {result.layout && (
              <div style={S.resultCard}>
                <div style={{ fontWeight:"800", fontSize:"12px", color:"#1e1b4b", marginBottom:"10px" }}>📐 레이아웃 시스템</div>
                {[["스타일",result.layout.style],["여백",result.layout.margin],["모서리",result.layout.radius],["그림자",result.layout.shadow]].map(([k,v])=>v&&(
                  <div key={k} style={{ display:"flex", gap:"10px", marginBottom:"7px", paddingBottom:"7px", borderBottom:"1px solid #f3f4f6" }}>
                    <span style={{ fontSize:"11px", color:"#9ca3af", width:"50px", flexShrink:0 }}>{k}</span>
                    <span style={{ fontSize:"11px", color:"#374151" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 방향 */}
            {result.imageGuide && (
              <div style={S.resultCard}>
                <div style={{ fontWeight:"800", fontSize:"12px", color:"#1e1b4b", marginBottom:"10px" }}>🖼️ 이미지·아이콘 방향</div>
                {[["사진",result.imageGuide.photoStyle],["필터",result.imageGuide.filter],["아이콘",result.imageGuide.iconStyle],["피할 것",result.imageGuide.avoid]].map(([k,v])=>v&&(
                  <div key={k} style={{ display:"flex", gap:"10px", marginBottom:"7px", padding:"6px 8px", borderRadius:"7px", background:k==="피할 것"?"#fef2f2":"#f9fafb" }}>
                    <span style={{ fontSize:"11px", color:k==="피할 것"?"#dc2626":"#9ca3af", width:"50px", flexShrink:0, fontWeight:k==="피할 것"?"700":"400" }}>{k}</span>
                    <span style={{ fontSize:"11px", color:"#374151" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* DO / DON'T */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px", marginBottom:"11px" }}>
              <div style={{ ...S.resultCard, marginBottom:0, border:"1px solid #bbf7d0" }}>
                <div style={{ fontWeight:"700", fontSize:"11px", color:"#059669", marginBottom:"8px" }}>✅ DO</div>
                {(result.doList||[]).map((d,i)=><div key={i} style={{ display:"flex", gap:"5px", marginBottom:"5px", fontSize:"11px", color:"#374151" }}><span style={{ color:"#10b981", flexShrink:0 }}>✓</span>{d}</div>)}
              </div>
              <div style={{ ...S.resultCard, marginBottom:0, border:"1px solid #fecaca" }}>
                <div style={{ fontWeight:"700", fontSize:"11px", color:"#dc2626", marginBottom:"8px" }}>❌ DON'T</div>
                {(result.dontList||[]).map((d,i)=><div key={i} style={{ display:"flex", gap:"5px", marginBottom:"5px", fontSize:"11px", color:"#374151" }}><span style={{ color:"#ef4444", flexShrink:0 }}>✗</span>{d}</div>)}
              </div>
            </div>

            {/* PPT 팁 */}
            <div style={S.resultCard}>
              <div style={{ fontWeight:"800", fontSize:"12px", color:"#1e1b4b", marginBottom:"9px" }}>💡 PPT 제작 실전 팁</div>
              {(result.pptTips||[]).map((tip,i)=>(
                <div key={i} style={{ display:"flex", gap:"7px", marginBottom:"7px", fontSize:"12px", color:"#374151" }}>
                  <span style={{ color:accent, fontWeight:"700", flexShrink:0 }}>{i+1}.</span>{tip}
                </div>
              ))}
            </div>

            <button style={{ ...S.btn(accent), width:"100%" }} onClick={printGuide}>🖨️ 디자인 가이드 PDF 출력</button>
          </div>
        )}

        {/* ════ 탭: 채팅 상담 ════ */}
        {!loading && result && !result.error && activeTab==="chat" && (
          <div className="fade" style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {/* 빠른 요청 */}
            <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
              {["좀 더 밝은 톤으로","다크모드 버전","채도 낮춰줘","강조색 바꿔줘","모바일 적합한 레이아웃","표지 슬라이드 상세 가이드"].map(q=>(
                <button key={q} onClick={()=>sendChat(q)} style={{ padding:"5px 11px", border:"1px solid #e5e7eb", borderRadius:"20px", cursor:"pointer", background:"#fff", color:"#6b7280", fontSize:"11px", fontFamily:"inherit", transition:"all .15s" }}>
                  {q}
                </button>
              ))}
            </div>

            {/* 채팅 */}
            <div style={{ ...S.resultCard, minHeight:"300px", display:"flex", flexDirection:"column", gap:"10px" }}>
              {chatHistory.map((m,i)=>(
                <div key={i} style={{ display:"flex", flexDirection:m.role==="user"?"row-reverse":"row", gap:"7px", alignItems:"flex-start" }} className="fade">
                  {m.role==="assistant" && <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:`linear-gradient(135deg,${accent},${accent}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>🎨</div>}
                  <div style={S.chatBubble(m.role==="user")}>
                    {m.content.split("\n").map((line,i)=>{
                      const b=line.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
                      if(!line.trim())return<div key={i} style={{height:"4px"}}/>;
                      return<p key={i} style={{margin:"2px 0",fontSize:"12.5px",lineHeight:"1.7"}} dangerouslySetInnerHTML={{__html:b}}/>;
                    })}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:"flex", gap:"7px", alignItems:"center" }}>
                  <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:`linear-gradient(135deg,${accent},${accent}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>🎨</div>
                  <div style={{ background:"#f3f4f6", borderRadius:"4px 14px 14px 14px", padding:"9px 13px", display:"flex", gap:"4px" }}>
                    {[0,1,2].map(j=><div key={j} style={{width:"6px",height:"6px",borderRadius:"50%",background:accent,animation:`pulse 1.2s ${j*.2}s infinite`}}/>)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>

            {/* 입력 */}
            <div style={{ display:"flex", gap:"8px", alignItems:"flex-end" }}>
              <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}}
                placeholder="색상 수정, 폰트 변경, 특정 슬라이드 상세 가이드 등 자유롭게..."
                rows={2} style={{ ...INPUT, flex:1, resize:"none", lineHeight:"1.6", minHeight:"auto", border:"1.5px solid #e5e7eb" }}
              />
              <button onClick={()=>sendChat()} disabled={chatLoading||!chatInput.trim()} style={{ width:"42px", height:"42px", background:chatInput.trim()&&!chatLoading?accent:"#e5e7eb", border:"none", borderRadius:"10px", color:chatInput.trim()&&!chatLoading?"#fff":"#9ca3af", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .18s" }}>↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
