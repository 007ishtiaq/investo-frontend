import React, { useState } from "react";
import "./DemoNotice.css";

const DemoNoticeBox = () => {
  const rawNumber = "03076570551";
  const telHref = `tel:${rawNumber}`;
  // WhatsApp needs country code; using Pakistan +92:
  const waHref = `https://wa.me/923076570551?text=Hi%20I%27m%20interested%20in%20purchasing%20the%20TrustyVest%20app`;

  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="demo-notice">
      <div className="demo-notice__icon" aria-hidden="true">
        {/* Info badge icon */}
        <svg viewBox="0 0 24 24" fill="none" className="demo-notice__icon-svg">
          <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12 8.2h.01M11 11.5h1v5h1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="demo-notice__content">
        <p className="demo-notice__title">
          This is a demo of application you can buy.
        </p>
        <p className="demo-notice__subtitle">
          Use the contact information below to make your purchase.
        </p>

        <div className="demo-notice__cta">
          <a
            href={telHref}
            className="demo-notice__btn"
            aria-label="Call to purchase"
          >
            {/* Phone SVG */}
            <svg
              viewBox="0 0 24 24"
              className="demo-notice__btn-icon"
              aria-hidden="true"
            >
              <path
                d="M22 16.92v2a3 3 0 0 1-3.27 3 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 1.09 4.27 3 3 0 0 1 4.06 1h2a3 3 0 0 1 3 2.5c.17 1.2.46 2.36.87 3.47a3 3 0 0 1-.68 3.16L8.54 10.9a16 16 0 0 0 6.56 6.56l.77-.71a3 3 0 0 1 3.16-.68c1.11.41 2.27.7 3.47.87A3 3 0 0 1 22 16.92Z"
                fill="currentColor"
              />
            </svg>
            {rawNumber}
          </a>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="demo-notice__btn demo-notice__btn--whatsapp"
            aria-label="WhatsApp to purchase"
          >
            {/* WhatsApp SVG */}
            <svg
              viewBox="0 0 32 32"
              className="demo-notice__btn-icon"
              aria-hidden="true"
            >
              <path
                d="M19.11 17.08c-.28-.14-1.64-.8-1.9-.89-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.09-.17.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.46-.47-.64-.48h-.54c-.19 0-.5.07-.76.36-.26.28-1 1-1 2.46s1.02 2.86 1.16 3.05c.14.19 2.01 3.07 4.86 4.31.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.33-.07-.12-.26-.19-.54-.33Z"
                fill="currentColor"
              />
              <path
                d="M26.78 5.22C24.02 2.46 20.59 1 16.99 1 9.72 1 3.95 6.77 3.95 14.04c0 2.19.57 4.34 1.65 6.23L3 31l10.99-2.55c1.8.99 3.84 1.51 5.99 1.51 7.27 0 13.04-5.77 13.04-13.04 0-3.6-1.47-7.03-4.24-9.7Zm-9.79 22.44c-1.88 0-3.71-.5-5.31-1.45l-.38-.23-6.52 1.51 1.39-6.36-.25-.4a11.92 11.92 0 0 1-1.85-6.69c0-6.58 5.36-11.94 11.94-11.94 3.19 0 6.19 1.24 8.44 3.49a11.86 11.86 0 0 1 3.49 8.45c0 6.58-5.36 11.94-11.95 11.94Z"
                fill="currentColor"
              />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
      <div>
        <button className="demo-notice-close" onClick={() => setVisible(false)}>
          ×
        </button>
      </div>
    </div>
  );
};

export default DemoNoticeBox;
