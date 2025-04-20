import React from "react";
import { Link, useHistory } from "react-router-dom";
import { WalletIcon, MenuIcon } from "../../utils/icons";
import { useIsMobile } from "../../hooks/use-mobile";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import "./Header.css";

const Header = () => {
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const history = useHistory();
  const { user } = useSelector((state) => ({ ...state }));

  const handleLogout = () => {
    dispatch(logout());
    if (window !== undefined) {
      localStorage.removeItem("user");
    }
    history.push("/login");
  };

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
            <Link to="/dashboard" className="nav-link">
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
              <div className="user-balance">
                <WalletIcon size={16} />
                <span>
                  {user.balance ? user.balance.toFixed(4) : "0.0000"} ETH
                </span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
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
