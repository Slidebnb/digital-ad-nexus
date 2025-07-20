
import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIPhone: boolean;
  isIPad: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isTouchDevice: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIPhone: false,
    isIPad: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    isTouchDevice: false,
    screenSize: 'large',
    orientation: 'landscape'
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Device detection
      const isIPhone = /iphone/.test(userAgent);
      const isIPad = /ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /android/.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Browser detection
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isChrome = /chrome/.test(userAgent);
      const isFirefox = /firefox/.test(userAgent);
      
      // Screen size categories
      let screenSize: 'small' | 'medium' | 'large' | 'xlarge' = 'large';
      if (width < 640) screenSize = 'small';
      else if (width < 1024) screenSize = 'medium';
      else if (width < 1440) screenSize = 'large';
      else screenSize = 'xlarge';
      
      // Device type logic - Debug logging
      const isMobile = width < 640 || isIPhone;
      const isTablet = (width >= 640 && width < 1024) || isIPad || (isAndroid && width >= 600);
      const isDesktop = width >= 1024 && !isIPad && !isTouchDevice;
      
      // Debug logging
      console.log('Device Detection:', {
        width,
        height,
        userAgent: userAgent.substring(0, 50),
        isMobile,
        isTablet,
        isDesktop,
        isIPad,
        isTouchDevice,
        screenSize
      });
      
      const orientation = height > width ? 'portrait' : 'landscape';
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIPhone,
        isIPad,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        isTouchDevice,
        screenSize,
        orientation
      });
    };

    detectDevice();
    
    const handleResize = () => detectDevice();
    const handleOrientationChange = () => setTimeout(detectDevice, 100);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}
