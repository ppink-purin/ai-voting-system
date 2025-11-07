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
  rating: number;
  updatedAt: Date;
}

interface SystemConfig {
  votingActive: boolean;
}

// In-memory storage
const users: Map<string, User> = new Map();
const votes: Map<string, Vote[]> = new Map(); // key: sessionId
const systemConfig: SystemConfig = { votingActive: true };

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
  async saveVote(sessionId: string, presentationId: number, rating: number): Promise<void> {
    let userVotes = votes.get(sessionId) || [];

    // Remove existing vote for this presentation
    userVotes = userVotes.filter(v => v.presentationId !== presentationId);

    // Add new vote
    userVotes.push({
      sessionId,
      presentationId,
      rating,
      updatedAt: new Date(),
    });

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

  // Stats operations
  async getStats(): Promise<{
    totalUsers: number;
    presentationStats: Array<{
      presentationId: number;
      voteCount: number;
      averageRating: number;
      totalRating: number;
    }>;
  }> {
    const presentationStats: Map<number, { count: number; total: number }> = new Map();

    votes.forEach(userVotes => {
      userVotes.forEach(vote => {
        const stats = presentationStats.get(vote.presentationId) || { count: 0, total: 0 };
        stats.count++;
        stats.total += vote.rating;
        presentationStats.set(vote.presentationId, stats);
      });
    });

    return {
      totalUsers: users.size,
      presentationStats: Array.from(presentationStats.entries()).map(([presentationId, stats]) => ({
        presentationId,
        voteCount: stats.count,
        averageRating: stats.total / stats.count,
        totalRating: stats.total,
      })),
    };
  },
};
