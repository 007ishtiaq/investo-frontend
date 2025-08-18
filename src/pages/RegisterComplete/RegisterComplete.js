import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { auth } from "../../firebase";
import { createOrUpdateUser, infoOTP } from "../../functions/auth";
import { registerWithAffiliateCode } from "../../functions/team";
import { EthereumIcon } from "../../utils/icons";
import "../Login/Login.css";
import { useLocation } from "react-router-dom";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import { ReactComponent as Logosign } from "../../images/logo.svg";

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
        <div className="center-dot-auth"></div>
      </div>
    </div>
  </div>
);

// Registration complete schema
const registerCompleteSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string().email().required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confim_password: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const RegisterComplete = () => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState("");
  const location = useLocation();

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
    // First check URL parameters
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get("ref");

    // If not in URL, check localStorage
    if (refCode) {
      setAffiliateCode(refCode);
    } else {
      const storedRefCode = window.localStorage.getItem("referralCode");
      if (storedRefCode) {
        setAffiliateCode(storedRefCode);
      }
    }
  }, [location]);

  // Formik setup
  const initialValues = {
    name: "",
    email: "",
    password: "",
    confim_password: "",
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleBlur,
    handleChange,
    handleSubmit,
    setValues,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: registerCompleteSchema,
    onSubmit: async (values, action) => {
      if (navigator.onLine) {
        setLoading(true);
        try {
          const { name, email, password } = values;

          // Get OTP information before proceeding
          const otpResponse = await infoOTP(email);

          // Check if OTP is verified
          if (otpResponse.data.otpRecord.isVerified) {
            // Proceed with user registration if OTP is verified
            const result = await auth.createUserWithEmailAndPassword(
              email,
              password
            );

            if (result) {
              // Remove user email from local storage
              window.localStorage.removeItem("emailForRegistration");

              // Get user ID token
              let user = auth.currentUser;

              // Update profile with name
              await user.updateProfile({
                displayName: name,
              });

              const idTokenResult = await user.getIdTokenResult();

              createOrUpdateUser(idTokenResult.token, name)
                .then((res) => {
                  dispatch({
                    type: "LOGGED_IN_USER",
                    payload: {
                      name: name,
                      email: res.data.email,
                      token: idTokenResult.token,
                      role: res.data.role,
                      _id: res.data._id,
                      profileImage: res.data.profileImage || null,
                    },
                  });

                  // Check for affiliate code and register it if exists
                  if (affiliateCode) {
                    // Use the user ID from the response
                    registerWithAffiliateCode(affiliateCode, res.data._id)
                      .then(() => {
                        toast.success(
                          `You've been successfully registered with a referral code!`
                        );
                      })
                      .catch((error) => {
                        console.error(
                          "Error registering affiliate code:",
                          error
                        );
                        // Optional: show a toast for affiliate error, but don't stop the flow
                        toast.error("Note: Could not register affiliate code");
                      });
                  }

                  // Remove referral code from localStorage after successful registration
                  window.localStorage.removeItem("referralCode");

                  // Show success message
                  toast.success(`Registration successful. Welcome, ${name}!`);

                  // Reset form and redirect
                  action.resetForm();
                  history.push("/");
                  setLoading(false);
                })
                .catch((error) => {
                  setLoading(false);
                  console.error("Error updating user:", error);
                  toast.error("Error updating user information");
                });
            }
          } else {
            // OTP verification failed
            setLoading(false);
            toast.error("OTP verification failed. Please try again.");
          }
        } catch (error) {
          setLoading(false);
          console.error("Error completing registration:", error);
          if (
            error.message ===
            "The email address is already in use by another account."
          ) {
            toast.error("User already registered. Please login instead.");
          } else {
            toast.error(error.message || "Error completing registration.");
          }
        }
      } else {
        setLoading(false);
        setNoNetModal(true);
      }
    },
  });

  useEffect(() => {
    if (user && user.token) history.push("/");
  }, [user, history]);

  useEffect(() => {
    if (!window.localStorage.getItem("emailForRegistration")) {
      history.push("/register");
      return;
    }
    // Retrieve email from local storage
    const storedEmail = window.localStorage.getItem("emailForRegistration");

    // Extract name from email (text before @)
    const defaultName = storedEmail.split("@")[0];

    // Set the email value using setValues, and populate name field
    setValues((prevValues) => ({
      ...prevValues,
      email: storedEmail,
      name: defaultName,
    }));
  }, [history, setValues]);

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
              <h1 className="login-title">Complete Registration</h1>
              <p className="login-subtitle">Create your account password</p>
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
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={values.email}
                  disabled
                />
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
                  autoFocus
                />
                {errors.password && touched.password ? (
                  <p className="error-message">{errors.password}</p>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="confim_password">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confim_password"
                  name="confim_password"
                  value={values.confim_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                />
                {errors.confim_password && touched.confim_password ? (
                  <p className="error-message">{errors.confim_password}</p>
                ) : null}
              </div>

              <div className="form-group">
                <label>Affiliate Code (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value)}
                  placeholder="Enter affiliate code if you have one"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={
                    loading ||
                    isSubmitting ||
                    !values.name ||
                    !values.email ||
                    !values.password ||
                    !values.confim_password
                  }
                >
                  {loading ? <Spinner /> : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>

          <div className="login-info-section">
            <div className="login-info-content">
              <h2>Almost There!</h2>
              <p className="info-description">
                Just one more step to start investing and earning daily rewards.
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
                    <h3>Secure Platform</h3>
                    <p>Your investments are protected with advanced security</p>
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

export default RegisterComplete;
