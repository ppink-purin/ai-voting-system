'use client';

import { useEffect, useState } from 'react';
import { ensureSession } from '@/lib/session';
import Link from 'next/link';

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

export default function Concept6() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-cyan-400 mx-auto mb-6"
                 style={{ filter: 'drop-shadow(0 0 20px rgb(34 211 238))' }}></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-2 border-purple-400 opacity-20"></div>
          </div>
          <p className="text-cyan-400 text-xl font-bold" style={{ textShadow: '0 0 20px rgb(34 211 238)' }}>
            우주로 진입 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(300px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(300px) rotate(-360deg); }
        }
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }
        .planet {
          position: absolute;
          border-radius: 50%;
          opacity: 0.3;
          filter: blur(1px);
        }
      `}</style>

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Nebula effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/concepts">
          <button className="px-4 py-2 rounded-lg bg-slate-900/80 border border-cyan-400/50 text-cyan-400 font-semibold hover:bg-slate-800 hover:border-cyan-400 transition-all"
                  style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}>
            ← 컨셉 목록으로
          </button>
        </Link>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-cyan-400/30"
           style={{ boxShadow: '0 4px 30px rgba(34, 211, 238, 0.2)' }}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
                  style={{ filter: 'drop-shadow(0 0 10px rgb(34 211 238))' }}>
                현재 선택: {selectedIds.size} / {requiredSelections}
              </h2>
              <p className="text-cyan-300 mt-1">
                {hasVoted ? '투표 완료' : `${requiredSelections}개 팀을 선택해주세요`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                   style={{ filter: 'drop-shadow(0 0 20px rgb(34 211 238))' }}>
                {selectedIds.size}/{requiredSelections}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 pb-32 relative z-10">
        <div className="text-center py-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4"
              style={{ filter: 'drop-shadow(0 0 30px rgb(168 85 247))' }}>
            AI 혁신 발표 투표
          </h1>
          <p className="text-cyan-300 text-lg font-medium">
            총 {presentations.length}개 팀 중 {requiredSelections}개의 발표 팀을 선택하여 투표해주세요
          </p>
          <p className="text-purple-400/70 text-sm mt-3">컨셉 6: Cosmic Tech</p>
        </div>

        <div className="space-y-5">
          {presentations.map((presentation) => {
            const isSelected = selectedIds.has(presentation.id);
            return (
              <div
                key={presentation.id}
                onClick={() => handleToggleSelection(presentation.id)}
                className={`
                  p-6 rounded-2xl transition-all duration-300 cursor-pointer relative group
                  ${isSelected
                    ? 'bg-gradient-to-r from-cyan-900/40 to-purple-900/40'
                    : 'bg-slate-900/40 hover:bg-slate-900/60'
                  }
                  ${!votingActive || hasVoted ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: isSelected
                    ? '2px solid transparent'
                    : '1px solid rgba(100, 116, 139, 0.3)',
                  backgroundImage: isSelected
                    ? 'linear-gradient(rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1)), linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3))'
                    : 'none',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  boxShadow: isSelected
                    ? '0 0 40px rgba(34, 211, 238, 0.5), inset 0 0 30px rgba(34, 211, 238, 0.1)'
                    : '0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Energy ring for selected cards */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 animate-pulse pointer-events-none"></div>
                )}

                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 flex items-center gap-4">
                    {/* Holographic number */}
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-400 w-10 text-center"
                         style={{ filter: 'drop-shadow(0 0 10px rgb(34 211 238))' }}>
                      {presentation.id}
                    </div>

                    {/* Cosmic checkbox */}
                    <div
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/30 to-purple-500/30'
                          : 'border-purple-500/50 bg-slate-900/50'
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? '0 0 20px rgba(34, 211, 238, 0.8), inset 0 0 15px rgba(34, 211, 238, 0.3)'
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
          <div className="mt-8 p-6 bg-red-900/40 border-2 border-red-500/50 rounded-2xl text-center backdrop-blur-md"
               style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)' }}>
            <p className="text-red-300 font-bold text-lg">
              투표가 종료되었습니다. 감사합니다!
            </p>
          </div>
        )}

        {hasVoted && votingActive && (
          <div className="mt-8 p-6 bg-green-900/40 border-2 border-green-500/50 rounded-2xl text-center backdrop-blur-md"
               style={{ boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)' }}>
            <p className="text-green-300 font-bold text-lg">
              투표가 완료되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </main>

      {/* Fixed submit button */}
      {votingActive && !hasVoted && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-cyan-400/30 p-6"
             style={{ boxShadow: '0 -4px 30px rgba(34, 211, 238, 0.2)' }}>
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.size !== requiredSelections}
              className={`w-full py-6 rounded-2xl font-black text-xl transition-all ${
                selectedIds.size === requiredSelections
                  ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400'
                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
              } ${submitting ? 'opacity-50' : ''}`}
              style={{
                boxShadow: selectedIds.size === requiredSelections
                  ? '0 0 40px rgba(34, 211, 238, 0.6), 0 0 80px rgba(168, 85, 247, 0.4)'
                  : 'none',
              }}
            >
              {submitting
                ? '우주로 전송 중...'
                : selectedIds.size === requiredSelections
                ? `🚀 투표 제출 (${selectedIds.size}/${requiredSelections})`
                : `${requiredSelections}개 선택 필요 (현재: ${selectedIds.size}개)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
