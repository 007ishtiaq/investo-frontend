// components/PlanUpgradeModal/PlanUpgradeModal.js
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
  onOpenDepositModal,
}) => {
  const [loading, setLoading] = useState(false);
  const [noNetModal, setNoNetModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(
    plan?.minAmount || 0
  );
  const [amountError, setAmountError] = useState("");

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

  // Reset investment amount when plan changes
  useEffect(() => {
    if (plan) {
      setInvestmentAmount(plan.minAmount);
      setAmountError("");
    }
  }, [plan]);

  // Validate investment amount
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return "Please enter a valid amount";
    }

    if (numAmount < plan.minAmount) {
      return `Minimum investment is $${plan.minAmount}`;
    }

    if (numAmount > plan.maxAmount) {
      return `Maximum investment is $${plan.maxAmount}`;
    }

    if (numAmount > walletBalance) {
      return "Insufficient wallet balance";
    }

    return "";
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setInvestmentAmount(value);

    const error = validateAmount(value);
    setAmountError(error);
  };

  // Check if user's wallet balance is sufficient for the entered amount
  const hasEnoughBalance =
    walletBalance >= investmentAmount && investmentAmount >= plan?.minAmount;
  const isValidAmount =
    !amountError &&
    investmentAmount >= plan?.minAmount &&
    investmentAmount <= plan?.maxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    // Validate amount before submission
    const error = validateAmount(investmentAmount);
    if (error) {
      setAmountError(error);
      toast.error(error);
      return;
    }

    if (!hasEnoughBalance || !isValidAmount) {
      toast.error("Please check your investment amount");
      return;
    }

    try {
      setLoading(true);
      const result = await upgradePlan(userToken, {
        planId: plan._id,
        investmentAmount: parseFloat(investmentAmount),
      });

      toast.success(
        result.message ||
          `Successfully invested $${investmentAmount} in ${plan.name}`
      );

      // Refresh the page or update user state to reflect new investment and balance
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      onClose();
    } catch (error) {
      console.error("Investment error:", error);

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
            "Failed to process investment. Please try again."
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
            <h3>Invest in {plan?.name}</h3>
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
                <span className="detail-label">Investment Range:</span>
                <span className="detail-value">
                  ${plan?.minAmount} - ${plan?.maxAmount}
                </span>
              </div>
              <div className="plan-detail-item">
                <span className="detail-label">Your Wallet Balance:</span>
                <span
                  className={`detail-value ${
                    walletBalance >= investmentAmount
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatBalance(walletBalance, walletCurrency)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="upgrade-form">
              <div className="amount-input-section">
                <label htmlFor="investmentAmount" className="amount-label">
                  Investment Amount ($)
                </label>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    id="investmentAmount"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    min={plan?.minAmount}
                    max={Math.min(plan?.maxAmount, walletBalance)}
                    step="0.01"
                    className={`amount-input ${
                      amountError ? "error-amount" : ""
                    }`}
                    placeholder={`Min: $${plan?.minAmount}, Max: $${plan?.maxAmount}`}
                  />
                  <div className="amount-range">
                    <span>Min: ${plan?.minAmount}</span>
                    <span>Max: ${plan?.maxAmount}</span>
                  </div>
                </div>
                {amountError && (
                  <div className="amount-error">{amountError}</div>
                )}
              </div>

              {hasEnoughBalance && isValidAmount ? (
                <div className="upgrade-summary">
                  <p>
                    You are about to invest <strong>${investmentAmount}</strong>{" "}
                    in <strong>{plan?.name}</strong>.
                  </p>
                  <p>
                    Expected daily return:{" "}
                    <strong>
                      $
                      {(investmentAmount * (plan?.dailyIncome / 100)).toFixed(
                        2
                      )}
                    </strong>
                  </p>
                  <p>This amount will be deducted from your wallet balance.</p>
                </div>
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
                    {amountError || "Please adjust your investment amount"}
                  </div>
                  {walletBalance < investmentAmount && (
                    <>
                      <p className="balance-message">
                        You need $
                        {(investmentAmount - walletBalance).toFixed(2)} more to
                        make this investment.
                      </p>
                      <button
                        type="button"
                        className="deposit-button gradient-bg"
                        onClick={handleDepositClick}
                      >
                        Deposit Funds
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="upgrade-button gradient-bg"
                  disabled={loading || !hasEnoughBalance || !isValidAmount}
                  onClick={(e) => {
                    // Check network before submitting
                    if (!navigator.onLine) {
                      e.preventDefault();
                      setNoNetModal(true);
                      return;
                    }
                  }}
                >
                  {loading ? "Processing..." : "Confirm Investment"}
                </button>
              </div>
            </form>
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
