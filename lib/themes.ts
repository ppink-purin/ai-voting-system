// Theme configuration for easy addition of new concepts

export interface ThemeConfig {
  id: number;
  name: string;
  nameKo: string;
  description: string;
  componentPath: string;
}

export const themes: ThemeConfig[] = [
  {
    id: 1,
    name: 'Futuristic Glassmorphism',
    nameKo: '미래지향적 글래스모피즘',
    description: '투명한 유리 효과와 그라디언트 배경',
    componentPath: 'Theme1',
  },
  {
    id: 2,
    name: 'Neural Network Theme',
    nameKo: '신경망 네트워크 테마',
    description: 'AI 신경망을 시각화한 다크 테마',
    componentPath: 'Theme2',
  },
  {
    id: 3,
    name: 'Minimalist Professional',
    nameKo: '미니멀 프로페셔널',
    description: '깔끔하고 전문적인 디자인',
    componentPath: 'Theme3',
  },
  {
    id: 4,
    name: 'Vibrant Innovation',
    nameKo: '생동감 넘치는 혁신',
    description: '대담한 색상과 활기찬 애니메이션',
    componentPath: 'Theme4',
  },
  {
    id: 5,
    name: '3D Modern Cards',
    nameKo: '3D 모던 카드',
    description: '깊이감 있는 3D 효과와 세련된 그림자',
    componentPath: 'Theme5',
  },
  {
    id: 6,
    name: 'Cosmic Tech',
    nameKo: '우주 기술 테마',
    description: '우주와 별을 모티프로 한 미래지향적 디자인',
    componentPath: 'Theme6',
  },
];

export function getTheme(id: number): ThemeConfig | undefined {
  return themes.find(t => t.id === id);
}

export function getRandomTheme(): ThemeConfig {
  const randomIndex = Math.floor(Math.random() * themes.length);
  return themes[randomIndex];
}
