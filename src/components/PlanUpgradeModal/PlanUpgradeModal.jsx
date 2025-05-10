import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { upgradePlan } from "../../functions/investmentplans";
import "./PlanUpgradeModal.css";

const PlanUpgradeModal = ({
  show,
  onClose,
  plan,
  walletBalance,
  walletCurrency,
  userToken,
}) => {
  const [loading, setLoading] = useState(false);

  // Check if user's wallet balance is sufficient
  const hasEnoughBalance = walletBalance >= plan?.minAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      toast.error(
        error.response?.data?.error ||
          "Failed to upgrade plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
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
                ${walletBalance}
              </span>
            </div>
          </div>

          {hasEnoughBalance ? (
            <form onSubmit={handleSubmit} className="upgrade-form">
              <div className="upgrade-summary">
                <p>
                  You are about to upgrade to <strong>{plan?.name}</strong> with
                  an investment of <strong>${plan?.minAmount}</strong>.
                </p>
                <p>
                  This amount will be deducted from your wallet balance, and
                  your account level will be upgraded to Level {plan?.minLevel}.
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="upgrade-button gradient-bg"
                  disabled={loading}
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
                You need ${(plan?.minAmount - walletBalance).toFixed(2)} more to
                upgrade to this plan.
              </p>
              <button
                className="deposit-button gradient-bg"
                onClick={() => {
                  onClose();
                  // Navigate to deposit page
                  window.location.href = "/wallet";
                }}
              >
                Deposit Funds
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeModal;
