'use client';

import { useEffect, useState } from 'react';
import { ensureSession } from '@/lib/session';
import Link from 'next/link';

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

export default function Concept5() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6 shadow-lg"></div>
          <p className="text-slate-800 text-xl font-bold">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <style jsx>{`
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-3d:hover:not(.disabled) {
          transform: translateY(-12px) scale(1.02);
        }
      `}</style>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/concepts">
          <button className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:shadow-lg transition-all shadow-md">
            ← 컨셉 목록으로
          </button>
        </Link>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white shadow-xl">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                현재 선택: {selectedIds.size} / {requiredSelections}
              </h2>
              <p className="text-slate-600 mt-1 font-medium">
                {hasVoted ? '투표 완료' : `${requiredSelections}개 팀을 선택해주세요`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-indigo-600 drop-shadow-md">
                {selectedIds.size}<span className="text-slate-400">/{requiredSelections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-32">
        <div className="text-center py-12">
          <h1 className="text-5xl font-black text-slate-900 mb-4 drop-shadow-sm">
            AI 혁신 발표 투표
          </h1>
          <p className="text-slate-700 text-lg font-medium">
            총 {presentations.length}개 팀 중 {requiredSelections}개의 발표 팀을 선택하여 투표해주세요
          </p>
          <p className="text-indigo-600 text-sm mt-2 font-semibold">컨셉 5: 3D Modern Cards</p>
        </div>

        <div className="space-y-6">
          {presentations.map((presentation) => {
            const isSelected = selectedIds.has(presentation.id);
            return (
              <div
                key={presentation.id}
                onClick={() => handleToggleSelection(presentation.id)}
                className={`
                  card-3d p-7 rounded-2xl cursor-pointer bg-white
                  ${isSelected
                    ? 'shadow-2xl border-4 border-indigo-600'
                    : 'shadow-lg border border-slate-200 hover:shadow-2xl'
                  }
                  ${!votingActive || hasVoted ? 'opacity-60 cursor-not-allowed disabled' : ''}
                `}
                style={{
                  boxShadow: isSelected
                    ? '0 25px 50px -12px rgba(79, 70, 229, 0.4), 0 0 0 4px rgba(79, 70, 229, 0.1)'
                    : undefined,
                }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 flex items-center gap-4">
                    {/* Number badge with 3D effect */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl
                      ${isSelected
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg'
                        : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 shadow-md'
                      }
                    `}
                    style={{
                      boxShadow: isSelected
                        ? '0 10px 25px -5px rgba(79, 70, 229, 0.5), inset 0 -3px 0 rgba(0, 0, 0, 0.2)'
                        : '0 4px 10px -2px rgba(0, 0, 0, 0.1), inset 0 -3px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      {presentation.id}
                    </div>

                    {/* Checkbox with 3D effect */}
                    <div
                      className={`w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 shadow-lg'
                          : 'border-slate-300 bg-white shadow-md hover:border-slate-400'
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? '0 10px 20px -5px rgba(79, 70, 229, 0.5), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                          : '0 4px 8px -2px rgba(0, 0, 0, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      {isSelected && (
                        <svg
                          className="w-6 h-6 text-white"
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
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {presentation.teamName}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed">
                      {presentation.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!votingActive && (
          <div className="mt-8 p-6 bg-red-50 border-2 border-red-300 rounded-2xl text-center shadow-lg">
            <p className="text-red-800 font-bold text-lg">
              투표가 종료되었습니다. 감사합니다!
            </p>
          </div>
        )}

        {hasVoted && votingActive && (
          <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-2xl text-center shadow-lg">
            <p className="text-green-800 font-bold text-lg">
              투표가 완료되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </main>

      {/* Fixed submit button */}
      {votingActive && !hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl p-6 border-t-2 border-slate-200">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.size !== requiredSelections}
              className={`w-full py-6 rounded-2xl font-bold text-xl transition-all transform ${
                selectedIds.size === requiredSelections
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white hover:from-indigo-500 hover:to-indigo-700 hover:scale-105 shadow-2xl'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-md'
              } ${submitting ? 'opacity-50' : ''}`}
              style={{
                boxShadow: selectedIds.size === requiredSelections
                  ? '0 20px 40px -10px rgba(79, 70, 229, 0.5), inset 0 -4px 0 rgba(0, 0, 0, 0.2)'
                  : undefined,
              }}
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
