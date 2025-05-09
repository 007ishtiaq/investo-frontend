// components/routes/LoadingToRedirect.js
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./LoadingToRedirect.css";

const LoadingToRedirect = () => {
  const [count, setCount] = useState(5);
  const history = useHistory();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((currentCount) => --currentCount);
    }, 1000);

    // redirect once count is equal to 0
    count === 0 && history.push("/login");

    // cleanup
    return () => clearInterval(interval);
  }, [count, history]);

  return (
    <div className="redirect-container">
      <div className="redirect-card">
        <div className="redirect-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill="currentColor"
            />
            <path
              d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z"
              fill="currentColor"
            />
            <path
              d="M12 7V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="redirect-title">Authentication Required</h2>
        <p className="redirect-message">
          You need to be logged in to access this page.
          <br />
          Redirecting to login in{" "}
          <span className="redirect-count">{count}</span> seconds.
        </p>
        <div className="redirect-progress">
          <div
            className="redirect-progress-bar"
            style={{ width: `${(count / 5) * 100}%` }}
          ></div>
        </div>
        <button
          className="redirect-button"
          onClick={() => history.push("/login")}
        >
          Login Now
        </button>
      </div>
    </div>
  );
};

export default LoadingToRedirect;
