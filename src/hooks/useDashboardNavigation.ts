
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useDashboardNavigation(defaultTab: string = 'overview') {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(defaultTab);

  // Sync tab with URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab');
    
    if (tabFromUrl && tabFromUrl !== currentTab) {
      setCurrentTab(tabFromUrl);
    } else if (!tabFromUrl && currentTab !== defaultTab) {
      // Set default tab in URL if none specified
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('tab', currentTab);
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [location.search, currentTab, defaultTab, navigate, location.pathname]);

  const handleTabChange = (newTab: string) => {
    setCurrentTab(newTab);
    
    // Update URL with new tab
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', newTab);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  return {
    currentTab,
    setCurrentTab: handleTabChange
  };
}
