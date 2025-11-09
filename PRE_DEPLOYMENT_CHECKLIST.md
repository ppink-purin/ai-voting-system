# 배포 전 체크리스트 및 작업 가이드

AI 혁신 발표 투표 시스템을 Vercel에 배포하기 전에 반드시 확인해야 할 사항들을 단계별로 정리했습니다.

---

## 📋 목차

1. [코드 최종 검토](#1-코드-최종-검토)
2. [환경 설정 확인](#2-환경-설정-확인)
3. [로컬 테스트](#3-로컬-테스트)
4. [발표 데이터 준비](#4-발표-데이터-준비)
5. [Git 저장소 준비](#5-git-저장소-준비)
6. [Vercel 배포](#6-vercel-배포)
7. [배포 후 검증](#7-배포-후-검증)
8. [행사 준비](#8-행사-준비)

---

## 1. 코드 최종 검토

### ✅ 필수 파일 존재 확인

```bash
cd c:\Project\cc-voting-app-practice\voting-app

# 핵심 파일들
ls app/page.tsx
ls app/admin/page.tsx
ls lib/db.ts
ls lib/themes.ts
ls data/presentations.json

# 환경변수 파일
ls .env.local

# 설정 파일들
ls package.json
ls next.config.js
ls tailwind.config.js
ls tsconfig.json
```

**확인 결과**: 모든 파일이 존재하면 ✅

---

### ✅ .gitignore 확인

`.gitignore` 파일에 다음이 포함되어 있는지 확인:

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local  # 이 줄이 반드시 있어야 함!

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

**⚠️ 중요**: `.env.local`이 Git에 포함되면 비밀번호가 노출됩니다!

---

### ✅ 빌드 테스트

```bash
npm run build
```

**예상 결과**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization
```

**에러 발생 시**:
- TypeScript 에러: 타입 오류 수정
- 빌드 에러: 해당 파일 확인 및 수정
- 메모리 부족: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

---

## 2. 환경 설정 확인

### ✅ .env.local 파일 확인

```bash
cat .env.local
```

**내용 확인**:
```env
ADMIN_PASSWORD=admin2024
```

**⚠️ 주의**:
- 이 파일은 **Git에 커밋하지 말 것**
- 프로덕션 환경에서는 더 강력한 비밀번호 사용 권장

---

### ✅ 비밀번호 강도 체크

프로덕션용 비밀번호 권장 사항:
- ✅ 최소 12자 이상
- ✅ 대문자, 소문자, 숫자, 특수문자 포함
- ✅ 예측 불가능한 문자열
- ❌ `admin`, `password`, `12345678` 같은 단순 비밀번호 지양

**예시**:
```
좋은 비밀번호: Tr4nsF0rm@2024!Innovation
나쁜 비밀번호: admin2024
```

---

## 3. 로컬 테스트

### ✅ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

### ✅ 참여자 페이지 테스트

**체크리스트**:
- [ ] 페이지가 정상적으로 로딩됨
- [ ] 선택한 테마로 리다이렉션됨 (기본: `/concepts/concept6`)
- [ ] 20개 발표 팀 목록이 표시됨
- [ ] 상단에 "현재 선택: 0 / 5" 표시
- [ ] 팀 선택 시 파란색 하이라이트 표시
- [ ] 5개 선택 완료 시 제출 버튼 활성화
- [ ] 투표 제출 성공 메시지 표시
- [ ] 재방문 시 이전 선택 표시됨 (localStorage)

---

### ✅ 관리자 페이지 테스트

**로그인 테스트** (`http://localhost:3000/admin/login`):
- [ ] 비밀번호 입력 후 로그인 성공
- [ ] 대시보드로 리다이렉션

**대시보드 기능** (`http://localhost:3000/admin`):
- [ ] 총 참여자 수 정확히 표시
- [ ] 필요 선택 갯수 표시
- [ ] 투표 상태 "진행 중" 표시
- [ ] 투표 제어 버튼 작동
- [ ] 순위 테이블 정상 표시
- [ ] 개별 투표 내역 표시

**설정 관리 기능**:
- [ ] 발표 데이터 JSON 업로드 작동
- [ ] 필요 선택 갯수 변경 작동
- [ ] 디자인 테마 선택 작동
- [ ] 랜덤 테마 체크박스 작동

**투표 초기화**:
- [ ] "투표 데이터 초기화" 버튼 작동
- [ ] 경고 모달 표시
- [ ] 초기화 후 데이터 모두 삭제 확인

---

### ✅ 테마 전환 테스트

1. 관리자 페이지에서 테마 변경 (예: Concept 1)
2. 참여자 페이지 접속 → `/concepts/concept1`로 리다이렉션 확인
3. 랜덤 테마 활성화
4. 참여자 페이지 새로고침 여러 번 → 매번 다른 테마 확인

---

### ✅ 모바일 반응형 테스트

브라우저 개발자 도구 (F12) → 모바일 화면 테스트:
- [ ] iPhone 12 Pro (390x844)
- [ ] Samsung Galaxy S20 (360x800)
- [ ] iPad (810x1080)

**확인 사항**:
- 레이아웃이 깨지지 않음
- 텍스트가 읽기 쉬움
- 버튼이 터치하기 쉬움
- 스크롤이 부드러움

---

## 4. 발표 데이터 준비

### ✅ presentations.json 파일 확인

```bash
cat data/presentations.json
```

**형식 확인**:
```json
{
  "presentations": [
    {
      "id": 1,
      "teamName": "팀명",
      "title": "발표 제목"
    }
  ]
}
```

**검증 항목**:
- [ ] JSON 형식이 올바름 (문법 오류 없음)
- [ ] `id`가 1부터 순차적
- [ ] `teamName`이 중복되지 않음
- [ ] `title`이 너무 길지 않음 (50자 이내 권장)
- [ ] 총 발표 팀 수가 올바름

**온라인 JSON 검증 도구**: https://jsonlint.com/

---

### ✅ 실제 발표 데이터로 교체

**현재 데이터**: 20개 샘플 데이터 (알파시그널, 스마트애널 등)

**행사용 데이터로 교체**:
1. 실제 발표 팀 정보 수집
2. `data/presentations.json` 파일 수정
3. 파일 저장
4. 로컬 테스트 (서버 재시작 후)

**또는 배포 후**:
- 관리자 페이지에서 JSON 업로드 기능 사용 (추천)

---

## 5. Git 저장소 준비

### ✅ Git 초기화 (아직 안 했다면)

```bash
git init
git add .
git commit -m "Initial commit: AI Innovation Voting System"
```

---

### ✅ GitHub 저장소 생성

1. https://github.com 접속 및 로그인
2. 우측 상단 "+" → "New repository"
3. Repository name: `ai-voting-system` (원하는 이름)
4. Description: `AI Innovation Voting System for 200 participants`
5. **Public** 또는 **Private** 선택
6. **중요**: "Initialize this repository with" 옵션 모두 체크 **해제**
7. "Create repository" 클릭

---

### ✅ 로컬 저장소 연결 및 푸시

GitHub에서 제공하는 명령어 복사 후 실행:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-voting-system.git
git branch -M main
git push -u origin main
```

**⚠️ 주의**:
- `YOUR_USERNAME`을 실제 GitHub 사용자명으로 변경
- `.env.local` 파일이 푸시되지 않았는지 재확인!

---

### ✅ GitHub에서 확인

https://github.com/YOUR_USERNAME/ai-voting-system 접속:
- [ ] 모든 파일이 업로드됨
- [ ] `.env.local`이 **보이지 않음** (중요!)
- [ ] README.md가 표시됨

---

## 6. Vercel 배포

### ✅ Vercel 계정 생성

1. https://vercel.com 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 선택 (권장)
4. GitHub 권한 승인

---

### ✅ 프로젝트 Import

1. Vercel 대시보드에서 "Add New..." → "Project"
2. "Import Git Repository" 섹션
3. GitHub 저장소 목록에서 `ai-voting-system` 찾기
4. "Import" 버튼 클릭

---

### ✅ 프로젝트 설정

**Configure Project** 화면:

| 항목 | 값 | 설명 |
|------|-----|------|
| Project Name | ai-voting-system | 자동 생성됨 (변경 가능) |
| Framework Preset | Next.js | 자동 감지됨 |
| Root Directory | `./` | 기본값 유지 |
| Build Command | `npm run build` | 기본값 유지 |
| Output Directory | `.next` | 기본값 유지 |
| Install Command | `npm install` | 기본값 유지 |

---

### ✅ 환경변수 설정 (중요!)

"Environment Variables" 섹션 펼치기:

**추가할 변수**:

| Name | Value | Environment |
|------|-------|-------------|
| `ADMIN_PASSWORD` | (강력한 비밀번호 입력) | Production, Preview, Development 모두 선택 |

**예시**:
```
Name: ADMIN_PASSWORD
Value: Tr4nsF0rm@2024!Innovation
Environment: ✅ Production ✅ Preview ✅ Development
```

**✅ "Add" 버튼 클릭**

**⚠️ 초중요**:
- 비밀번호를 안전하게 보관하세요!
- 이 비밀번호로 관리자 페이지에 로그인합니다
- 나중에 변경 가능하지만 재배포 필요

---

### ✅ 배포 시작

1. 모든 설정 확인
2. **"Deploy" 버튼 클릭**
3. 빌드 로그 실시간 확인 (1~3분 소요)

**빌드 로그 예시**:
```
Cloning repository...
Installing dependencies...
Building...
✓ Compiled successfully
Deploying...
✅ Deployment complete!
```

---

### ✅ 배포 완료 확인

축하 화면이 표시되면 성공!

**배포 URL 형식**:
```
https://ai-voting-system-username.vercel.app
```

또는

```
https://ai-voting-system.vercel.app
```

**📝 URL을 복사하여 안전한 곳에 저장하세요!**

---

## 7. 배포 후 검증

### ✅ 참여자 페이지 접속

```
https://your-project.vercel.app
```

**체크리스트**:
- [ ] 페이지가 로딩됨 (최초 로딩은 3~5초 소요 가능)
- [ ] 선택한 테마로 표시됨
- [ ] 20개 발표 팀 표시
- [ ] 팀 선택 작동
- [ ] 투표 제출 작동
- [ ] 새로고침 후 선택 유지됨

---

### ✅ 관리자 로그인

```
https://your-project.vercel.app/admin/login
```

**체크리스트**:
- [ ] 로그인 페이지 표시
- [ ] Vercel 환경변수에 설정한 비밀번호로 로그인 성공
- [ ] 관리자 대시보드 표시
- [ ] 통계가 정상 표시됨

---

### ✅ 모든 기능 테스트

**참여자 기능**:
- [ ] 투표 제출
- [ ] 재방문 시 복원
- [ ] 투표 종료 시 차단

**관리자 기능**:
- [ ] 발표 데이터 JSON 업로드
- [ ] 필요 선택 갯수 변경
- [ ] 테마 선택 및 변경
- [ ] 랜덤 테마 활성화
- [ ] 투표 시작/종료
- [ ] 투표 초기화
- [ ] 통계 조회
- [ ] 자동 새로고침

---

### ✅ 모바일 테스트

실제 스마트폰으로 접속:
- [ ] 참여자 페이지 정상 표시
- [ ] 터치 조작 원활
- [ ] 레이아웃 깨짐 없음
- [ ] 투표 제출 성공

---

### ✅ 성능 테스트

**로딩 속도**:
- 첫 접속: ~3초 (Cold Start)
- 재접속: ~1초

**API 응답 속도**:
- `/api/config`: ~100ms
- `/api/votes`: ~200ms

---

## 8. 행사 준비

### ✅ 발표 데이터 최종 확인

**방법 1**: 로컬에서 수정 후 재배포
```bash
# data/presentations.json 수정
git add data/presentations.json
git commit -m "Update presentations for event"
git push origin main
# Vercel이 자동으로 재배포 (1~2분 소요)
```

**방법 2**: 관리자 페이지에서 JSON 업로드 (추천)
1. 관리자 페이지 접속
2. "발표 데이터 업로드" 선택
3. JSON 파일 업로드
4. 즉시 반영

---

### ✅ 시스템 설정 확인

**관리자 페이지에서**:
- [ ] 필요 선택 갯수: 5개 (또는 원하는 값)
- [ ] 디자인 테마: Cosmic Tech (또는 선택한 테마)
- [ ] 랜덤 테마: 비활성화 (또는 활성화)
- [ ] 투표 상태: 진행 중

---

### ✅ 테스트 투표 및 초기화

**깨끗한 상태로 시작하기**:
1. 테스트 투표 여러 건 실행
2. 관리자 페이지에서 통계 확인
3. "투표 데이터 초기화" 버튼 클릭
4. 모든 데이터가 삭제되었는지 확인
5. 행사 시작 준비 완료!

---

### ✅ URL 공유 준비

**카카오톡 공유 메시지 템플릿**:

```
📊 AI 혁신 발표 투표

안녕하세요!
오늘 발표하신 팀들의 혁신 사례에 대해
여러분의 평가를 부탁드립니다.

🔗 투표 링크:
https://your-project.vercel.app

📱 사용 방법:
1. 위 링크 클릭
2. 마음에 드는 5개 팀 선택
3. 하단 제출 버튼 클릭
4. 투표 종료 전까지 수정 가능

⏰ 투표 마감: [시간]

감사합니다!
```

---

### ✅ QR 코드 생성 (선택사항)

온라인 QR 생성기:
- https://www.qr-code-generator.com/
- https://www.qr-monkey.com/

**생성할 QR 코드**:
```
https://your-project.vercel.app
```

**사용 목적**:
- 발표 화면에 표시
- 인쇄물에 포함
- 빠른 접속 유도

---

### ✅ 관리자 비밀번호 공유

**관리자 담당자에게 전달**:
- URL: `https://your-project.vercel.app/admin/login`
- 비밀번호: (Vercel 환경변수에 설정한 값)

**보안 주의사항**:
- 비밀번호를 안전하게 전달 (암호화된 채널 사용)
- 행사 종료 후 비밀번호 변경 권장

---

## 9. 행사 당일 체크리스트

### ✅ 행사 시작 1시간 전

- [ ] 배포 URL 접속 확인
- [ ] 관리자 로그인 확인
- [ ] 투표 상태 "진행 중" 확인
- [ ] 발표 데이터 최종 확인
- [ ] 테스트 투표 후 초기화
- [ ] 모바일 테스트 (실제 기기)

---

### ✅ 행사 시작

- [ ] 참여자들에게 URL 공유 (카카오톡)
- [ ] QR 코드 화면 표시 (선택사항)
- [ ] 관리자 대시보드 열어두기
- [ ] 실시간 통계 모니터링

---

### ✅ 행사 진행 중

- [ ] 주기적으로 참여자 수 확인
- [ ] 문제 발생 시 즉시 대응
- [ ] Vercel 함수 로그 모니터링 (필요시)

---

### ✅ 투표 종료

- [ ] "투표 종료" 버튼 클릭
- [ ] 최종 순위 스크린샷 저장
- [ ] 결과 발표 준비

---

## 10. 문제 해결

### ❌ 빌드 실패 시

**증상**: Vercel 빌드 로그에 에러

**해결**:
1. 로컬에서 `npm run build` 실행
2. 에러 메시지 확인 및 수정
3. Git 커밋 및 푸시
4. Vercel 자동 재배포 대기

---

### ❌ 환경변수 미적용

**증상**: 관리자 비밀번호가 작동하지 않음

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `ADMIN_PASSWORD` 확인
3. 필요시 수정 후 재배포

---

### ❌ 페이지 404 에러

**증상**: 배포는 성공했으나 페이지가 열리지 않음

**해결**:
1. Vercel 프로젝트 설정에서 Root Directory 확인
2. Framework Preset이 Next.js인지 확인
3. 재배포 시도

---

### ❌ 데이터가 사라짐

**증상**: 투표 데이터가 갑자기 초기화됨

**원인**: 메모리 기반 데이터베이스는 서버 재시작 시 초기화

**해결**:
- Vercel Postgres 연결 (DEPLOYMENT_GUIDE.md 참조)
- 또는 행사 시간 동안은 데이터 유지됨 (보통 문제 없음)

---

## 11. 최종 점검표

### 배포 전

- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] `.gitignore`에 `.env*.local` 포함 확인
- [ ] GitHub 저장소 생성 및 푸시
- [ ] `.env.local`이 Git에 없는지 확인
- [ ] 강력한 관리자 비밀번호 준비

### Vercel 배포

- [ ] Vercel 계정 생성
- [ ] 프로젝트 Import
- [ ] 환경변수 `ADMIN_PASSWORD` 설정
- [ ] 배포 성공 확인
- [ ] 배포 URL 저장

### 기능 검증

- [ ] 참여자 페이지 접속 및 투표
- [ ] 관리자 로그인 및 대시보드
- [ ] 모든 관리 기능 테스트
- [ ] 모바일 테스트

### 행사 준비

- [ ] 발표 데이터 최종 업데이트
- [ ] 시스템 설정 확인
- [ ] 테스트 투표 후 초기화
- [ ] URL 공유 메시지 준비
- [ ] QR 코드 생성 (선택사항)

---

## 📞 지원

문제 발생 시:
1. DEPLOYMENT_GUIDE.md 참조
2. GitHub Issues 등록
3. Vercel 공식 문서: https://vercel.com/docs

---

## ✅ 완료!

모든 체크리스트를 완료하셨다면 배포 준비가 완료되었습니다!

행사 성공을 기원합니다! 🎉

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
