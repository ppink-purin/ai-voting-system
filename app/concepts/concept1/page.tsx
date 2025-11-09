'use client';

import { useEffect, useState } from 'react';
import { ensureSession } from '@/lib/session';
import Link from 'next/link';

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

export default function Concept1() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 animate-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 animate-gradient">
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>

      {/* Back to concepts button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/concepts">
          <button className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all">
            ← 컨셉 목록으로
          </button>
        </Link>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                현재 선택: {selectedIds.size} / {requiredSelections}
              </h2>
              <p className="text-white/90 mt-1">
                {hasVoted ? '투표 완료' : `${requiredSelections}개 팀을 선택해주세요`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white drop-shadow-lg">
                {selectedIds.size}/{requiredSelections}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-32">
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            AI 혁신 발표 투표
          </h1>
          <p className="text-white/90 text-lg">
            총 {presentations.length}개 팀 중 {requiredSelections}개의 발표 팀을 선택하여 투표해주세요
          </p>
          <p className="text-white/70 text-sm mt-2">컨셉 1: Futuristic Glassmorphism</p>
        </div>

        <div className="space-y-4">
          {presentations.map((presentation) => {
            const isSelected = selectedIds.has(presentation.id);
            return (
              <div
                key={presentation.id}
                onClick={() => handleToggleSelection(presentation.id)}
                className={`
                  p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? 'bg-white/30 border-2 border-blue-300 shadow-2xl shadow-blue-500/50 scale-[1.02]'
                    : 'bg-white/15 border border-white/20 hover:bg-white/25 hover:scale-[1.01] shadow-xl'
                  }
                  ${!votingActive || hasVoted ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 mt-1 flex items-center gap-4">
                    <div className="text-2xl font-bold text-white/60 w-10 text-center drop-shadow">
                      {presentation.id}
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-white bg-white shadow-lg shadow-white/50'
                          : 'border-white/50 bg-white/10'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-blue-600"
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
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                      {presentation.teamName}
                    </h3>
                    <p className="text-white/90 text-base">
                      {presentation.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!votingActive && (
          <div className="mt-8 p-6 bg-red-500/30 backdrop-blur-xl border border-red-300/50 rounded-2xl text-center">
            <p className="text-white font-semibold text-lg">
              투표가 종료되었습니다. 감사합니다!
            </p>
          </div>
        )}

        {hasVoted && votingActive && (
          <div className="mt-8 p-6 bg-green-500/30 backdrop-blur-xl border border-green-300/50 rounded-2xl text-center">
            <p className="text-white font-semibold text-lg">
              투표가 완료되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </main>

      {/* Fixed submit button */}
      {votingActive && !hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-t border-white/20 p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.size !== requiredSelections}
              className={`w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl ${
                selectedIds.size === requiredSelections
                  ? 'bg-white text-purple-600 hover:bg-white/90 hover:scale-[1.02]'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              } ${submitting ? 'opacity-50' : ''}`}
            >
              {submitting
                ? '제출 중...'
                : selectedIds.size === requiredSelections
                ? `투표 제출 (${selectedIds.size}/${requiredSelections})`
                : `${requiredSelections}개 선택 필요 (현재: ${selectedIds.size}개)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
