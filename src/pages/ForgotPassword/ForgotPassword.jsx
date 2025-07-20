import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { auth } from "../../firebase";
import { EthereumIcon } from "../../utils/icons";
import "./ForgotPassword.css";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import "../Login/Login.css";

// Spinner component for loading state
const Spinner = () => (
  <div className="spinner">
    <div className="bounce1"></div>
    <div className="bounce2"></div>
    <div className="bounce3"></div>
  </div>
);

const LogoSpinner = () => (
  <div className="logo-spinner">
    <div className="logo-spinner-container">
      <div className="logo-spinner-ring ring-1"></div>
      <div className="logo-spinner-ring ring-2"></div>
      <div className="logo-spinner-ring ring-3"></div>
      <div className="logo-spinner-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-spinner-icon"
        >
          <path
            d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  </div>
);

// Forgot password schema
const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { user } = useSelector((state) => ({ ...state }));
  const history = useHistory();

  useEffect(() => {
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        setNoNetModal(false);
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (user && user.token) history.push("/");
  }, [user, history]);

  // Formik setup
  const initialValues = {
    email: "",
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, action) => {
      if (navigator.onLine) {
        setLoading(true);
        try {
          const config = {
            url:
              process.env.REACT_APP_PASSWORD_RESET_REDIRECT ||
              window.location.origin + "/login",
            handleCodeInApp: true,
          };

          await auth.sendPasswordResetEmail(values.email, config);

          setEmailSent(true);
          action.resetForm();
          setLoading(false);
          toast.success("Password reset link sent to your email");
        } catch (error) {
          setLoading(false);
          console.error("Password reset error:", error);

          if (error.code === "auth/user-not-found") {
            toast.error("No user found with this email address");
          } else if (
            error.message ===
            "A network error (such as timeout, interrupted connection or unreachable host) has occurred."
          ) {
            setNoNetModal(true);
          } else {
            toast.error(
              error.message || "Failed to send reset email. Please try again."
            );
          }
        }
      } else {
        setNoNetModal(true);
      }
    },
  });

  return (
    <div className="login-page forgot-password-page">
      <div className="container">
        <div className="login-container">
          <div className="login-form-section">
            <div className="login-header">
              <div className="logo-container">
                {loading ? (
                  <LogoSpinner />
                ) : (
                  <div className="app-logo">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        width="40"
                        height="40"
                        rx="8"
                        fill="url(#paint0_linear)"
                      />
                      <path d="M20 10L28.6603 25H11.3397L20 10Z" fill="white" />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="0"
                          y1="0"
                          x2="40"
                          y2="40"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#4F46E5" />
                          <stop offset="1" stopColor="#7A70FF" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </div>
              <h1 className="login-title">Reset Your Password</h1>
              <p className="login-subtitle">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            {emailSent ? (
              <div className="email-sent-container">
                <div className="email-sent-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="email-sent-title">Check Your Email</h2>
                <p className="email-sent-message">
                  We've sent a password reset link to{" "}
                  <strong>{values.email}</strong>. Please check your inbox and
                  follow the instructions to reset your password.
                </p>
                <p className="email-sent-note">
                  If you don't see the email, check your spam folder or try
                  again.
                </p>
                <div className="email-sent-actions">
                  <button
                    className="login-button"
                    onClick={() => setEmailSent(false)}
                  >
                    Try Another Email
                  </button>
                  <Link to="/login" className="back-to-login">
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    autoFocus
                    autoComplete="off"
                  />
                  {errors.email && touched.email ? (
                    <p className="error-message">{errors.email}</p>
                  ) : null}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading || isSubmitting || !values.email}
                  >
                    {loading ? <Spinner /> : "Send Reset Link"}
                  </button>
                </div>

                <div className="form-footer">
                  <p className="back-to-login-link">
                    <Link to="/login">← Back to login</Link>
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="login-info-section">
            <div className="login-info-content">
              <h2>Investment Platform</h2>
              <p className="info-description">
                Your trusted platform for cryptocurrency investments and daily
                rewards.
              </p>

              <div className="platform-features">
                <div className="feature-item">
                  <div className="feature-icon-login">
                    <EthereumIcon size={24} />
                  </div>
                  <div className="feature-text">
                    <h3>Daily Returns</h3>
                    <p>Earn competitive daily interest on your investments</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-login">
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
                  <div className="feature-icon-login">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 20H7C4.79086 20 3 18.2091 3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8V16C21 18.2091 19.2091 20 17 20Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 16C16 13.7909 14.2091 12 12 12C9.79086 12 8 13.7909 8 16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>User-Friendly Interface</h3>
                    <p>
                      Easy to navigate platform with secure account management
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleSubmit}
      />
    </div>
  );
};

export default ForgotPassword;
