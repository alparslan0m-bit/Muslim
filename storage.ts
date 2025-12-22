import { type Session, type InsertSession } from "./shared/schema";
import { db } from "./db";
import { sessions } from "./shared/schema";
import { eq } from "drizzle-orm";

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

export class DbStorage implements IStorage {
  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }
}

export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
