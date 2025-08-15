import React from "react";
import { Link } from "react-router-dom";
import {
  // TelegramIcon,
  // TiktokIcon,
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
} from "../../utils/icons";
import { ReactComponent as Logosign } from "../../images/logo.svg";

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
              <Link to="/">
                <div class="logo-svgsize logo-svgsize-footer">
                  <Logosign /> <span className="logo-text">TrustyVest</span>
                </div>
              </Link>
              <p className="footer-description">
                Discover, collect, and sell extraordinary NFTs on the world's
                first and largest NFT marketplace.
              </p>
              <div className="social-links">
                {/* <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <TelegramIcon size={20} />
                </a> */}
                <a
                  href="https://www.facebook.com/TrustyVest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <FacebookIcon size={20} />
                </a>
                <a
                  href="https://www.instagram.com/trustyvest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <InstagramIcon size={20} />
                </a>

                <a
                  href="https://www.youtube.com/@TrustyVest"
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
                <h4 className="footer-column-title">My Account</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/wallet">Wallet</Link>
                  </li>

                  <li>
                    <Link to="/invest">My Investments</Link>
                  </li>
                  <li>
                    <Link to="/history">History</Link>
                  </li>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-links-column footer-to-hide">
                <h4 className="footer-column-title">Navigation</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/plans">Plans</Link>
                  </li>
                  <li>
                    <Link to="/tasks">Tasks</Link>
                  </li>
                  <li>
                    <Link to="/team">My Team</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-links-column">
                <h4 className="footer-column-title">Company</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/terms">Terms</Link>
                  </li>
                  <li>
                    <Link to="/privacy">Privacy</Link>
                  </li>
                  <li>
                    <Link to="/cookies">Cookies</Link>
                  </li>
                  <li>
                    <Link to="/contact">Contact</Link>
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
.logo-text {
      font-size: 1.5rem;
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-right: 2rem;
}
.logo-svgsize-footer{
 display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1rem;
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
  background-color: #f5f5f5;
  color: #6865da;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.social-link:hover {
  background-color: var(--color-primary);
  color: white;
}

.footer-links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (min-width: 768px) {
  .footer-links-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
  @media (max-width: 450px) {
   .footer-links-grid {
  grid-template-columns: repeat(2, 1fr);
}
  .footer-to-hide{
  display: none;}
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
