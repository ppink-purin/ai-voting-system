# 빠른 시작 가이드

AI 혁신 발표 투표 시스템을 빠르게 시작하는 방법입니다.

---

## 🚀 5분 만에 배포하기

### 1단계: 코드 확인 (30초)

```bash
cd c:\Project\cc-voting-app-practice\voting-app
npm install  # 아직 안 했다면
npm run build  # 빌드 테스트
```

---

### 2단계: GitHub 업로드 (2분)

```bash
# Git 초기화 (처음만)
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/ai-voting-system.git
git push -u origin main
```

**⚠️ 중요**: `.env.local` 파일이 Git에 포함되지 않았는지 확인!

---

### 3단계: Vercel 배포 (2분)

1. https://vercel.com 접속 → GitHub 로그인
2. "Add New Project" → GitHub 저장소 선택
3. **환경변수 추가**:
   - Name: `ADMIN_PASSWORD`
   - Value: (강력한 비밀번호)
4. "Deploy" 클릭

---

### 4단계: 확인 (30초)

- 참여자 페이지: `https://your-app.vercel.app`
- 관리자 페이지: `https://your-app.vercel.app/admin/login`

---

## 📋 행사 당일 체크리스트

### 준비 (행사 1시간 전)

- [ ] 관리자 페이지 접속 확인
- [ ] 발표 데이터 업데이트 (JSON 업로드)
- [ ] 필요 선택 갯수 설정 (예: 5개)
- [ ] 디자인 테마 선택
- [ ] 테스트 투표 → 초기화

### 시작

- [ ] 카카오톡에 URL 공유
- [ ] 관리자 대시보드 열어두기

### 종료

- [ ] "투표 종료" 버튼 클릭
- [ ] 결과 스크린샷 저장

---

## 🎨 테마 변경

1. 관리자 페이지 → "디자인 테마 설정"
2. 6개 컨셉 중 선택:
   - **Concept 1**: Futuristic Glassmorphism (보라색 그라디언트)
   - **Concept 2**: Neural Network Theme (다크 모드)
   - **Concept 3**: Minimalist Professional (깔끔한 화이트)
   - **Concept 4**: Vibrant Innovation (활기찬 색상)
   - **Concept 5**: 3D Modern Cards (3D 효과)
   - **Concept 6**: Cosmic Tech (우주 테마) ⭐ 기본값
3. "테마 설정 적용" 클릭

**랜덤 테마**: 체크박스 선택하면 참여자마다 다른 테마 표시

---

## 🔧 주요 관리 기능

### 발표 데이터 변경

관리자 페이지 → "발표 데이터 업로드" → JSON 파일 선택

**JSON 형식**:
```json
{
  "presentations": [
    {"id": 1, "teamName": "팀명", "title": "발표 제목"}
  ]
}
```

### 선택 갯수 변경

관리자 페이지 → "필요 선택 갯수 설정" → 숫자 입력 → "변경"

### 투표 초기화

관리자 페이지 하단 → "투표 데이터 초기화" → 확인

---

## 📱 URL 공유 메시지

```
📊 AI 혁신 발표 투표

🔗 https://your-app.vercel.app

마음에 드는 5개 팀을 선택해주세요!
투표 마감: [시간]
```

---

## 🆘 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| 로그인 안 됨 | Vercel 환경변수 `ADMIN_PASSWORD` 확인 |
| 페이지 404 | Vercel 프로젝트 Root Directory = `./` 확인 |
| 빌드 실패 | 로컬에서 `npm run build` 실행 후 에러 수정 |
| 데이터 사라짐 | 정상 (메모리 기반, 행사 중에는 유지됨) |

---

## 📚 상세 가이드

- **전체 기능**: `README.md`
- **관리자 사용법**: `ADMIN_GUIDE.md`
- **배포 상세**: `DEPLOYMENT_GUIDE.md`
- **테마 시스템**: `THEME_GUIDE.md`
- **배포 전 체크리스트**: `PRE_DEPLOYMENT_CHECKLIST.md`

---

## ✅ 완료!

이제 투표 시스템을 사용할 준비가 되었습니다!

🎉 행사 성공을 기원합니다!

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
