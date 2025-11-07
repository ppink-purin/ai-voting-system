'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PresentationStats {
  presentationId: number;
  teamName: string;
  title: string;
  voteCount: number;
  averageRating: number;
}

interface VoteDetail {
  sessionId: string;
  votes: Array<{
    presentationId: number;
    rating: number;
  }>;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<{
    totalUsers: number;
    votingActive: boolean;
    presentations: PresentationStats[];
  } | null>(null);
  const [allVotes, setAllVotes] = useState<VoteDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    const savedPassword = sessionStorage.getItem('admin_password');
    if (!savedPassword) {
      router.push('/admin/login');
      return;
    }
    setPassword(savedPassword);
    loadData(savedPassword);

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadData(savedPassword, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const loadData = async (pwd: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Load stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${pwd}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Unauthorized');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Load all votes
      const votesResponse = await fetch('/api/admin/all-votes', {
        headers: {
          Authorization: `Bearer ${pwd}`,
        },
      });

      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        setAllVotes(votesData.votes);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      sessionStorage.removeItem('admin_password');
      router.push('/admin/login');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleVoting = async () => {
    if (!stats || !password) return;

    const confirmed = confirm(
      stats.votingActive
        ? '투표를 종료하시겠습니까? 종료 후에는 참여자들이 더 이상 투표할 수 없습니다.'
        : '투표를 다시 시작하시겠습니까?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/toggle-voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          active: !stats.votingActive,
        }),
      });

      if (response.ok) {
        loadData(password);
      } else {
        alert('투표 제어에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to toggle voting:', error);
      alert('투표 제어에 실패했습니다');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_password');
    router.push('/admin/login');
  };

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600 mt-1">AI 혁신 발표 투표 현황</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => loadData(password)}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {refreshing ? '새로고침 중...' : '새로고침'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">총 참여자</h3>
            <p className="text-4xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">투표 상태</h3>
            <p className={`text-2xl font-bold ${stats?.votingActive ? 'text-green-600' : 'text-red-600'}`}>
              {stats?.votingActive ? '진행 중' : '종료됨'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">투표 제어</h3>
            <button
              onClick={handleToggleVoting}
              className={`px-6 py-2 rounded-lg font-medium ${
                stats?.votingActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {stats?.votingActive ? '투표 종료' : '투표 시작'}
            </button>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">순위 및 통계</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">순위</th>
                  <th className="text-left p-3 font-semibold text-gray-700">팀명</th>
                  <th className="text-left p-3 font-semibold text-gray-700">발표 제목</th>
                  <th className="text-center p-3 font-semibold text-gray-700">투표 수</th>
                  <th className="text-center p-3 font-semibold text-gray-700">평균 별점</th>
                </tr>
              </thead>
              <tbody>
                {stats?.presentations.map((pres, index) => (
                  <tr key={pres.presentationId} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-bold text-lg">{index + 1}</span>
                    </td>
                    <td className="p-3 font-medium">{pres.teamName}</td>
                    <td className="p-3 text-sm text-gray-600">{pres.title}</td>
                    <td className="p-3 text-center">{pres.voteCount}</td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-yellow-600">
                        {pres.averageRating.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual Votes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            개별 투표 내역 (총 {allVotes.length}명)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">참여자 ID</th>
                  <th className="text-center p-3 font-semibold text-gray-700">투표 수</th>
                  <th className="text-left p-3 font-semibold text-gray-700">발표별 점수</th>
                </tr>
              </thead>
              <tbody>
                {allVotes.map((vote) => (
                  <tr key={vote.sessionId} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{vote.sessionId.substring(0, 12)}...</td>
                    <td className="p-3 text-center">{vote.votes.length}</td>
                    <td className="p-3 text-sm">
                      {vote.votes
                        .sort((a, b) => a.presentationId - b.presentationId)
                        .map((v) => `#${v.presentationId}: ${v.rating}★`)
                        .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
