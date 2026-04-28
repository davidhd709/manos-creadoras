import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageView } from './analytics';

export default function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
