import React from 'react';

export const WHATSAPP_PHONE = '917989743595';
export const WHATSAPP_DEFAULT_MESSAGE = "Hello Farminix! 👋 I would like to know more about your rice & grocery products and place an order.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="24" fill="#25D366" />
    <path
      fill="#FFFFFF"
      d="M35.12 12.88A15.65 15.65 0 0 0 24.05 8.3C15.4 8.3 8.35 15.35 8.35 24c0 2.76.72 5.46 2.09 7.84L8.3 40l8.36-2.19a15.66 15.66 0 0 0 7.39 1.85h.01c8.65 0 15.7-7.05 15.7-15.7 0-4.19-1.63-8.13-4.64-11.08zm-11.07 24.1h-.01a13.01 13.01 0 0 1-6.63-1.81l-.47-.28-4.93 1.29 1.32-4.8-.31-.49a13.02 13.02 0 0 1-2-7c0-7.18 5.85-13.03 13.04-13.03 3.48 0 6.75 1.36 9.21 3.82 2.46 2.46 3.82 5.73 3.82 9.21 0 7.18-5.85 13.03-13.04 13.03zm7.15-9.76c-.39-.2-2.32-1.15-2.68-1.28-.36-.13-.62-.2-.88.2-.26.39-1.01 1.28-1.24 1.54-.23.26-.46.29-.85.1-.39-.2-1.65-.61-3.15-1.94-1.16-1.04-1.95-2.32-2.18-2.71-.23-.39-.02-.6.17-.79.18-.18.39-.46.59-.69.2-.23.26-.39.39-.65.13-.26.07-.49-.03-.69-.1-.2-.88-2.13-1.21-2.92-.32-.77-.65-.67-.88-.68l-.75-.01c-.26 0-.68.1-1.04.49-.36.39-1.37 1.34-1.37 3.27 0 1.93 1.4 3.8 1.6 4.06.2.26 2.76 4.21 6.69 5.91.93.4 1.66.64 2.23.82.94.3 1.8.26 2.47.16.76-.11 2.32-.95 2.65-1.87.33-.92.33-1.7.23-1.87-.1-.17-.36-.26-.75-.46z"
    />
  </svg>
);

export const WhatsAppFloatingButton: React.FC = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Farminix on WhatsApp"
      className="fixed bottom-6 right-5 sm:right-6 z-40 w-14 h-14 sm:w-[60px] sm:h-[60px] flex items-center justify-center drop-shadow-xl hover:drop-shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
    >
      <WhatsAppIcon className="w-full h-full" />
    </a>
  );
};
