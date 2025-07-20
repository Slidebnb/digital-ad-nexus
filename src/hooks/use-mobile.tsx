
import { useDeviceDetection } from "./useDeviceDetection";

// Legacy compatibility hook - use useDeviceDetection for new code
export function useIsMobile() {
  const device = useDeviceDetection();
  return device.isMobile;
}
