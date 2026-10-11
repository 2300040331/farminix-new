import React from 'react';

export const WHATSAPP_PHONE = '917989743595';
export const WHATSAPP_DEFAULT_MESSAGE = "Hello Farminix! 👋 I would like to know more about your rice & grocery products and place an order.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.031 2c-5.508 0-9.984 4.477-9.984 9.984 0 1.761.458 3.479 1.332 5l-1.379 5.016 5.152-1.352c1.464.798 3.109 1.22 4.879 1.22 5.508 0 9.984-4.476 9.984-9.984 0-5.508-4.476-9.984-9.984-9.984zm0 18.297c-1.492 0-2.953-.402-4.227-1.164l-.305-.18-3.141.824.836-3.059-.199-.316c-.84-1.332-1.285-2.883-1.285-4.402 0-4.57 3.719-8.289 8.289-8.289s8.289 3.719 8.289 8.289-3.719 8.289-8.289 8.289zm4.543-6.203c-.25-.125-1.477-.73-1.707-.812-.23-.086-.398-.125-.566.125s-.652.812-.801.98-.297.188-.547.062c-.25-.125-1.055-.391-2.012-1.242-.746-.664-1.25-1.488-1.398-1.738-.148-.25-.016-.387.109-.512.113-.113.25-.297.375-.445.125-.148.168-.25.25-.422.086-.168.043-.32-.02-.445s-.566-1.363-.777-1.871c-.207-.492-.418-.426-.566-.434-.145-.008-.312-.008-.477-.008s-.438.062-.668.312c-.23.25-.879.859-.879 2.098 0 1.238.902 2.438 1.027 2.605.125.168 1.777 2.715 4.305 3.805.602.262 1.07.418 1.438.535.605.191 1.156.164 1.59.1.484-.07 1.477-.602 1.684-1.184.207-.582.207-1.078.145-1.184-.062-.105-.23-.168-.48-.293z" />
  </svg>
);

export const WhatsAppFloatingButton: React.FC = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Farminix on WhatsApp"
      className="group fixed bottom-6 right-5 sm:right-6 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white p-3.5 sm:pl-3.5 sm:pr-4 sm:py-2.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
    >
      <div className="relative flex items-center justify-center">
        <WhatsAppIcon className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-200 border-2 border-[#25D366] rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[#25D366] rounded-full" />
      </div>
      <div className="hidden sm:flex flex-col text-left leading-tight">
        <span className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">Chat with us</span>
        <span className="text-xs font-black text-white">WhatsApp</span>
      </div>
    </a>
  );
};
