'use client';

import { useEffect, useState, useCallback } from 'react';
import { ensureSession } from '@/lib/session';
import ProgressBar from '@/components/ProgressBar';
import PresentationCard from '@/components/PresentationCard';

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

interface Vote {
  presentationId: number;
  rating: number;
}

export default function Home() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [votes, setVotes] = useState<Map<number, number>>(new Map());
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [votingActive, setVotingActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize session and load data
  useEffect(() => {
    async function init() {
      try {
        // Ensure session
        const sid = await ensureSession();
        setSessionId(sid);

        // Load presentations
        const presResponse = await fetch('/api/presentations');
        const presData = await presResponse.json();
        setPresentations(presData.presentations);

        // Load existing votes
        const votesResponse = await fetch(`/api/votes/${sid}`);
        if (votesResponse.ok) {
          const votesData = await votesResponse.json();
          const votesMap = new Map<number, number>();
          votesData.votes.forEach((vote: Vote) => {
            votesMap.set(vote.presentationId, vote.rating);
          });
          setVotes(votesMap);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Debounced save function
  const saveVote = useCallback(
    async (presentationId: number, rating: number) => {
      if (!sessionId) return;

      setSaving(true);
      try {
        const response = await fetch('/api/votes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            presentationId,
            rating,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.error === 'Voting has ended') {
            setVotingActive(false);
          }
          throw new Error(error.error || 'Failed to save vote');
        }
      } catch (error) {
        console.error('Failed to save vote:', error);
        alert('투표 저장에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setSaving(false);
      }
    },
    [sessionId]
  );

  const handleRatingChange = (presentationId: number, rating: number) => {
    // Update local state immediately
    setVotes((prev) => new Map(prev).set(presentationId, rating));

    // Save to server
    saveVote(presentationId, rating);
  };

  const completedCount = votes.size;
  const totalCount = presentations.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar completed={completedCount} total={totalCount} />

      <main className="max-w-4xl mx-auto p-4 pb-20">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI 혁신 발표 투표
          </h1>
          <p className="text-gray-600">
            각 발표에 대해 1~5점으로 평가해주세요
          </p>
          {saving && (
            <p className="text-sm text-blue-600 mt-2">저장 중...</p>
          )}
        </div>

        <div className="space-y-4">
          {presentations.map((presentation) => (
            <PresentationCard
              key={presentation.id}
              id={presentation.id}
              teamName={presentation.teamName}
              title={presentation.title}
              currentRating={votes.get(presentation.id) || null}
              onRatingChange={(rating) =>
                handleRatingChange(presentation.id, rating)
              }
              disabled={!votingActive}
            />
          ))}
        </div>

        {!votingActive && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-700 font-medium">
              투표가 종료되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
