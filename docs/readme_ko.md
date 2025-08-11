<!-- 배너 -->
<div align="center">
  <img src="../assets/fewinfos-banner.png" alt="FEWINFOS Contribution - GitHub Repository Stats Widget에 오신 것을 환영합니다" width="100%">
</div>

# 📦 GitHub 저장소 통계 위젯

오픈소스, 완전 클라이언트 측 도구로 **GitHub 저장소의 실시간 통계**를 인터랙티브하고 맞춤형 형식으로 시각화합니다. 개발자, 오픈소스 프로젝트 유지관리자, 포트폴리오에 이상적입니다.

---

## 🎯 목표

이 위젯은 GitHub REST API를 사용하여 모든 공개 GitHub 저장소의 다양한 메타데이터와 분석 정보를 가져와 표시합니다. **백엔드나 인증 없이 브라우저에서만** 작동합니다.

---

## ✨ 기능

- 🔄 GitHub REST API를 통한 실시간 데이터 가져오기  
- ⭐ 스타 수, 포크 수, 워처 수, 오픈/닫힌 이슈 표시  
- 👥 기여자 아바타와 커밋 수 표시  
- 📊 사용 언어를 인터랙티브 차트로 표시  
- 📅 저장소 생성일 및 마지막 업데이트 시간 표시  
- 📜 라이선스 정보 표시  
- 🎨 깔끔하고 반응형이며 맞춤 가능한 UI  
- 💻 브라우저에서 직접 실행 (서버 설정 불필요)  
- 🧩 웹사이트나 README.md에 쉽게 포함 가능  
- 📈 Chart.js를 활용한 추가 시각화  

---

## 🧱 기술 스택

- **HTML** – 구조와 마크업  
- **CSS** – 스타일과 반응형 디자인  
- **JavaScript** – 로직과 API 처리  
- **GitHub REST API** – 데이터 소스  
- **Chart.js** – 차트 생성 (선택 사항)  

---

## 📊 제공 위젯

### 🔍 저장소 통계

- ⭐ 스타 / 🍴 포크 / 👁️ 워처  
- 📅 생성일 및 마지막 업데이트  
- 📜 라이선스 종류  
- 📊 사용 언어 (파이 차트, 바 차트, 도넛 차트)  
- 📦 의존성 그래프 (npm, pip 등)  
- 📈 커밋 활동 히트맵  
- 🕐 평균 PR 병합 시간  
- 🧵 이슈 분류 (오픈 / 닫힘 / 고정됨)  

### 👥 기여자 위젯

- 👥 상위 기여자 (아바타 + 커밋 수)  
- 📊 요일별 기여도  
- 🗺️ 기여자 위치 지도 (공개 데이터 기준)  
- ⏱️ 최근 기여자 (최근 7 / 30일)  
- 📈 시간에 따른 기여 변화 (누적 그래프)  

### 📊 시각화 위젯

- 📊 저장소 ‘건강’ 레이더 차트 (스타, 포크, PR, 이슈)  
- 📉 스타/포크 증가 추세 선 그래프  
- 🍩 사용 언어 도넛 차트  
- 📈 이슈/PR 추세 차트  
- 📆 GitHub 스타일 활동 캘린더  

### ⚙️ DevOps 및 CI/CD

- 🚦 GitHub Actions CI/CD 상태 배지  
- 🧪 코드 커버리지 배지 (Codecov, Coveralls)  
- 🔄 마지막 워크플로 실행 상태 표시  
- 🛠️ 빌드 히스토리 피드 (성공/실패)  

### 📌 이슈 및 PR

- 📋 고정된 이슈나 토론  
- 🔍 이슈 라벨 워드 클라우드  
- 📬 PR 병합 진행률 표시기  
- 📈 이슈 감정 분석 (키워드 기반)  

### 🧩 기타 위젯

- 📌 즐겨찾기 버튼  
- 🔍 다른 저장소 검색 기능  
- 🧠 커밋 요약 AI (선택 사항)  
- 🔗 관련 저장소 위젯  
- 🪄 iframe / HTML 내보내기  


## 📂 프로젝트 구조
```
github-repo-stats-widget/
├── index.html # 메인 HTML 파일
├── style.css # CSS 스타일
├── repo.js # JavaScript 로직
├── charts.js # 차트 로직
├── assets/ # 아이콘, 스크린샷
├── README.md # 이 문서
└── LICENSE # MIT 라이선스
```
---

## 🚀 배포

**GitHub Pages** 또는 Netlify, Vercel, Firebase 같은 정적 호스팅에 배포할 수 있습니다.

### GitHub Pages로 배포

1. 프로젝트를 GitHub에 업로드  
2. **Settings → Pages**로 이동  
3. 브랜치: `main` / 폴더: `/ (root)` 선택  
4. 위젯은 다음 주소에서 접근 가능:  
   `https://yourusername.github.io/github-repo-stats-widget/`
