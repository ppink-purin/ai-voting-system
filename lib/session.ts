// Session management utilities for client-side

const SESSION_KEY = 'voting_session_id';

export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function saveSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, sessionId);
}

export async function generateSessionId(): Promise<string> {
  const response = await fetch('/api/session', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to generate session ID');
  }

  const data = await response.json();
  return data.sessionId;
}

export async function ensureSession(): Promise<string> {
  let sessionId = getSessionId();

  if (!sessionId) {
    sessionId = await generateSessionId();
    saveSessionId(sessionId);
  }

  return sessionId;
}
