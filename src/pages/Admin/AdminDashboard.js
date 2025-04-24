// client/src/pages/admin/AdminDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useSelector((state) => ({ ...state }));

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin panel.</p>
        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage your platform from here</p>

        <div className="admin-menu-grid">
          <Link to="/admin/tasks" className="admin-menu-item">
            <div className="admin-menu-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
            </div>
            <h3>Tasks Management</h3>
            <p>Create and manage tasks for users</p>
          </Link>

          <Link to="/admin/taskverification" className="admin-menu-item">
            <div className="admin-menu-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                <path d="M22 4L12 14.01l-3-3"></path>
              </svg>
            </div>
            <h3>Task Verification</h3>
            <p>Review and verify user task submissions</p>
          </Link>

          <Link to="/admin/users" className="admin-menu-item">
            <div className="admin-menu-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <h3>User Management</h3>
            <p>View and manage platform users</p>
          </Link>

          <Link to="/admin/analytics" className="admin-menu-item">
            <div className="admin-menu-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </div>
            <h3>Analytics</h3>
            <p>View platform statistics and analytics</p>
          </Link>

          <Link to="/admin/settings" className="admin-menu-item">
            <div className="admin-menu-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82 1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
              </svg>
            </div>
            <h3>System Settings</h3>
            <p>Configure platform settings</p>
          </Link>
        </div>

        <div className="admin-quick-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">-</p>
          </div>
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-value">-</p>
          </div>
          <div className="stat-card">
            <h3>Task Completions</h3>
            <p className="stat-value">-</p>
          </div>
          <div className="stat-card">
            <h3>Rewards Distributed</h3>
            <p className="stat-value">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
