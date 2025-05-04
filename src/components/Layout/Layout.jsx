import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LineChart,
  Wallet2,
  BarChart3,
  History,
  User,
  Plus,
  ArrowUpRight,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react";
import "./Layout.css";

const Layout = ({ children }) => {
  // Fix: useLocation returns an object, not an array
  const location = useLocation();
  const user = { name: "User", profileImage: null }; // Provide fallback for user
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div className="layout">
      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <div className="mobile-nav-grid">
          <Link to="/" className="mobile-nav-link">
            <div
              className={`mobile-nav-item ${
                location.pathname === "/" ? "mobile-nav-active" : ""
              }`}
            >
              <LineChart className="mobile-nav-icon" />
              <span className="mobile-nav-label">Dashboard</span>
            </div>
          </Link>
          <Link to="/wallet" className="mobile-nav-link">
            <div
              className={`mobile-nav-item ${
                location.pathname === "/wallet" ? "mobile-nav-active" : ""
              }`}
            >
              <Wallet2 className="mobile-nav-icon" />
              <span className="mobile-nav-label">Wallet</span>
            </div>
          </Link>
          <Link to="/invest" className="mobile-nav-link">
            <div
              className={`mobile-nav-item ${
                location.pathname === "/invest" ? "mobile-nav-active" : ""
              }`}
            >
              <BarChart3 className="mobile-nav-icon" />
              <span className="mobile-nav-label">Invest</span>
            </div>
          </Link>
          <Link to="/profile" className="mobile-nav-link">
            <div
              className={`mobile-nav-item ${
                location.pathname === "/profile" ? "mobile-nav-active" : ""
              }`}
            >
              <User className="mobile-nav-icon" />
              <span className="mobile-nav-label">Profile</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="layout-main">
        <div className="main-container">
          <div className="main-content">
            {/* Desktop Sidebar */}
            <div className="desktop-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-header">
                  <h2 className="sidebar-title">Navigation</h2>
                </div>
                <nav className="sidebar-nav">
                  <Link to="/Dashboard" className="sidebar-link">
                    <div
                      className={`sidebar-item ${
                        location.pathname === "/Dashboard"
                          ? "sidebar-active"
                          : ""
                      }`}
                    >
                      <LineChart className="sidebar-icon" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <Link to="/wallet" className="sidebar-link">
                    <div
                      className={`sidebar-item ${
                        location.pathname === "/wallet" ? "sidebar-active" : ""
                      }`}
                    >
                      <Wallet2 className="sidebar-icon" />
                      <span>Wallet</span>
                    </div>
                  </Link>
                  <Link to="/invest" className="sidebar-link">
                    <div
                      className={`sidebar-item ${
                        location.pathname === "/invest" ? "sidebar-active" : ""
                      }`}
                    >
                      <BarChart3 className="sidebar-icon" />
                      <span>Invest</span>
                    </div>
                  </Link>
                  <Link to="/history" className="sidebar-link">
                    <div
                      className={`sidebar-item ${
                        location.pathname === "/history" ? "sidebar-active" : ""
                      }`}
                    >
                      <History className="sidebar-icon" />
                      <span>History</span>
                    </div>
                  </Link>
                  <Link to="/profile" className="sidebar-link">
                    <div
                      className={`sidebar-item ${
                        location.pathname === "/profile" ? "sidebar-active" : ""
                      }`}
                    >
                      <User className="sidebar-icon" />
                      <span>Profile</span>
                    </div>
                  </Link>
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="actions-card">
                <div className="actions-header">
                  <h2 className="actions-title">Quick Actions</h2>
                </div>
                <div className="actions-content">
                  <button
                    className="deposit-button"
                    onClick={() => setShowDepositModal(true)}
                  >
                    <Plus className="action-icon" /> Deposit
                  </button>
                  <button
                    className="withdraw-button"
                    onClick={() => setShowWithdrawModal(true)}
                  >
                    <ArrowUpRight className="action-icon" /> Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="main-page-content">{children}</div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="mobile-actions">
            <div className="mobile-actions-header">
              <h2 className="mobile-actions-title">Quick Actions</h2>
            </div>
            <div className="mobile-actions-grid">
              <button
                className="mobile-deposit-button"
                onClick={() => setShowDepositModal(true)}
              >
                <Plus className="mobile-action-icon" /> Deposit
              </button>
              <button
                className="mobile-withdraw-button"
                onClick={() => setShowWithdrawModal(true)}
              >
                <ArrowUpRight className="mobile-action-icon" /> Withdraw
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
