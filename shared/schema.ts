export interface Session {
  id: number;
  startTime: Date | string;
  endTime?: Date | string | null;
  durationSeconds: number;
  date: string; // YYYY-MM-DD
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type InsertSession = Omit<Session, 'id' | 'createdAt' | 'updatedAt'>;
