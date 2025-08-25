import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import { registerSchema } from "../../schemas";
import { SendOTP } from "../../functions/auth";
import { EthereumIcon } from "../../utils/icons";
import "../Login/Login.css";
import { useLocation } from "react-router-dom";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import { ReactComponent as Logosign } from "../../images/logo.svg";
import LoginDemo from "../../components/LoginDemo/LoginDemo";

const LogoSpinner = () => (
  <div className="logo-spinner">
    <div className="logo-spinner-container">
      <div className="logo-spinner-ring ring-1"></div>
      <div className="logo-spinner-ring ring-2"></div>
      <div className="logo-spinner-ring ring-3"></div>
      <div className="logo-spinner-center">
        <div className="center-dot-auth"></div>
      </div>
    </div>
  </div>
);

// Spinner component for loading state
const Spinner = () => (
  <div className="spinner">
    <div className="bounce1"></div>
    <div className="bounce2"></div>
    <div className="bounce3"></div>
  </div>
);

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);

  const { user } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

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
    validationSchema: registerSchema,
    onSubmit: async (values, action) => {
      if (navigator.onLine) {
        setLoading(true);
        try {
          const response = await SendOTP(values.email);
          if (response.status === 200) {
            toast.success(`OTP sent to your email. Please check your inbox.`);
            window.localStorage.setItem("emailForRegistration", values.email);

            // Extract referral code from URL if present and save it
            const urlParams = new URLSearchParams(location.search);
            const refCode = urlParams.get("ref");
            if (refCode) {
              window.localStorage.setItem("referralCode", refCode);
            }

            action.resetForm();
            setLoading(false);
            history.push("/otpVerification");
          } else {
            toast.error(response.data.error || "Error sending OTP");
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          toast.error(error.response?.data?.error || "Error sending OTP");
          console.error("Error sending OTP:", error);
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
                  <div class="auth-logosize">
                    <Logosign />
                  </div>
                )}
              </div>
              <h1 className="login-title">Create an Account</h1>
              <p className="login-subtitle">
                Join our platform and start earning rewards today.
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
                  disabled={
                    loading ||
                    isSubmitting ||
                    !values.email ||
                    (errors.email && touched.email)
                  }
                >
                  {loading ? <Spinner /> : "Send OTP"}
                </button>
              </div>

              <div className="form-footer">
                <p className="register-link">
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </div>
              <div className="note_title">
                For demonstration, the login credentials are provided below:
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
        <LoginDemo />
      </div>

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleSubmit}
      />
    </div>
  );
};

export default Register;
