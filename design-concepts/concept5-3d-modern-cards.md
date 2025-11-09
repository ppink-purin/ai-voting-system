# 컨셉 5: 3D Modern Cards (3D 모던 카드)

## 디자인 컨셉 개요
깊이감 있는 3D 카드 효과, 세련된 그림자, 현대적인 호버 인터랙션을 활용하여 물리적 카드를 다루는 듯한 촉각적 경험을 제공하는 디자인입니다.

## 선정 사유

### 1. 카드 UI의 2025 트렌드 반영
- Card UI는 2025년에 더욱 인기를 얻을 것으로 예상되는 레이아웃
- Bento grid와 함께 반응형 디자인에 최적
- 정보를 논리적으로 그룹화하여 인지 부담 감소

### 2. 3D 효과로 현대적인 경험 제공
- Neumorphism의 진화된 형태로 깊이감 있는 디자인
- 카드가 실제로 들어올려지는 듯한 물리적 피드백
- 참여자들에게 새롭고 흥미로운 인터랙션 경험

### 3. 우수한 사용성과 직관성
- 각 카드가 독립적인 객체로 명확히 구분
- 호버/클릭 시 즉각적인 시각적 피드백
- 터치 디바이스에서도 효과적인 인터랙션

### 4. 세련되고 프리미엄한 느낌
- 깊은 그림자와 3D 효과로 고급스러운 이미지
- 현대적인 웹 트렌드를 반영한 세련된 디자인
- 전문성과 혁신성을 동시에 표현

## 주요 디자인 요소

### 색상 팔레트
- **배경**: 부드러운 그라디언트 또는 밝은 회색 (`#f3f4f6` → `#e5e7eb`)
- **카드**: 순백색 (`#ffffff`)
- **주요 색상**: 모던 블루 (`#2563eb`)
- **강조 색상**: 딥 인디고 (`#4f46e5`)
- **텍스트**: 다크 그레이 (`#1f2937`)

### 3D 카드 효과
- **기본 상태**:
  - 중간 정도의 그림자 (`shadow-lg`)
  - 미묘한 transform으로 약간 기울어진 느낌 (선택사항)
  - `perspective`를 활용한 3D 공간 설정
- **호버 상태**:
  - 카드가 위로 들어올려짐 (`translateY(-8px)`)
  - 그림자가 더욱 깊어짐 (`shadow-2xl`)
  - 살짝 확대 (`scale(1.02)`)
  - 카드가 마우스 방향으로 기울어짐 (3D tilt effect)

### 선택 상태 스타일
- **테두리**: 두꺼운 블루 테두리 (3-4px)
- **그림자**: 블루 컬러 섀도우로 선택됨을 강조
- **배경**: 매우 연한 블루 틴트 (`bg-blue-50`)
- **체크마크**: 3D 느낌의 떠있는 체크 아이콘
- **애니메이션**: 선택 시 bounce 효과

### 레이아웃
- **그리드**: 일정한 간격의 카드 그리드
- **여백**: 충분한 spacing으로 각 카드 독립성 강조
- **정렬**: 센터 정렬 또는 좌측 정렬
- **반응형**: 화면 크기에 따라 카드 크기와 간격 조절

### 타이포그래피
- **팀 이름**: 큰 bold 폰트 (xl-2xl)
- **발표 제목**: 미디엄 폰트 (base-lg)
- **번호**: 큰 숫자를 배지 형태로 표시
- **계층**: 명확한 시각적 위계

### 특수 효과
- **3D Tilt**: 마우스 위치에 따라 카드가 기울어지는 효과
- **그라디언트 오버레이**: 카드 상단에 미묘한 그라디언트
- **리플 효과**: 클릭 시 ripple 애니메이션
- **백라이트**: 선택된 카드 뒤에서 빛이 나는 효과 (선택사항)

## 기술적 구현

### CSS Transform
```css
.card {
  transform-style: preserve-3d;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### 3D Tilt Effect (JavaScript)
```javascript
// 마우스 위치에 따라 카드 기울이기
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = (y - centerY) / 10;
  const rotateY = (centerX - x) / 10;

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
```

### Ripple Effect
- Material Design의 ripple 효과 구현
- 클릭 위치에서 원형으로 퍼지는 애니메이션

## 참고 레퍼런스
- 2025 UI 트렌드: Card UI popularity
- Material Design 3 (3D effects and shadows)
- Apple Card UI (premium card design)
- Dribbble의 3D card design examples
- Neumorphism 디자인 트렌드

## 사용 시나리오 적합성

### 적합한 경우
- 현대적이고 세련된 이미지를 원할 때
- 인터랙티브한 경험을 제공하고 싶을 때
- 프리미엄 브랜드 이미지
- 테크 중심의 젊은 오디언스
- 데스크톱 사용자가 많은 경우

### 고려사항
- 3D 효과는 성능에 영향을 줄 수 있음 → 최적화 필요
- 모바일에서는 일부 효과 제한 (tilt 등)
- 과도한 움직임은 일부 사용자에게 불편할 수 있음
- prefers-reduced-motion 지원 필수

## 성능 최적화
1. **GPU 가속**: `transform`과 `opacity`만 애니메이션
2. **Throttling**: 마우스 이벤트 throttle 처리
3. **조건부 활성화**: 데스크톱에서만 3D tilt 적용
4. **간소화 옵션**: 저사양 디바이스에서는 효과 감소

## 예상 효과
- ✅ 현대적이고 세련된 사용자 경험
- ✅ 물리적 카드를 다루는 듯한 직관적인 인터랙션
- ✅ 각 팀이 독립적으로 돋보이는 레이아웃
- ✅ 프리미엄하고 고급스러운 이미지
- ✅ 참여자들에게 기억에 남는 경험 제공
- ⚠️ 모바일에서는 효과 제한적 (주로 데스크톱 최적화)
- ⚠️ 성능 최적화 필요 (많은 카드 처리 시)
