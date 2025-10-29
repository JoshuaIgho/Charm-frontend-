// hooks/useKeepAlive.js
import { useEffect, useRef } from 'react';
import { API_URL } from '../services/api';

/**
 * Hook to keep the backend awake by pinging it periodically
 * Only runs when user is active on the page
 */
export function useKeepAlive(intervalMinutes = 10) {
  const intervalRef = useRef(null);
  const lastPingRef = useRef(Date.now());

  useEffect(() => {
    // Simple health check query
    const pingBackend = async () => {
      try {
        const now = Date.now();
        const timeSinceLastPing = (now - lastPingRef.current) / 1000 / 60;
        
        // Skip if we pinged recently
        if (timeSinceLastPing < intervalMinutes) {
          return;
        }

        console.log('🏓 Pinging backend to keep it awake...');
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `{ __typename }` // Minimal query
          }),
        });

        if (response.ok) {
          lastPingRef.current = now;
          console.log('✅ Backend ping successful');
        }
      } catch (error) {
        console.warn('⚠️ Backend ping failed (expected if user is idle):', error.message);
      }
    };

    // Ping immediately on mount
    pingBackend();

    // Then ping every X minutes
    intervalRef.current = setInterval(() => {
      // Only ping if document is visible (user is on the page)
      if (!document.hidden) {
        pingBackend();
      }
    }, intervalMinutes * 60 * 1000);

    // Also ping when user returns to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastPing = (Date.now() - lastPingRef.current) / 1000 / 60;
        // If it's been more than intervalMinutes, ping immediately
        if (timeSinceLastPing >= intervalMinutes) {
          pingBackend();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMinutes]);
}

export default useKeepAlive;