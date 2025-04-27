import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { WalletIcon, MenuIcon } from "../../utils/icons";
import { useIsMobile } from "../../hooks/use-mobile";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import { formatBalance } from "../../functions/wallet";
import { useWallet } from "../../contexts/WalletContext";
import "./Header.css";

const Header = () => {
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const history = useHistory();
  const { user } = useSelector((state) => ({ ...state }));
  const { walletBalance, walletCurrency, loading } = useWallet();

  const handleLogout = () => {
    dispatch(logout());
    if (window !== undefined) {
      localStorage.removeItem("user");
    }
    history.push("/login");
  };

  // Determine dashboard path based on user role
  const dashboardPath = user && user.role === "admin" ? "/admin" : "/user";

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
            <Link to={dashboardPath} className="nav-link">
              Dashboard
            </Link>
            <Link to="/tasks" className="nav-link">
              Tasks
            </Link>
            <Link to="/team" className="nav-link">
              My Team
            </Link>
            <Link to="/vip" className="nav-link">
              VIP
            </Link>
            <Link to="/profile" className="nav-link">
              Me
            </Link>
          </nav>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {!user ? (
            <>
              {!isMobile && (
                <Link to="/register" className="create-button">
                  Sign Up
                </Link>
              )}
              <Link
                to="/login"
                className="connect-wallet-button gradient-bg wallet-button"
              >
                <WalletIcon size={16} />
                <span>Login</span>
              </Link>
            </>
          ) : (
            <div className="user-auth-section">
              <button
                onClick={handleLogout}
                className="logout-button button-to-hide"
              >
                Logout
              </button>
              <Link
                to="/wallet"
                className="user-balance connect-wallet-button gradient-bg wallet-button"
              >
                <WalletIcon size={16} />
                <span>
                  {loading
                    ? "Loading..."
                    : formatBalance(walletBalance, walletCurrency)}
                </span>
              </Link>
            </div>
          )}

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
