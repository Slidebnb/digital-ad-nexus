
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface OptimisticUpdateOptions<T> {
  queryKey: string[];
  updateFn: (oldData: T) => T;
  mutationFn: () => Promise<any>;
  rollbackFn?: (oldData: T) => T;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>({
  queryKey,
  updateFn,
  mutationFn,
  rollbackFn,
  successMessage,
  errorMessage
}: OptimisticUpdateOptions<T>) {
  const [isOptimistic, setIsOptimistic] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const performOptimisticUpdate = useCallback(async () => {
    setIsOptimistic(true);
    
    // Speichere vorherige Daten für Rollback
    const previousData = queryClient.getQueryData<T>(queryKey);
    
    // Optimistische Aktualisierung
    queryClient.setQueryData<T>(queryKey, (oldData) => {
      if (!oldData) return oldData;
      return updateFn(oldData);
    });

    try {
      // Führe die tatsächliche Mutation aus
      await mutationFn();
      
      if (successMessage) {
        toast({
          title: "Erfolgreich",
          description: successMessage,
        });
      }
      
      // Invalidiere und hole frische Daten
      await queryClient.invalidateQueries({ queryKey });
      
    } catch (error) {
      console.error('Optimistic update failed:', error);
      
      // Rollback bei Fehler
      if (previousData) {
        queryClient.setQueryData<T>(queryKey, rollbackFn ? rollbackFn(previousData) : previousData);
      }
      
      toast({
        title: "Fehler",
        description: errorMessage || "Aktion konnte nicht ausgeführt werden",
        variant: "destructive",
      });
    } finally {
      setIsOptimistic(false);
    }
  }, [queryKey, updateFn, mutationFn, rollbackFn, successMessage, errorMessage, queryClient, toast]);

  return {
    performOptimisticUpdate,
    isOptimistic
  };
}

// Spezielle Hooks für häufige Use-Cases
export function useOptimisticFavorite(adId: string) {
  return useOptimisticUpdate({
    queryKey: ['favorites'],
    updateFn: (favorites: any[]) => [...favorites, { ad_id: adId, created_at: new Date().toISOString() }],
    mutationFn: async () => {
      const response = await fetch(`/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: adId })
      });
      if (!response.ok) throw new Error('Failed to add favorite');
    },
    rollbackFn: (favorites: any[]) => favorites.filter(f => f.ad_id !== adId),
    successMessage: "Zu Favoriten hinzugefügt",
    errorMessage: "Fehler beim Hinzufügen zu Favoriten"
  });
}

export function useOptimisticLike(itemId: string, itemType: 'ad' | 'comment') {
  return useOptimisticUpdate({
    queryKey: [itemType, itemId, 'likes'],
    updateFn: (likes: number) => likes + 1,
    mutationFn: async () => {
      const response = await fetch(`/api/${itemType}s/${itemId}/like`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to like');
    },
    rollbackFn: (likes: number) => likes - 1,
    successMessage: "Gefällt mir hinzugefügt",
    errorMessage: "Fehler beim Liken"
  });
}

export function useOptimisticMessage() {
  return useOptimisticUpdate({
    queryKey: ['messages'],
    updateFn: (messages: any[]) => [...messages, {
      id: `temp-${Date.now()}`,
      content: '',
      created_at: new Date().toISOString(),
      sending: true
    }],
    mutationFn: async () => {
      // Will be implemented in message send
    },
    rollbackFn: (messages: any[]) => messages.filter(m => !m.id.startsWith('temp-')),
    errorMessage: "Nachricht konnte nicht gesendet werden"
  });
}
