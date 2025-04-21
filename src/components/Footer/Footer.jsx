import React from "react";
import { Link } from "react-router-dom";
import {
  TwitterIcon,
  InstagramIcon,
  DiscordIcon,
  YoutubeIcon,
} from "../../utils/icons";

/**
 * Footer component for the application
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-branding">
              <Link to="/" className="footer-logo">
                TreasureNFT
              </Link>
              <p className="footer-description">
                Discover, collect, and sell extraordinary NFTs on the world's
                first and largest NFT marketplace.
              </p>
              <div className="social-links">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <TwitterIcon size={20} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <InstagramIcon size={20} />
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <DiscordIcon size={20} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <YoutubeIcon size={20} />
                </a>
              </div>
            </div>

            <div className="footer-links-grid">
              <div className="footer-links-column">
                <h4 className="footer-column-title">Marketplace</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/explore">Explore</Link>
                  </li>
                  <li>
                    <Link to="/collections">Collections</Link>
                  </li>
                  <li>
                    <Link to="/creators">Creators</Link>
                  </li>
                  <li>
                    <Link to="/activity">Activity</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-links-column">
                <h4 className="footer-column-title">My Account</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <Link to="/favorites">Favorites</Link>
                  </li>
                  <li>
                    <Link to="/watchlist">Watchlist</Link>
                  </li>
                  <li>
                    <Link to="/settings">Settings</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-links-column">
                <h4 className="footer-column-title">Resources</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/help-center">Help Center</Link>
                  </li>
                  <li>
                    <Link to="/platform-status">Platform Status</Link>
                  </li>
                  <li>
                    <Link to="/partners">Partners</Link>
                  </li>
                  <li>
                    <Link to="/blog">Blog</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-links-column">
                <h4 className="footer-column-title">Company</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/about">About</Link>
                  </li>
                  <li>
                    <Link to="/careers">Careers</Link>
                  </li>
                  <li>
                    <Link to="/contact">Contact</Link>
                  </li>
                  <li>
                    <Link to="/press">Press</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">
              &copy; {currentYear} TreasureNFT. All rights reserved.
            </p>
            <div className="legal-links">
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// Add styling for the Footer component
document.head.appendChild(document.createElement("style")).textContent = `
.site-footer {
  background-color: var(--color-card-bg);
  border-top: 1px solid var(--color-border);
  padding: 4rem 0 2rem;
  margin-top: 3rem;
}

.footer-content {
  display: flex;
  flex-direction: column;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr 2fr;
  }
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  display: block;
}

.footer-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.social-link:hover {
  background-color: var(--color-primary);
  color: white;
}

.footer-links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

@media (min-width: 768px) {
  .footer-links-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-column-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--color-text-primary);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.copyright {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0;
}

.legal-links {
  display: flex;
  gap: 1.5rem;
}

.legal-links a {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.legal-links a:hover {
  color: var(--color-primary);
}
`;
