import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { upgradePlan } from "../../functions/investmentplans";
import { formatBalance } from "../../functions/wallet";
import NoNetModal from "../NoNetModal/NoNetModal";
import "./PlanUpgradeModal.css";

const PlanUpgradeModal = ({
  show,
  onClose,
  plan,
  walletBalance,
  walletCurrency,
  userToken,
  onOpenDepositModal, // Add this prop
}) => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);

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

  // Check if user's wallet balance is sufficient
  const hasEnoughBalance = walletBalance >= plan?.minAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    if (!hasEnoughBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }

    try {
      setLoading(true);
      const result = await upgradePlan(userToken, { planId: plan._id });

      toast.success(result.message || `Successfully upgraded to ${plan.name}`);

      // Refresh the page or update user state to reflect new level and balance
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      onClose();
    } catch (error) {
      console.error("Plan upgrade error:", error);

      // Check if it's a network error
      if (
        (error.message && error.message.includes("network")) ||
        error.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error(
          error.response?.data?.error ||
            "Failed to upgrade plan. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDepositClick = () => {
    // Check network status before opening deposit modal
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    // Close the current modal and trigger parent to open deposit modal
    onClose();
    if (onOpenDepositModal) {
      onOpenDepositModal();
    }
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="plan-upgrade-modal">
          <div className="modal-header">
            <h3>Upgrade to {plan?.name}</h3>
            <button className="close-button" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="modal-body">
            <div className="plan-details">
              <div className="plan-detail-item">
                <span className="detail-label">Plan:</span>
                <span className="detail-value">{plan?.name}</span>
              </div>
              <div className="plan-detail-item">
                <span className="detail-label">Daily Return:</span>
                <span className="detail-value">{plan?.dailyIncome}%</span>
              </div>
              <div className="plan-detail-item">
                <span className="detail-label">Minimum Investment:</span>
                <span className="detail-value">${plan?.minAmount}</span>
              </div>
              <div className="plan-detail-item">
                <span className="detail-label">Your Wallet Balance:</span>
                <span
                  className={`detail-value ${
                    hasEnoughBalance ? "text-success" : "text-danger"
                  }`}
                >
                  {formatBalance(walletBalance, walletCurrency)}
                </span>
              </div>
            </div>

            {hasEnoughBalance ? (
              <form onSubmit={handleSubmit} className="upgrade-form">
                <div className="upgrade-summary">
                  <p>
                    You are about to upgrade to <strong>{plan?.name}</strong>{" "}
                    with an investment of <strong>${plan?.minAmount}</strong>.
                  </p>
                  <p>
                    This amount will be deducted from your wallet balance, and
                    your account level will be upgraded to Level{" "}
                    {plan?.minLevel}.
                  </p>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="upgrade-button gradient-bg"
                    disabled={loading}
                    onClick={(e) => {
                      // Check network before submitting
                      if (!navigator.onLine) {
                        e.preventDefault();
                        setNoNetModal(true);
                        return;
                      }
                    }}
                  >
                    {loading ? "Processing..." : "Confirm Upgrade"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="insufficient-balance">
                <div className="warning-message">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Insufficient wallet balance
                </div>
                <p className="balance-message">
                  You need ${(plan?.minAmount - walletBalance).toFixed(2)} more
                  to upgrade to this plan.
                </p>
                <button
                  className="deposit-button gradient-bg"
                  onClick={handleDepositClick}
                >
                  Deposit Funds
                </button>
              </div>
            )}
          </div>
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

export default PlanUpgradeModal;
