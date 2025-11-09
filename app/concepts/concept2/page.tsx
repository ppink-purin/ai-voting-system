'use client';

import { useEffect, useState } from 'react';
import { ensureSession } from '@/lib/session';
import Link from 'next/link';

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

export default function Concept2() {
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e27]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-6"
               style={{ filter: 'drop-shadow(0 0 10px rgb(34 211 238))' }}></div>
          <p className="text-cyan-400 text-xl font-semibold" style={{ textShadow: '0 0 10px rgb(34 211 238)' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1a2e] to-[#0f0e17] relative overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        .scanline {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
        }
      `}</style>

      {/* Network pattern background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="#00d4ff" opacity="0.3"/>
              <line x1="25" y1="25" x2="50" y2="25" stroke="#b624ff" strokeWidth="0.5" opacity="0.2"/>
              <line x1="25" y1="25" x2="25" y2="50" stroke="#ff006b" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none"></div>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/concepts">
          <button className="px-4 py-2 rounded-lg bg-slate-900/80 border border-cyan-500/50 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400 transition-all"
                  style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}>
            ← 컨셉 목록으로
          </button>
        </Link>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-cyan-500/30"
           style={{ boxShadow: '0 4px 30px rgba(34, 211, 238, 0.1)' }}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}>
                현재 선택: {selectedIds.size} / {requiredSelections}
              </h2>
              <p className="text-purple-300 mt-1">
                {hasVoted ? '투표 완료' : `${requiredSelections}개 팀을 선택해주세요`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
                   style={{ filter: 'drop-shadow(0 0 20px rgb(34 211 238))' }}>
                {selectedIds.size}/{requiredSelections}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-32 relative z-10">
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4"
              style={{ filter: 'drop-shadow(0 0 30px rgb(182 36 255))' }}>
            AI 혁신 발표 투표
          </h1>
          <p className="text-cyan-300 text-lg">
            총 {presentations.length}개 팀 중 {requiredSelections}개의 발표 팀을 선택하여 투표해주세요
          </p>
          <p className="text-purple-400/70 text-sm mt-2">컨셉 2: Neural Network Theme</p>
        </div>

        <div className="space-y-4">
          {presentations.map((presentation) => {
            const isSelected = selectedIds.has(presentation.id);
            return (
              <div
                key={presentation.id}
                onClick={() => handleToggleSelection(presentation.id)}
                className={`
                  p-6 rounded-xl transition-all duration-300 cursor-pointer relative
                  ${isSelected
                    ? 'bg-slate-900/85 border-2 border-cyan-400'
                    : 'bg-slate-900/50 border border-purple-500/30 hover:border-purple-400/50 hover:bg-slate-900/70'
                  }
                  ${!votingActive || hasVoted ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                style={{
                  boxShadow: isSelected
                    ? '0 0 30px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.1)'
                    : '0 0 15px rgba(182, 36, 255, 0.2)',
                }}
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 mt-1 flex items-center gap-4">
                    <div className="text-2xl font-bold text-cyan-400/60 w-10 text-center"
                         style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}>
                      {presentation.id}
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400/20'
                          : 'border-purple-500/50 bg-transparent'
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? '0 0 15px rgba(34, 211, 238, 0.8), inset 0 0 10px rgba(34, 211, 238, 0.5)'
                          : 'none',
                      }}
                    >
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          style={{ filter: 'drop-shadow(0 0 5px rgb(34 211 238))' }}
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-cyan-100 mb-2">
                      {presentation.teamName}
                    </h3>
                    <p className="text-purple-200/80 text-base">
                      {presentation.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!votingActive && (
          <div className="mt-8 p-6 bg-red-900/30 border-2 border-red-500/50 rounded-xl text-center"
               style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}>
            <p className="text-red-300 font-semibold text-lg">
              투표가 종료되었습니다. 감사합니다!
            </p>
          </div>
        )}

        {hasVoted && votingActive && (
          <div className="mt-8 p-6 bg-green-900/30 border-2 border-green-500/50 rounded-xl text-center"
               style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}>
            <p className="text-green-300 font-semibold text-lg">
              투표가 완료되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </main>

      {/* Fixed submit button */}
      {votingActive && !hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-cyan-500/30 p-6"
             style={{ boxShadow: '0 -4px 30px rgba(34, 211, 238, 0.2)' }}>
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.size !== requiredSelections}
              className={`w-full py-5 rounded-xl font-bold text-xl transition-all ${
                selectedIds.size === requiredSelections
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500'
                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
              } ${submitting ? 'opacity-50' : ''}`}
              style={{
                boxShadow: selectedIds.size === requiredSelections
                  ? '0 0 30px rgba(34, 211, 238, 0.5)'
                  : 'none',
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
