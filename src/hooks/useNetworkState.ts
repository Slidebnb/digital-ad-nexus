
import { useState, useEffect } from "react";

interface NetworkState {
  isOnline: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export function useNetworkState(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine
  });

  useEffect(() => {
    const updateNetworkState = () => {
      const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

      setNetworkState({
        isOnline: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData
      });
    };

    const handleOnline = () => {
      updateNetworkState();
      console.log('Network: Back online');
    };

    const handleOffline = () => {
      updateNetworkState();
      console.log('Network: Gone offline');
    };

    const handleConnectionChange = () => {
      updateNetworkState();
      console.log('Network: Connection changed');
    };

    // Event Listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Initial state
    updateNetworkState();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkState;
}

// Hook für Netzwerk-Feedback
export function useNetworkFeedback() {
  const { isOnline, effectiveType } = useNetworkState();
  
  const getConnectionQuality = () => {
    if (!isOnline) return 'offline';
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'poor';
      case '3g':
        return 'moderate';
      case '4g':
        return 'good';
      default:
        return 'unknown';
    }
  };

  const shouldShowLowBandwidthWarning = () => {
    return isOnline && ['slow-2g', '2g'].includes(effectiveType || '');
  };

  return {
    isOnline,
    connectionQuality: getConnectionQuality(),
    shouldShowLowBandwidthWarning: shouldShowLowBandwidthWarning(),
    isSlowConnection: ['slow-2g', '2g', '3g'].includes(effectiveType || '')
  };
}
