import React from "react";
import { WifiOff, RefreshCw, X } from "lucide-react";
import "./NoNetModal.css";

const NoNetModal = ({ classDisplay, setNoNetModal, handleRetry }) => (
  <div className={`no-net-modal ${classDisplay}`}>
    <div
      className="no-net-modal-overlay"
      onClick={() => setNoNetModal(false)}
    ></div>
    <div className="no-net-modal-content">
      <div className="modal-icon-container">
        <div className="icon-background"></div>
        <WifiOff size={32} className="modal-icon" />
      </div>

      <h3 className="modal-title">Connection Lost</h3>
      <p className="modal-message">
        We're having trouble connecting to the server. Please check your
        internet connection.
      </p>

      <div className="connection-status">
        <div className="status-indicator"></div>
        <span>Waiting for connection...</span>
      </div>

      <div className="modal-buttons">
        <button
          className="modal-btn cancel-btn"
          onClick={() => setNoNetModal(false)}
        >
          <X size={16} />
          <span>Close</span>
        </button>
        <button className="modal-btn retry-btn" onClick={handleRetry}>
          <RefreshCw size={16} className="retry-icon" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  </div>
);

export default NoNetModal;
