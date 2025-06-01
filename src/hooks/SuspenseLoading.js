import React from "react";
import "./SuspenseLoading.css";

export default function SuspenseLoading() {
  return (
    <div className="app-loader-container">
      <div className="app-loader-content">
        <div className="app-loader-graphic">
          <div className="loader-circles">
            <div className="loader-circle circle-1"></div>
            <div className="loader-circle circle-2"></div>
            <div className="loader-circle circle-3"></div>
            <div className="loader-circle circle-4"></div>
          </div>
          <div className="loader-center-icon">
            <div className="center-dot"></div>
          </div>
        </div>
        <div className="app-loader-text">
          <h3>Loading Application</h3>
          <div className="loading-dots">
            <span className="dot dot-1">.</span>
            <span className="dot dot-2">.</span>
            <span className="dot dot-3">.</span>
          </div>
        </div>
        <div className="loader-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
