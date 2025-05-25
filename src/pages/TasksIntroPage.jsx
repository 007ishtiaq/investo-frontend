import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Tasks.css";

export default function TasksIntroPage() {
  return (
    <div className="tasks-intro-page">
      <div className="intro-hero">
        <div className="container">
          <div className="intro-header animate-in">
            <div className="header-content-intro">
              <h1 className="page-title">Complete Tasks, Earn Rewards</h1>
              <p className="page-description">
                Join our community of users who earn rewards by completing
                simple daily tasks. Level up your account and unlock
                higher-value opportunities.
              </p>
              <div className="header-actions">
                <Link to="/login" className="login-button-tasks">
                  <span className="btn-text">Login to Start</span>
                  <span className="btn-icon">→</span>
                </Link>
              </div>
            </div>
            <div className="header-graphic">
              <div className="tasks-graphic-container animate-float">
                <div className="tasks-graphic-inner">
                  <div className="tasks-graphic-circle circle-1"></div>
                  <div className="tasks-graphic-circle circle-2"></div>
                  <div className="tasks-graphic-circle circle-3"></div>
                  <div className="tasks-graphic-checklist"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="features-section animate-in">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon task-icon"></div>
              <h3>Complete Tasks</h3>
              <p>
                Watch videos, visit websites, follow social media accounts, and
                more to earn rewards
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon rewards-icon"></div>
              <h3>Earn Rewards</h3>
              <p>
                Get cryptocurrency rewards deposited directly to your wallet for
                each completed task
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon level-icon"></div>
              <h3>Level Up</h3>
              <p>
                Increase your account level to unlock higher-value tasks and
                better rewards
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon daily-icon"></div>
              <h3>Daily Rotation</h3>
              <p>
                New tasks available every day at midnight to keep earning
                opportunities fresh
              </p>
            </div>
          </div>
        </div>

        <div className="cta-section animate-in">
          <h2>Ready to start earning?</h2>
          <p>
            Create an account or login to start completing tasks and earning
            rewards today.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="register-button">
              Create Account
            </Link>
            <Link to="/login" className="login-button-alt">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
