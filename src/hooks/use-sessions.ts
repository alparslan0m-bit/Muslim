import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertSession } from "@shared/routes";

export function useSessions() {
  return useQuery({
    queryKey: [api.sessions.list.path],
    queryFn: async () => {
      const res = await fetch(api.sessions.list.path);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch sessions: ${res.status} ${errorText}`);
      }
      return api.sessions.list.responses[200].parse(await res.json());
    },
    retry: 2,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: InsertSession) => {
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save session: ${res.status} ${errorText}`);
      }
      
      return api.sessions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
    },
    retry: 2,
  });
}
