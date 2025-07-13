import React, { useState, useEffect, useRef } from "react";
import { Link, useHistory, useLocation } from "react-router-dom"; // Added useLocation
import {
  LineChart,
  Wallet2,
  BarChart3,
  History,
  User,
  Users,
  LogOut,
  ClipboardList,
  Settings,
  UserPlus,
  LogIn,
} from "lucide-react";
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
  const location = useLocation(); // Added useLocation hook
  const { user } = useSelector((state) => ({ ...state }));
  const { walletBalance, walletCurrency, loading } = useWallet();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    if (window !== undefined) {
      localStorage.removeItem("user");
    }
    history.push("/login");
    setShowMobileMenu(false);
  };

  // Handle clicks outside the mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine dashboard path based on user role
  const dashboardPath = user && user.role === "admin" ? "/admin" : "/Dashboard";

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
            {user ? (
              <Link
                to={dashboardPath}
                className={`nav-link ${
                  location.pathname === dashboardPath ? "nav-link-active" : ""
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/"
                className={`nav-link ${
                  location.pathname === "/" ? "nav-link-active" : ""
                }`}
              >
                Home
              </Link>
            )}

            <Link
              to="/plans"
              className={`nav-link ${
                location.pathname === "/plans" ? "nav-link-active" : ""
              }`}
            >
              Plans
            </Link>
            <Link
              to="/tasks"
              className={`nav-link ${
                location.pathname === "/tasks" ? "nav-link-active" : ""
              }`}
            >
              Tasks
            </Link>
            <Link
              to="/team"
              className={`nav-link ${
                location.pathname === "/team" ? "nav-link-active" : ""
              }`}
            >
              My Team
            </Link>
            <Link
              to="/contact"
              className={`nav-link ${
                location.pathname === "/contact" ? "nav-link-active" : ""
              }`}
            >
              Contact
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
            <div className="mobile-menu-container" ref={mobileMenuRef}>
              <button
                className="menu-button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <MenuIcon size={24} />
              </button>

              {/* Mobile Menu Dropdown */}
              {showMobileMenu && (
                <div className="profile-dropdown mobile-menu-dropdown">
                  {user && (
                    <div className="profile-dropdown-header">
                      <p className="dropdown-info-text">Hi,</p>
                      <p className="dropdown-user-name">
                        {user.name || "User"}
                      </p>
                    </div>
                  )}

                  <div className="dropdown-section">
                    <Link
                      to={dashboardPath}
                      className="dropdown-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div
                        className={`dropdown-item ${
                          location.pathname === dashboardPath
                            ? "dropdown-item-active"
                            : ""
                        }`}
                      >
                        <LineChart className="dropdown-icon" />
                        Dashboard
                      </div>
                    </Link>
                    <Link
                      to="/wallet"
                      className="dropdown-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div
                        className={`dropdown-item ${
                          location.pathname === "/wallet"
                            ? "dropdown-item-active"
                            : ""
                        }`}
                      >
                        <Wallet2 className="dropdown-icon" />
                        Wallet
                      </div>
                    </Link>
                    <Link
                      to="/tasks"
                      className="dropdown-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div
                        className={`dropdown-item ${
                          location.pathname === "/tasks"
                            ? "dropdown-item-active"
                            : ""
                        }`}
                      >
                        <ClipboardList className="dropdown-icon" />
                        Tasks
                      </div>
                    </Link>
                    <Link
                      to="/team"
                      className="dropdown-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div
                        className={`dropdown-item ${
                          location.pathname === "/team"
                            ? "dropdown-item-active"
                            : ""
                        }`}
                      >
                        <Users className="dropdown-icon" />
                        My Team
                      </div>
                    </Link>
                    <Link
                      to="/invest"
                      className="dropdown-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div
                        className={`dropdown-item ${
                          location.pathname === "/invest"
                            ? "dropdown-item-active"
                            : ""
                        }`}
                      >
                        <BarChart3 className="dropdown-icon" />
                        Invest
                      </div>
                    </Link>
                    <Link
                      to="/history"
                      className="dropdown-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div
                        className={`dropdown-item ${
                          location.pathname === "/history"
                            ? "dropdown-item-active"
                            : ""
                        }`}
                      >
                        <History className="dropdown-icon" />
                        History
                      </div>
                    </Link>
                  </div>

                  {user ? (
                    <div className="dropdown-section dropdown-section-border">
                      <Link
                        to="/profile"
                        className="dropdown-link"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div
                          className={`dropdown-item ${
                            location.pathname === "/profile"
                              ? "dropdown-item-active"
                              : ""
                          }`}
                        >
                          <User className="dropdown-icon" />
                          Profile
                        </div>
                      </Link>
                      <Link
                        to="/profile"
                        className="dropdown-link"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div className="dropdown-item">
                          <Settings className="dropdown-icon" />
                          Settings
                        </div>
                      </Link>
                      <button
                        className="dropdown-button dropdown-button-danger"
                        onClick={handleLogout}
                      >
                        <LogOut className="dropdown-icon" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="dropdown-section dropdown-section-border">
                      <Link
                        to="/login"
                        className="dropdown-link"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div
                          className={`dropdown-item ${
                            location.pathname === "/login"
                              ? "dropdown-item-active"
                              : ""
                          }`}
                        >
                          <LogIn className="dropdown-icon" />
                          Login
                        </div>
                      </Link>
                      <Link
                        to="/register"
                        className="dropdown-link"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div
                          className={`dropdown-item ${
                            location.pathname === "/register"
                              ? "dropdown-item-active"
                              : ""
                          }`}
                        >
                          <UserPlus className="dropdown-icon" />
                          Sign Up
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
