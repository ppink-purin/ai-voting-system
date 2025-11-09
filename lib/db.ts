// In-memory database for local development
// Will be replaced with Vercel Postgres in production

interface User {
  sessionId: string;
  createdAt: Date;
  lastUpdated: Date;
}

interface Vote {
  sessionId: string;
  presentationId: number;
  selectedAt: Date;
}

interface Presentation {
  id: number;
  teamName: string;
  title: string;
}

interface SystemConfig {
  votingActive: boolean;
  requiredSelections: number;  // 필요 선택 갯수 (예: 5)
  presentations: Presentation[];  // JSON 업로드로 관리
  lastConfigUpdate: number;  // 설정 변경 타임스탬프
  selectedTheme: number;  // 선택된 테마 (1-6, 기본값 6)
  randomTheme: boolean;  // 랜덤 테마 활성화
}

// For development: Store in global to survive Hot Module Reload
const globalForDb = global as typeof globalThis & {
  users?: Map<string, User>;
  votes?: Map<string, Vote[]>;
  systemConfig?: SystemConfig;
};

// In-memory storage (persists across HMR in development)
const users: Map<string, User> = globalForDb.users || new Map();
if (!globalForDb.users) globalForDb.users = users;

const votes: Map<string, Vote[]> = globalForDb.votes || new Map();
if (!globalForDb.votes) globalForDb.votes = votes;

const systemConfig: SystemConfig = globalForDb.systemConfig || {
  votingActive: true,
  requiredSelections: 5,  // 기본값 5개
  presentations: [],  // 초기값은 빈 배열
  lastConfigUpdate: Date.now(),  // 초기 타임스탬프
  selectedTheme: 6,  // 기본값 컨셉 6 (우주 기술 테마)
  randomTheme: false  // 랜덤 테마 기본 비활성화
};
if (!globalForDb.systemConfig) globalForDb.systemConfig = systemConfig;

export const db = {
  // User operations
  async createUser(sessionId: string): Promise<User> {
    const user: User = {
      sessionId,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    users.set(sessionId, user);
    return user;
  },

  async getUser(sessionId: string): Promise<User | null> {
    return users.get(sessionId) || null;
  },

  async updateUserTimestamp(sessionId: string): Promise<void> {
    const user = users.get(sessionId);
    if (user) {
      user.lastUpdated = new Date();
    }
  },

  async getTotalUsers(): Promise<number> {
    return users.size;
  },

  // Vote operations
  async saveVotes(sessionId: string, presentationIds: number[]): Promise<void> {
    // 선택된 발표들만 저장
    const userVotes: Vote[] = presentationIds.map(id => ({
      sessionId,
      presentationId: id,
      selectedAt: new Date(),
    }));

    votes.set(sessionId, userVotes);
    await this.updateUserTimestamp(sessionId);
  },

  async getUserVotes(sessionId: string): Promise<Vote[]> {
    return votes.get(sessionId) || [];
  },

  async getAllVotes(): Promise<Map<string, Vote[]>> {
    return votes;
  },

  async getVotesForPresentation(presentationId: number): Promise<Vote[]> {
    const allVotes: Vote[] = [];
    votes.forEach(userVotes => {
      const vote = userVotes.find(v => v.presentationId === presentationId);
      if (vote) {
        allVotes.push(vote);
      }
    });
    return allVotes;
  },

  // System config operations
  async getVotingStatus(): Promise<boolean> {
    return systemConfig.votingActive;
  },

  async setVotingStatus(active: boolean): Promise<void> {
    systemConfig.votingActive = active;
  },

  // System config operations
  async getConfig(): Promise<SystemConfig> {
    return systemConfig;
  },

  async updatePresentations(presentations: Presentation[]): Promise<void> {
    systemConfig.presentations = presentations;
    systemConfig.lastConfigUpdate = Date.now();
  },

  async updateRequiredSelections(count: number): Promise<void> {
    systemConfig.requiredSelections = count;
    systemConfig.lastConfigUpdate = Date.now();
  },

  async updateThemeSettings(selectedTheme: number, randomTheme: boolean): Promise<void> {
    systemConfig.selectedTheme = selectedTheme;
    systemConfig.randomTheme = randomTheme;
    systemConfig.lastConfigUpdate = Date.now();
  },

  async resetAllVotes(): Promise<void> {
    users.clear();
    votes.clear();
  },

  // Stats operations
  async getStats(): Promise<{
    totalUsers: number;
    presentationStats: Array<{
      presentationId: number;
      selectionCount: number;
    }>;
  }> {
    const presentationStats: Map<number, number> = new Map();

    votes.forEach(userVotes => {
      userVotes.forEach(vote => {
        const count = presentationStats.get(vote.presentationId) || 0;
        presentationStats.set(vote.presentationId, count + 1);
      });
    });

    return {
      totalUsers: users.size,
      presentationStats: Array.from(presentationStats.entries()).map(([presentationId, count]) => ({
        presentationId,
        selectionCount: count,
      })),
    };
  },
};
