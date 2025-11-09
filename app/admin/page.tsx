'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PresentationStats {
  presentationId: number;
  teamName: string;
  title: string;
  selectionCount: number;
}

interface VoteDetail {
  sessionId: string;
  votes: Array<{
    presentationId: number;
  }>;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<{
    totalUsers: number;
    votingActive: boolean;
    requiredSelections: number;
    presentations: PresentationStats[];
  } | null>(null);
  const [allVotes, setAllVotes] = useState<VoteDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newRequiredSelections, setNewRequiredSelections] = useState(5);
  const [uploadedFileName, setUploadedFileName] = useState<string>('presentations.json (기본)');
  const [sortMode, setSortMode] = useState<'file' | 'votes-asc' | 'votes-desc'>('file');
  const [selectedTheme, setSelectedTheme] = useState(6);
  const [randomTheme, setRandomTheme] = useState(false);
  const [updatingTheme, setUpdatingTheme] = useState(false);
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
      setNewRequiredSelections(statsData.requiredSelections || 5);
      setSelectedTheme(statsData.selectedTheme || 6);
      setRandomTheme(statsData.randomTheme || false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !password) return;

    // 투표 초기화 확인
    const confirmed = confirm(
      '⚠️ 경고: 발표 데이터를 업로드하면 모든 투표가 초기화됩니다.\n\n계속하시겠습니까?'
    );
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.presentations || !Array.isArray(data.presentations)) {
        throw new Error('Invalid JSON format. Must have "presentations" array.');
      }

      const response = await fetch('/api/admin/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFileName(file.name);
        alert(result.message || '발표 데이터가 성공적으로 업로드되었습니다!');
        loadData(password);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload:', error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleUpdateRequiredSelections = async () => {
    if (!password || newRequiredSelections < 1) return;

    const confirmed = confirm(
      `⚠️ 경고: 필요 선택 갯수를 ${newRequiredSelections}개로 변경하면 모든 투표가 초기화됩니다.\n\n계속하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          requiredSelections: newRequiredSelections,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || '설정이 성공적으로 변경되었습니다!');
        loadData(password);
      } else {
        throw new Error('Failed to update config');
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      alert('설정 변경에 실패했습니다');
    }
  };

  const handleUpdateTheme = async () => {
    if (!password) return;

    setUpdatingTheme(true);
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          selectedTheme,
          randomTheme,
        }),
      });

      if (response.ok) {
        alert('디자인 테마가 성공적으로 변경되었습니다!');
        loadData(password);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update theme');
      }
    } catch (error: any) {
      console.error('Failed to update theme:', error);
      alert(`테마 변경 실패: ${error.message}`);
    } finally {
      setUpdatingTheme(false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">총 참여자</h3>
            <p className="text-4xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">필요 선택 갯수</h3>
            <p className="text-4xl font-bold text-purple-600">{stats?.requiredSelections || 0}</p>
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

        {/* Configuration Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">설정 관리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JSON Upload */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">발표 데이터 업로드</h3>
              <p className="text-xs text-gray-500 mb-3">
                JSON 파일을 업로드하여 발표 팀 목록을 업데이트합니다
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {uploading && <p className="text-sm text-blue-600 mt-2">업로드 중...</p>}
            </div>

            {/* Required Selections */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">필요 선택 갯수 설정</h3>
              <p className="text-xs text-gray-500 mb-3">
                참여자가 선택해야 하는 팀의 갯수를 지정합니다
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={newRequiredSelections}
                  onChange={(e) => setNewRequiredSelections(parseInt(e.target.value) || 1)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleUpdateRequiredSelections}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  변경
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Configuration Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">디자인 테마 설정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">테마 선택</h3>
              <p className="text-xs text-gray-500 mb-3">
                참여자 페이지에 적용할 디자인 테마를 선택하세요
              </p>
              <div className="space-y-2">
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(parseInt(e.target.value))}
                  disabled={randomTheme}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-60"
                >
                  <option value={1}>컨셉 1: Futuristic Glassmorphism (미래지향적 글래스모피즘)</option>
                  <option value={2}>컨셉 2: Neural Network Theme (신경망 네트워크 테마)</option>
                  <option value={3}>컨셉 3: Minimalist Professional (미니멀 프로페셔널)</option>
                  <option value={4}>컨셉 4: Vibrant Innovation (생동감 넘치는 혁신)</option>
                  <option value={5}>컨셉 5: 3D Modern Cards (3D 모던 카드)</option>
                  <option value={6}>컨셉 6: Cosmic Tech (우주 기술 테마) ⭐ 기본값</option>
                </select>
                <a
                  href="/concepts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  모든 컨셉 미리보기 →
                </a>
              </div>
            </div>

            {/* Random Theme */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">랜덤 디자인 스킨</h3>
              <p className="text-xs text-gray-500 mb-3">
                활성화하면 참여자가 페이지를 열 때마다 랜덤 테마가 적용됩니다
              </p>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomTheme}
                  onChange={(e) => setRandomTheme(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  랜덤 테마 활성화 {randomTheme && '(선택된 테마 무시됨)'}
                </span>
              </label>
              <button
                onClick={handleUpdateTheme}
                disabled={updatingTheme}
                className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {updatingTheme ? '적용 중...' : '테마 설정 적용'}
              </button>
            </div>
          </div>

          {/* Current Theme Display */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">현재 설정:</span>{' '}
              {randomTheme ? (
                <span className="text-purple-700 font-medium">🎲 랜덤 테마 활성화됨 (매 방문마다 다른 테마 표시)</span>
              ) : (
                <span className="text-blue-700 font-medium">
                  컨셉 {selectedTheme} 고정{' '}
                  {selectedTheme === 1 && '(Futuristic Glassmorphism)'}
                  {selectedTheme === 2 && '(Neural Network Theme)'}
                  {selectedTheme === 3 && '(Minimalist Professional)'}
                  {selectedTheme === 4 && '(Vibrant Innovation)'}
                  {selectedTheme === 5 && '(3D Modern Cards)'}
                  {selectedTheme === 6 && '(Cosmic Tech) ⭐'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Team List Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">팀 목록 및 투표 현황</h2>
              <p className="text-sm text-gray-500 mt-1">
                현재 설정 파일: <span className="font-semibold text-blue-600">{uploadedFileName}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortMode('file')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  sortMode === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                파일 순서
              </button>
              <button
                onClick={() => setSortMode('votes-desc')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  sortMode === 'votes-desc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                투표수 ↓
              </button>
              <button
                onClick={() => setSortMode('votes-asc')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  sortMode === 'votes-asc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                투표수 ↑
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">번호</th>
                  <th className="text-left p-3 font-semibold text-gray-700">팀명</th>
                  <th className="text-left p-3 font-semibold text-gray-700">발표 제목</th>
                  <th className="text-center p-3 font-semibold text-gray-700">선택 횟수</th>
                  <th className="text-center p-3 font-semibold text-gray-700">선택율</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let sortedPresentations = [...(stats?.presentations || [])];

                  if (sortMode === 'file') {
                    // Sort by presentationId (file order)
                    sortedPresentations.sort((a, b) => a.presentationId - b.presentationId);
                  } else if (sortMode === 'votes-asc') {
                    // Sort by selectionCount ascending
                    sortedPresentations.sort((a, b) => a.selectionCount - b.selectionCount);
                  } else if (sortMode === 'votes-desc') {
                    // Sort by selectionCount descending (already default from API)
                    sortedPresentations.sort((a, b) => b.selectionCount - a.selectionCount);
                  }

                  return sortedPresentations.map((pres, index) => (
                    <tr key={pres.presentationId} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className="font-bold text-lg">{sortMode === 'file' ? pres.presentationId : index + 1}</span>
                      </td>
                      <td className="p-3 font-medium">{pres.teamName}</td>
                      <td className="p-3 text-sm text-gray-600">{pres.title}</td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-blue-600">{pres.selectionCount}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-yellow-600">
                          {stats?.totalUsers && stats.totalUsers > 0 ? ((pres.selectionCount / stats.totalUsers) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
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
                  <th className="text-center p-3 font-semibold text-gray-700">선택 갯수</th>
                  <th className="text-left p-3 font-semibold text-gray-700">선택한 발표 팀 ID</th>
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
                        .map((v) => `#${v.presentationId}`)
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
