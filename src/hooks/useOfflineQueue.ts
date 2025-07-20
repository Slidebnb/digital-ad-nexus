
import { useState, useEffect, useCallback } from "react";
import { useNetworkState } from "./useNetworkState";

interface QueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  execute: () => Promise<any>;
}

const QUEUE_STORAGE_KEY = 'offline_queue';
const MAX_QUEUE_SIZE = 100;

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOnline } = useNetworkState();

  // Queue aus LocalStorage laden
  useEffect(() => {
    const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Failed to load offline queue:', error);
        localStorage.removeItem(QUEUE_STORAGE_KEY);
      }
    }
  }, []);

  // Queue in LocalStorage speichern
  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } else {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
    }
  }, [queue]);

  // Queue verarbeiten wenn online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [isOnline, queue.length, isProcessing]);

  const addToQueue = useCallback((item: Omit<QueueItem, 'id' | 'timestamp' | 'retries'>) => {
    const queueItem: QueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0
    };

    setQueue(prev => {
      const newQueue = [...prev, queueItem];
      // Queue-Größe begrenzen
      if (newQueue.length > MAX_QUEUE_SIZE) {
        return newQueue.slice(-MAX_QUEUE_SIZE);
      }
      return newQueue;
    });

    // Sofort versuchen zu verarbeiten wenn online
    if (isOnline) {
      processQueue();
    }

    return queueItem.id;
  }, [isOnline]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0 || !isOnline) return;

    setIsProcessing(true);
    
    const itemsToProcess = [...queue];
    
    for (const item of itemsToProcess) {
      try {
        await item.execute();
        removeFromQueue(item.id);
        console.log(`Successfully processed queued action: ${item.action}`);
      } catch (error) {
        console.error(`Failed to process queued action: ${item.action}`, error);
        
        // Retry-Logik
        if (item.retries < item.maxRetries) {
          setQueue(prev => 
            prev.map(queueItem => 
              queueItem.id === item.id 
                ? { ...queueItem, retries: queueItem.retries + 1 }
                : queueItem
            )
          );
        } else {
          // Max retries erreicht, aus Queue entfernen
          removeFromQueue(item.id);
          console.error(`Max retries reached for action: ${item.action}`);
        }
      }
    }
    
    setIsProcessing(false);
  }, [isProcessing, queue, isOnline, removeFromQueue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }, []);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    isProcessing,
    queueSize: queue.length
  };
}

// Hook für spezielle Offline-Actions
export function useOfflineActions() {
  const { addToQueue } = useOfflineQueue();

  const queueFavoriteAction = useCallback((adId: string, add: boolean) => {
    return addToQueue({
      action: add ? 'add_favorite' : 'remove_favorite',
      data: { adId },
      maxRetries: 3,
      execute: async () => {
        const response = await fetch(`/api/favorites`, {
          method: add ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ad_id: adId })
        });
        if (!response.ok) throw new Error(`Failed to ${add ? 'add' : 'remove'} favorite`);
      }
    });
  }, [addToQueue]);

  const queueMessageAction = useCallback((conversationId: string, content: string) => {
    return addToQueue({
      action: 'send_message',
      data: { conversationId, content },
      maxRetries: 5,
      execute: async () => {
        const response = await fetch(`/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            conversation_id: conversationId,
            content 
          })
        });
        if (!response.ok) throw new Error('Failed to send message');
      }
    });
  }, [addToQueue]);

  const queueRatingAction = useCallback((toUserId: string, rating: number, comment?: string) => {
    return addToQueue({
      action: 'submit_rating',
      data: { toUserId, rating, comment },
      maxRetries: 2,
      execute: async () => {
        const response = await fetch(`/api/ratings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            to_user_id: toUserId,
            rating,
            review_text: comment
          })
        });
        if (!response.ok) throw new Error('Failed to submit rating');
      }
    });
  }, [addToQueue]);

  return {
    queueFavoriteAction,
    queueMessageAction,
    queueRatingAction
  };
}
