'use client';

import { useEffect, useState } from 'react';
import { ensureSession } from '@/lib/session';
import Link from 'next/link';

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

export default function Concept3() {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/concepts">
          <button className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all font-medium">
            ← 컨셉 목록으로
          </button>
        </Link>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                현재 선택: {selectedIds.size} / {requiredSelections}
              </h2>
              <p className="text-gray-600 mt-1.5 text-base">
                {hasVoted ? '투표 완료' : `${requiredSelections}개 팀을 선택해주세요`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-blue-900">
                {selectedIds.size}<span className="text-gray-400">/{requiredSelections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-8 py-12 pb-36">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI 혁신 발표 투표
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            총 {presentations.length}개 팀 중 {requiredSelections}개의 발표 팀을 선택하여 투표해주세요
          </p>
          <p className="text-gray-400 text-sm mt-2">컨셉 3: Minimalist Professional</p>
        </div>

        <div className="space-y-4">
          {presentations.map((presentation) => {
            const isSelected = selectedIds.has(presentation.id);
            return (
              <div
                key={presentation.id}
                onClick={() => handleToggleSelection(presentation.id)}
                className={`
                  p-7 rounded-lg transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'bg-white border-3 border-blue-900 shadow-md'
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                  ${!votingActive || hasVoted ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <div className="text-xl font-bold text-gray-400 w-9 text-center">
                      {presentation.id}
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-blue-900 bg-blue-900'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white"
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {presentation.teamName}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {presentation.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!votingActive && (
          <div className="mt-10 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-800 font-semibold text-lg">
              투표가 종료되었습니다. 감사합니다!
            </p>
          </div>
        )}

        {hasVoted && votingActive && (
          <div className="mt-10 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-800 font-semibold text-lg">
              투표가 완료되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </main>

      {/* Fixed submit button */}
      {votingActive && !hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.size !== requiredSelections}
              className={`w-full py-5 rounded-lg font-bold text-lg transition-all ${
                selectedIds.size === requiredSelections
                  ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-md'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
