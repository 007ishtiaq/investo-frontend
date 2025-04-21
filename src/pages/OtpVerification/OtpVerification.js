import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createOrUpdateUser } from "../../functions/auth";
import { auth } from "../../firebase";
import { EthereumIcon } from "../../utils/icons";
import "../Login/Login.css";

// Spinner component for loading state
const Spinner = () => (
  <div className="spinner">
    <div className="bounce1"></div>
    <div className="bounce2"></div>
    <div className="bounce3"></div>
  </div>
);

// No internet connection modal
const NoNetModal = ({ classDisplay, setNoNetModal, handleRetry }) => (
  <div className={`no-net-modal ${classDisplay}`}>
    <div className="modal-content">
      <h3>No Internet Connection</h3>
      <p>Please check your internet connection and try again.</p>
      <div className="modal-buttons">
        <button onClick={() => setNoNetModal(false)}>Close</button>
        <button onClick={handleRetry}>Retry</button>
      </div>
    </div>
  </div>
);

// OTP schema
const otpSchema = Yup.object({
  otp: Yup.string()
    .required("Please enter the OTP")
    .matches(/^[0-9]+$/, "OTP must be numbers only")
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
  password: Yup.string()
    .required("Please enter a password")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
  name: Yup.string()
    .required("Please enter your name")
    .min(2, "Name must be at least 2 characters"),
});

const OTPVerification = () => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);
  const [email, setEmail] = useState("");

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
    // Get email from localStorage
    const email = window.localStorage.getItem("emailForRegistration");
    if (email) {
      setEmail(email);
    } else {
      // Redirect to register if no email found
      history.push("/register");
    }
  }, [history]);

  const roleBasedRedirect = (res) => {
    // check if intended
    let intended = history.location.state;
    if (intended) {
      history.push(intended.from);
    } else {
      if (res.data.role === "admin") {
        history.push("/AdminPanel?page=AdminDashboard");
      } else {
        history.push("/");
      }
    }
  };

  // Formik setup
  const initialValues = {
    otp: "",
    password: "",
    confirmPassword: "",
    name: "",
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
    validationSchema: otpSchema,
    onSubmit: async (values, action) => {
      if (navigator.onLine) {
        setLoading(true);
        try {
          // Register with Firebase
          const result = await auth.createUserWithEmailAndPassword(
            email,
            values.password
          );

          // Update profile with name
          await result.user.updateProfile({
            displayName: values.name,
          });

          // Get token
          const idTokenResult = await result.user.getIdTokenResult();

          // Create or update user in your backend
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
                },
              });

              // Clear email from localStorage
              window.localStorage.removeItem("emailForRegistration");

              // Show success message
              toast.success(
                `Registration successful. Welcome, ${values.name}!`
              );

              setLoading(false);
              roleBasedRedirect(res);
            })
            .catch((err) => {
              setLoading(false);
              toast.error(err.response?.data?.error || "Error updating user");
              console.error("Error updating user:", err);
            });
        } catch (error) {
          setLoading(false);

          // Handle Firebase auth errors
          if (error.code === "auth/email-already-in-use") {
            toast.error(
              "Email is already in use. Please use another email or login."
            );
          } else if (error.code === "auth/invalid-email") {
            toast.error("Invalid email format.");
          } else if (error.code === "auth/weak-password") {
            toast.error("Password is too weak. Use at least 6 characters.");
          } else {
            toast.error(error.message);
          }

          console.error("Registration error:", error);
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
              <h1 className="login-title">Verify Your Email</h1>
              <p className="login-subtitle">
                Enter the OTP sent to {email} and create your account.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  autoComplete="off"
                />
                {errors.name && touched.name ? (
                  <p className="error-message">{errors.name}</p>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="otp">OTP Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="otp"
                  name="otp"
                  value={values.otp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter 6-digit OTP"
                  autoComplete="off"
                />
                {errors.otp && touched.otp ? (
                  <p className="error-message">{errors.otp}</p>
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
                  placeholder="Create a password"
                />
                {errors.password && touched.password ? (
                  <p className="error-message">{errors.password}</p>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && touched.confirmPassword ? (
                  <p className="error-message">{errors.confirmPassword}</p>
                ) : null}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading || isSubmitting}
                >
                  {loading ? <Spinner /> : "Create Account"}
                </button>
              </div>

              <div className="form-footer">
                <p className="register-link">
                  Didn't receive OTP? <Link to="/register">Request again</Link>
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

      <NoNetModal
        classDisplay={noNetModal ? "open-popup" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleSubmit}
      />
    </div>
  );
};

export default OTPVerification;
