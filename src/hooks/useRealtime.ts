import { useState, useEffect } from 'react';
import { rtdb } from '../lib/firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { ChatMessage } from '../types';

export function useRealtime(villageId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    if (!villageId) return;
    
    const messagesRef = query(ref(rtdb, `villages/${villageId}/messages`), limitToLast(100));
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map(key => ({ id: key, ...data[key] } as ChatMessage));
        parsed.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(parsed);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [villageId]);

  return { messages };
}
