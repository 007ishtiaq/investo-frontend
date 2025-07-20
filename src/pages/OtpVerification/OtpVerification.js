import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { verifyOTP, SendOTP } from "../../functions/auth";
import { EthereumIcon } from "../../utils/icons";
import "../Login/Login.css";
import { useDispatch, useSelector } from "react-redux";
import NoNetModal from "../../components/NoNetModal/NoNetModal";

// Spinner component for loading state
const Spinner = () => (
  <div className="spinner">
    <div className="bounce1"></div>
    <div className="bounce2"></div>
    <div className="bounce3"></div>
  </div>
);

// OTP Input Component
const OtpInput = ({ setValues }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    // Create a new array with the updated value
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      const nextInput =
        element.parentElement.nextSibling.querySelector("input");
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Update form values - JUST THIS ONE TIME
    setValues((prevValues) => ({
      ...prevValues,
      otp: newOtp.join(""), // Use newOtp, not otp (state hasn't updated yet)
    }));
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      const prevInput =
        e.target.parentElement.previousSibling.querySelector("input");
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .trim()
      .slice(0, 6)
      .split("");

    if (pastedData.length === 6 && pastedData.every((x) => !isNaN(x))) {
      setOtp(pastedData);
      setValues((prevValues) => ({
        ...prevValues,
        otp: pastedData.join(""),
      }));
    }
  };

  return (
    <div className="otp-input-container">
      {otp.map((data, index) => {
        return (
          <div className="otp-input-box" key={index}>
            <input
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className="otp-input"
            />
          </div>
        );
      })}
    </div>
  );
};

// OTP schema
const otpSchema = Yup.object({
  email: Yup.string().email().required("Email is required"),
  otp: Yup.string()
    .required("Please enter the OTP")
    .matches(/^[0-9]+$/, "OTP must be numbers only")
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
});

const OtpVerification = () => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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
    if (user && user.token) history.push("/");
  }, [user, history]);

  // Formik setup
  const initialValues = {
    email: "",
    otp: "",
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
    validationSchema: otpSchema,
    onSubmit: async (values, action) => {
      if (navigator.onLine) {
        setLoading(true);

        verifyOTP(values)
          .then((response) => {
            if (response.status === 200) {
              toast.success("OTP verified successfully!");
              action.resetForm();
              setLoading(false);
              history.push("/register/complete");
            }
          })
          .catch((error) => {
            setLoading(false);
            toast.error(error.response?.data?.err || "Invalid OTP");
            console.error("Error during OTP verification:", error);
          });
      } else {
        setLoading(false);
        setNoNetModal(true);
      }
    },
  });

  useEffect(() => {
    if (!window.localStorage.getItem("emailForRegistration")) {
      history.push("/register");
      return;
    }

    // Retrieve email from local storage
    const storedEmail = window.localStorage.getItem("emailForRegistration");
    setUserEmail(storedEmail);

    // Set the email value using setValues
    setValues((prevValues) => ({ ...prevValues, email: storedEmail }));
  }, []);

  const resendOtp = async () => {
    if (navigator.onLine) {
      setLoading(true);
      try {
        const response = await SendOTP(values.email);
        if (response.status === 200) {
          toast.success(`OTP successfully resent to your email`);
          setLoading(false);
        } else {
          setLoading(false);
          toast.error(response.data?.error || "Error sending OTP");
        }
      } catch (error) {
        setLoading(false);
        toast.error(error.response?.data?.error || "Error sending OTP");
        console.error("Error resending OTP:", error);
      }
    } else {
      setLoading(false);
      setNoNetModal(true);
    }
  };

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
                  <Spinner />
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
              <h1 className="login-title">Verify Your Email</h1>
              <p className="login-subtitle">
                Enter the OTP sent to {userEmail}
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="otpcont">
                <OtpInput setValues={setValues} />
              </div>

              <div className="resend-otp">
                Don't get the code?{" "}
                <button
                  type="button"
                  className="resend-button"
                  onClick={resendOtp}
                  disabled={loading}
                >
                  Resend
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={values.otp.length !== 6 || loading || isSubmitting}
                >
                  {loading ? <Spinner /> : "Verify OTP"}
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
              <h2>Email Verification</h2>
              <p className="info-description">
                We've sent a verification code to your email to ensure account
                security.
              </p>

              <div className="platform-features">
                <div className="feature-item">
                  <div className="feature-icon-login">
                    <EthereumIcon size={24} />
                  </div>
                  <div className="feature-text">
                    <h3>Secure Account</h3>
                    <p>Your account security is our top priority</p>
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
                    <h3>Quick Verification</h3>
                    <p>
                      Complete verification in seconds to access your account
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

export default OtpVerification;
