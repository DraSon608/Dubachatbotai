import { useEffect, useState, useCallback } from 'react';
import { ApiService } from '../services/api';

export function useOnlineStatus(forceOffline = false) {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [pingMs, setPingMs] = useState<number | null>(null);

  const checkConnectivity = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setBrowserOnline(false);
      setServerOnline(false);
      return;
    }

    const start = performance.now();
    try {
      const health = await ApiService.checkHealth();
      const elapsed = Math.round(performance.now() - start);
      setServerOnline(health.online);
      setPingMs(elapsed);
    } catch {
      setServerOnline(false);
      setPingMs(null);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      checkConnectivity();
    };
    const handleOffline = () => {
      setBrowserOnline(false);
      setServerOnline(false);
      setPingMs(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnectivity();

    // Periodic ping every 25 seconds
    const interval = setInterval(checkConnectivity, 25000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  const isActuallyOnline = !forceOffline && browserOnline && serverOnline;

  return {
    isOnline: isActuallyOnline,
    browserOnline,
    serverOnline,
    pingMs,
    refreshStatus: checkConnectivity,
  };
}
