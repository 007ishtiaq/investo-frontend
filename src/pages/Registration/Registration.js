import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { loggedInUser } from "../../actions/auth";
import { EthereumIcon } from "../../utils/icons";
import "../Login/Login.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const history = useHistory();

  // Check if user is already logged in
  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    if (user && user.token) {
      history.push("/dashboard");
    }
  }, [user, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/auth/register`,
        {
          name,
          email,
          password,
        }
      );

      // Save user and token to Redux store
      dispatch(
        loggedInUser({
          name: res.data.name,
          email: res.data.email,
          token: res.data.token,
          role: res.data.role,
          _id: res.data._id,
          balance: res.data.balance || 0,
        })
      );

      // Save to local storage
      if (window !== undefined) {
        localStorage.setItem("user", JSON.stringify(res.data));
      }

      setLoading(false);
      history.push("/dashboard");
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.error
          ? err.response.data.error
          : "Registration failed. Please try again."
      );
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-form-section">
            <div className="login-header">
              <h1 className="login-title">Create an Account</h1>
              <p className="login-subtitle">
                Join our platform and start earning rewards today.
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={
                    loading || !name || !email || !password || !confirmPassword
                  }
                >
                  {loading ? "Creating Account..." : "Register"}
                </button>
              </div>

              <div className="form-footer">
                <p className="register-link">
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </div>
            </form>
          </div>

          <div className="login-info-section">
            <div className="login-info-content">
              <h2>Join Our Platform</h2>
              <p className="info-description">
                Create an account to start investing and earning daily rewards.
              </p>

              <div className="platform-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <EthereumIcon size={24} />
                  </div>
                  <div className="feature-text">
                    <h3>Daily Returns</h3>
                    <p>Earn competitive daily interest on your investments</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 6V12L16 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>Fixed Deposit Plans</h3>
                    <p>Multiple investment plans with guaranteed returns</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 11L12 14L22 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>Task Rewards</h3>
                    <p>Complete simple tasks to earn additional rewards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
