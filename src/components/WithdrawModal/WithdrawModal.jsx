import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { submitWithdrawal, formatBalance } from "../../functions/wallet";
import { useWallet } from "../../contexts/WalletContext";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import "./WithdrawModal.css";

const WithdrawModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const { walletBalance } = useWallet();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check network status before submitting
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    if (!amount || !paymentMethod) {
      return toast.error("Please fill all required fields");
    }

    // Check if withdrawal amount is valid
    if (parseFloat(amount) <= 0) {
      return toast.error("Withdrawal amount must be greater than zero");
    }

    // Check if user has sufficient balance
    if (parseFloat(amount) > walletBalance) {
      return toast.error("Insufficient wallet balance");
    }

    // Validate wallet address for crypto methods
    if (
      ["bitcoin", "ethereum", "litecoin"].includes(paymentMethod) &&
      !walletAddress
    ) {
      return toast.error(
        `Please provide a valid ${paymentMethod} wallet address`
      );
    }

    // Validate bank details for bank transfer
    // if (paymentMethod === "bank_transfer" && !bankDetails) {
    //   return toast.error("Please provide your bank account details");
    // }

    try {
      setLoading(true);

      await submitWithdrawal(
        {
          amount,
          paymentMethod,
          walletAddress: ["bitcoin", "ethereum", "litecoin"].includes(
            paymentMethod
          )
            ? walletAddress
            : null,
          bankDetails: paymentMethod === "bank_transfer" ? bankDetails : null,
        },
        user.token
      );

      // Reset form
      setAmount("");
      setPaymentMethod("");
      setWalletAddress("");
      // setBankDetails("");

      toast.success("Withdrawal request submitted successfully");
      setLoading(false);
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      handleClose(); // Use the animated close
    } catch (error) {
      console.error("Withdrawal submission error:", error);

      // Check if it's a network error
      if (
        (error.message && error.message.includes("network")) ||
        error.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        if (
          (error.message && error.message.includes("400")) ||
          error.message === "Request failed with status code 400"
        ) {
          toast.error(
            "Failed to submit withdrawal request, Please Reload Page & try again"
          );
        } else
          toast.error(error.message || "Failed to submit withdrawal request");
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
        className={`withdraw-modal-overlay ${isVisible ? "visible" : ""}`}
        onClick={handleOverlayClick}
      >
        <div
          className={`withdraw-modal ${isVisible ? "visible" : ""}`}
          ref={modalContentRef}
        >
          <div className="withdraw-modal-header">
            <h2>Withdraw Funds</h2>
            <button className="close-modal-button" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          <div className="withdraw-instructions">
            <div className="instructions-card">
              <h3>How to withdraw funds</h3>
              <ol>
                <li>Enter the amount you wish to withdraw</li>
                <li>Select your preferred withdrawal method</li>
                <li>Provide your wallet address or bank details</li>
                <li>Submit your withdrawal request for approval</li>
              </ol>
              <div className="instructions-note">
                <strong>Note:</strong> Withdrawals are processed within 24-48
                hours after approval. You'll receive an email notification once
                processed.
              </div>
            </div>
          </div>

          <div className="wallet-balance-display">
            <span>Available Balance:</span>
            <span className="balance-amount">
              {formatBalance(walletBalance)}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="withdraw-modal-form">
            <div className="withdraw-form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount (USD)*</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter withdrawal amount"
                  min="0.01"
                  step="0.01"
                  max={walletBalance} // Added max attribute for HTML5 validation
                  required
                />
                {/* Optional: Show balance hint below input */}
                {amount && parseFloat(amount) > walletBalance && (
                  <div className="balance-error">
                    Insufficient balance. Available:{" "}
                    {formatBalance(walletBalance)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Withdrawal Method*</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select withdrawal method</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="litecoin">Litecoin</option>
                  {/* <option value="bank_transfer">Bank Transfer</option> */}
                </select>
              </div>
            </div>

            {/* Conditional fields based on payment method */}
            {["bitcoin", "ethereum", "litecoin"].includes(paymentMethod) && (
              <div className="form-group">
                <label htmlFor="walletAddress">
                  {paymentMethod.charAt(0).toUpperCase() +
                    paymentMethod.slice(1)}{" "}
                  Wallet Address*
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={`Enter your ${paymentMethod} wallet address`}
                  required
                />
              </div>
            )}

            {/* {paymentMethod === "bank_transfer" && (
              <div className="form-group">
                <label htmlFor="bankDetails">Bank Account Details*</label>
                <textarea
                  id="bankDetails"
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="Enter your bank name, account number, account name, routing number, and SWIFT/BIC code"
                  rows={4}
                  required
                />
              </div>
            )} */}

            <div className="withdraw-notice">
              <p>
                <strong>Important:</strong> Please ensure your withdrawal
                details are correct. Incorrect information may lead to failed
                transactions.
              </p>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Processing..." : "Submit Withdrawal Request"}
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

export default WithdrawModal;
