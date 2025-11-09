'use client';

import Link from 'next/link';

const concepts = [
  {
    id: 1,
    name: 'Futuristic Glassmorphism',
    nameKo: '미래지향적 글래스모피즘',
    description: '투명한 유리 효과와 그라디언트 배경으로 미래지향적이고 혁신적인 느낌',
    color: 'from-purple-600 via-pink-500 to-orange-400',
    tags: ['AI 테마', '고급스러움', '현대적'],
    bestFor: '혁신적이고 미래지향적인 이미지를 원할 때',
  },
  {
    id: 2,
    name: 'Neural Network Theme',
    nameKo: '신경망 네트워크 테마',
    description: 'AI 신경망을 시각화한 다크 테마로 사이버펑크 미학 구현',
    color: 'from-slate-900 via-purple-900 to-slate-900',
    tags: ['다크 모드', '네온 효과', 'AI 직관적'],
    bestFor: '기술적이고 미래지향적인 강한 인상이 필요할 때',
  },
  {
    id: 3,
    name: 'Minimalist Professional',
    nameKo: '미니멀 프로페셔널',
    description: '깔끔하고 전문적인 디자인으로 콘텐츠에 집중',
    color: 'from-gray-100 to-gray-200',
    tags: ['전문성', '가독성', '접근성'],
    bestFor: '기업/기관 행사나 다양한 연령대 참여자',
  },
  {
    id: 4,
    name: 'Vibrant Innovation',
    nameKo: '생동감 넘치는 혁신',
    description: '대담한 색상과 활기찬 애니메이션으로 에너지 넘치는 분위기',
    color: 'from-blue-500 via-purple-500 to-pink-500',
    tags: ['다채로운', '활기찬', '젊음'],
    bestFor: '젊은 타겟층과 창의적인 분위기 강조',
  },
  {
    id: 5,
    name: '3D Modern Cards',
    nameKo: '3D 모던 카드',
    description: '깊이감 있는 3D 효과와 세련된 그림자로 프리미엄 경험 제공',
    color: 'from-slate-200 to-slate-300',
    tags: ['3D 효과', '고급스러움', '인터랙티브'],
    bestFor: '세련되고 프리미엄한 브랜드 이미지',
  },
  {
    id: 6,
    name: 'Cosmic Tech',
    nameKo: '우주 기술 테마',
    description: '우주와 별을 모티프로 AI 혁신의 무한한 가능성 표현',
    color: 'from-slate-900 via-purple-900 to-slate-900',
    tags: ['우주 테마', '화려함', '차별화'],
    bestFor: '강한 시각적 임팩트와 차별화된 경험',
  },
];

export default function ConceptsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/">
            <button className="mb-4 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-all font-medium">
              ← 메인 페이지로
            </button>
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            디자인 컨셉 선택
          </h1>
          <p className="text-gray-600 text-lg">
            6가지 디자인 컨셉 중 원하는 스타일을 선택하여 확인해보세요
          </p>
          <p className="text-gray-500 text-sm mt-2">
            각 컨셉의 상세 설명은 design-concepts 폴더의 MD 파일을 참고하세요
          </p>
        </div>
      </div>

      {/* Concepts Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {concepts.map((concept) => (
            <Link key={concept.id} href={`/concepts/concept${concept.id}`}>
              <div className="group cursor-pointer">
                {/* Preview Card */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 transform hover:-translate-y-2">
                  {/* Color Preview */}
                  <div className={`h-32 bg-gradient-to-r ${concept.color} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white font-black text-6xl opacity-20">
                        {concept.id}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {concept.nameKo}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                          {concept.name}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                        {concept.id}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {concept.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {concept.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Best For */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        추천 상황
                      </p>
                      <p className="text-sm text-gray-700">
                        {concept.bestFor}
                      </p>
                    </div>

                    {/* View Button */}
                    <button className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-md group-hover:shadow-lg">
                      디자인 확인하기 →
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Documentation Notice */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📖 상세 설명 문서
          </h2>
          <p className="text-gray-600 mb-4">
            각 컨셉에 대한 상세한 설명, 선정 사유, 디자인 요소, 기술적 구현 방법 등은
            다음 파일들을 참고하세요:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {concepts.map((concept) => (
              <div
                key={concept.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {concept.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-700 truncate">
                    design-concepts/concept{concept.id}-
                    {concept.name.toLowerCase().replace(/\s+/g, '-')}.md
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔍 디자인 리서치 요약
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>2025 UI 트렌드:</strong> AI 개인화, 모바일 우선, 인터랙티브 요소,
              대담한 색상, 실시간 콘텐츠, 카드 UI, 미니멀리즘
            </p>
            <p>
              <strong>Glassmorphism:</strong> 투명도와 블러를 활용한 현대적 디자인,
              AI/테크 스타트업에서 선호
            </p>
            <p>
              <strong>투표 UX 베스트 프랙티스:</strong> 명확한 선택 상태, 시각적 피드백,
              접근성, 사용 편의성
            </p>
            <p>
              <strong>테크 컨퍼런스 사례:</strong> GitHub Satellite (우주 테마),
              dConstruct (미래지향적), Ai4 Conference (애니메이션)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
