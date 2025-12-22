import { type Session, type InsertSession } from "@shared/schema";

export interface IStorage {
  getSessions(): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
}

export class MemStorage implements IStorage {
  private sessions: Session[];
  private currentId: number;

  constructor() {
    this.sessions = [];
    this.currentId = 1;
  }

  async getSessions(): Promise<Session[]> {
    return this.sessions;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = { ...insertSession, id: this.currentId++ };
    this.sessions.push(session);
    return session;
  }
}

export const storage = new MemStorage();
