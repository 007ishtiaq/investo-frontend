import React from "react";
import { Link } from "react-router-dom";

/**
 * 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link href="/" className="not-found-button">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// Add styling for the not-found page
document.head.appendChild(document.createElement("style")).textContent = `
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
  text-align: center;
}

.not-found-content {
  max-width: 600px;
}

.not-found-title {
  font-size: 8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.not-found-subtitle {
  font-size: 2rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.not-found-message {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.not-found-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 9999px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.not-found-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}
`;
