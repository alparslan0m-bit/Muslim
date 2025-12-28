import { type Session, type InsertSession } from "@shared/schema";

const STORAGE_KEY = "muslim_focus_sessions";

export class LocalStorage {
  /**
   * Get all sessions from localStorage
   */
  static getSessions(): Session[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to read sessions from storage:", error);
      return [];
    }
  }

  /**
   * Create a new session in localStorage
   */
  static createSession(input: InsertSession): Session {
    try {
      const sessions = this.getSessions();
      const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
      
      const now = new Date();
      const session: Session = {
        id: newId,
        startTime: input.startTime instanceof Date ? input.startTime : new Date(input.startTime),
        endTime: input.endTime instanceof Date ? input.endTime : (input.endTime ? new Date(input.endTime) : null),
        durationSeconds: input.durationSeconds,
        date: input.date,
        createdAt: now,
        updatedAt: now,
      };

      sessions.push(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      return session;
    } catch (error) {
      console.error("Failed to save session to storage:", error);
      throw new Error("Failed to save session locally");
    }
  }

  /**
   * Clear all sessions from localStorage
   */
  static clearAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear sessions:", error);
    }
  }
}
