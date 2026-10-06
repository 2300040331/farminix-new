import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface IntroVideoOverlayProps {
  onFinish?: () => void;
}

export const IntroVideoOverlay: React.FC<IntroVideoOverlayProps> = ({ onFinish }) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768;
  });
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem('farminix_intro_played');
    } catch {
      return false;
    }
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPlayBlocked, setIsPlayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('farminix_intro_played', 'true');
    } catch {}
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    try {
      sessionStorage.setItem('farminix_intro_played', 'true');
    } catch {}
    setIsFadingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      if (onFinish) onFinish();
    }, 500);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay with sound was blocked; mute and retry
        video.muted = true;
        video.play().catch(() => {
          setIsPlayBlocked(true);
        });
      });
    }

    const handleEnded = () => {
      handleClose();
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  if (!isDesktop || !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#EAEAEA] flex items-center justify-center overflow-hidden transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── Background Video Player (Edge-to-Edge) ── */}
      <video
        ref={videoRef}
        src="/farminix_intro.mp4"
        className="w-full h-full object-cover bg-[#EAEAEA] border-0 outline-hidden"
        autoPlay
        playsInline
        muted
        preload="auto"
      />

      {/* ── Bottom Right Minimal Purple Skip Intro Button ── */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 pointer-events-auto">
        <button
          onClick={handleClose}
          className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white rounded-full text-xs sm:text-sm font-black tracking-wide shadow-xl shadow-purple-950/25 flex items-center gap-2 cursor-pointer transition-all border border-purple-400/30 transform hover:scale-[1.03] active:scale-[0.97]"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Autoplay Blocked Fallback ── */}
      {isPlayBlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 backdrop-blur-xs">
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.play();
                setIsPlayBlocked(false);
              }
            }}
            className="w-16 h-16 rounded-full bg-[#7C3AED] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-2xl cursor-pointer"
          >
            <Play className="w-8 h-8 fill-white ml-1" />
          </button>
          <p className="text-white text-xs font-semibold mt-3">Click to start intro video</p>
        </div>
      )}
    </div>
  );
};

