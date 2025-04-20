import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";
import "./Header.css";

const Headerbottom = () => {
  const isMobile = useIsMobile();
  return (
    isMobile && (
      <nav className="mobile-nav">
        <div className="mobile-nav-list">
          <Link to="/explore" className="mobile-nav-item">
            <span className="mobile-nav-text">Home</span>
          </Link>
          <Link to="/invest" className="mobile-nav-item">
            <span className="mobile-nav-text">Tasks</span>
          </Link>
          <Link to="/dashboard" className="mobile-nav-item">
            <span className="mobile-nav-text">Team</span>
          </Link>
          <Link to="/collections" className="mobile-nav-item">
            <span className="mobile-nav-text">VIP</span>
          </Link>
          <Link to="/creators" className="mobile-nav-item">
            <span className="mobile-nav-text">Me</span>
          </Link>
        </div>
      </nav>
    )
  );
};

export default Headerbottom;
