import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { auth } from "../../firebase";
import { createOrUpdateUser } from "../../functions/auth";
import { EthereumIcon } from "../../utils/icons";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import "./Login.css";

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

// Login schema
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);

  const { user } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();
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
    let intended = history.location.state;
    if (intended) {
      return;
    } else {
      if (user && user.token) history.push("/");
    }
  }, [user, history]);

  // Formik setup
  const initialValues = {
    email: "",
    password: "",
  };

  const roleBasedRedirect = (res) => {
    // check if intended
    let intended = history.location.state;
    if (intended) {
      history.push(intended.from);
    } else {
      if (res.data.role === "admin") {
        history.push("/admin");
      } else {
        history.push("/");
      }
    }
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
    validationSchema: loginSchema,
    onSubmit: async (values, action) => {
      if (navigator.onLine) {
        setLoading(true);
        try {
          const result = await auth.signInWithEmailAndPassword(
            values.email,
            values.password
          );
          const { user } = result;
          const idTokenResult = await user.getIdTokenResult();

          createOrUpdateUser(idTokenResult.token)
            .then((res) => {
              dispatch({
                type: "LOGGED_IN_USER",
                payload: {
                  name: res.data.name,
                  email: res.data.email,
                  token: idTokenResult.token,
                  role: res.data.role,
                  _id: res.data._id,
                  balance: res.data.balance || 0,
                  profileImage: res.data.profileImage || null,
                },
              });

              // Save to local storage
              if (window !== undefined) {
                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    name: res.data.name,
                    email: res.data.email,
                    token: idTokenResult.token,
                    role: res.data.role,
                    _id: res.data._id,
                    balance: res.data.balance || 0,
                    profileImage: res.data.profileImage || null,
                  })
                );
              }

              toast.success("Login successful!");
              action.resetForm();
              setLoading(false);
              roleBasedRedirect(res);
            })
            .catch((err) => {
              setLoading(false);
              console.error("Error updating user:", err);
              toast.error("Error updating user information");
            });
        } catch (error) {
          setLoading(false);
          console.error("Login error:", error);

          if (
            error.message ===
            "A network error (such as timeout, interrupted connection or unreachable host) has occurred."
          ) {
            setNoNetModal(true);
          } else if (
            error.message ===
            "The password is invalid or the user does not have a password."
          ) {
            toast.error("Invalid credentials. Please try again.");
          } else if (
            error.message ===
            "There is no user record corresponding to this identifier. The user may have been deleted."
          ) {
            toast.error("Account not found. Please register first.");
          } else {
            toast.error(error.message || "Login failed. Please try again.");
          }
        }
      } else {
        setLoading(false);
        setNoNetModal(true);
      }
    },
  });

  return (
    <div className="login-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "green",
              color: "white",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "red",
              color: "white",
            },
          },
        }}
      />

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
              <h1 className="login-title">Log In to Your Account</h1>
              <p className="login-subtitle">
                Welcome back! Please enter your credentials to access your
                account.
              </p>
            </div>

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

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  autoComplete="off"
                />
                {errors.password && touched.password ? (
                  <p className="error-message">{errors.password}</p>
                ) : null}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={
                    loading || isSubmitting || !values.email || !values.password
                  }
                >
                  {loading ? <Spinner /> : "Log In"}
                </button>
              </div>

              <div className="form-footer">
                <p className="register-link">
                  Don't have an account?{" "}
                  <Link to="/register">Register now</Link>
                </p>
                <p className="forgot-password-link">
                  <Link to="/forgot/password">Forgot your password?</Link>
                </p>
              </div>
            </form>
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

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleSubmit}
      />
    </div>
  );
};

export default Login;
