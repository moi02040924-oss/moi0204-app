# 커리어포레스트 GitHub 수정 가이드
## https://github.com/kanghuntwo/kanghuntwo.github.io

---

## 1단계: diagnosis-hub.html 추가 (새 파일)
→ 이미 만들어준 `diagnosis-hub.html` 파일을 GitHub에 업로드

방법:
1. https://github.com/kanghuntwo/kanghuntwo.github.io 접속
2. "Add file" → "Upload files" 클릭
3. diagnosis-hub.html 파일 업로드
4. Commit changes

---

## 2단계: index.html 수정 (6곳)

1. https://github.com/kanghuntwo/kanghuntwo.github.io 접속
2. index.html 클릭
3. 연필 아이콘(✏️ Edit) 클릭
4. Ctrl+H (찾기/바꾸기) 로 아래 6가지 수정

---

### 🔁 수정 1 — 카카오 링크 변경

찾기:
```
https://open.kakao.com/o/sfcCPVii
```
바꾸기:
```
https://pf.kakao.com/_EJNlX
```
→ 1곳 (CTA 섹션 카카오 버튼)

---

### 🔁 수정 2 — 네비게이션 무료진단 링크

찾기:
```
<a href="#diagnosis">무료 진단</a>
```
바꾸기:
```
<a href="diagnosis-hub.html">무료 진단</a>
```

---

### 🔁 수정 3 — 히어로 무료생애진단 버튼

찾기:
```
<a href="#diagnosis" class="btn-primary">🧭 무료 생애진단 시작</a>
```
바꾸기:
```
<a href="diagnosis-hub.html" class="btn-primary">🧭 무료 생애진단 시작</a>
```

---

### 🔁 수정 4 — 진단섹션 시작하기 버튼

찾기:
```
<a href="diagnosis.html" class="btn-gold">🧭 무료 진단 시작하기 →</a>
```
바꾸기:
```
<a href="diagnosis-hub.html" class="btn-gold">🧭 무료 진단 시작하기 →</a>
```

---

### 🔁 수정 5 — CTA 섹션 무료진단 버튼

찾기:
```
<a href="diagnosis.html" class="btn-outline" style="border-color:white;color:white;">🧭 무료 진단 먼저 해보기</a>
```
바꾸기:
```
<a href="diagnosis-hub.html" class="btn-outline" style="border-color:white;color:white;">🧭 무료 진단 먼저 해보기</a>
```

---

### 🔁 수정 6 — 푸터 무료진단 링크

찾기:
```
<a href="diagnosis.html">무료진단</a>
```
바꾸기:
```
<a href="diagnosis-hub.html">무료진단</a>
```

---

## ✅ 완료 후 확인 체크리스트

- [ ] diagnosis-hub.html 업로드 완료
- [ ] 카카오 링크 → pf.kakao.com/_EJNlX
- [ ] 네비 "무료 진단" → diagnosis-hub.html
- [ ] 히어로 "무료 생애진단 시작" → diagnosis-hub.html
- [ ] 진단섹션 "시작하기" → diagnosis-hub.html
- [ ] CTA "무료 진단 먼저 해보기" → diagnosis-hub.html
- [ ] 푸터 "무료진단" → diagnosis-hub.html

---
diagnosis-hub.html 안에서는 카카오채널 링크가 이미 pf.kakao.com/_EJNlX 로 설정되어 있어요 ✓
