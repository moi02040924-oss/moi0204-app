import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from "recharts";

const BASE = 76;
const NAVY = "#1B3A6B";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

const LQ = [
  ["성별을 선택하세요.", [["남성", -3], ["여성", 4]]],
  ["인구 200만 명 이상의 도시에 거주하십니까?", [["예", -2], ["아니오", 0]]],
  ["인구 1만 명 이하의 읍·농촌에 거주하십니까?", [["예", 2], ["아니오", 0]]],
  ["조부모 중 한 분이 85세 이상 생존하셨습니까?", [["예", 2], ["아니오", 0]]],
  ["조부모 4분 모두 80세 이상 사셨습니까?", [["예", 6], ["아니오", 0]]],
  ["부모님 중 한 분이 50세 이전에 뇌졸중·심장마비로 돌아가셨습니까?", [["예", -4], ["아니오", 0]]],
  ["부모·형제·자매 중 50세 이하에서 암·심장병·당뇨가 있는 분이 있습니까?", [["예", -3], ["아니오", 0]]],
  ["연간 소득이 6,000만 원을 초과합니까?", [["예", -2], ["아니오", 0]]],
  ["최종 학력을 선택하세요.", [["대학원 학위 또는 전문직 자격증", 2], ["대학교 졸업", 1], ["대학교 미졸업", 0]]],
  ["65세 이상이며 현재 일을 하고 있습니까?", [["예", 3], ["아니오 / 해당없음", 0]]],
  ["배우자나 친한 친구와 함께 생활하고 있습니까?", [["예, 함께 살고 있다", 5], ["혼자 생활 (25세 이후 10년 이내)", -1], ["혼자 생활 (25세 이후 10~20년)", -2], ["혼자 생활 (25세 이후 30년 이상)", -3]]],
  ["주로 앉아서 일합니까? (사무직)", [["예", -1], ["아니오", 0]]],
  ["정규직이며 무거운 육체노동을 합니까?", [["예", 3], ["아니오", 0]]],
  ["운동 빈도를 선택하세요.", [["주 5회 이상 (조깅·수영·테니스 등)", 4], ["주 2~3회 운동", 2], ["거의 하지 않음", 0]]],
  ["매일 10시간 이상 잡니까?", [["예", -4], ["아니오", 0]]],
  ["성격이 감정적·공격적이며 쉽게 화를 냅니까?", [["예", -3], ["아니오", 0]]],
  ["편안하게 생각하고 자주 휴식을 취하십니까?", [["예", 3], ["아니오", 0]]],
  ["현재 삶이 행복합니까?", [["행복하다", 1], ["보통이다", 0], ["불행하다", -2]]],
  ["작년에 속도위반 범칙금을 납부한 적이 있습니까?", [["예", -1], ["아니오", 0]]],
  ["여성이며 연 1회 산부인과 검진을 받고 있습니까?", [["예", 2], ["아니오 / 해당없음", 0]]],
  ["흡연 여부를 선택하세요.", [["하루 2갑 이상", -8], ["하루 1~2갑", -6], ["하루 반~1갑", -3], ["비흡연", 0]]],
  ["과체중 여부를 선택하세요.", [["표준 대비 20kg 이상 초과", -8], ["11~20kg 초과", -4], ["4~10kg 초과", -2], ["정상 체중", 0]]],
  ["40세 이상 남성이며 매년 건강검진을 받습니까?", [["예", 2], ["아니오 / 해당없음", 0]]],
  ["현재 연령대를 선택하세요.", [["30~40세", 2], ["40~50세", 3], ["50~70세", 4], ["30세 미만 또는 70세 초과", 0]]],
];

const DD = [
  {
    key: "health", name: "신체건강", color: "#2E7D32", emoji: "💪",
    qs: ["규칙적으로 운동을 하고 있다", "수면의 질이 좋고 충분히 잔다", "균형 잡힌 식사를 규칙적으로 한다", "정기적으로 건강검진을 받는다", "현재 신체 건강 상태에 만족한다"],
    lv: [
      [20, "매우 우수", "신체 건강 관리가 탁월합니다. 규칙적인 생활습관이 건강수명을 크게 늘려주고 있습니다.", "현재 좋은 습관을 유지하며 새로운 스포츠·활동에도 도전해 보세요.", "건강한 몸은 삶의 모든 여정을 더욱 빛나게 합니다!"],
      [15, "양호", "전반적으로 건강 관리를 잘 하고 있습니다. 일부 영역의 보완이 필요합니다.", "수면·식습관·운동 중 가장 취약한 부분을 집중 개선해 보세요.", "작은 습관 하나가 큰 건강으로 이어집니다!"],
      [10, "보통", "기본적인 건강 관리는 하고 있으나 보다 적극적인 관심이 필요합니다.", "주 3회 30분 걷기와 채소 위주 식단으로 시작해 보세요.", "지금 시작하는 변화가 10년 후 건강을 바꿉니다!"],
      [5, "주의 필요", "건강 관리에 적신호가 켜졌습니다. 즉각적인 관심과 조치가 필요합니다.", "전문 의료인 상담 후 맞춤형 건강 관리 계획을 수립해 보세요.", "몸의 회복력은 생각보다 강합니다. 지금이 변화의 최적 시기입니다!"],
      [0, "위험", "건강 관리가 매우 부족한 상태로 즉각적인 조치가 필요합니다.", "가까운 병원이나 건강증진센터를 방문해 종합검진을 받으세요.", "오늘의 한 걸음이 미래를 바꿀 수 있습니다!"],
    ]
  },
  {
    key: "mental", name: "정신·심리", color: "#1565C0", emoji: "🧠",
    qs: ["스트레스를 효과적으로 관리하고 있다", "정서적으로 안정되고 평온하다", "삶의 의미와 목적을 느끼고 있다", "어려운 상황에서도 긍정적으로 대처한다", "심리적으로 행복하고 만족스럽다"],
    lv: [
      [20, "매우 우수", "정신적으로 매우 건강하고 뛰어난 회복탄력성을 지니고 있습니다.", "이 긍정 에너지를 주변과 나누며 멘토 역할도 고려해 보세요.", "건강한 마음은 삶의 모든 영역을 빛나게 합니다!"],
      [15, "양호", "정신 건강이 전반적으로 양호합니다.", "명상·마음챙김·감사 일기를 일상에 추가해 보세요.", "내면의 평화는 실천할수록 더욱 깊어집니다!"],
      [10, "보통", "보통 수준의 심리 안정을 유지하고 있습니다.", "일기 쓰기, 규칙적 운동, 충분한 수면으로 심리 안정을 도모하세요.", "조금씩 나아지는 것으로 충분합니다!"],
      [5, "주의 필요", "스트레스와 심리적 불안이 높은 상태입니다.", "전문 심리 상담이나 힐링 프로그램에 참여해 보세요.", "도움을 구하는 것은 가장 용기 있는 행동입니다!"],
      [0, "위험", "심리적으로 매우 힘든 상황일 수 있습니다.", "정신건강 위기상담 전화 1577-0199를 활용해 보세요.", "힘든 시간도 지나갑니다. 당신은 혼자가 아닙니다!"],
    ]
  },
  {
    key: "relation", name: "가족·관계", color: "#AD1457", emoji: "👨‍👩‍👧",
    qs: ["가족 간의 관계가 원만하고 행복하다", "신뢰하고 의지할 수 있는 친구가 있다", "다른 사람들과 원활하게 소통한다", "사회적 활동에 적극적으로 참여한다", "인간관계에서 충분한 지지와 사랑을 받는다"],
    lv: [
      [20, "매우 우수", "인간관계가 매우 풍요롭고 강한 사회적 유대를 갖고 있습니다.", "이 관계의 힘을 활용해 새로운 커뮤니티를 이끌어 보세요.", "좋은 관계는 삶을 두 배로 풍요롭게 합니다!"],
      [15, "양호", "전반적으로 좋은 인간관계를 유지하고 있습니다.", "정기적인 만남·연락으로 소중한 관계를 더 돈독히 하세요.", "관계에 투자한 시간은 반드시 행복으로 돌아옵니다!"],
      [10, "보통", "기본적인 관계는 유지되나 더 넓은 인간관계를 만들 여지가 있습니다.", "동호회·봉사활동 등에 참여해 새로운 인연을 만들어 보세요.", "진심 어린 관심 하나가 평생의 인연을 만듭니다!"],
      [5, "주의 필요", "인간관계에서 어려움을 겪고 있을 수 있습니다.", "소통 기술을 배우고 작은 친절과 경청을 실천해 보세요.", "새로운 관계는 언제든 시작될 수 있습니다!"],
      [0, "위험", "사회적 고립감이 높을 수 있습니다.", "지역사회 모임이나 전문 상담을 통해 관계 회복을 시작해 보세요.", "당신의 이야기를 들어줄 사람은 반드시 있습니다!"],
    ]
  },
  {
    key: "career", name: "직업·경력", color: "#E65100", emoji: "💼",
    qs: ["현재 직업이나 역할에 만족한다", "일과 생활의 균형이 잘 이루어진다", "직업적으로 성장하고 발전하고 있다", "내 일에서 보람과 의미를 느낀다", "미래 경력에 대한 명확한 계획이 있다"],
    lv: [
      [20, "매우 우수", "직업적으로 매우 만족스럽고 꾸준히 성장하고 있습니다.", "멘토링이나 강연을 통해 경험을 나누어 보세요.", "좋아하는 일을 하는 것은 인생 최고의 행운입니다!"],
      [15, "양호", "직업 만족도와 성장이 양호합니다.", "새로운 기술 습득이나 네트워킹으로 커리어를 확장해 보세요.", "당신의 커리어는 아직 충분히 성장할 여지가 있습니다!"],
      [10, "보통", "직업 생활을 유지하나 더 큰 만족을 추구할 수 있습니다.", "커리어 코칭이나 직무 교육에 투자해 보세요.", "의미 있는 일을 찾는 여정은 언제나 계속될 수 있습니다!"],
      [5, "주의 필요", "직업적 만족도나 방향성에 어려움이 있습니다.", "직업 상담이나 전직 지원 프로그램을 알아보세요.", "지금의 어려움도 더 나은 길의 발판이 됩니다!"],
      [0, "위험", "직업 생활에 큰 어려움이 있거나 방향을 잃은 상태일 수 있습니다.", "고용센터나 직업상담소에서 전문 도움을 받아보세요.", "새로운 시작은 언제나 가능합니다!"],
    ]
  },
  {
    key: "finance", name: "재정·경제", color: "#4A148C", emoji: "💰",
    qs: ["현재 재정 상태가 안정적이다", "꾸준히 저축 또는 투자를 하고 있다", "노후를 위한 재정 계획이 있다", "재정적 불안 없이 안정적으로 생활한다", "수입과 지출을 체계적으로 관리한다"],
    lv: [
      [20, "매우 우수", "재정 관리가 탁월하고 미래 준비가 잘 되어 있습니다.", "자산 다양화와 사회 환원도 고려해 보세요.", "재정적 자유는 삶의 더 많은 선택지를 열어줍니다!"],
      [15, "양호", "재정 상태가 전반적으로 안정적입니다.", "노후 자금 계획을 더 구체적으로 수립해 보세요.", "꾸준한 저축이 미래의 든든한 기반이 됩니다!"],
      [10, "보통", "기본적인 재정 관리는 하고 있습니다.", "재무 설계사 상담이나 재테크 교육을 받아보세요.", "지금 시작해도 충분합니다. 시작이 반입니다!"],
      [5, "주의 필요", "재정적으로 불안정한 상태일 수 있습니다.", "부채 관리 계획과 긴급 자금 마련을 우선시하세요.", "재정적 어려움에는 반드시 해결책이 있습니다!"],
      [0, "위험", "재정적으로 매우 어려운 상황일 수 있습니다.", "서민금융진흥원 등 공공 지원 기관을 적극 활용하세요.", "재정 회복의 첫 걸음을 지금 내딛을 수 있습니다!"],
    ]
  },
  {
    key: "growth", name: "자기계발·여가", color: "#00695C", emoji: "🌱",
    qs: ["지속적으로 새로운 것을 배우고 있다", "취미나 여가 활동을 즐기고 있다", "개인적인 성장 목표를 갖고 추구한다", "창의적인 활동에 시간을 투자한다", "충분한 휴식으로 삶의 균형을 유지한다"],
    lv: [
      [20, "매우 우수", "자기계발과 여가의 균형이 매우 훌륭합니다.", "배운 것을 강의·글쓰기·코칭으로 나누어 보세요.", "성장하는 사람은 나이와 관계없이 빛납니다!"],
      [15, "양호", "꾸준한 자기계발이 이루어지고 있습니다.", "새로운 분야에도 도전해 시야를 넓혀보세요.", "배움의 기쁨은 나이가 들수록 더욱 깊어집니다!"],
      [10, "보통", "어느 정도 자기계발에 투자하고 있습니다.", "하루 30분 독서나 온라인 강의로 시작해 보세요.", "매일의 작은 배움이 쌓여 큰 성장이 됩니다!"],
      [5, "주의 필요", "자기계발과 여가 활동이 부족한 상태입니다.", "관심 있는 취미 하나를 지금 당장 시작해 보세요.", "취미는 인생에 색깔과 활력을 더해줍니다!"],
      [0, "위험", "삶의 활력과 성장 동력이 부족한 상태입니다.", "지역 문화센터나 복지관의 프로그램을 활용해 보세요.", "호기심을 갖는 것만으로도 충분한 시작입니다!"],
    ]
  },
];

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [info, setInfo] = useState({ name: "", anon: false });
  const [leIdx, setLeIdx] = useState(0);
  const [leAns, setLeAns] = useState({});
  const [domIdx, setDomIdx] = useState(0);
  const [domAns, setDomAns] = useState(Array(6).fill(null).map(() => Array(5).fill(3)));
  const [results, setResults] = useState(null);
  const [allData, setAllData] = useState([]);
  const [pwIn, setPwIn] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const PW = "admin1234";

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("survey_v1");
        if (r) setAllData(JSON.parse(r.value));
      } catch {}
    })();
  }, []);

  const calcLE = () => BASE + Object.values(leAns).reduce((s, v) => s + v, 0);

  const getLv = (lv, score) => lv.find(([m]) => score >= m) || lv[lv.length - 1];

  const finish = async () => {
    const le = calcLE();
    const doms = DD.map((d, i) => ({ ...d, score: domAns[i].reduce((s, v) => s + v, 0) }));
    const rec = {
      id: Date.now(),
      name: info.anon ? "익명" : (info.name || "익명"),
      date: new Date().toLocaleDateString("ko-KR"),
      le,
      domains: doms.map(d => ({ name: d.name, score: d.score }))
    };
    setResults({ le, doms, rec });
    setScreen("results");
    try {
      const up = [...allData, rec];
      await window.storage.set("survey_v1", JSON.stringify(up));
      setAllData(up);
    } catch {}
  };

  const exportCSV = () => {
    const h = ["이름", "검사일", "기대수명", ...DD.map(d => d.name)];
    const rows = allData.map(r => [r.name, r.date, r.le, ...(r.domains?.map(d => d.score) || [])]);
    const csv = [h, ...rows].map(r => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    Object.assign(document.createElement("a"), { href: url, download: "생애설계진단_데이터.csv" }).click();
  };

  const ss = { minHeight: "100vh", background: CREAM, fontFamily: "'Georgia','Batang',serif" };
  const hs = { background: NAVY, color: "white", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" };
  const cs = { background: "white", borderRadius: 12, padding: 22, boxShadow: "0 2px 14px rgba(0,0,0,0.08)", marginBottom: 16 };
  const bp = (bg = NAVY) => ({ background: bg, color: "white", border: "none", borderRadius: 8, padding: "12px 26px", fontSize: 15, cursor: "pointer", fontFamily: "inherit" });
  const bo = { background: "white", color: NAVY, border: `2px solid ${NAVY}`, borderRadius: 8, padding: "10px 22px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" };

  const Stepper = ({ step }) => {
    const steps = ["기본정보", "기대수명", "생애진단", "결과보고"];
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", background: "white", borderBottom: "1px solid #e8e4de" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < step ? GOLD : i === step ? NAVY : "#ddd", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 11, marginTop: 3, color: i === step ? NAVY : "#aaa", fontWeight: i === step ? "bold" : "normal" }}>{s}</div>
            </div>
            {i < 3 && <div style={{ width: 40, height: 2, background: i < step ? GOLD : "#ddd", margin: "0 4px 18px" }} />}
          </div>
        ))}
      </div>
    );
  };

  // ── WELCOME ──────────────────────────────────────────────────────────────
  if (screen === "welcome") return (
    <div style={ss}>
      <div style={hs}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <span style={{ fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>생애설계 진단검사</span>
        </div>
        <button onClick={() => setScreen("admin_login")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "white", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 13 }}>🔐 관리자</button>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🌱</div>
          <h1 style={{ color: NAVY, fontSize: 26, marginBottom: 10, lineHeight: 1.4 }}>나의 기대수명 &amp;<br />생애 6대 영역 진단</h1>
          <p style={{ color: "#666", fontSize: 15, lineHeight: 1.9 }}>검증된 방법으로 나의 현재를 진단하고<br />더 건강하고 행복한 미래를 설계하세요</p>
        </div>
        <div style={cs}>
          <h3 style={{ color: NAVY, marginBottom: 14, fontSize: 16 }}>📋 검사 구성</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["🧮", "기대수명 계산", "24개 요인 기반 산출"], ["🎯", "6대 영역 진단", "30개 문항 5점 척도"], ["📊", "육각형 시각화", "영역별 비교 분석"], ["📄", "PDF 보고서", "결과 저장·출력 제공"]].map(([ic, t, d], i) => (
              <div key={i} style={{ background: CREAM, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 22 }}>{ic}</div>
                <div style={{ fontWeight: "bold", fontSize: 13, color: NAVY, margin: "4px 0 2px" }}>{t}</div>
                <div style={{ fontSize: 12, color: "#777" }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={cs}>
          <ul style={{ paddingLeft: 18, lineHeight: 2.1, fontSize: 14, color: "#555", margin: 0 }}>
            <li>총 소요 시간: 약 10~15분</li>
            <li>무료 제공 · 익명 참여 가능</li>
            <li>결과는 PDF로 저장·출력 가능</li>
            <li>QR코드로 쉽게 접근 및 공유 가능</li>
          </ul>
        </div>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <button onClick={() => setScreen("info")} style={{ ...bp(), fontSize: 17, padding: "15px 50px" }}>검사 시작하기 →</button>
        </div>
        <div style={{ ...cs, textAlign: "center" }}>
          <h3 style={{ color: NAVY, fontSize: 14, marginBottom: 10 }}>📱 QR코드로 공유하기</h3>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(window.location.href)}`} alt="QR" style={{ borderRadius: 8, border: `3px solid ${GOLD}` }} onError={e => e.target.style.display = "none"} />
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>QR코드를 스캔하면 동일한 검사에 접근할 수 있습니다</p>
        </div>
      </div>
    </div>
  );

  // ── INFO ─────────────────────────────────────────────────────────────────
  if (screen === "info") return (
    <div style={ss}>
      <div style={hs}><span style={{ fontSize: 16, fontWeight: "bold" }}>🌿 생애설계 진단검사</span></div>
      <Stepper step={0} />
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px" }}>
        <div style={cs}>
          <h2 style={{ color: NAVY, fontSize: 20, marginBottom: 20 }}>참여자 기본 정보</h2>
          <label style={{ display: "block", fontWeight: "bold", fontSize: 14, color: "#333", marginBottom: 8 }}>이름 (선택 사항)</label>
          <input type="text" placeholder="이름을 입력하세요 (선택)" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} disabled={info.anon}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", background: info.anon ? "#f5f5f5" : "white" }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#555", marginTop: 12 }}>
            <input type="checkbox" checked={info.anon} onChange={e => setInfo({ ...info, anon: e.target.checked, name: "" })} style={{ width: 17, height: 17 }} />
            익명으로 참여합니다
          </label>
          <p style={{ fontSize: 13, color: "#999", marginTop: 16, borderLeft: `3px solid ${GOLD}`, paddingLeft: 12, lineHeight: 1.8 }}>
            입력 정보는 통계 목적으로만 활용되며 외부에 공유되지 않습니다.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setScreen("welcome")} style={bo}>← 이전</button>
          <button onClick={() => { setLeIdx(0); setLeAns({}); setScreen("le_quiz"); }} style={bp()}>기대수명 계산 시작 →</button>
        </div>
      </div>
    </div>
  );

  // ── LE QUIZ ───────────────────────────────────────────────────────────────
  if (screen === "le_quiz") {
    const q = LQ[leIdx];
    const pct = Math.round(((leIdx + 1) / LQ.length) * 100);
    return (
      <div style={ss}>
        <div style={hs}><span style={{ fontSize: 16, fontWeight: "bold" }}>🧮 기대수명 계산</span><span style={{ opacity: .8, fontSize: 13 }}>{leIdx + 1} / {LQ.length}</span></div>
        <div style={{ background: "#ddd", height: 5 }}><div style={{ background: GOLD, height: "100%", width: `${pct}%`, transition: "width .3s" }} /></div>
        <Stepper step={1} />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px" }}>
          <div style={cs}>
            <div style={{ fontSize: 12, color: GOLD, fontWeight: "bold", marginBottom: 6 }}>질문 {leIdx + 1} / {LQ.length}</div>
            <h2 style={{ color: NAVY, fontSize: 18, lineHeight: 1.55, marginBottom: 26 }}>{q[0]}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q[1].map(([label, val], i) => (
                <button key={i} onClick={() => {
                  const na = { ...leAns, [leIdx]: val };
                  setLeAns(na);
                  if (leIdx < LQ.length - 1) setLeIdx(leIdx + 1);
                  else { setDomIdx(0); setDomAns(Array(6).fill(null).map(() => Array(5).fill(3))); setScreen("domain_quiz"); }
                }} style={{ background: leAns[leIdx] === val ? NAVY : "white", color: leAns[leIdx] === val ? "white" : "#333", border: `2px solid ${leAns[leIdx] === val ? NAVY : "#ddd"}`, borderRadius: 8, padding: "13px 16px", fontSize: 15, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .15s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => leIdx > 0 ? setLeIdx(leIdx - 1) : setScreen("info")} style={bo}>← 이전</button>
            {leAns[leIdx] !== undefined && (
              <button onClick={() => {
                if (leIdx < LQ.length - 1) setLeIdx(leIdx + 1);
                else { setDomIdx(0); setScreen("domain_quiz"); }
              }} style={bp()}>다음 →</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DOMAIN QUIZ ───────────────────────────────────────────────────────────
  if (screen === "domain_quiz") {
    const d = DD[domIdx];
    return (
      <div style={{ ...ss, background: "#fafafa" }}>
        <div style={{ ...hs, background: d.color }}><span style={{ fontSize: 16, fontWeight: "bold" }}>{d.emoji} {d.name} 영역</span><span style={{ opacity: .9, fontSize: 13 }}>영역 {domIdx + 1} / {DD.length}</span></div>
        <div style={{ background: "#ddd", height: 5 }}><div style={{ background: d.color, height: "100%", width: `${((domIdx + 1) / DD.length) * 100}%`, transition: "width .4s" }} /></div>
        <Stepper step={2} />
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
          <div style={cs}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 30 }}>{d.emoji}</span>
              <div>
                <h2 style={{ color: d.color, fontSize: 19, margin: 0 }}>{d.name} 진단</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#999" }}>1점(전혀 그렇지 않다) ~ 5점(매우 그렇다)</p>
              </div>
            </div>
            {d.qs.map((q, qi) => (
              <div key={qi} style={{ marginBottom: 16, padding: 14, background: "#f8f7f5", borderRadius: 8, borderLeft: `4px solid ${d.color}` }}>
                <div style={{ fontSize: 14, color: "#333", marginBottom: 10 }}><strong>{qi + 1}.</strong> {q}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#bbb", minWidth: 50, textAlign: "right" }}>전혀 아님</span>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => {
                      const na = domAns.map((arr, ii) => ii === domIdx ? arr.map((a, jj) => jj === qi ? v : a) : [...arr]);
                      setDomAns(na);
                    }} style={{ width: 38, height: 38, borderRadius: "50%", background: domAns[domIdx][qi] === v ? d.color : "white", color: domAns[domIdx][qi] === v ? "white" : d.color, border: `2px solid ${d.color}`, fontSize: 14, fontWeight: "bold", cursor: "pointer", transition: "all .15s" }}>{v}</button>
                  ))}
                  <span style={{ fontSize: 11, color: "#bbb", minWidth: 50 }}>매우 그렇다</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <button onClick={() => domIdx > 0 ? setDomIdx(domIdx - 1) : setScreen("le_quiz")} style={bo}>← 이전</button>
            <button onClick={() => domIdx < DD.length - 1 ? setDomIdx(domIdx + 1) : finish()} style={bp(d.color)}>
              {domIdx < DD.length - 1 ? `다음: ${DD[domIdx + 1].name} →` : "🎯 결과 보기"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (screen === "results" && results) {
    const { le, doms, rec } = results;
    const radar = doms.map(d => ({ subject: d.name, score: d.score, fullMark: 25 }));
    const total = doms.reduce((s, d) => s + d.score, 0);
    const best = [...doms].sort((a, b) => b.score - a.score)[0];
    const worst = [...doms].sort((a, b) => a.score - b.score)[0];
    const leC = le >= 85 ? "#2E7D32" : le >= 80 ? "#1565C0" : le >= 75 ? GOLD : le >= 70 ? "#E65100" : "#C62828";
    const leM = le >= 85 ? "매우 건강한 생애 예측" : le >= 80 ? "건강한 생애 예측" : le >= 75 ? "평균 수준의 생애 예측" : le >= 70 ? "주의가 필요한 생애 예측" : "즉각적인 생활 개선 필요";

    return (
      <div style={{ minHeight: "100vh", background: "white", fontFamily: "'Georgia','Batang',serif" }}>
        <style>{`@media print { .no-print { display: none !important; } body { margin: 0; } }`}</style>
        <div className="no-print" style={hs}>
          <span style={{ fontSize: 16, fontWeight: "bold" }}>🌿 진단 결과 보고서</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={bp(GOLD)}>📄 PDF 저장</button>
            <button onClick={() => { setScreen("welcome"); setResults(null); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.5)", color: "white", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>처음으로</button>
          </div>
        </div>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>
          {/* Title */}
          <div style={{ textAlign: "center", paddingBottom: 22, marginBottom: 24, borderBottom: `3px solid ${NAVY}` }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>🌿</div>
            <h1 style={{ color: NAVY, fontSize: 22, marginBottom: 4 }}>나의 기대수명 &amp; 생애설계 진단 보고서</h1>
            <p style={{ color: "#888", fontSize: 13 }}>참여자: <strong>{rec.name}</strong> &nbsp;|&nbsp; 검사일: {rec.date}</p>
          </div>

          {/* Life Expectancy */}
          <div style={{ ...cs, textAlign: "center", border: `2px solid ${leC}`, marginBottom: 22 }}>
            <h2 style={{ color: NAVY, fontSize: 16, marginBottom: 12 }}>🧮 나의 기대수명</h2>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 76, fontWeight: "bold", color: leC, lineHeight: 1 }}>{le}</span>
              <span style={{ fontSize: 22, color: "#666" }}>세</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: "bold", color: leC, marginBottom: 14 }}>{leM}</div>
            <div style={{ background: "#f9f7f4", borderRadius: 8, padding: 14, fontSize: 13, color: "#666", lineHeight: 1.8, textAlign: "left" }}>
              <strong>📌 계산 기준:</strong> 기준 기대수명 <strong>{BASE}세</strong>에 성별·거주지·가족력·생활습관·건강 상태 등 24개 요인을 가감하여 산출하였습니다.<br />
              <em style={{ fontSize: 12, color: "#aaa" }}>※ 본 결과는 교육적 참고 목적이며 의학적 진단을 대체하지 않습니다.</em>
            </div>
          </div>

          {/* Radar Chart */}
          <div style={{ ...cs, marginBottom: 22 }}>
            <h2 style={{ color: NAVY, fontSize: 16, textAlign: "center", marginBottom: 2 }}>🎯 생애 6대 영역 종합 진단</h2>
            <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 4 }}>총점 <strong style={{ color: NAVY }}>{total}</strong> / 150점</p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radar} margin={{ top: 20, right: 50, bottom: 10, left: 50 }}>
                <PolarGrid stroke="#e0ddd8" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: NAVY, fontSize: 12, fontFamily: "'Georgia',serif", fontWeight: "bold" }} />
                <PolarRadiusAxis domain={[0, 25]} tick={{ fill: "#bbb", fontSize: 10 }} axisLine={false} tickCount={4} />
                <Radar dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.28} strokeWidth={2.5} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", fontSize: 13, marginTop: 4 }}>
              <span>🏆 최고 영역: <strong style={{ color: best.color }}>{best.name} ({best.score}점)</strong></span>
              <span>⚡ 개선 필요: <strong style={{ color: worst.color }}>{worst.name} ({worst.score}점)</strong></span>
            </div>
          </div>

          {/* Domain Cards */}
          <h2 style={{ color: NAVY, fontSize: 16, marginBottom: 14 }}>📋 영역별 상세 분석</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            {doms.map((d, i) => {
              const lvEntry = getLv(d.lv, d.score);
              const grade = lvEntry[1];
              const desc = lvEntry[2];
              const alt = lvEntry[3];
              const hope = lvEntry[4];
              const pct = Math.round((d.score / 25) * 100);
              return (
                <div key={i} style={{ background: "white", border: "1px solid #eee", borderTop: `4px solid ${d.color}`, borderRadius: 10, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 20 }}>{d.emoji}</span>
                      <span style={{ fontWeight: "bold", color: NAVY, fontSize: 14 }}>{d.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 20, fontWeight: "bold", color: d.color }}>{d.score}</span>
                      <span style={{ fontSize: 11, color: "#bbb" }}>/25</span>
                    </div>
                  </div>
                  <div style={{ background: "#eee", borderRadius: 4, height: 6, marginBottom: 10 }}>
                    <div style={{ background: d.color, height: "100%", width: `${pct}%`, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: d.color, marginBottom: 6 }}>📊 {grade}</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 6 }}>{desc}</div>
                  <div style={{ fontSize: 12, color: "#444", background: "#f5f5f5", borderRadius: 6, padding: "8px 10px", marginBottom: 6 }}>
                    <strong>💡 대안:</strong> {alt}
                  </div>
                  <div style={{ fontSize: 12, color: d.color, fontStyle: "italic" }}>✨ {hope}</div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{ ...cs, borderLeft: `5px solid ${GOLD}`, marginBottom: 22 }}>
            <h3 style={{ color: NAVY, fontSize: 15, marginBottom: 12 }}>📝 종합 요약 및 제언</h3>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: "#444", margin: 0 }}>
              {rec.name}님의 기대수명은 <strong style={{ color: leC }}>{le}세</strong>로 산출되었으며, 생애 6대 영역 종합 점수는 <strong style={{ color: NAVY }}>{total}점 / 150점</strong>입니다.
              가장 강점을 보이는 영역은 <strong style={{ color: best.color }}>{best.name}</strong>이며, 상대적으로 <strong style={{ color: worst.color }}>{worst.name}</strong> 영역에 집중적인 관심이 필요합니다.
              균형 잡힌 생애 설계를 통해 더욱 건강하고 행복한 미래를 만들어 나가시길 바랍니다.
            </p>
          </div>

          <div className="no-print" style={{ textAlign: "center", marginBottom: 20, display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => window.print()} style={{ ...bp(GOLD), fontSize: 16, padding: "13px 36px" }}>📄 PDF로 저장하기</button>
            <button onClick={() => { setScreen("welcome"); setResults(null); }} style={bo}>처음으로 돌아가기</button>
          </div>
          <p className="no-print" style={{ textAlign: "center", fontSize: 12, color: "#bbb" }}>※ PDF 저장 시 브라우저의 인쇄 기능을 활용하세요 (Ctrl+P → PDF로 저장)</p>
        </div>
      </div>
    );
  }

  // ── ADMIN LOGIN ───────────────────────────────────────────────────────────
  if (screen === "admin_login") return (
    <div style={{ ...ss, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...cs, width: 340, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
        <h2 style={{ color: NAVY, marginBottom: 20 }}>관리자 로그인</h2>
        <input type="password" placeholder="비밀번호 입력" value={pwIn} onChange={e => { setPwIn(e.target.value); setPwErr(false); }}
          onKeyDown={e => { if (e.key === "Enter") { if (pwIn === PW) { setPwIn(""); setScreen("admin"); } else setPwErr(true); } }}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: `2px solid ${pwErr ? "red" : "#ddd"}`, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8 }} />
        {pwErr && <p style={{ color: "red", fontSize: 13, margin: "0 0 8px" }}>비밀번호가 올바르지 않습니다.</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
          <button onClick={() => setScreen("welcome")} style={bo}>취소</button>
          <button onClick={() => { if (pwIn === PW) { setPwIn(""); setScreen("admin"); } else setPwErr(true); }} style={bp()}>로그인</button>
        </div>
      </div>
    </div>
  );

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  if (screen === "admin") {
    const avg = field => allData.length ? Math.round(allData.reduce((s, r) => s + (r[field] || 0), 0) / allData.length) : 0;
    const domAvg = (name) => {
      const vals = allData.map(r => r.domains?.find(d => d.name === name)?.score).filter(v => v != null);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : "-";
    };
    return (
      <div style={ss}>
        <div style={hs}>
          <span style={{ fontSize: 16, fontWeight: "bold" }}>🔐 관리자 대시보드</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportCSV} style={bp(GOLD)}>📥 CSV 다운로드</button>
            <button onClick={() => setScreen("welcome")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "white", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 13 }}>로그아웃</button>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
            {[["👥", "총 참여자", `${allData.length}명`], ["🧮", "평균 기대수명", `${avg("le")}세`], ["🎯", "평균 총점", `${allData.length ? Math.round(allData.reduce((s, r) => s + (r.domains?.reduce((a, d) => a + d.score, 0) || 0), 0) / allData.length) : 0}점`]].map(([ic, t, v], i) => (
              <div key={i} style={{ ...cs, textAlign: "center", margin: 0 }}>
                <div style={{ fontSize: 28 }}>{ic}</div>
                <div style={{ fontSize: 13, color: "#888", margin: "4px 0 2px" }}>{t}</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: NAVY }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ ...cs, marginBottom: 22 }}>
            <h3 style={{ color: NAVY, marginBottom: 14 }}>📊 영역별 평균 점수</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {DD.map((d, i) => (
                <div key={i} style={{ background: CREAM, borderRadius: 8, padding: "10px 14px", borderLeft: `4px solid ${d.color}` }}>
                  <div style={{ fontSize: 13, color: "#555" }}>{d.emoji} {d.name}</div>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: d.color, marginTop: 4 }}>{domAvg(d.name)} <span style={{ fontSize: 12, color: "#aaa" }}>/25</span></div>
                </div>
              ))}
            </div>
          </div>
          <div style={cs}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ color: NAVY, margin: 0 }}>📋 참여자 목록 ({allData.length}명)</h3>
            </div>
            {allData.length === 0 ? (
              <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: 15 }}>아직 참여 데이터가 없습니다.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: NAVY, color: "white" }}>
                      {["이름", "검사일", "기대수명", ...DD.map(d => d.name)].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontWeight: "bold", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...allData].reverse().map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9f7f4" }}>
                        <td style={{ padding: "9px 12px" }}>{r.name}</td>
                        <td style={{ padding: "9px 12px", color: "#888" }}>{r.date}</td>
                        <td style={{ padding: "9px 12px", fontWeight: "bold", color: NAVY }}>{r.le}세</td>
                        {DD.map((d, j) => (
                          <td key={j} style={{ padding: "9px 12px", color: d.color, fontWeight: "bold" }}>{r.domains?.find(x => x.name === d.name)?.score ?? "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ ...cs, background: "#fffbf0", border: `1px solid ${GOLD}` }}>
            <h3 style={{ color: NAVY, fontSize: 14, marginBottom: 12 }}>💡 데이터 관리 안내</h3>
            <ul style={{ fontSize: 13, color: "#666", lineHeight: 2, paddingLeft: 18, margin: 0 }}>
              <li>참여자 데이터는 브라우저 내 안전한 저장소에 보관됩니다.</li>
              <li>CSV 다운로드로 Excel·SPSS 등 분석 도구에서 활용하세요.</li>
              <li>QR코드로 오프라인 현장에서도 쉽게 배포할 수 있습니다.</li>
              <li>관리자 비밀번호(기본: admin1234)는 코드에서 변경 가능합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
