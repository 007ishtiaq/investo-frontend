// client/src/pages/Plans.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import {
  EthereumIcon,
  CheckIcon,
  InfoIcon,
  WalletIcon,
  StarIcon,
} from "../utils/icons";
import { useWallet } from "../contexts/WalletContext";
import "./Plans.css";

const Plans = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const { refreshWalletBalance } = useWallet();
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInvestments, setUserInvestments] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Investment Plans
  const plans = [
    {
      id: 1,
      name: "Starter Growth",
      minAmount: 50,
      maxAmount: 500,
      days: 7,
      dailyPercentage: 1.5,
      totalReturn: 10.5, // 1.5% × 7 days
      minLevel: 1,
      fee: 0,
      color: "#4caf50", // Green
      features: [
        "Daily profit payouts",
        "Principal returned at end of term",
        "Cancel anytime (5% fee)",
        "Perfect for beginners",
      ],
    },
    {
      id: 2,
      name: "Balanced Yield",
      minAmount: 200,
      maxAmount: 2000,
      days: 14,
      dailyPercentage: 1.8,
      totalReturn: 25.2, // 1.8% × 14 days
      minLevel: 2,
      fee: 0,
      color: "#2196f3", // Blue
      features: [
        "Daily profit payouts",
        "Principal returned at end of term",
        "Priority customer support",
        "Early withdrawal available",
      ],
    },
    {
      id: 3,
      name: "Premium Growth",
      minAmount: 500,
      maxAmount: 5000,
      days: 30,
      dailyPercentage: 2.2,
      totalReturn: 66, // 2.2% × 30 days
      minLevel: 3,
      fee: 0,
      color: "#ff9800", // Orange
      features: [
        "Daily profit payouts",
        "Principal returned at end of term",
        "VIP customer support",
        "Performance analytics dashboard",
      ],
    },
    {
      id: 4,
      name: "Elite Performance",
      minAmount: 1000,
      maxAmount: 10000,
      days: 60,
      dailyPercentage: 2.5,
      totalReturn: 150, // 2.5% × 60 days
      minLevel: 4,
      fee: 0,
      color: "#9c27b0", // Purple
      features: [
        "Daily profit payouts",
        "Principal returned at end of term",
        "Dedicated account manager",
        "Exclusive investment opportunities",
        "Profit boosters available",
      ],
    },
    {
      id: 5,
      name: "VIP Accelerator",
      minAmount: 5000,
      maxAmount: 100000,
      days: 90,
      dailyPercentage: 3.0,
      totalReturn: 270, // 3.0% × 90 days
      minLevel: 5,
      fee: 0,
      color: "#f44336", // Red
      features: [
        "Daily profit payouts",
        "Principal returned at end of term",
        "24/7 dedicated VIP support",
        "Exclusive investment opportunities",
        "Early access to new plans",
        "Profit insurance protection",
      ],
    },
  ];

  useEffect(() => {
    if (user && user.token) {
      loadWalletBalance();
      loadUserInvestments();
    }
  }, [user]);

  const loadWalletBalance = async () => {
    if (!user || !user.token) return;

    try {
      const res = await fetch("/api/wallet", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setWalletBalance(data.balance || 0);
    } catch (err) {
      console.error("Error loading wallet balance:", err);
      setWalletBalance(0);
    }
  };

  const loadUserInvestments = async () => {
    if (!user || !user.token) return;

    setLoading(true);
    try {
      const res = await fetch("/api/investments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setUserInvestments(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading investments:", err);
      setLoading(false);
      toast.error("Failed to load your investments");
    }
  };

  const openPlanModal = (plan) => {
    setSelectedPlan(plan);
    setInvestmentAmount(plan.minAmount.toString());
  };

  const closePlanModal = () => {
    setSelectedPlan(null);
    setInvestmentAmount("");
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setInvestmentAmount(value);
  };

  const validateAmount = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return false;
    }

    if (amount < selectedPlan.minAmount) {
      toast.error(`Minimum investment amount is $${selectedPlan.minAmount}`);
      return false;
    }

    if (amount > selectedPlan.maxAmount) {
      toast.error(`Maximum investment amount is $${selectedPlan.maxAmount}`);
      return false;
    }

    if (amount > walletBalance) {
      toast.error("Insufficient wallet balance");
      return false;
    }

    return true;
  };

  const openConfirmInvestment = () => {
    if (!validateAmount()) return;
    setShowConfirmModal(true);
  };

  const handleCreateInvestment = async () => {
    if (!user || !user.token) {
      toast.error("Please login to invest");
      return;
    }

    if (!validateAmount()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: parseFloat(investmentAmount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Investment created successfully!");
        refreshWalletBalance();
        loadUserInvestments();
        setShowConfirmModal(false);
        closePlanModal();
      } else {
        throw new Error(data.message || "Failed to create investment");
      }
    } catch (err) {
      console.error("Error creating investment:", err);
      toast.error(err.message || "Failed to create investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlanStatusClass = (plan) => {
    // If user is not logged in, make all plans available but they'll need to login to invest
    if (!user) return "";

    const userLevel = user.level || 1;

    if (plan.minLevel > userLevel) {
      return "plan-locked";
    }
    return "";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="plans-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "green",
            },
          },
          error: {
            style: {
              background: "red",
            },
          },
        }}
      />

      <div className="container">
        <div className="plans-header">
          <h1 className="page-title">Investment Plans</h1>
          <div className="wallet-info">
            <div className="wallet-balance">
              <WalletIcon size={18} />
              <span>{formatCurrency(walletBalance)}</span>
            </div>
            {user && user.level && (
              <div className="user-level">
                <StarIcon size={16} />
                <span>Level {user.level}</span>
              </div>
            )}
          </div>
        </div>

        <div className="plans-intro">
          <h2>Choose Your Ideal Investment Plan</h2>
          <p>
            Our investment plans offer various terms and returns based on your
            investment goals. Higher level plans are unlocked as you progress.
          </p>
        </div>

        <div className="plans-overview">
          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${getPlanStatusClass(plan)}`}
              >
                {plan.minLevel > 1 && (
                  <div className="plan-level-badge">Level {plan.minLevel}+</div>
                )}

                <div
                  className="plan-header"
                  style={{
                    backgroundColor: plan.color + "15",
                    borderColor: plan.color + "30",
                  }}
                >
                  <h3 className="plan-name" style={{ color: plan.color }}>
                    {plan.name}
                  </h3>
                  <div className="plan-return">
                    <span className="percentage">{plan.dailyPercentage}%</span>
                    <span className="period">Daily</span>
                  </div>
                </div>

                <div className="plan-details">
                  <div className="plan-detail">
                    <span className="detail-label">Investment Period</span>
                    <span className="detail-value">{plan.days} Days</span>
                  </div>

                  <div className="plan-detail">
                    <span className="detail-label">Total Return</span>
                    <span className="detail-value">{plan.totalReturn}%</span>
                  </div>

                  <div className="plan-detail">
                    <span className="detail-label">Min-Max Investment</span>
                    <span className="detail-value">
                      ${plan.minAmount} - ${plan.maxAmount}
                    </span>
                  </div>

                  <div className="plan-detail">
                    <span className="detail-label">Service Fee</span>
                    <span className="detail-value">{plan.fee}%</span>
                  </div>

                  <div className="plan-features">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckIcon size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="plan-footer">
                  <button
                    className="invest-button"
                    onClick={() => openPlanModal(plan)}
                    disabled={getPlanStatusClass(plan) === "plan-locked"}
                    style={{
                      backgroundColor: plan.color,
                      opacity:
                        getPlanStatusClass(plan) === "plan-locked" ? 0.5 : 1,
                    }}
                  >
                    {getPlanStatusClass(plan) === "plan-locked" ? (
                      <>
                        Locked <span className="lock-icon">🔒</span>
                      </>
                    ) : (
                      "Invest Now"
                    )}
                  </button>

                  {getPlanStatusClass(plan) === "plan-locked" && (
                    <div className="lock-message">
                      Reach Level {plan.minLevel} to unlock
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {userInvestments.length > 0 && (
          <div className="active-investments-section">
            <h2>Your Active Investments</h2>
            <div className="investments-list">
              {userInvestments.map((investment) => (
                <div key={investment._id} className="investment-item">
                  <div className="investment-plan-info">
                    <h4>{investment.planName}</h4>
                    <span className="investment-date">
                      Started:{" "}
                      {new Date(investment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="investment-details">
                    <div className="investment-amount">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">
                        {formatCurrency(investment.amount)}
                      </span>
                    </div>

                    <div className="investment-progress">
                      <span className="detail-label">Progress</span>
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(
                              (investment.daysPassed / investment.totalDays) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {investment.daysPassed} of {investment.totalDays} days
                      </span>
                    </div>

                    <div className="investment-earnings">
                      <span className="detail-label">Earnings</span>
                      <span className="detail-value positive">
                        +{formatCurrency(investment.totalEarnings)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Investment Plan Modal */}
      {selectedPlan && (
        <div className="modal-overlay">
          <div className="investment-modal">
            <button className="close-modal" onClick={closePlanModal}>
              &times;
            </button>

            <div
              className="modal-header"
              style={{ borderColor: selectedPlan.color }}
            >
              <h2 style={{ color: selectedPlan.color }}>{selectedPlan.name}</h2>
              <div className="plan-summary">
                <div className="summary-item">
                  <span className="summary-label">Daily</span>
                  <span className="summary-value">
                    {selectedPlan.dailyPercentage}%
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Period</span>
                  <span className="summary-value">
                    {selectedPlan.days} Days
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Return</span>
                  <span className="summary-value">
                    {selectedPlan.totalReturn}%
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-content">
              <div className="investment-form">
                <div className="form-group">
                  <label htmlFor="investmentAmount">
                    Investment Amount (USD)
                  </label>
                  <input
                    type="number"
                    id="investmentAmount"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    placeholder={`Min: $${selectedPlan.minAmount} | Max: $${selectedPlan.maxAmount}`}
                    min={selectedPlan.minAmount}
                    max={selectedPlan.maxAmount}
                  />
                  <div className="input-limits">
                    <span>${selectedPlan.minAmount} min</span>
                    <span>${selectedPlan.maxAmount} max</span>
                  </div>
                </div>

                <div className="wallet-balance-info">
                  <span>Wallet Balance:</span>
                  <span>${walletBalance.toFixed(2)}</span>
                </div>

                {parseFloat(investmentAmount) > 0 && (
                  <div className="investment-details">
                    <h3>Projected Returns</h3>

                    <div className="projection-item">
                      <span>Daily Profit:</span>
                      <span>
                        $
                        {(
                          (parseFloat(investmentAmount) *
                            selectedPlan.dailyPercentage) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>

                    <div className="projection-item">
                      <span>Total Profit ({selectedPlan.days} days):</span>
                      <span>
                        $
                        {(
                          (parseFloat(investmentAmount) *
                            selectedPlan.totalReturn) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>

                    <div className="projection-item">
                      <span>Amount + Profit:</span>
                      <span>
                        $
                        {(
                          parseFloat(investmentAmount) *
                          (1 + selectedPlan.totalReturn / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="investment-terms">
                  <div className="terms-header">
                    <InfoIcon size={18} />
                    <h4>Terms & Conditions</h4>
                  </div>
                  <ul className="terms-list">
                    <li>
                      Daily profits will be credited to your wallet
                      automatically.
                    </li>
                    <li>
                      The principal amount will be locked for the entire{" "}
                      {selectedPlan.days}-day period.
                    </li>
                    <li>
                      After maturity, your principal will be returned to your
                      wallet.
                    </li>
                    <li>
                      Early withdrawal incurs a 5% fee on the principal amount.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={closePlanModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="invest-button"
                onClick={openConfirmInvestment}
                disabled={
                  isSubmitting ||
                  parseFloat(investmentAmount) <= 0 ||
                  parseFloat(investmentAmount) < selectedPlan.minAmount
                }
                style={{ backgroundColor: selectedPlan.color }}
              >
                {isSubmitting ? "Processing..." : "Invest Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-header">
              <h2>Confirm Investment</h2>
            </div>

            <div className="confirm-content">
              <p>You are about to invest in:</p>
              <div className="confirm-details">
                <div className="confirm-item">
                  <span>Plan:</span>
                  <span>{selectedPlan.name}</span>
                </div>
                <div className="confirm-item">
                  <span>Amount:</span>
                  <span>${parseFloat(investmentAmount).toFixed(2)}</span>
                </div>
                <div className="confirm-item">
                  <span>Duration:</span>
                  <span>{selectedPlan.days} days</span>
                </div>
                <div className="confirm-item">
                  <span>Daily Return:</span>
                  <span>{selectedPlan.dailyPercentage}%</span>
                </div>
                <div className="confirm-item">
                  <span>Total Return:</span>
                  <span>{selectedPlan.totalReturn}%</span>
                </div>
                <div className="confirm-item">
                  <span>Total Profit:</span>
                  <span>
                    $
                    {(
                      (parseFloat(investmentAmount) *
                        selectedPlan.totalReturn) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="confirm-warning">
                <InfoIcon size={18} />
                <p>
                  This amount will be deducted from your wallet and locked for{" "}
                  {selectedPlan.days} days. Are you sure you want to proceed?
                </p>
              </div>
            </div>

            <div className="confirm-actions">
              <button
                className="cancel-button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleCreateInvestment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm Investment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
