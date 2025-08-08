import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { submitDeposit } from "../../functions/deposit";
import toast from "react-hot-toast";
import { X, Copy } from "lucide-react";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import "./DepositModal.css";
import { InfoIcon } from "../../utils/icons";

const DepositModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);
  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  // Animation states
  const [isVisible, setIsVisible] = useState(false);

  // Add network status monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        setNoNetModal(false);
      }
    };

    const handleOfflineStatus = () => {
      setNoNetModal(true);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // Check initial status
    if (!navigator.onLine) {
      setNoNetModal(true);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  // Handle animation on open/close
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow CSS transitions to work properly
      setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Add this copy function
  const copyAddress = (address) => {
    // Function to copy text using the modern clipboard API
    const copyWithClipboardAPI = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error("Clipboard API failed:", err);
        return false;
      }
    };

    // Fallback function for older browsers or mobile devices
    const copyWithFallback = (text) => {
      try {
        // Create a temporary textarea element
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Make it invisible
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.style.pointerEvents = "none";

        // Add to DOM
        document.body.appendChild(textArea);

        // Focus and select
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices

        // Copy the text
        const successful = document.execCommand("copy");

        // Remove the textarea
        document.body.removeChild(textArea);

        return successful;
      } catch (err) {
        console.error("Fallback copy failed:", err);
        return false;
      }
    };

    // Main copy function
    const performCopy = async () => {
      let success = false;

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        success = await copyWithClipboardAPI(address);
      }

      // If clipboard API failed, use fallback method
      if (!success) {
        success = copyWithFallback(address);
      }

      // Show appropriate message
      if (success) {
        toast.success("Address copied to clipboard!");
      } else {
        // If all methods fail, show the address in an alert as last resort
        toast.error("Copy failed. Address: " + address);

        // Optional: Show a prompt with the address for manual copying
        setTimeout(() => {
          if (
            window.confirm(
              "Copy failed. Would you like to see the address to copy manually?"
            )
          ) {
            prompt("Copy this address manually:", address);
          }
        }, 1000);
      }
    };

    // Execute the copy operation
    performCopy();
  };

  // Handle actual closing after animation completes
  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Handle overlay click to close modal when clicking outside
  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check network status before submitting
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    if (!amount || !paymentMethod || !screenshot) {
      return toast.error(
        "Please fill all required fields and upload a screenshot"
      );
    }

    try {
      setLoading(true);

      await submitDeposit(
        {
          amount,
          paymentMethod,
          transactionId,
          screenshot,
        },
        user.token
      );

      // Reset form
      setAmount("");
      setPaymentMethod("");
      setTransactionId("");
      setScreenshot(null);
      setPreviewUrl("");

      toast.success("Deposit request submitted successfully");
      setLoading(false);
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      handleClose(); // Use the animated close
    } catch (error) {
      console.error("Deposit submission error:", error);

      // Check if it's a network error
      if (
        (error.message && error.message.includes("network")) ||
        error.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error(error.message || "Failed to submit deposit request");
      }
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      // Modal is ready for new submission attempts
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`deposit-modal-overlay ${isVisible ? "visible" : ""}`}
        onClick={handleOverlayClick}
      >
        <div
          className={`deposit-modal ${isVisible ? "visible" : ""}`}
          ref={modalContentRef}
        >
          <div className="deposit-modal-header">
            <h2>Deposit Funds</h2>
            <button className="close-modal-button" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          <div className="deposit-instructions">
            <div className="instructions-card">
              <h3>How to deposit funds</h3>
              <ol>
                <li>Enter the amount you wish to deposit</li>
                <li>Select your preferred payment method</li>
                <li>Make the payment to the provided address</li>
                <li>Upload a screenshot of your payment confirmation</li>
                <li>Submit your deposit request for approval</li>
              </ol>
              <div className="instructions-note">
                <strong>Note:</strong> Your deposit will be processed within 24
                hours after verification. You'll receive an email notification
                once approved.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="deposit-modal-form">
            <div className="deposit-form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount (USD)*</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter deposit amount"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method*</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="bitcoin">Tron (TRC 20)</option>
                  <option value="ethereum">BNB Smart chain (BEP20) </option>
                  <option value="litecoin">Ethereum (ERC20)</option>
                </select>
              </div>
            </div>
            <div className="deposit-form-row">
              <div className="form-group">
                <label htmlFor="transactionId">Transaction ID/Reference</label>
                <input
                  type="text"
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID or reference"
                />
              </div>

              <div className="form-group">
                <label htmlFor="screenshot">Payment Screenshot*</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="screenshot"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="file-upload-button"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Upload Screenshot
                  </button>
                  <span className="file-name">
                    {screenshot ? screenshot.name : "No file chosen"}
                  </span>
                </div>
              </div>
            </div>

            {previewUrl && (
              <div className="screenshot-preview">
                <img src={previewUrl} alt="Payment proof" />
              </div>
            )}

            <div className="payment-instructions">
              <h3>Payment Details</h3>
              {paymentMethod === "bitcoin" && (
                <div className="payment-address">
                  <p>Tron (TRC 20) Address:</p>
                  <div className="address-container">
                    <code>
                      {process.env.REACT_APP_TRON_ADDRESS ||
                        "bc1q98y7heu5glx5q7v93qjh0x9dsw29ruvjz35g7k"}
                    </code>
                    <button
                      className="copy-button"
                      onClick={() =>
                        copyAddress(
                          process.env.REACT_APP_TRON_ADDRESS ||
                            "not getting address from Env"
                        )
                      }
                      type="button"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}
              {paymentMethod === "ethereum" && (
                <div className="payment-address">
                  <p>BNB Smart chain (BEP20) Address:</p>
                  <div className="address-container">
                    <code>
                      {process.env.REACT_APP_BNB_ADDRESS ||
                        "not getting address from Env"}
                    </code>
                    <button
                      className="copy-button"
                      onClick={() =>
                        copyAddress(
                          process.env.REACT_APP_BNB_ADDRESS ||
                            "not getting address from Env"
                        )
                      }
                      type="button"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}
              {paymentMethod === "litecoin" && (
                <div className="payment-address">
                  <p>Ethereum (ERC20) Address:</p>
                  <div className="address-container">
                    <code>
                      {process.env.REACT_APP_ETHEREUM_ADDRESS ||
                        "not getting address from Env"}
                    </code>
                    <button
                      className="copy-button"
                      onClick={() =>
                        copyAddress(
                          process.env.REACT_APP_ETHEREUM_ADDRESS ||
                            "not getting address from Env"
                        )
                      }
                      type="button"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Processing..." : "Submit Deposit Request"}
            </button>
          </form>
        </div>
      </div>

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default DepositModal;
