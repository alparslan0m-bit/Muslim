import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertSession } from "@shared/schema";
import { LocalStorage } from "@/lib/local-storage";

const SESSIONS_QUERY_KEY = ["sessions"];

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async () => {
      // Use localStorage as primary storage (offline-first PWA)
      const sessions = LocalStorage.getSessions();
      return sessions;
    },
    retry: false,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: InsertSession) => {
      // Save to localStorage (works offline)
      const savedSession = LocalStorage.createSession(session);
      return savedSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}
