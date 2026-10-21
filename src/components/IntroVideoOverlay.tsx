import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import './IntroVideoOverlay.css';

const PaddyHarvestScene = React.lazy(() => import('./PaddyHarvestScene'));

interface IntroVideoOverlayProps {
  onFinish?: () => void;
}

// Replay on a fresh page load, without interrupting internal navigation.
let hasIntroPlayedInSession = false;

export const IntroVideoOverlay: React.FC<IntroVideoOverlayProps> = ({ onFinish }) => {
  const { publishedConfig } = useAdminConfig();
  const [isOpen, setIsOpen] = useState(() => !hasIntroPlayedInSession);
  const [isReady, setIsReady] = useState(false);
  const [isLogoReady, setIsLogoReady] = useState(false);
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
    }, delay);
  }, []);

  const handleReady = useCallback(() => setIsReady(true), []);

  useEffect(() => {
    if (!isOpen) onFinish?.();
  }, [isOpen, onFinish]);

  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      clearTimeout(closeTimer.current);
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [active, handleClose]);

  if (!active) return null;

  return (
    <dialog ref={dialogRef} className="harvest-intro" aria-label="Welcome to Farminix — Family Choice Brand"
      data-ready={isReady} data-closing={isFadingOut}
      onCancel={(event) => event.preventDefault()}>
      <header className="harvest-intro-header">
        <div className="harvest-intro-logo">
          <img src={publishedConfig.header.logoUrl || '/farminix_logo.png'} alt={publishedConfig.header.logoAlt || 'Farminix'}
            onLoad={() => setIsLogoReady(true)}
            onError={(event) => {
              if (event.currentTarget.getAttribute('src') !== '/farminix_logo.png') event.currentTarget.src = '/farminix_logo.png';
              else setIsLogoReady(true);
            }} />
        </div>
      </header>
      <React.Suspense fallback={<div className="harvest-intro-loading"><p>Family Choice Brand</p><span>Welcome to Farminix</span></div>}>
        <PaddyHarvestScene variant="intro" suspended={!isLogoReady} onReady={handleReady} onComplete={handleClose} />
      </React.Suspense>
      <footer className="harvest-intro-footer">
        <div className="harvest-intro-welcome">
          <span>FROM OUR FIELDS TO YOUR FAMILY</span>
        </div>
        <span className="harvest-intro-status" role="status">{isReady ? 'Discover the care in every grain.' : 'Preparing the harvest…'}</span>
      </footer>
    </dialog>
  );
};
