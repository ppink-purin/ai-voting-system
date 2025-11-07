# 배포 가이드

AI 혁신 발표 투표 시스템을 Vercel에 배포하는 방법을 단계별로 안내합니다.

## 사전 준비

### 1. GitHub 계정
- GitHub 계정이 없다면 https://github.com 에서 가입
- 무료 계정으로 충분합니다

### 2. Vercel 계정
- Vercel 계정이 없다면 https://vercel.com 에서 GitHub 계정으로 가입
- 무료 Hobby 플랜으로 충분합니다 (200명 동시 접속 지원)

## 배포 단계

### Step 1: GitHub 저장소 생성 및 푸시

#### 1-1. GitHub에 새 저장소 생성
1. https://github.com 접속 및 로그인
2. 우측 상단 "+" 버튼 클릭 → "New repository"
3. 저장소 정보 입력:
   - Repository name: `ai-voting-system` (원하는 이름)
   - Description: AI Innovation Voting System
   - Public 또는 Private 선택
   - **중요**: "Initialize this repository with" 옵션은 모두 체크 해제
4. "Create repository" 버튼 클릭

#### 1-2. 로컬 저장소 연결 및 푸시
터미널에서 다음 명령어 실행:

```bash
cd voting-app

# GitHub 저장소 URL로 remote 추가 (아래 URL은 예시, 실제 URL로 변경)
git remote add origin https://github.com/your-username/ai-voting-system.git

# master 브랜치를 main으로 변경 (선택사항)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

> **참고**: GitHub에서 제공하는 URL을 복사해서 사용하세요.

### Step 2: Vercel에 프로젝트 Import

#### 2-1. Vercel 대시보드 접속
1. https://vercel.com 접속 및 로그인
2. "Add New..." 버튼 클릭 → "Project" 선택

#### 2-2. GitHub 저장소 Import
1. "Import Git Repository" 섹션에서 GitHub 연결
2. 처음이라면 "Install" 버튼 클릭하여 GitHub 권한 부여
3. 방금 생성한 `ai-voting-system` 저장소 찾기
4. "Import" 버튼 클릭

#### 2-3. 프로젝트 설정
**Configure Project** 화면에서:

1. **Project Name**: 자동으로 생성됨 (변경 가능)
2. **Framework Preset**: Next.js (자동 감지됨)
3. **Root Directory**: `./` (기본값 유지)
4. **Build and Output Settings**: 기본값 유지

#### 2-4. 환경변수 설정
**Environment Variables** 섹션에서:

| Key | Value | 설명 |
|-----|-------|------|
| `ADMIN_PASSWORD` | 원하는 비밀번호 | 관리자 페이지 접근 비밀번호 |

**추가 방법**:
1. "Environment Variables" 섹션 펼치기
2. Key: `ADMIN_PASSWORD` 입력
3. Value: 원하는 비밀번호 입력 (예: `SecurePassword2024!`)
4. 체크박스: Production, Preview, Development 모두 선택
5. "Add" 버튼 클릭

> **보안 팁**:
> - 최소 8자 이상
> - 영문 대소문자, 숫자, 특수문자 조합 권장
> - `admin`, `password` 같은 쉬운 비밀번호 지양

#### 2-5. 배포 시작
1. 모든 설정 확인 후 "Deploy" 버튼 클릭
2. 빌드 로그 확인 (1~3분 소요)
3. 배포 완료 시 축하 화면 표시

### Step 3: 배포 완료 및 URL 확인

#### 3-1. 배포 URL 확인
배포 완료 후 자동 생성된 URL 형식:
```
https://your-project-name.vercel.app
```

#### 3-2. 접속 테스트

**참여자 페이지**:
```
https://your-project-name.vercel.app
```

**관리자 로그인 페이지**:
```
https://your-project-name.vercel.app/admin/login
```

## 배포 후 확인사항

### 체크리스트

- [ ] 메인 페이지 정상 접속
- [ ] 20개 발표 목록 표시 확인
- [ ] 별점 선택 및 저장 테스트
- [ ] 관리자 로그인 페이지 접속
- [ ] 관리자 비밀번호로 로그인 성공
- [ ] 관리자 대시보드 통계 표시 확인
- [ ] 투표 종료 버튼 작동 확인
- [ ] 모바일 브라우저 테스트

### 문제 해결

#### 빌드 실패 시
1. Vercel 대시보드에서 "Deployments" 탭 클릭
2. 실패한 배포 클릭 → "View Function Logs" 확인
3. 에러 메시지에 따라 수정:
   - TypeScript 에러: `tsconfig.json` 확인
   - 패키지 에러: `package.json` 확인
   - 빌드 설정 에러: Vercel 프로젝트 설정 확인

#### 배포는 성공했으나 페이지가 열리지 않을 때
1. 브라우저 콘솔(F12) 확인
2. Vercel 함수 로그 확인:
   - Vercel 대시보드 → Functions → Logs
3. 환경변수 설정 확인:
   - Settings → Environment Variables

## 추가 설정 (선택사항)

### 커스텀 도메인 연결

무료로 제공되는 `.vercel.app` 대신 자신의 도메인 사용:

1. Vercel 프로젝트 설정 → "Domains" 탭
2. 소유한 도메인 입력 (예: `voting.mycompany.com`)
3. DNS 설정 안내에 따라 도메인 연결
4. SSL 인증서 자동 발급 (무료)

### Vercel Postgres 연결 (선택사항)

데이터 영속성이 필요한 경우:

#### 1. Vercel Postgres 생성
1. Vercel 프로젝트 → "Storage" 탭
2. "Create Database" → "Postgres" 선택
3. 무료 plan 선택 (Hobby)
4. 데이터베이스 이름 입력
5. "Create" 버튼 클릭

#### 2. 환경변수 자동 설정
- Vercel이 자동으로 다음 환경변수를 설정합니다:
  - `POSTGRES_URL`
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`
  - `POSTGRES_USER`
  - `POSTGRES_HOST`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DATABASE`

#### 3. 데이터베이스 스키마 생성
`lib/db.ts` 파일을 Vercel Postgres용으로 수정 필요 (별도 가이드 참조)

> **참고**: 현재 버전은 메모리 기반으로 작동하며, 서버 재시작 시 데이터가 초기화됩니다. 대부분의 투표 행사는 단회성이므로 메모리 기반으로 충분합니다.

## 업데이트 배포

코드 수정 후 재배포 방법:

### 자동 배포 (권장)
```bash
# 로컬에서 수정 후
git add .
git commit -m "Update presentations data"
git push origin main
```

GitHub에 푸시하면 Vercel이 자동으로 재배포합니다.

### 수동 재배포
1. Vercel 대시보드 → "Deployments" 탭
2. 최신 배포 우측 "..." 메뉴 → "Redeploy"

## 환경변수 수정

### 비밀번호 변경 방법
1. Vercel 프로젝트 → "Settings" 탭
2. "Environment Variables" 선택
3. `ADMIN_PASSWORD` 찾기 → "Edit" 버튼
4. 새 비밀번호 입력
5. "Save" 버튼 클릭
6. **중요**: 재배포 필요 (자동 또는 수동)

## 발표 데이터 수정 및 재배포

행사 당일 실제 발표 주제로 변경하는 방법:

### 1. 로컬에서 수정
```bash
# data/presentations.json 파일 수정
# (텍스트 에디터로 열어서 팀명, 제목 변경)

git add data/presentations.json
git commit -m "Update presentations for event"
git push origin main
```

### 2. Vercel 자동 재배포
- GitHub 푸시 후 1~3분 내에 자동 재배포 완료
- Vercel 대시보드에서 진행 상황 확인 가능

## 비용 안내

### Vercel 무료 플랜 (Hobby)
- **가격**: $0/월
- **제한사항**:
  - 100 GB 대역폭/월
  - 100 빌드/일
  - 서버리스 함수 실행 시간 100GB-시간/월
  - 동시 빌드 1개

### 예상 사용량 (200명 행사 기준)
- **대역폭**: ~500 MB (매우 여유)
- **함수 실행**: ~50 GB-시간 (여유)
- **빌드**: 1~2회 (충분)

> **결론**: 무료 플랜으로 충분히 운영 가능합니다.

## 보안 체크리스트

배포 전 반드시 확인:

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있음
- [ ] GitHub에 민감한 정보(비밀번호 등)가 푸시되지 않음
- [ ] Vercel 환경변수에 강력한 `ADMIN_PASSWORD` 설정
- [ ] 관리자 페이지 로그인 테스트 완료
- [ ] 불필요한 API 엔드포인트 비활성화 확인

## 행사 당일 체크리스트

### 행사 1일 전
- [ ] 발표 데이터 최종 확인 및 업데이트
- [ ] 재배포 완료 및 테스트
- [ ] 관리자 비밀번호 확인
- [ ] 모바일 접속 테스트
- [ ] URL QR 코드 생성 (https://www.qr-code-generator.com/)

### 행사 당일 (시작 전)
- [ ] 배포 URL 접속 확인
- [ ] 관리자 페이지 로그인 확인
- [ ] 투표 상태 "진행 중" 확인
- [ ] 카카오톡 공유 메시지 준비

### 행사 당일 (진행 중)
- [ ] 참여자들에게 URL 공유
- [ ] 관리자 대시보드로 실시간 모니터링
- [ ] 문제 발생 시 즉시 대응

### 행사 당일 (종료 후)
- [ ] 투표 종료 버튼 클릭
- [ ] 최종 순위 스크린샷 저장
- [ ] 결과 발표

## 문제 해결

### Vercel 배포 실패
**증상**: 빌드 로그에 에러 메시지
**해결**:
1. 로컬에서 `npm run build` 실행하여 에러 확인
2. 에러 수정 후 다시 푸시
3. Vercel이 자동으로 재배포

### 환경변수 적용 안 됨
**증상**: 관리자 비밀번호가 작동하지 않음
**해결**:
1. Vercel Settings → Environment Variables 확인
2. 변수명이 정확히 `ADMIN_PASSWORD`인지 확인
3. 재배포 실행

### 페이지 로딩 느림
**증상**: 첫 접속 시 3초 이상 소요
**해결**:
- Vercel 무료 플랜의 Cold Start 특성 (정상)
- 한번 접속 후에는 빠르게 로딩됨
- 행사 시작 10분 전에 한 번 접속하여 워밍업

### 데이터가 사라짐
**증상**: 투표 데이터가 갑자기 초기화됨
**원인**:
- 메모리 기반 데이터베이스는 서버 재시작 시 초기화
- Vercel의 서버리스 함수는 일정 시간 후 자동 재시작
**해결**:
- Vercel Postgres 연결 (선택사항)
- 또는 행사 중에는 데이터 손실 가능성 낮음 (수분~수십분 단위 유지)

## 지원 및 문의

### Vercel 공식 문서
- https://vercel.com/docs
- https://nextjs.org/docs/deployment

### 문제 발생 시
1. Vercel 대시보드 로그 확인
2. GitHub Issues에 문제 등록
3. 개발자에게 연락

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
