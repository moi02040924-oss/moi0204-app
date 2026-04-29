import { useState, useMemo, useRef } from "react";

/* ══════════════════════════════════════════════════
   직업대조표 DATABASE  (한국고용정보원 기반 재구성)
   각 항목: 1~5점 (5=최고/최우수)
   stress: 1=저스트레스, 5=고스트레스 (역점수)
══════════════════════════════════════════════════ */
const JOBS = [
  // 의료·보건
  {id:1,name:"의사",cat:"의료·보건",icon:"🏥",wage:5,stability:5,growth:4,env:3,demand:4,stress:2,physical:2,selfActual:5,reputation:5,expertise:5,workLife:2,edu:"대학원(의대)",key:"전문성·사명감"},
  {id:2,name:"간호사",cat:"의료·보건",icon:"💉",wage:3,stability:5,growth:3,env:2,demand:5,stress:2,physical:2,selfActual:4,reputation:4,expertise:4,workLife:2,edu:"전문대 이상",key:"봉사·체력"},
  {id:3,name:"약사",cat:"의료·보건",icon:"💊",wage:4,stability:5,growth:3,env:4,demand:3,stress:3,physical:4,selfActual:4,reputation:4,expertise:5,workLife:4,edu:"약학대학원",key:"전문성·안정"},
  {id:4,name:"치과의사",cat:"의료·보건",icon:"🦷",wage:5,stability:5,growth:3,env:4,demand:3,stress:3,physical:3,selfActual:4,reputation:5,expertise:5,workLife:3,edu:"대학원(치의학)",key:"전문성·소득"},
  {id:5,name:"물리치료사",cat:"의료·보건",icon:"🏋️",wage:3,stability:4,growth:3,env:3,demand:4,stress:3,physical:2,selfActual:4,reputation:3,expertise:4,workLife:3,edu:"전문대 이상",key:"봉사·체력"},
  // 교육
  {id:6,name:"초등교사",cat:"교육",icon:"📚",wage:4,stability:5,growth:3,env:4,demand:3,stress:3,physical:3,selfActual:4,reputation:4,expertise:4,workLife:5,edu:"교육대학교",key:"안정·교육"},
  {id:7,name:"중고등교사",cat:"교육",icon:"🎓",wage:4,stability:5,growth:3,env:4,demand:3,stress:3,physical:4,selfActual:4,reputation:4,expertise:4,workLife:4,edu:"사범대학",key:"안정·교육"},
  {id:8,name:"대학교수",cat:"교육",icon:"🎓",wage:4,stability:4,growth:4,env:5,demand:2,stress:3,physical:5,selfActual:5,reputation:5,expertise:5,workLife:4,edu:"박사",key:"연구·전문성"},
  {id:9,name:"직업상담사",cat:"교육",icon:"🧭",wage:3,stability:3,growth:3,env:4,demand:4,stress:3,physical:4,selfActual:5,reputation:3,expertise:3,workLife:4,edu:"학사 이상",key:"상담·사명감"},
  {id:10,name:"학원강사",cat:"교육",icon:"✏️",wage:3,stability:2,growth:2,env:3,demand:3,stress:3,physical:4,selfActual:3,reputation:3,expertise:3,workLife:3,edu:"학사 이상",key:"교육·소통"},
  // IT·기술
  {id:11,name:"소프트웨어개발자",cat:"IT·기술",icon:"💻",wage:5,stability:4,growth:5,env:5,demand:5,stress:3,physical:5,selfActual:4,reputation:4,expertise:5,workLife:3,edu:"학사 이상",key:"논리·창의"},
  {id:12,name:"데이터분석가",cat:"IT·기술",icon:"📊",wage:5,stability:4,growth:5,env:5,demand:5,stress:3,physical:5,selfActual:4,reputation:4,expertise:5,workLife:4,edu:"학사 이상",key:"분석·수학"},
  {id:13,name:"AI엔지니어",cat:"IT·기술",icon:"🤖",wage:5,stability:4,growth:5,env:5,demand:5,stress:3,physical:5,selfActual:5,reputation:5,expertise:5,workLife:3,edu:"학사 이상",key:"수학·프로그래밍"},
  {id:14,name:"UX·UI디자이너",cat:"IT·기술",icon:"🎨",wage:4,stability:3,growth:4,env:5,demand:4,stress:3,physical:5,selfActual:5,reputation:3,expertise:4,workLife:4,edu:"학사 이상",key:"감각·창의"},
  {id:15,name:"정보보안전문가",cat:"IT·기술",icon:"🔐",wage:5,stability:4,growth:5,env:5,demand:5,stress:2,physical:5,selfActual:4,reputation:4,expertise:5,workLife:3,edu:"학사 이상",key:"분석·꼼꼼함"},
  // 경영·금융
  {id:16,name:"회계사(공인)",cat:"경영·금융",icon:"🧾",wage:5,stability:4,growth:4,env:4,demand:3,stress:2,physical:5,selfActual:3,reputation:5,expertise:5,workLife:3,edu:"학사+자격증",key:"꼼꼼함·신뢰"},
  {id:17,name:"세무사",cat:"경영·금융",icon:"💰",wage:4,stability:4,growth:3,env:4,demand:4,stress:3,physical:5,selfActual:3,reputation:4,expertise:5,workLife:4,edu:"학사+자격증",key:"꼼꼼함·법률"},
  {id:18,name:"마케터",cat:"경영·금융",icon:"📣",wage:3,stability:3,growth:4,env:4,demand:4,stress:3,physical:5,selfActual:4,reputation:3,expertise:3,workLife:3,edu:"학사 이상",key:"창의·소통"},
  {id:19,name:"경영컨설턴트",cat:"경영·금융",icon:"📈",wage:5,stability:3,growth:5,env:4,demand:3,stress:2,physical:4,selfActual:5,reputation:5,expertise:5,workLife:2,edu:"학사 이상",key:"분석·소통"},
  {id:20,name:"보험설계사",cat:"경영·금융",icon:"🛡️",wage:3,stability:2,growth:3,env:4,demand:4,stress:3,physical:5,selfActual:3,reputation:2,expertise:3,workLife:4,edu:"고졸 이상",key:"영업·소통"},
  {id:21,name:"은행원",cat:"경영·금융",icon:"🏦",wage:4,stability:4,growth:3,env:4,demand:3,stress:3,physical:5,selfActual:3,reputation:4,expertise:3,workLife:4,edu:"학사 이상",key:"꼼꼼함·서비스"},
  // 공무원·공공
  {id:22,name:"일반직공무원",cat:"공무원·공공",icon:"🏛️",wage:3,stability:5,growth:3,env:4,demand:3,stress:4,physical:4,selfActual:3,reputation:4,expertise:3,workLife:5,edu:"학사 이상",key:"안정·성실"},
  {id:23,name:"경찰관",cat:"공무원·공공",icon:"👮",wage:3,stability:5,growth:3,env:2,demand:3,stress:1,physical:1,selfActual:4,reputation:4,expertise:3,workLife:2,edu:"고졸 이상",key:"정의·체력"},
  {id:24,name:"소방관",cat:"공무원·공공",icon:"🚒",wage:3,stability:5,growth:3,env:1,demand:3,stress:1,physical:1,selfActual:5,reputation:5,expertise:3,workLife:2,edu:"고졸 이상",key:"봉사·체력"},
  {id:25,name:"사회복지사",cat:"공무원·공공",icon:"🤝",wage:2,stability:4,growth:3,env:3,demand:5,stress:2,physical:3,selfActual:5,reputation:4,expertise:3,workLife:3,edu:"학사 이상",key:"봉사·공감"},
  // 법률·전문직
  {id:26,name:"변호사",cat:"법률·전문직",icon:"⚖️",wage:5,stability:4,growth:4,env:4,demand:3,stress:2,physical:4,selfActual:4,reputation:5,expertise:5,workLife:2,edu:"법학전문대학원",key:"논리·정의"},
  {id:27,name:"건축사",cat:"법률·전문직",icon:"🏗️",wage:4,stability:3,growth:4,env:4,demand:3,stress:2,physical:4,selfActual:5,reputation:4,expertise:5,workLife:3,edu:"학사+자격증",key:"창의·공간"},
  {id:28,name:"기자·PD",cat:"법률·전문직",icon:"📰",wage:3,stability:3,growth:3,env:3,demand:2,stress:2,physical:3,selfActual:5,reputation:4,expertise:4,workLife:2,edu:"학사 이상",key:"호기심·소통"},
  {id:29,name:"상담심리사",cat:"법률·전문직",icon:"🧠",wage:3,stability:3,growth:4,env:4,demand:4,stress:3,physical:5,selfActual:5,reputation:4,expertise:4,workLife:4,edu:"석사 이상",key:"공감·전문성"},
  // 서비스·생활
  {id:30,name:"조리사(셰프)",cat:"서비스·생활",icon:"👨‍🍳",wage:3,stability:3,growth:4,env:2,demand:4,stress:2,physical:1,selfActual:5,reputation:3,expertise:4,workLife:2,edu:"고졸 이상",key:"창의·체력"},
  {id:31,name:"미용사·헤어",cat:"서비스·생활",icon:"✂️",wage:3,stability:3,growth:3,env:3,demand:4,stress:3,physical:2,selfActual:4,reputation:3,expertise:3,workLife:3,edu:"고졸+자격증",key:"감각·소통"},
  {id:32,name:"요양보호사",cat:"서비스·생활",icon:"🏠",wage:2,stability:4,growth:2,env:2,demand:5,stress:2,physical:1,selfActual:4,reputation:3,expertise:2,workLife:3,edu:"고졸+자격증",key:"봉사·체력"},
  {id:33,name:"택배·물류",cat:"서비스·생활",icon:"📦",wage:3,stability:3,growth:2,env:2,demand:5,stress:3,physical:1,selfActual:2,reputation:2,expertise:2,workLife:3,edu:"고졸 이상",key:"체력·독립"},
  // 크리에이티브
  {id:34,name:"유튜버·크리에이터",cat:"크리에이티브",icon:"🎬",wage:3,stability:1,growth:4,env:5,demand:3,stress:3,physical:5,selfActual:5,reputation:3,expertise:3,workLife:3,edu:"무관",key:"창의·자기표현"},
  {id:35,name:"웹툰작가",cat:"크리에이티브",icon:"🖼️",wage:3,stability:2,growth:4,env:5,demand:3,stress:3,physical:5,selfActual:5,reputation:3,expertise:4,workLife:3,edu:"무관",key:"창의·끈기"},
  {id:36,name:"작가·번역가",cat:"크리에이티브",icon:"📝",wage:2,stability:2,growth:3,env:5,demand:3,stress:4,physical:5,selfActual:5,reputation:4,expertise:4,workLife:4,edu:"학사 이상",key:"언어·창의"},
  // 기술직
  {id:37,name:"전기기사",cat:"기술직",icon:"⚡",wage:4,stability:4,growth:3,env:3,demand:4,stress:3,physical:2,selfActual:3,reputation:3,expertise:4,workLife:4,edu:"고졸+자격증",key:"기술·꼼꼼함"},
  {id:38,name:"자동차정비사",cat:"기술직",icon:"🔧",wage:3,stability:4,growth:3,env:2,demand:4,stress:3,physical:2,selfActual:3,reputation:3,expertise:4,workLife:4,edu:"고졸+자격증",key:"기술·손재주"},
  {id:39,name:"용접기사",cat:"기술직",icon:"🔥",wage:4,stability:4,growth:3,env:1,demand:4,stress:3,physical:1,selfActual:3,reputation:3,expertise:4,workLife:3,edu:"고졸+자격증",key:"기술·체력"},
  {id:40,name:"프리랜서",cat:"자영·창업",icon:"🌐",wage:3,stability:2,growth:4,env:5,demand:4,stress:3,physical:5,selfActual:5,reputation:3,expertise:3,workLife:4,edu:"무관",key:"자유·자기관리"},
];

const DIMS = [
  {key:"wage",label:"임금수준",icon:"💰",desc:"평균 연봉 및 소득 수준"},
  {key:"stability",label:"고용안정성",icon:"🛡️",desc:"직업 지속성과 실직 위험"},
  {key:"growth",label:"발전가능성",icon:"📈",desc:"승진·성장·미래 전망"},
  {key:"env",label:"근무환경",icon:"🌿",desc:"사무실·쾌적도·안전성"},
  {key:"demand",label:"일자리수요",icon:"🔍",desc:"취업·채용 기회의 수"},
  {key:"stress",label:"저스트레스",icon:"😌",desc:"업무 압박·스트레스 낮을수록↑"},
  {key:"physical",label:"체력부담낮음",icon:"🪑",desc:"신체 부담 낮을수록↑"},
  {key:"selfActual",label:"자아실현",icon:"✨",desc:"보람·성취감·의미"},
  {key:"reputation",label:"사회평판",icon:"🏆",desc:"사회적 인정·존중"},
  {key:"workLife",label:"일·생활균형",icon:"⚖️",desc:"개인시간·워라밸"},
  {key:"expertise",label:"전문성",icon:"🎓",desc:"전문 지식·기술 축적"},
];

const CATS = ["전체",...[...new Set(JOBS.map(j=>j.cat))]];

const VALUES_Q = [
  {id:"income",label:"💰 높은 수입이 가장 중요하다",dim:"wage"},
  {id:"secure",label:"🛡️ 안정적·오래 다닐 수 있어야 한다",dim:"stability"},
  {id:"future",label:"📈 성장·승진 가능성이 중요하다",dim:"growth"},
  {id:"env",label:"🌿 쾌적한 근무환경이 중요하다",dim:"env"},
  {id:"job",label:"🔍 일자리가 많고 취업이 쉬워야 한다",dim:"demand"},
  {id:"stress",label:"😌 스트레스가 적어야 한다",dim:"stress"},
  {id:"body",label:"🪑 몸이 편한 일이 좋다",dim:"physical"},
  {id:"self",label:"✨ 보람·의미 있는 일이 최고다",dim:"selfActual"},
  {id:"rep",label:"🏆 사회적으로 인정받는 직업이 좋다",dim:"reputation"},
  {id:"wl",label:"⚖️ 칼퇴·개인시간이 보장돼야 한다",dim:"workLife"},
  {id:"exp",label:"🎓 한 분야 전문가가 되고 싶다",dim:"expertise"},
];

const COLORS = ["#4f46e5","#0891b2","#059669","#dc2626","#d97706"];

/* ══════════ RADAR CHART ══════════ */
function RadarChart({ jobs, selectedDims }) {
  const dims = selectedDims || DIMS;
  const N = dims.length;
  const R = 75, cx = 95, cy = 95;
  const angle = (i) => (i * 2 * Math.PI) / N - Math.PI / 2;
  const pt = (i, v) => ({ x: cx + R * (v / 5) * Math.cos(angle(i)), y: cy + R * (v / 5) * Math.sin(angle(i)) });
  const rings = [1,2,3,4,5];

  return (
    <svg viewBox="0 0 190 190" style={{width:"100%",maxWidth:"280px",margin:"0 auto",display:"block"}}>
      {/* rings */}
      {rings.map(r => (
        <polygon key={r} points={dims.map((_,i)=>`${pt(i,r).x},${pt(i,r).y}`).join(" ")} fill="none" stroke="#e0e7ff" strokeWidth="0.5" />
      ))}
      {/* spokes */}
      {dims.map((_,i) => <line key={i} x1={cx} y1={cy} x2={pt(i,5).x} y2={pt(i,5).y} stroke="#c7d2fe" strokeWidth="0.5" />)}
      {/* labels */}
      {dims.map((d,i) => {
        const lpt = pt(i,5.8);
        return <text key={i} x={lpt.x} y={lpt.y} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="#4338ca" fontWeight="600">{d.icon}</text>;
      })}
      {/* job polygons */}
      {jobs.map((job, ji) => (
        <polygon key={job.id} points={dims.map((d,i)=>`${pt(i,job[d.key]||0).x},${pt(i,job[d.key]||0).y}`).join(" ")}
          fill={COLORS[ji%COLORS.length]+"33"} stroke={COLORS[ji%COLORS.length]} strokeWidth="1.5" />
      ))}
      {/* center */}
      <circle cx={cx} cy={cy} r="2" fill="#6366f1" />
    </svg>
  );
}

/* ══════════ SCORE BAR ══════════ */
const Bar = ({val, color="#4f46e5"}) => (
  <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
    <div style={{flex:1,height:"6px",background:"#e0e7ff",borderRadius:"3px",overflow:"hidden"}}>
      <div style={{height:"100%",width:`${val*20}%`,background:color,borderRadius:"3px",transition:"width .6s ease"}} />
    </div>
    <span style={{fontSize:"10px",fontWeight:"700",color,width:"12px"}}>{val}</span>
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════ */
export default function CareerDecisionApp() {
  const [step, setStep] = useState(0); // 0=intro 1=가치관 2=탐색 3=비교 4=매트릭스 5=AI결과
  const [values, setValues] = useState({}); // dim -> weight 1~5
  const [selected, setSelected] = useState([]); // 선택된 직업 ids
  const [catFilter, setCatFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [weights, setWeights] = useState(Object.fromEntries(DIMS.map(d=>[d.key,3])));
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandRow, setExpandRow] = useState(null);
  const [userInfo, setUserInfo] = useState({name:"",age:"",situation:""});
  const printRef = useRef();

  /* ── 필터링 ── */
  const filtered = useMemo(() => {
    let list = JOBS.filter(j =>
      (catFilter==="전체" || j.cat===catFilter) &&
      (j.name.includes(search) || j.cat.includes(search) || j.key.includes(search))
    );
    if (sortBy==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
    else list.sort((a,b)=>b[sortBy]-a[sortBy]);
    return list;
  }, [catFilter, search, sortBy]);

  /* ── 선택 직업 ── */
  const selectedJobs = JOBS.filter(j => selected.includes(j.id));

  /* ── 가중 점수 계산 ── */
  const getScore = (job) => {
    let total = 0, wTotal = 0;
    DIMS.forEach(d => { total += (job[d.key]||0) * (weights[d.key]||1); wTotal += (weights[d.key]||1); });
    return wTotal > 0 ? (total/wTotal).toFixed(2) : "0";
  };

  const rankedJobs = useMemo(() =>
    [...selectedJobs].sort((a,b)=>parseFloat(getScore(b))-parseFloat(getScore(a))),
    [selectedJobs, weights]
  );

  /* ── 가치관 → 가중치 자동반영 ── */
  const applyValues = () => {
    const newW = {...weights};
    VALUES_Q.forEach(q => { if (values[q.id]) newW[q.dim] = values[q.id]; });
    setWeights(newW);
    setStep(2);
  };

  /* ── AI 분석 ── */
  const runAI = async () => {
    setAiLoading(true);
    setStep(5);
    try {
      const jobSummary = rankedJobs.map((j,i) =>
        `${i+1}위: ${j.name}(${j.cat}) 종합점수:${getScore(j)} [임금${j.wage} 안정${j.stability} 성장${j.growth} 환경${j.env} 수요${j.demand} 자아${j.selfActual} 평판${j.reputation} 균형${j.workLife}]`
      ).join("\n");
      const valueSummary = VALUES_Q.filter(q=>values[q.id]>=4).map(q=>q.label).join(", ");
      const prompt = `당신은 16년 경력 커리어 컨설턴트입니다. 다음 직업 의사결정 데이터를 분석해 맞춤 최종 보고서를 작성하세요.

[내담자 정보]
이름: ${userInfo.name||"미기재"} / 연령: ${userInfo.age||"미기재"} / 상황: ${userInfo.situation||"미기재"}

[중시하는 가치관]
${valueSummary||"미입력"}

[직업대조표 비교 결과]
${jobSummary}

[가중치 설정]
${DIMS.map(d=>`${d.label}:${weights[d.key]}`).join(" | ")}

다음 구조로 보고서를 작성하세요:
## 🏆 최종 추천 직업
(1위 직업 추천 이유 - 내담자 가치관과 매칭 분석 포함, 3~4문장)

## 📊 직업별 핵심 분석
(각 직업의 장단점과 이 내담자에게 맞는지 여부)

## 🎯 실행 로드맵
(추천 직업으로 가기 위한 단계별 계획 - 단기/중기/장기)

## ⚠️ 의사결정 시 주의사항
(2~3가지 핵심 체크포인트)

## 💬 컨설턴트 한마디
(따뜻하고 격려하는 한 문장)`;

      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"당신은 16년 경력 커리어 컨설턴트입니다. 직업심리학과 직업대조표 분석 전문가입니다. 한국 취업 시장의 현실적 조언을 제공합니다.",messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      setAiResult(data.content?.[0]?.text||"분석 오류");
    } catch(e) { setAiResult("오류: "+e.message); }
    finally { setAiLoading(false); }
  };

  /* ── 출력 ── */
  const handlePrint = () => {
    const w = window.open("","_blank");
    const jobRows = rankedJobs.map(j=>`<tr><td style="font-weight:700;color:#4f46e5">${j.name}</td><td>${j.cat}</td>${DIMS.slice(0,6).map(d=>`<td style="text-align:center">${j[d.key]}</td>`).join("")}<td style="font-weight:700;text-align:center">${getScore(j)}</td></tr>`).join("");
    w.document.write(`<html><head><title>직업 의사결정 보고서</title>
    <style>body{font-family:'Malgun Gothic',sans-serif;font-size:12px;padding:20px 30px;color:#111;line-height:1.8}h1{color:#4338ca;border-bottom:2px solid #4338ca;padding-bottom:6px}h2{color:#1e1b4b;margin:16px 0 6px;border-left:4px solid #6366f1;padding-left:8px}table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#4f46e5;color:#fff;padding:6px 8px;font-size:11px}td{padding:5px 8px;border-bottom:1px solid #e0e7ff}p{margin-bottom:6px}.ai{background:#f0f4ff;border:1px solid #c7d2fe;border-radius:6px;padding:10px 14px;margin:8px 0}li{margin-bottom:4px}</style></head>
    <body><h1>📊 직업 의사결정 보고서</h1>
    <p style="color:#666;font-size:11px">내담자: ${userInfo.name||"미기재"} / 생성일: ${new Date().toLocaleDateString("ko-KR")} / CareerForest AI</p>
    <h2>직업대조표 비교 결과</h2>
    <table><tr><th>직업명</th><th>분야</th>${DIMS.slice(0,6).map(d=>`<th>${d.icon}${d.label}</th>`).join("")}<th>종합점수</th></tr>${jobRows}</table>
    <h2>AI 컨설턴트 분석</h2>
    <div class="ai">${(aiResult||"").split("\n").map(l=>{
      if(l.startsWith("## "))return`<h2>${l.slice(3)}</h2>`;
      if(l.startsWith("- "))return`<li>${l.slice(2)}</li>`;
      if(!l.trim())return"<br>";
      return`<p>${l}</p>`;
    }).join("")}</div>
    <p style="font-size:10px;color:#aaa;margin-top:20px;border-top:1px solid #eee;padding-top:6px">본 보고서는 직업대조표 데이터와 AI 분석을 기반으로 생성되었습니다.</p>
    </body></html>`);
    w.document.close(); w.print();
  };

  /* ════ COLORS & STYLES ════ */
  const INDIGO = "#4f46e5"; const LIGHT = "#f5f3ff";
  const S = {
    app:{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",background:"#fafaf9",minHeight:"100vh",display:"flex",flexDirection:"column",color:"#1e1b4b"},
    header:{background:"linear-gradient(135deg,#1e1b4b,#312e81)",padding:"14px 18px",display:"flex",alignItems:"center",gap:"12px"},
    step:(a)=>({flex:1,padding:"8px 4px",border:"none",cursor:"pointer",background:a?"rgba(79,70,229,.1)":"transparent",color:a?INDIGO:"#a5b4fc",fontWeight:a?"700":"400",borderBottom:a?`2px solid ${INDIGO}`:"2px solid transparent",fontSize:"10px",fontFamily:"inherit",transition:"all .2s"}),
    card:{background:"#fff",border:"1px solid #e0e7ff",borderRadius:"14px",padding:"14px",marginBottom:"10px",boxShadow:"0 1px 6px rgba(79,70,229,.06)"},
    label:{fontSize:"10px",fontWeight:"700",color:"#6366f1",textTransform:"uppercase",letterSpacing:".5px",display:"block",marginBottom:"4px"},
    input:{width:"100%",background:"#f5f3ff",border:"1.5px solid #e0e7ff",borderRadius:"9px",padding:"9px 12px",color:"#1e1b4b",fontSize:"13px",outline:"none",fontFamily:"inherit"},
    btn:(c=INDIGO,outline=false)=>({background:outline?"transparent":`linear-gradient(135deg,${c},${c}cc)`,color:outline?c:"#fff",border:outline?`1.5px solid ${c}44`:"none",borderRadius:"10px",padding:"10px 20px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}),
    catBtn:(a)=>({padding:"6px 13px",border:`1.5px solid ${a?INDIGO:"#e0e7ff"}`,borderRadius:"20px",cursor:"pointer",background:a?LIGHT:"#fff",color:a?INDIGO:"#818cf8",fontSize:"11px",fontWeight:a?"700":"400",fontFamily:"inherit",transition:"all .15s",whiteSpace:"nowrap"}),
    jobRow:(sel)=>({background:sel?"#ede9fe":"#fff",border:`1.5px solid ${sel?INDIGO:"#e0e7ff"}`,borderRadius:"11px",padding:"10px 12px",marginBottom:"6px",cursor:"pointer",transition:"all .15s"}),
    badge:(c=INDIGO)=>({display:"inline-block",background:`${c}18`,color:c,border:`1px solid ${c}33`,borderRadius:"20px",padding:"1px 8px",fontSize:"9px",fontWeight:"700"}),
    rankCard:(i)=>({background:["linear-gradient(135deg,#fef9c3,#fef08a)","linear-gradient(135deg,#f1f5f9,#e2e8f0)","linear-gradient(135deg,#fef3c7,#fde68a)"][i]||"#fff",border:`1px solid ${["#fbbf24","#cbd5e1","#d97706"][i]||"#e0e7ff"}`,borderRadius:"12px",padding:"14px",flex:1}),
  };

  const fmtAI = (text) => text?.split("\n").map((line,i)=>{
    if(!line.trim())return<div key={i} style={{height:"6px"}}/>;
    if(line.startsWith("## "))return<div key={i} style={{fontWeight:"800",fontSize:"14px",color:"#1e1b4b",margin:"14px 0 6px",borderLeft:"3px solid #6366f1",paddingLeft:"10px"}}>{line.slice(3)}</div>;
    if(line.startsWith("### "))return<div key={i} style={{fontWeight:"700",fontSize:"13px",color:"#312e81",margin:"10px 0 3px"}}>{line.slice(4)}</div>;
    if(line.startsWith("- "))return<div key={i} style={{display:"flex",gap:"7px",marginBottom:"3px",fontSize:"13px",color:"#374151"}}><span style={{color:INDIGO,flexShrink:0}}>▸</span><span>{line.slice(2)}</span></div>;
    return<p key={i} style={{margin:"2px 0",fontSize:"13px",lineHeight:"1.8",color:"#374151"}}>{line}</p>;
  });

  /* ════════════════════════════════════════
     STEPS RENDER
  ════════════════════════════════════════ */
  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#c7d2fe;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
        .fade{animation:fadeUp .35s ease}
        .jrow:hover{border-color:#a5b4fc!important;background:#f5f3ff!important}
        input::placeholder,textarea::placeholder{color:#a5b4fc}
        select option{background:#fff;color:#1e1b4b}
      `}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div style={{width:"40px",height:"40px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",boxShadow:"0 0 18px #6366f155"}}>🧭</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:"900",fontSize:"15px",color:"#ede9fe"}}>직업선택 의사결정 시스템</div>
          <div style={{fontSize:"10px",color:"#818cf8"}}>직업대조표 기반 · 가치관 분석 · AI 맞춤 추천</div>
        </div>
        {step>=5&&aiResult&&<button style={{...S.btn("#fff",true),fontSize:"11px",padding:"6px 13px",color:"#e0e7ff",border:"1px solid rgba(255,255,255,.2)"}} onClick={handlePrint}>🖨️ PDF</button>}
      </div>

      {/* STEP TABS */}
      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e0e7ff",overflowX:"auto",scrollbarWidth:"none"}}>
        {[["가치관","🌱",1],["직업탐색","🔍",2],["비교분석","📊",3],["우선순위","⚖️",4],["AI결과","🏆",5]].map(([label,icon,s])=>(
          <button key={s} style={S.step(step===s)} onClick={()=>{ if(s<=step||s===step+1) setStep(s); }}>
            <div style={{fontSize:"14px"}}>{icon}</div><div>{label}</div>
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>

        {/* ═════ INTRO ═════ */}
        {step===0 && (
          <div className="fade">
            <div style={{...S.card,background:"linear-gradient(135deg,#ede9fe,#e0e7ff)",border:"none",textAlign:"center",padding:"28px 20px",marginBottom:"14px"}}>
              <div style={{fontSize:"48px",marginBottom:"10px"}}>🧭</div>
              <div style={{fontWeight:"900",fontSize:"20px",color:"#1e1b4b",marginBottom:"6px"}}>직업선택 의사결정 시스템</div>
              <div style={{fontSize:"13px",color:"#4338ca",lineHeight:"1.8"}}>직업대조표 40개 직업 데이터 기반<br/>가치관 분석 → 직업 비교 → AI 맞춤 추천</div>
            </div>
            <div style={S.card}>
              <div style={{fontWeight:"700",fontSize:"13px",color:"#1e1b4b",marginBottom:"10px"}}>📋 사용법 (5단계)</div>
              {[["🌱 가치관 진단","내가 직업에서 중요하게 생각하는 것 선택"],["🔍 직업 탐색","40개 직업대조표에서 관심 직업 선택 (최대 5개)"],["📊 비교 분석","레이더차트로 직업 특성 한눈에 비교"],["⚖️ 우선순위 설정","항목별 중요도 조정 → 자동 순위 계산"],["🏆 AI 추천","커리어 컨설턴트 AI의 맞춤 분석 보고서"]].map(([t,d],i)=>(
                <div key={i} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                  <div style={{width:"24px",height:"24px",borderRadius:"50%",background:INDIGO,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",flexShrink:0}}>{i+1}</div>
                  <div><div style={{fontWeight:"700",fontSize:"13px",color:"#1e1b4b"}}>{t}</div><div style={{fontSize:"11px",color:"#6366f1"}}>{d}</div></div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:"700",fontSize:"12px",color:"#4338ca",marginBottom:"9px"}}>내담자 정보 (선택)</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div><label style={S.label}>이름</label><input style={S.input} placeholder="예: 홍길동" value={userInfo.name} onChange={e=>setUserInfo(p=>({...p,name:e.target.value}))} onFocus={e=>e.target.style.borderColor=INDIGO} onBlur={e=>e.target.style.borderColor="#e0e7ff"} /></div>
                  <div><label style={S.label}>연령</label><input style={S.input} placeholder="예: 35세" value={userInfo.age} onChange={e=>setUserInfo(p=>({...p,age:e.target.value}))} onFocus={e=>e.target.style.borderColor=INDIGO} onBlur={e=>e.target.style.borderColor="#e0e7ff"} /></div>
                </div>
                <div><label style={S.label}>현재 상황</label><input style={S.input} placeholder="예: 경력단절 후 재취업 희망 / 소상공인 폐업 후 전환" value={userInfo.situation} onChange={e=>setUserInfo(p=>({...p,situation:e.target.value}))} onFocus={e=>e.target.style.borderColor=INDIGO} onBlur={e=>e.target.style.borderColor="#e0e7ff"} /></div>
              </div>
            </div>
            <button style={{...S.btn(),width:"100%",fontSize:"15px"}} onClick={()=>setStep(1)}>시작하기 →</button>
          </div>
        )}

        {/* ═════ STEP 1: 가치관 ═════ */}
        {step===1 && (
          <div className="fade">
            <div style={{...S.card,background:"#f5f3ff",border:"1px solid #c7d2fe",marginBottom:"14px"}}>
              <div style={{fontWeight:"800",fontSize:"13px",color:"#1e1b4b",marginBottom:"4px"}}>🌱 나의 직업 가치관은?</div>
              <div style={{fontSize:"11px",color:"#6366f1"}}>각 항목이 나에게 얼마나 중요한지 점수를 선택하세요 (1=별로 중요하지 않음 / 5=매우 중요함)</div>
            </div>
            {VALUES_Q.map(q=>(
              <div key={q.id} style={S.card}>
                <div style={{fontSize:"13px",fontWeight:"600",color:"#1e1b4b",marginBottom:"10px"}}>{q.label}</div>
                <div style={{display:"flex",gap:"6px"}}>
                  {[1,2,3,4,5].map(v=>(
                    <button key={v} onClick={()=>setValues(p=>({...p,[q.id]:v}))} style={{flex:1,padding:"8px 4px",border:`2px solid ${values[q.id]===v?INDIGO:"#e0e7ff"}`,borderRadius:"10px",cursor:"pointer",background:values[q.id]===v?INDIGO:"#fff",color:values[q.id]===v?"#fff":"#818cf8",fontWeight:"700",fontSize:"13px",fontFamily:"inherit",transition:"all .15s"}}>
                      {v}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:"#a5b4fc",marginTop:"3px"}}><span>중요하지 않음</span><span>매우 중요함</span></div>
              </div>
            ))}
            <button style={{...S.btn(),width:"100%"}} onClick={applyValues}>가치관 저장 & 직업 탐색으로 →</button>
          </div>
        )}

        {/* ═════ STEP 2: 직업대조표 ═════ */}
        {step===2 && (
          <div className="fade">
            <div style={{...S.card,background:"#f5f3ff",border:"1px solid #c7d2fe",padding:"10px 12px"}}>
              <div style={{fontWeight:"700",fontSize:"12px",color:"#4338ca",marginBottom:"8px"}}>🔍 직업대조표에서 관심 직업을 선택하세요 (최대 5개)</div>
              <div style={{display:"flex",gap:"7px",marginBottom:"8px"}}>
                <input style={{...S.input,flex:1}} placeholder="직업명·분야·키워드 검색" value={search} onChange={e=>setSearch(e.target.value)} onFocus={e=>e.target.style.borderColor=INDIGO} onBlur={e=>e.target.style.borderColor="#e0e7ff"} />
                <select style={{...S.input,width:"auto",flexShrink:0}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                  <option value="name">이름순</option>
                  {DIMS.map(d=><option key={d.key} value={d.key}>{d.label}순</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                {CATS.map(c=><button key={c} style={S.catBtn(catFilter===c)} onClick={()=>setCatFilter(c)}>{c}</button>)}
              </div>
            </div>

            {selected.length>0 && (
              <div style={{...S.card,border:`1.5px solid ${INDIGO}`,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:"12px",color:"#4338ca",fontWeight:"700"}}>✅ 선택됨: {selectedJobs.map(j=>j.name).join(", ")}</div>
                <button style={{...S.btn(),padding:"7px 16px",fontSize:"12px"}} onClick={()=>setStep(3)}>비교하기 →</button>
              </div>
            )}

            {/* 직업 목록 */}
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              {filtered.map(job=>{
                const isSel = selected.includes(job.id);
                const isExpanded = expandRow===job.id;
                return (
                  <div key={job.id} className="jrow" style={S.jobRow(isSel)} onClick={()=>setExpandRow(isExpanded?null:job.id)}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                      <div style={{fontSize:"22px",flexShrink:0}}>{job.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                          <span style={{fontWeight:"700",fontSize:"13px",color:isSel?INDIGO:"#1e1b4b"}}>{job.name}</span>
                          <span style={S.badge()}>{job.cat}</span>
                          <span style={{fontSize:"10px",color:"#818cf8"}}>{job.edu}</span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"3px",marginTop:"5px"}}>
                          {[["💰",job.wage],["🛡️",job.stability],["📈",job.growth],["✨",job.selfActual]].map(([icon,v],i)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:"2px"}}>
                              <span style={{fontSize:"9px"}}>{icon}</span>
                              <Bar val={v} color={isSel?INDIGO:"#818cf8"} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();if(isSel){setSelected(p=>p.filter(id=>id!==job.id))}else if(selected.length<5){setSelected(p=>[...p,job.id])}}}
                        style={{width:"32px",height:"32px",borderRadius:"50%",border:`2px solid ${isSel?INDIGO:"#c7d2fe"}`,background:isSel?INDIGO:"#fff",color:isSel?"#fff":INDIGO,fontWeight:"700",fontSize:"16px",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                        {isSel?"✓":"+"}
                      </button>
                    </div>
                    {isExpanded && (
                      <div style={{marginTop:"10px",paddingTop:"10px",borderTop:"1px solid #e0e7ff",animation:"fadeUp .25s ease"}} className="fade">
                        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"5px"}}>
                          {DIMS.map(d=>(
                            <div key={d.key} style={{display:"flex",gap:"5px",alignItems:"center"}}>
                              <span style={{fontSize:"11px",width:"14px"}}>{d.icon}</span>
                              <span style={{fontSize:"10px",color:"#6366f1",width:"65px",flexShrink:0}}>{d.label}</span>
                              <Bar val={job[d.key]} color={INDIGO} />
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:"8px",fontSize:"11px",color:"#818cf8"}}>🔑 키워드: {job.key}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═════ STEP 3: 비교분석 ═════ */}
        {step===3 && (
          <div className="fade">
            {selectedJobs.length<2 ? (
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:"32px",marginBottom:"10px"}}>📊</div>
                <div style={{fontSize:"13px",color:"#6366f1",marginBottom:"12px"}}>직업을 2개 이상 선택해야 비교할 수 있어요</div>
                <button style={S.btn()} onClick={()=>setStep(2)}>← 직업 선택하기</button>
              </div>
            ) : (
              <>
                {/* 레이더 차트 */}
                <div style={S.card}>
                  <div style={{fontWeight:"700",fontSize:"13px",color:"#1e1b4b",marginBottom:"10px"}}>📡 직업 특성 레이더 비교</div>
                  <RadarChart jobs={selectedJobs} />
                  {/* 범례 */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"10px",justifyContent:"center"}}>
                    {selectedJobs.map((j,i)=>(
                      <div key={j.id} style={{display:"flex",alignItems:"center",gap:"5px"}}>
                        <div style={{width:"12px",height:"3px",background:COLORS[i%COLORS.length],borderRadius:"2px"}} />
                        <span style={{fontSize:"11px",color:"#4338ca",fontWeight:"600"}}>{j.icon}{j.name}</span>
                      </div>
                    ))}
                  </div>
                  {/* 아이콘 범례 */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"4px",marginTop:"10px",background:"#f5f3ff",borderRadius:"9px",padding:"8px"}}>
                    {DIMS.map(d=><div key={d.key} style={{fontSize:"10px",color:"#6366f1",display:"flex",gap:"3px",alignItems:"center"}}><span>{d.icon}</span><span>{d.label}</span></div>)}
                  </div>
                </div>

                {/* 수치 비교표 */}
                <div style={S.card}>
                  <div style={{fontWeight:"700",fontSize:"13px",color:"#1e1b4b",marginBottom:"10px"}}>📋 직업대조표 수치 비교</div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px"}}>
                      <thead>
                        <tr style={{background:"#ede9fe"}}>
                          <th style={{padding:"7px 8px",textAlign:"left",color:"#4338ca",fontWeight:"700"}}>항목</th>
                          {selectedJobs.map((j,i)=><th key={j.id} style={{padding:"7px 8px",textAlign:"center",color:COLORS[i%COLORS.length],fontWeight:"700"}}>{j.icon}{j.name}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {DIMS.map((d,di)=>(
                          <tr key={d.key} style={{background:di%2===0?"#fff":"#fafafa"}}>
                            <td style={{padding:"6px 8px",color:"#4338ca",fontWeight:"600",fontSize:"11px"}}>{d.icon} {d.label}</td>
                            {selectedJobs.map((j,ji)=>{
                              const v=j[d.key]; const best=Math.max(...selectedJobs.map(x=>x[d.key]));
                              return <td key={j.id} style={{padding:"6px 8px",textAlign:"center",fontWeight:v===best?"900":"400",color:v===best?COLORS[ji%COLORS.length]:"#374151",fontSize:"14px"}}>{v}<span style={{fontSize:"9px",color:"#c7d2fe"}}>/5</span></td>;
                            })}
                          </tr>
                        ))}
                        <tr style={{background:"#ede9fe"}}>
                          <td style={{padding:"7px 8px",fontWeight:"800",color:"#1e1b4b"}}>📊 균등평균</td>
                          {selectedJobs.map((j,ji)=>{
                            const avg=(DIMS.reduce((s,d)=>s+j[d.key],0)/DIMS.length).toFixed(1);
                            return <td key={j.id} style={{padding:"7px 8px",textAlign:"center",fontWeight:"900",color:COLORS[ji%COLORS.length],fontSize:"15px"}}>{avg}</td>;
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <button style={{...S.btn(),width:"100%"}} onClick={()=>setStep(4)}>우선순위 설정으로 → ⚖️</button>
              </>
            )}
          </div>
        )}

        {/* ═════ STEP 4: 의사결정 매트릭스 ═════ */}
        {step===4 && (
          <div className="fade">
            <div style={{...S.card,background:"#f5f3ff",border:"1px solid #c7d2fe"}}>
              <div style={{fontWeight:"800",fontSize:"13px",color:"#1e1b4b",marginBottom:"4px"}}>⚖️ 항목별 중요도를 조정하세요</div>
              <div style={{fontSize:"11px",color:"#6366f1"}}>슬라이더를 움직이면 종합 순위가 실시간으로 바뀝니다</div>
            </div>

            {/* 가중치 슬라이더 */}
            <div style={S.card}>
              {DIMS.map(d=>(
                <div key={d.key} style={{marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                    <span style={{fontSize:"12px",fontWeight:"700",color:"#1e1b4b"}}>{d.icon} {d.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <span style={{fontSize:"10px",color:"#6366f1"}}>중요도</span>
                      <span style={{width:"24px",height:"24px",borderRadius:"50%",background:INDIGO,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700"}}>{weights[d.key]}</span>
                    </div>
                  </div>
                  <input type="range" min="1" max="5" value={weights[d.key]} onChange={e=>setWeights(p=>({...p,[d.key]:+e.target.value}))} style={{width:"100%",accentColor:INDIGO}} />
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:"#a5b4fc"}}><span>낮음(1)</span><span style={{color:"#6366f1",fontSize:"10px",fontWeight:"600"}}>{d.desc}</span><span>높음(5)</span></div>
                </div>
              ))}
            </div>

            {/* 실시간 순위 */}
            {rankedJobs.length>0 && (
              <div style={S.card}>
                <div style={{fontWeight:"700",fontSize:"13px",color:"#1e1b4b",marginBottom:"12px"}}>🏆 가중치 적용 종합 순위</div>
                {rankedJobs.map((j,i)=>(
                  <div key={j.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"10px",background:i===0?"#ede9fe":i===1?"#f1f5f9":"#fafafa",border:`1px solid ${i===0?"#c7d2fe":i===1?"#e2e8f0":"#f3f4f6"}`,marginBottom:"6px",transition:"all .3s"}}>
                    <div style={{width:"32px",height:"32px",borderRadius:"50%",background:[INDIGO,"#64748b","#d97706","#374151","#059669"][i]||"#374151",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"14px",flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:"18px"}}>{j.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:"700",fontSize:"13px",color:"#1e1b4b"}}>{j.name}</div>
                      <div style={{fontSize:"10px",color:"#818cf8"}}>{j.cat}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:"900",fontSize:"20px",color:COLORS[i%COLORS.length]}}>{getScore(j)}</div>
                      <div style={{fontSize:"9px",color:"#a5b4fc"}}>종합점수</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button style={{...S.btn(),width:"100%",fontSize:"14px"}} onClick={runAI}>🤖 AI 컨설턴트 최종 분석 받기</button>
          </div>
        )}

        {/* ═════ STEP 5: AI 결과 ═════ */}
        {step===5 && (
          <div className="fade" ref={printRef}>
            {aiLoading ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"14px",padding:"50px 20px"}}>
                <div style={{width:"56px",height:"56px",border:"3px solid #e0e7ff",borderTop:`3px solid ${INDIGO}`,borderRadius:"50%",animation:"spin 1s linear infinite"}} />
                <div style={{color:INDIGO,fontWeight:"800",fontSize:"14px"}}>AI 커리어 컨설턴트 분석 중...</div>
                {["직업대조표 데이터 분석...","가치관-직업 매칭 계산...","실행 로드맵 설계...","보고서 작성 중..."].map((t,i)=>(
                  <div key={t} style={{fontSize:"11px",color:"#818cf8",animation:`pulse 1.5s ${i*.3}s infinite`}}>▸ {t}</div>
                ))}
              </div>
            ) : aiResult && (
              <>
                {/* 순위 요약 카드 */}
                <div style={{display:"flex",gap:"7px",marginBottom:"12px",overflowX:"auto",scrollbarWidth:"none"}}>
                  {rankedJobs.slice(0,3).map((j,i)=>(
                    <div key={j.id} style={S.rankCard(i)}>
                      <div style={{fontSize:"18px",marginBottom:"3px"}}>{["🥇","🥈","🥉"][i]}</div>
                      <div style={{fontSize:"16px"}}>{j.icon}</div>
                      <div style={{fontWeight:"800",fontSize:"12px",color:"#1e1b4b",marginTop:"3px"}}>{j.name}</div>
                      <div style={{fontWeight:"900",fontSize:"18px",color:COLORS[i%COLORS.length]}}>{getScore(j)}</div>
                    </div>
                  ))}
                </div>

                {/* AI 보고서 */}
                <div style={{...S.card,border:`1.5px solid #c7d2fe`}}>
                  <div style={{display:"flex",gap:"9px",alignItems:"center",marginBottom:"14px",paddingBottom:"10px",borderBottom:"1px solid #e0e7ff"}}>
                    <div style={{width:"36px",height:"36px",background:`linear-gradient(135deg,${INDIGO},#8b5cf6)`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>🤖</div>
                    <div>
                      <div style={{fontWeight:"800",fontSize:"13px",color:"#1e1b4b"}}>AI 커리어 컨설턴트 분석 보고서</div>
                      <div style={{fontSize:"10px",color:"#818cf8"}}>{userInfo.name||"내담자"} · {new Date().toLocaleDateString("ko-KR")} · CareerForest</div>
                    </div>
                  </div>
                  <div>{fmtAI(aiResult)}</div>
                </div>

                {/* 직업대조표 미니 */}
                <div style={S.card}>
                  <div style={{fontWeight:"700",fontSize:"12px",color:"#4338ca",marginBottom:"8px"}}>📊 비교 직업 요약 데이터</div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"10px"}}>
                      <thead><tr style={{background:"#ede9fe"}}>
                        <th style={{padding:"5px 6px",textAlign:"left",color:"#4338ca"}}>직업</th>
                        {DIMS.slice(0,5).map(d=><th key={d.key} style={{padding:"5px 6px",textAlign:"center",color:"#6366f1"}}>{d.icon}</th>)}
                        <th style={{padding:"5px 6px",textAlign:"center",color:"#4338ca"}}>종합</th>
                      </tr></thead>
                      <tbody>{rankedJobs.map((j,i)=>(
                        <tr key={j.id} style={{background:i%2===0?"#fff":"#f5f3ff"}}>
                          <td style={{padding:"5px 6px",fontWeight:"700",color:COLORS[i%COLORS.length]}}>{j.icon}{j.name}</td>
                          {DIMS.slice(0,5).map(d=><td key={d.key} style={{padding:"5px 6px",textAlign:"center",color:"#374151"}}>{j[d.key]}</td>)}
                          <td style={{padding:"5px 6px",textAlign:"center",fontWeight:"900",color:COLORS[i%COLORS.length]}}>{getScore(j)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>

                <div style={{display:"flex",gap:"7px"}}>
                  <button style={{...S.btn(INDIGO,true),flex:1}} onClick={()=>setStep(4)}>← 가중치 재조정</button>
                  <button style={{...S.btn(),flex:2}} onClick={handlePrint}>🖨️ PDF 보고서 출력</button>
                </div>
                <div style={{textAlign:"center",fontSize:"10px",color:"#c7d2fe",marginTop:"8px",paddingBottom:"12px"}}>한국고용정보원 직업대조표 데이터 기반 · AI 분석 참고용</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
