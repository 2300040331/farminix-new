import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import './IntroVideoOverlay.css';

interface IntroVideoOverlayProps {
  onFinish?: () => void;
}

// Replay on a fresh page load, without interrupting internal navigation.
let hasIntroPlayedInSession = false;

export const IntroVideoOverlay: React.FC<IntroVideoOverlayProps> = ({ onFinish }) => {
  const { publishedConfig } = useAdminConfig();
  const [isOpen, setIsOpen] = useState(() => !hasIntroPlayedInSession);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isClosing = useRef(false);
  const intro = publishedConfig.introVideo;
  const active = isOpen && intro.enabled;
  const videoUrl = isMobile ? intro.mobileUrl || intro.desktopUrl : intro.desktopUrl || intro.mobileUrl;

  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    hasIntroPlayedInSession = true;
    setIsFadingOut(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    closeTimer.current = setTimeout(() => setIsOpen(false), delay);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isOpen) onFinish?.();
  }, [isOpen, onFinish]);

  useEffect(() => {
    if (!intro.enabled && isOpen) {
      hasIntroPlayedInSession = true;
      setIsOpen(false);
    }
  }, [intro.enabled, isOpen]);

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
      videoRef.current?.pause();
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // Muted inline playback is broadly supported, but retry once for browsers
      // that apply autoplay restrictions before the muted attribute is observed.
      video.muted = true;
      video.play().catch(() => undefined);
    });
  }, [active, videoUrl]);

  if (!active) return null;

  return (
    <dialog ref={dialogRef} className="harvest-intro harvest-intro-video" aria-label="Welcome to Farminix — Family Choice Brand"
      data-closing={isFadingOut} onCancel={(event) => event.preventDefault()}>
      <video ref={videoRef} className="harvest-intro-video-player" src={videoUrl} autoPlay muted playsInline preload="auto"
        onEnded={handleClose} onError={() => {
          if (isMobile && intro.mobileUrl && intro.desktopUrl && videoUrl === intro.mobileUrl) setIsMobile(false);
        }} aria-label="Farminix introduction" />
      <button type="button" className="harvest-intro-enter" autoFocus onClick={handleClose}>
        Enter Site <ArrowRight size={18} aria-hidden="true" />
      </button>
    </dialog>
  );
};
