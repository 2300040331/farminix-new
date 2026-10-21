import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import './IntroVideoOverlay.css';

const PaddyHarvestScene = React.lazy(() => import('./PaddyHarvestScene'));

interface IntroVideoOverlayProps {
  onFinish?: () => void;
}

// Replay on a fresh page load, without interrupting internal navigation.
let hasIntroPlayedInSession = false;
const INTRO_DURATION = 6500;

export const IntroVideoOverlay: React.FC<IntroVideoOverlayProps> = ({ onFinish }) => {
  const { publishedConfig } = useAdminConfig();
  const [isOpen, setIsOpen] = useState(() => !hasIntroPlayedInSession);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isClosing = useRef(false);
  const active = isOpen && publishedConfig.introVideo.enabled;

  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    hasIntroPlayedInSession = true;
    setIsFadingOut(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
    closeTimer.current = setTimeout(() => {
      setIsOpen(false);
      onFinish?.();
    }, delay);
  }, [onFinish]);

  const handleReady = useCallback(() => setIsReady(true), []);

  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    dialog?.showModal();
    // Keep entry available even if the animation chunk takes a long time to load.
    const safetyTimer = setTimeout(handleClose, 12000);
    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(closeTimer.current);
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [active, handleClose]);

  useEffect(() => {
    if (!active || !isReady) return;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1500 : INTRO_DURATION;
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [active, isReady, handleClose]);

  if (!active) return null;

  return (
    <dialog ref={dialogRef} className="harvest-intro" aria-label="Welcome to Farminix — Family Choice Brand"
      data-ready={isReady} data-closing={isFadingOut}
      onCancel={(event) => { event.preventDefault(); handleClose(); }}>
      <header className="harvest-intro-header">
        <div className="harvest-intro-logo">
          <img src={publishedConfig.header.logoUrl || '/farminix_logo.png'} alt={publishedConfig.header.logoAlt || 'Farminix'}
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/farminix_logo.png'; }} />
        </div>
      </header>
      <React.Suspense fallback={<div className="harvest-intro-loading"><p>Family Choice Brand</p><span>Welcome to Farminix</span></div>}>
        <PaddyHarvestScene variant="intro" onReady={handleReady} />
      </React.Suspense>
      <footer className="harvest-intro-footer">
        <div className="harvest-intro-welcome">
          <span>FROM OUR FIELDS TO YOUR FAMILY</span>
          <div className="harvest-intro-progress" aria-hidden="true"><span /></div>
        </div>
        <button type="button" className="harvest-intro-enter" autoFocus onClick={handleClose}>
          Enter Farminix <ArrowRight size={18} />
        </button>
      </footer>
    </dialog>
  );
};
