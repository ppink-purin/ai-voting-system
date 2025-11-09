'use client';

import { useEffect, useState } from 'react';
import { ensureSession } from '@/lib/session';
import Link from 'next/link';

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

const vibrantColors = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-400',
  'from-orange-500 to-yellow-400',
  'from-green-500 to-emerald-400',
  'from-pink-500 to-rose-400',
  'from-indigo-500 to-blue-400',
];

export default function Concept4() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [votingActive, setVotingActive] = useState(true);
  const [requiredSelections, setRequiredSelections] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [configTimestamp, setConfigTimestamp] = useState<number>(0);

  useEffect(() => {
    async function init() {
      try {
        const sid = await ensureSession();
        setSessionId(sid);

        const configResponse = await fetch('/api/config');
        const configData = await configResponse.json();
        setVotingActive(configData.votingActive);
        setRequiredSelections(configData.requiredSelections);
        setConfigTimestamp(configData.lastConfigUpdate);

        const presResponse = await fetch('/api/presentations');
        const presData = await presResponse.json();
        setPresentations(presData.presentations);

        const votesResponse = await fetch(`/api/votes/${sid}`);
        if (votesResponse.ok) {
          const votesData = await votesResponse.json();
          const selectedSet = new Set<number>();
          votesData.votes.forEach((vote: { presentationId: number }) => {
            selectedSet.add(vote.presentationId);
          });
          setSelectedIds(selectedSet);
          setHasVoted(selectedSet.size > 0);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const handleToggleSelection = (presentationId: number) => {
    if (!votingActive || hasVoted) return;

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(presentationId)) {
        newSet.delete(presentationId);
      } else {
        if (newSet.size >= requiredSelections) {
          alert(`최대 ${requiredSelections}개까지만 선택할 수 있습니다.`);
          return prev;
        }
        newSet.add(presentationId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!sessionId || !votingActive) return;

    if (selectedIds.size !== requiredSelections) {
      alert(`정확히 ${requiredSelections}개의 팀을 선택해야 합니다. (현재: ${selectedIds.size}개)`);
      return;
    }

    const confirmed = confirm(`${requiredSelections}개 팀을 선택하셨습니다. 투표를 제출하시겠습니까?`);
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          selectedPresentationIds: Array.from(selectedIds),
          configTimestamp,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        if (error.requireReload) {
          alert('관리자가 설정을 변경하여 투표가 무효화되었습니다.\\n페이지를 새로고침하여 새로운 설정으로 다시 투표해주세요.');
          window.location.reload();
          return;
        }

        if (error.error === 'Voting has ended') {
          setVotingActive(false);
        }
        throw new Error(error.error || 'Failed to submit vote');
      }

      setHasVoted(true);
      alert('투표가 성공적으로 제출되었습니다!');
    } catch (error: any) {
      console.error('Failed to submit vote:', error);
      alert(error.message || '투표 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
          <p className="text-purple-900 text-xl font-bold">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/concepts">
          <button className="px-4 py-2 rounded-xl bg-white border-2 border-purple-300 text-purple-700 font-semibold hover:border-purple-400 hover:shadow-lg transition-all">
            ← 컨셉 목록으로
          </button>
        </Link>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                현재 선택: {selectedIds.size} / {requiredSelections}
              </h2>
              <p className="text-gray-700 mt-1 font-medium">
                {hasVoted ? '투표 완료' : `${requiredSelections}개 팀을 선택해주세요`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {selectedIds.size}/{requiredSelections}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-32">
        <div className="text-center py-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI 혁신 발표 투표
          </h1>
          <p className="text-gray-700 text-xl font-semibold">
            총 {presentations.length}개 팀 중 {requiredSelections}개의 발표 팀을 선택하여 투표해주세요
          </p>
          <p className="text-purple-600 text-sm mt-3 font-medium">컨셉 4: Vibrant Innovation</p>
        </div>

        <div className="space-y-5">
          {presentations.map((presentation, index) => {
            const isSelected = selectedIds.has(presentation.id);
            const colorClass = vibrantColors[index % vibrantColors.length];

            return (
              <div
                key={presentation.id}
                onClick={() => handleToggleSelection(presentation.id)}
                className={`
                  relative p-6 rounded-2xl transition-all duration-300 cursor-pointer transform
                  ${isSelected
                    ? 'scale-105 shadow-2xl'
                    : 'hover:scale-102 shadow-lg hover:shadow-xl'
                  }
                  ${!votingActive || hasVoted ? 'opacity-60 cursor-not-allowed' : ''}
                  bg-white
                `}
                style={{
                  animation: isSelected ? 'pulse 2s ease-in-out infinite' : 'none',
                }}
              >
                {/* Colorful top accent */}
                <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-2xl bg-gradient-to-r ${colorClass}`}></div>

                <div className="flex items-start gap-5 mt-2">
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <div className={`text-2xl font-black bg-gradient-to-r ${colorClass} bg-clip-text text-transparent w-10 text-center`}>
                      {presentation.id}
                    </div>
                    <div
                      className={`w-9 h-9 rounded-full border-3 flex items-center justify-center transition-all transform ${
                        isSelected
                          ? `bg-gradient-to-r ${colorClass} border-transparent scale-110`
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {presentation.teamName}
                    </h3>
                    <p className="text-gray-600 text-base">
                      {presentation.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!votingActive && (
          <div className="mt-8 p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl text-center shadow-xl">
            <p className="text-white font-bold text-lg">
              투표가 종료되었습니다. 감사합니다!
            </p>
          </div>
        )}

        {hasVoted && votingActive && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center shadow-xl">
            <p className="text-white font-bold text-lg">
              투표가 완료되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </main>

      {/* Fixed submit button */}
      {votingActive && !hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t-4 border-purple-400 shadow-2xl p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.size !== requiredSelections}
              className={`w-full py-6 rounded-2xl font-black text-xl transition-all transform ${
                selectedIds.size === requiredSelections
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:scale-105 shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } ${submitting ? 'opacity-50' : ''}`}
            >
              {submitting
                ? '제출 중...'
                : selectedIds.size === requiredSelections
                ? `🚀 투표 제출 (${selectedIds.size}/${requiredSelections})`
                : `${requiredSelections}개 선택 필요 (현재: ${selectedIds.size}개)`}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
