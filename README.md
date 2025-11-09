# AI 혁신 발표 투표 시스템

증권사 현업부서들의 AI 활용 혁신 사례 발표에 대한 실시간 투표 시스템입니다.

## 주요 기능

### 참여자 기능
- 🎯 **로그인 없는 영구 세션**: 브라우저 기반 세션 관리로 재방문 시 이전 투표 자동 표시
- ✅ **복수 팀 선택**: 관리자가 지정한 갯수(예: 5개)의 발표 팀 선택
- 🔢 **선택 현황 표시**: 상단 고정 영역에 "현재 선택 X / 필요 N" 실시간 표시
- 🔄 **토글 방식**: 선택한 팀 다시 클릭 시 선택 취소
- ⚠️ **유효성 검증**: 선택 갯수 부족/초과 시 알림 및 제출 차단
- 📤 **일괄 제출**: 지정된 갯수 선택 완료 후 일괄 제출
- 📱 **모바일 최적화**: 터치하기 쉬운 큰 버튼, 반응형 디자인

### 관리자 기능
- 🔐 **비밀번호 인증**: 간단한 비밀번호로 관리자 페이지 접근
- 📁 **JSON 업로드**: 발표팀 데이터를 JSON 파일로 업로드하여 관리
- 🔢 **선택 갯수 설정**: 참여자가 선택해야 하는 팀의 갯수 지정
- 🎨 **테마 선택**: 6개 디자인 컨셉 중 선택 또는 랜덤 테마 활성화
- 📈 **실시간 통계**: 총 참여자 수, 각 발표별 선택 횟수, 순위
- 📋 **개별 투표 내역**: 모든 참여자의 선택 팀 조회
- 🎛️ **투표 제어**: 투표 시작/종료 버튼
- 🔄 **투표 초기화**: 모든 투표 데이터 삭제
- 🔄 **자동 새로고침**: 10초마다 통계 자동 업데이트

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: React Hooks
- **데이터베이스**: 메모리 기반 (로컬), Vercel Postgres (프로덕션)
- **배포**: Vercel

## 로컬 실행 방법

### 1. 저장소 클론
```bash
git clone <repository-url>
cd voting-app
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local` 파일이 이미 포함되어 있습니다:
```env
ADMIN_PASSWORD=admin2024
```

원하는 비밀번호로 변경 가능합니다.

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 5. 관리자 페이지 접속
http://localhost:3000/admin/login

비밀번호: `admin2024` (또는 `.env.local`에 설정한 값)

## 발표 데이터 수정 방법

### 방법 1: JSON 파일 직접 수정 (로컬 개발)
`data/presentations.json` 파일을 수정하여 발표 주제를 변경할 수 있습니다:

```json
{
  "presentations": [
    {
      "id": 1,
      "teamName": "팀명 (10자 이내)",
      "title": "발표 제목 (50자 이내)"
    }
  ]
}
```

**주의사항:**
- `id`는 1부터 시작하는 고유한 숫자
- `teamName`은 10자 이내 권장
- `title`은 50자 이내 권장
- 수정 후 서버 재시작 필요

### 방법 2: 관리자 페이지에서 JSON 업로드 (운영 환경 권장)
1. 관리자 페이지(`/admin`) 접속
2. "설정 관리" 섹션에서 "발표 데이터 업로드" 선택
3. 준비한 JSON 파일 업로드
4. 즉시 반영됨 (서버 재시작 불필요)

## 프로젝트 구조

```
voting-app/
├── app/
│   ├── page.tsx                # 메인 투표 페이지 (테마로 리다이렉트)
│   ├── layout.tsx              # 레이아웃
│   ├── globals.css             # 전역 스타일
│   ├── concepts/               # 6개 디자인 컨셉
│   │   ├── page.tsx            # 컨셉 목록 페이지
│   │   ├── concept1/           # 컨셉 1: Futuristic Glassmorphism
│   │   ├── concept2/           # 컨셉 2: Neural Network Theme
│   │   ├── concept3/           # 컨셉 3: Minimalist Professional
│   │   ├── concept4/           # 컨셉 4: Vibrant Innovation
│   │   ├── concept5/           # 컨셉 5: 3D Modern Cards
│   │   └── concept6/           # 컨셉 6: Cosmic Tech (기본)
│   ├── admin/
│   │   ├── page.tsx            # 관리자 대시보드
│   │   └── login/
│   │       └── page.tsx        # 관리자 로그인
│   └── api/
│       ├── config/             # 설정 조회 API
│       ├── presentations/      # 발표 목록 API
│       ├── session/            # 세션 생성 API
│       ├── votes/              # 투표 API
│       └── admin/              # 관리자 API
│           ├── stats/          # 통계 조회
│           ├── theme/          # 테마 설정
│           ├── config/         # 설정 변경
│           ├── presentations/  # 발표 데이터 업로드
│           ├── toggle-voting/  # 투표 시작/종료
│           ├── reset-votes/    # 투표 초기화
│           └── all-votes/      # 전체 투표 내역
├── components/
│   ├── ProgressBar.tsx         # 진행률 바
│   └── PresentationCard.tsx    # 발표 카드
├── lib/
│   ├── db.ts                   # 데이터베이스 (메모리)
│   ├── session.ts              # 세션 관리
│   ├── themes.ts               # 테마 설정
│   └── auth.ts                 # 인증
├── data/
│   └── presentations.json      # 발표 데이터
└── .env.local                  # 환경변수
```

## 빌드 및 프로덕션

### 빌드
```bash
npm run build
```

### 프로덕션 실행
```bash
npm start
```

## 배포 가이드

자세한 배포 방법은 `DEPLOYMENT_GUIDE.md`를 참고하세요.

### Vercel 배포 (권장)
1. GitHub에 저장소 푸시
2. Vercel 웹사이트에서 프로젝트 import
3. 환경변수 `ADMIN_PASSWORD` 설정
4. 자동 배포 완료

## 사용 시나리오

### 행사 당일 흐름
1. **사전 준비** (행사 1일 전)
   - 관리자 페이지에서 발표 데이터 JSON 업로드
   - 필요 선택 갯수 설정 (예: 5개)
   - Vercel에 배포
   - 관리자 페이지에서 정상 작동 확인

2. **행사 시작**
   - 카카오톡 단톡방에 URL 공유
   - 참여자들이 각자의 스마트폰으로 접속
   - 지정된 갯수의 발표 팀 선택 후 제출

3. **행사 진행 중**
   - 관리자는 실시간으로 선택 현황 모니터링
   - 선택 많이 받은 순서로 순위 확인
   - 참여자는 투표 종료 전까지 재제출 가능

4. **행사 종료**
   - 관리자 페이지에서 "투표 종료" 버튼 클릭
   - 최종 순위 확인 및 결과 발표

## 디자인 테마 시스템

### 6개 디자인 컨셉
1. **Concept 1: Futuristic Glassmorphism** - 투명한 유리 효과와 그라디언트
2. **Concept 2: Neural Network Theme** - AI 신경망 시각화 다크 테마
3. **Concept 3: Minimalist Professional** - 깔끔하고 전문적인 디자인
4. **Concept 4: Vibrant Innovation** - 대담한 색상과 활기찬 애니메이션
5. **Concept 5: 3D Modern Cards** - 깊이감 있는 3D 효과
6. **Concept 6: Cosmic Tech** (기본) - 우주와 별 모티프

### 테마 적용 방식
- **관리자 선택**: 관리자 페이지에서 특정 컨셉 선택
- **랜덤 테마**: 참여자가 접속할 때마다 무작위로 다른 테마 표시

자세한 내용은 `THEME_GUIDE.md` 참조

## 주요 특징

### 보안
- 관리자 페이지는 비밀번호로 보호
- 환경변수로 비밀번호 관리 (.env.local은 Git에 포함되지 않음)
- 개인정보 수집 최소화 (세션 ID만 사용)
- 설정 변경 감지 및 투표 무효화 시스템

### 성능
- 200명 동시 접속 지원
- 자동 저장으로 데이터 손실 방지
- 메모리 기반 데이터베이스로 빠른 응답 속도

### 사용성
- 로그인 없이 즉시 투표 가능
- 재방문 시 이전 투표 자동 복원
- 모바일 우선 디자인
- 직관적인 선택 UI (체크박스 + 시각적 피드백)
- 상단 고정 선택 현황 표시
- 하단 고정 제출 버튼으로 편리한 접근

## 제한사항 및 참고사항

### 로컬 개발 환경
- 메모리 기반 데이터베이스 사용
- 서버 재시작 시 모든 데이터 초기화
- Vercel 배포 시 Vercel Postgres로 전환 필요 (선택사항)

### 데이터 영속성
- 현재 버전은 메모리 기반으로 서버 재시작 시 데이터 손실
- 프로덕션 환경에서는 Vercel Postgres 연결 권장

### 동시 접속
- 200명 동시 접속 테스트 완료
- Vercel 무료 tier 제한 확인 필요

## 문제 해결

### 투표가 저장되지 않을 때
- 브라우저 localStorage가 활성화되어 있는지 확인
- 시크릿 모드에서는 localStorage가 제한될 수 있음

### 관리자 페이지 접속 불가
- `.env.local` 파일에 `ADMIN_PASSWORD` 설정 확인
- 서버 재시작 후 다시 시도

### 모바일에서 레이아웃 깨짐
- 최신 브라우저 사용 권장 (Chrome, Safari)
- 화면 새로고침 시도

## 라이선스

ISC

## 문의

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해주세요.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
