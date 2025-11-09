# 디자인 테마 시스템 가이드

AI 혁신 발표 투표 시스템의 디자인 테마 기능을 상세하게 설명합니다.

## 개요

투표 시스템은 6가지 독특한 디자인 컨셉을 제공하여, 관리자가 행사 분위기에 맞는 테마를 선택할 수 있습니다.

## 6개 디자인 컨셉

### Concept 1: Futuristic Glassmorphism
**컨셉명**: 미래지향적 글래스모피즘
**URL**: `/concepts/concept1`

**특징**:
- 보라색-핑크 그라디언트 배경
- 투명한 유리 효과 (glassmorphism)
- 부드러운 블러 처리
- 세련되고 현대적인 느낌

**적합한 행사**:
- 혁신 기술 발표
- 디지털 트랜스포메이션
- 미래 지향적 주제

---

### Concept 2: Neural Network Theme
**컨셉명**: 신경망 네트워크 테마
**URL**: `/concepts/concept2`

**특징**:
- 다크 모드 베이스
- AI 신경망 시각화 배경
- 네온 그린 악센트
- 기술적이고 전문적인 분위기

**적합한 행사**:
- AI/ML 관련 발표
- 데이터 사이언스
- 기술 컨퍼런스

---

### Concept 3: Minimalist Professional
**컨셉명**: 미니멀 프로페셔널
**URL**: `/concepts/concept3`

**특징**:
- 깔끔한 화이트 배경
- 최소한의 디자인 요소
- 높은 가독성
- 전문적이고 격식있는 느낌

**적합한 행사**:
- 공식 발표
- 임원진 대상 행사
- 보수적인 기업 문화

---

### Concept 4: Vibrant Innovation
**컨셉명**: 생동감 넘치는 혁신
**URL**: `/concepts/concept4`

**특징**:
- 대담한 그라디언트 색상
- 활기찬 애니메이션 효과
- 눈에 띄는 비주얼
- 에너지 넘치는 분위기

**적합한 행사**:
- 창의성 중시 행사
- 젊은 문화의 조직
- 혁신 아이디어 발표

---

### Concept 5: 3D Modern Cards
**컨셉명**: 3D 모던 카드
**URL**: `/concepts/concept5`

**특징**:
- 깊이감 있는 3D 효과
- 그림자와 레이어링
- 세련된 카드 디자인
- 현대적이고 세련된 느낌

**적합한 행사**:
- 디자인 중시 조직
- UX/UI 관련 발표
- 프리미엄 이벤트

---

### Concept 6: Cosmic Tech ⭐ (기본값)
**컨셉명**: 우주 기술 테마
**URL**: `/concepts/concept6`

**특징**:
- 우주 배경 (별, 네뷸라)
- 다크 블루 톤
- 네온 효과
- 미래지향적이고 웅장한 느낌

**적합한 행사**:
- 혁신 기술 발표
- 비전 제시
- 미래 전략 행사

**기본값 이유**:
- 가장 보편적으로 선호되는 디자인
- AI 혁신이라는 주제와 잘 어울림
- 모든 연령대에 적합

---

## 테마 선택 방법

### 관리자 페이지에서 선택

1. 관리자 로그인 (`/admin/login`)
2. "디자인 테마 설정" 섹션 찾기
3. 드롭다운에서 원하는 컨셉 선택
4. "테마 설정 적용" 버튼 클릭
5. 참여자 페이지 확인

### 테마 변경 시점

- **행사 전**: 사전에 테마를 선택하고 테스트
- **행사 중**: 실시간으로 변경 가능 (참여자는 다음 접속 시 새 테마 표시)
- **행사 후**: 원할 때 언제든지 변경

### 테마 미리보기

관리자 페이지에서 "모든 컨셉 미리보기 →" 링크를 클릭하여 `/concepts` 페이지에서 6가지 테마를 모두 확인할 수 있습니다.

---

## 랜덤 테마 기능

### 개요

참여자가 페이지를 열 때마다 6개 테마 중 무작위로 하나가 표시됩니다.

### 활성화 방법

1. 관리자 페이지 → "디자인 테마 설정"
2. "랜덤 테마 활성화" 체크박스 선택
3. "테마 설정 적용" 버튼 클릭

### 작동 방식

```
참여자 A 접속 → Concept 3 (Minimalist Professional)
참여자 B 접속 → Concept 5 (3D Modern Cards)
참여자 A 새로고침 → Concept 1 (Futuristic Glassmorphism)
```

- 매 접속마다 `Math.random()`으로 테마 선택
- 서버 사이드에서 랜덤 선택
- 참여자별로 다른 테마 표시 가능

### 사용 시나리오

**추천**:
- 다양한 디자인을 보여주고 싶을 때
- 재미있는 경험 제공
- 참여자 간 차별화

**비추천**:
- 일관된 브랜드 이미지 필요
- 공식적인 행사
- 통일된 경험 필요

---

## 기술적 세부사항

### 테마 설정 저장

테마 설정은 메모리 기반 데이터베이스(`lib/db.ts`)에 저장됩니다:

```typescript
interface SystemConfig {
  selectedTheme: number;  // 1-6
  randomTheme: boolean;   // true/false
  ...
}
```

### 테마 로딩 프로세스

1. 참여자가 `/` 접속
2. `/api/config` 호출하여 설정 조회
3. `randomTheme`이 true면 무작위 테마 ID 생성
4. 해당 테마 페이지로 리다이렉트 (예: `/concepts/concept3`)
5. 테마별 컴포넌트 렌더링

### API 엔드포인트

**테마 조회**:
```
GET /api/config
Response: {
  selectedTheme: 6,
  randomTheme: false,
  ...
}
```

**테마 설정** (관리자):
```
POST /api/admin/theme
Body: {
  selectedTheme: 3,
  randomTheme: false
}
Response: {
  success: true
}
```

---

## 새로운 테마 추가하기

추후 디자인 컨셉을 추가하려면:

### 1. 컴포넌트 생성

```bash
app/concepts/concept7/page.tsx
```

### 2. 테마 정보 등록

`lib/themes.ts` 파일에 추가:

```typescript
export const themes: ThemeConfig[] = [
  // ... 기존 테마들
  {
    id: 7,
    name: 'Your Theme Name',
    nameKo: '테마 이름',
    description: '설명',
    componentPath: 'Theme7'
  }
];
```

### 3. 관리자 UI 업데이트

`app/admin/page.tsx`의 드롭다운에 옵션 추가:

```tsx
<option value={7}>컨셉 7: Your Theme Name</option>
```

### 4. 검증 업데이트

`app/api/admin/theme/route.ts`에서 범위 검증 수정:

```typescript
if (selectedTheme < 1 || selectedTheme > 7) {  // 6 → 7
  return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
}
```

---

## 테마 커스터마이징

각 테마의 스타일을 수정하려면 해당 테마의 `page.tsx` 파일을 편집하세요.

### 예시: Concept 1 색상 변경

```tsx
// app/concepts/concept1/page.tsx

// 기존 그라디언트
className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500"

// 변경 후
className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500"
```

### Tailwind CSS 클래스

모든 테마는 Tailwind CSS를 사용하므로:
- 색상: `bg-`, `text-`, `border-`
- 효과: `backdrop-blur-`, `shadow-`
- 애니메이션: `animate-`, `transition-`

---

## 테마 디자인 가이드라인

새 테마를 디자인할 때 고려사항:

### 필수 요소

1. **가독성**: 텍스트가 명확히 보여야 함
2. **터치 친화적**: 모바일 터치를 고려한 버튼 크기
3. **응답형 디자인**: 모든 화면 크기 지원
4. **접근성**: 색상 대비, 글꼴 크기

### 권장 사항

- **일관성**: 동일 테마 내에서 색상 팔레트 통일
- **계층 구조**: 중요한 정보 강조
- **피드백**: 선택/클릭 시 시각적 반응
- **성능**: 과도한 애니메이션 지양

---

## 문제 해결

### 테마가 적용되지 않을 때

1. 브라우저 캐시 삭제
2. 하드 리프레시 (Ctrl+Shift+R)
3. 관리자 페이지에서 테마 재설정
4. 서버 로그 확인

### 랜덤 테마가 작동하지 않을 때

1. 관리자 페이지에서 "랜덤 테마 활성화" 체크 확인
2. "테마 설정 적용" 버튼 클릭 여부 확인
3. `/api/config` 직접 호출하여 `randomTheme: true` 확인

### 모바일에서 레이아웃 깨짐

- 각 테마의 반응형 클래스 확인
- `sm:`, `md:`, `lg:` 접두사 사용
- `overflow-x-hidden` 추가

---

## 베스트 프랙티스

### 행사 준비

1. **사전 테스트**: 모든 테마를 미리 테스트
2. **참여자 피드백**: 베타 테스트로 선호도 조사
3. **브랜드 일치성**: 회사 브랜드 컬러와 어울리는 테마 선택
4. **백업 계획**: 랜덤 테마 사용 시 고정 테마도 준비

### 사용자 경험

1. **일관성 유지**: 가급적 한 행사에서는 하나의 테마 사용
2. **로딩 시간**: 과도한 애니메이션 지양
3. **모바일 우선**: 대부분 스마트폰 접속 예상
4. **접근성**: 시각 장애인을 위한 충분한 색상 대비

---

## FAQ

**Q: 행사 진행 중 테마를 변경할 수 있나요?**
A: 네, 관리자 페이지에서 언제든지 변경 가능합니다. 참여자는 다음 접속 또는 새로고침 시 새 테마를 보게 됩니다.

**Q: 랜덤 테마 사용 시 통계에 영향이 있나요?**
A: 없습니다. 테마는 시각적 요소만 변경하며, 투표 데이터와 독립적입니다.

**Q: 특정 참여자에게만 특정 테마를 보여줄 수 있나요?**
A: 기본 기능으로는 불가능합니다. 모든 참여자는 동일한 설정을 따릅니다.

**Q: 자체 디자인 테마를 만들 수 있나요?**
A: 네, 위의 "새로운 테마 추가하기" 섹션을 참고하세요.

**Q: 테마별로 투표 통계가 다르게 나오나요?**
A: 아니요. 테마는 UI만 변경하며, 데이터와 로직은 완전히 독립적입니다.

---

## 지원

테마 관련 문의사항이나 커스터마이징 요청은 개발팀에 문의하세요.

- GitHub Issues
- 이메일: your-email@company.com

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
