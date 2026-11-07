import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function TrackOrderModal() {
  const { isTrackOrderOpen, setIsTrackOrderOpen, navigate } = useApp();
  useEffect(() => {
    if (isTrackOrderOpen) { setIsTrackOrderOpen(false); navigate('/orders'); }
  }, [isTrackOrderOpen, setIsTrackOrderOpen, navigate]);
  return null;
}
