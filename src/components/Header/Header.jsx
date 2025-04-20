import React from "react";
import { Link } from "react-router-dom";
import { WalletIcon, MenuIcon } from "../../utils/icons";
import { useIsMobile } from "../../hooks/use-mobile";
import "./Header.css";

const Header = () => {
  const isMobile = useIsMobile();
  return (
    <header className="header">
      <div className="header-content container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon gradient-bg">
              <span>T</span>
            </div>
            <span className="logo-text">TreasureNFT</span>
          </Link>
        </div>

        {/* Navigation */}
        {!isMobile && (
          <nav className="main-nav">
            <Link to="/explore" className="nav-link">
              Dashboard
            </Link>
            <Link to="/tasks" className="nav-link">
              Tasks
            </Link>
            <Link to="/dashboard" className="nav-link">
              My Team
            </Link>
            <Link to="/collections" className="nav-link">
              VIP
            </Link>
            <Link to="/creators" className="nav-link">
              Me
            </Link>
          </nav>
        )}

        {/* <nav className="mobile-nav">
          <div className="mobile-nav-list">
            <Link to="/explore" className="mobile-nav-item">
              <span className="mobile-nav-text">Explore</span>
            </Link>
            <Link to="/invest" className="mobile-nav-item">
              <span className="mobile-nav-text">Invest</span>
            </Link>
            <Link to="/dashboard" className="mobile-nav-item">
              <span className="mobile-nav-text">Dashboard</span>
            </Link>
            <Link to="/collections" className="mobile-nav-item">
              <span className="mobile-nav-text">Collections</span>
            </Link>
            <Link to="/creators" className="mobile-nav-item">
              <span className="mobile-nav-text">Creators</span>
            </Link>
          </div>
        </nav> */}

        {/* Action Buttons */}
        <div className="action-buttons">
          {!isMobile && (
            <Link to="/create" className="create-button">
              Sign Up
            </Link>
          )}
          <button className="connect-wallet-button gradient-bg wallet-button">
            <WalletIcon size={16} />
            <span>Login</span>
          </button>

          {isMobile && (
            <button className="menu-button">
              <MenuIcon size={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
