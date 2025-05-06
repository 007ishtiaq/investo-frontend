// client/src/pages/admin/AdminWithdrawals.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getWithdrawals,
  reviewWithdrawal,
} from "../../functions/adminWithdrawal";
import { getInvestmentPlans } from "../../functions/adminDeposit"; // Reuse existing function
import "./AdminWithdrawals.css";
import { useWallet } from "../../contexts/WalletContext";

const AdminWithdrawals = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const { refreshWalletBalance } = useWallet();

  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investmentPlans, setInvestmentPlans] = useState([]);
  const [activeWithdrawal, setActiveWithdrawal] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState("pending");
  const [transactionId, setTransactionId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  useEffect(() => {
    loadWithdrawals();
    loadInvestmentPlans();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await getWithdrawals(user.token, filter);
      setWithdrawals(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Error loading withdrawals");
      setLoading(false);
    }
  };

  const loadInvestmentPlans = async () => {
    try {
      const data = await getInvestmentPlans(user.token);
      setInvestmentPlans(data);
    } catch (error) {
      toast.error(error.message || "Error loading investment plans");
    }
  };

  const openReviewModal = (withdrawal) => {
    setActiveWithdrawal(withdrawal);
    setAdminNotes("");
    setTransactionId("");

    // Find and select the plan that matches the user's level
    if (
      investmentPlans.length > 0 &&
      withdrawal.user &&
      withdrawal.user.level
    ) {
      const userLevel = withdrawal.user.level || 1;
      const matchingPlan = investmentPlans.find(
        (plan) => plan.minLevel === userLevel
      );

      if (matchingPlan) {
        setSelectedPlanId(matchingPlan._id);
      } else {
        // If no exact match, find the closest plan with minLevel less than or equal to user's level
        const eligiblePlans = investmentPlans
          .filter((plan) => plan.minLevel <= userLevel)
          .sort((a, b) => b.minLevel - a.minLevel); // Sort by minLevel in descending order

        if (eligiblePlans.length > 0) {
          setSelectedPlanId(eligiblePlans[0]._id); // Select the highest eligible plan
        } else {
          // If no eligible plans, select the lowest level plan available
          const lowestLevelPlan = [...investmentPlans].sort(
            (a, b) => a.minLevel - b.minLevel
          )[0];
          if (lowestLevelPlan) {
            setSelectedPlanId(lowestLevelPlan._id);
          } else {
            setSelectedPlanId(""); // No plans available
          }
        }
      }
    } else {
      setSelectedPlanId("");
    }
  };

  const closeReviewModal = () => {
    setActiveWithdrawal(null);
  };

  const handleReviewSubmit = async (status) => {
    if (status === "approved" && !transactionId) {
      return toast.error(
        "Please enter a transaction ID for the approved withdrawal"
      );
    }

    try {
      setLoading(true);
      await reviewWithdrawal(
        activeWithdrawal._id,
        {
          status,
          adminNotes,
          transactionId: status === "approved" ? transactionId : null,
          planId: selectedPlanId,
        },
        user.token
      );
      toast.success(`Withdrawal ${status} successfully`);
      loadWithdrawals();
      refreshWalletBalance();
      closeReviewModal();
      setLoading(false);
    } catch (error) {
      toast.error(error.message || `Failed to ${status} withdrawal`);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPaymentMethod = (method) => {
    return method.charAt(0).toUpperCase() + method.slice(1).replace("_", " ");
  };

  return (
    <div className="admin-withdrawals-page">
      <div className="container">
        <div className="page-header">
          <h1>Withdrawal Management</h1>
          <div className="filter-controls">
            <button
              className={`filter-button ${
                filter === "pending" ? "active" : ""
              }`}
              onClick={() => setFilter("pending")}
            >
              Pending Withdrawals
            </button>
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Withdrawals
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="no-withdrawals">
            <p>No {filter === "pending" ? "pending" : ""} withdrawals found.</p>
          </div>
        ) : (
          <div className="withdrawals-table-container">
            <table className="withdrawals-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id}>
                    <td>{withdrawal.user.username || withdrawal.user.email}</td>
                    <td>${withdrawal.amount.toFixed(2)}</td>
                    <td>{formatPaymentMethod(withdrawal.paymentMethod)}</td>
                    <td>{formatDate(withdrawal.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge status-${withdrawal.status}`}
                      >
                        {withdrawal.status.charAt(0).toUpperCase() +
                          withdrawal.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="view-button"
                        onClick={() => openReviewModal(withdrawal)}
                      >
                        {withdrawal.status === "pending" ? "Review" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeWithdrawal && (
          <div className="modal-overlay">
            <div className="withdrawal-review-modal">
              <div className="modal-header">
                <h2>
                  {activeWithdrawal.status === "pending"
                    ? "Review Withdrawal"
                    : "Withdrawal Details"}
                </h2>
                <button className="close-button" onClick={closeReviewModal}>
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="withdrawal-details">
                  <div className="detail-row">
                    <span className="detail-label">User:</span>
                    <span className="detail-value">
                      {activeWithdrawal.user.username ||
                        activeWithdrawal.user.email}
                    </span>
                  </div>

                  {/* User Level */}
                  <div className="detail-row">
                    <span className="detail-label">User Level:</span>
                    <span className="detail-value user-level">
                      Level {activeWithdrawal.user.level || 1}
                    </span>
                  </div>

                  {/* Wallet Balance */}
                  <div className="detail-row">
                    <span className="detail-label">Wallet Balance:</span>
                    <span className="detail-value wallet-balance">
                      ${(activeWithdrawal.userWalletBalance || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">
                      ${activeWithdrawal.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">
                      {formatPaymentMethod(activeWithdrawal.paymentMethod)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {formatDate(activeWithdrawal.createdAt)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span
                      className={`status-badge status-${activeWithdrawal.status}`}
                    >
                      {activeWithdrawal.status.charAt(0).toUpperCase() +
                        activeWithdrawal.status.slice(1)}
                    </span>
                  </div>

                  {/* Display payment details based on payment method */}
                  {["bitcoin", "ethereum", "litecoin"].includes(
                    activeWithdrawal.paymentMethod
                  ) && (
                    <div className="detail-row">
                      <span className="detail-label">Wallet Address:</span>
                      <span className="detail-value wallet-address">
                        {activeWithdrawal.walletAddress}
                      </span>
                    </div>
                  )}

                  {activeWithdrawal.paymentMethod === "bank_transfer" && (
                    <div className="detail-row">
                      <span className="detail-label">Bank Details:</span>
                      <span className="detail-value bank-details">
                        <pre>{activeWithdrawal.bankDetails}</pre>
                      </span>
                    </div>
                  )}

                  {activeWithdrawal.status !== "pending" && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Processed By:</span>
                        <span className="detail-value">
                          {activeWithdrawal.processedBy
                            ? activeWithdrawal.processedBy.username ||
                              activeWithdrawal.processedBy.email
                            : "N/A"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Processed Date:</span>
                        <span className="detail-value">
                          {activeWithdrawal.processedAt
                            ? formatDate(activeWithdrawal.processedAt)
                            : "N/A"}
                        </span>
                      </div>
                      {activeWithdrawal.transactionId && (
                        <div className="detail-row">
                          <span className="detail-label">Transaction ID:</span>
                          <span className="detail-value">
                            {activeWithdrawal.transactionId}
                          </span>
                        </div>
                      )}
                      {activeWithdrawal.adminNotes && (
                        <div className="detail-row">
                          <span className="detail-label">Admin Notes:</span>
                          <span className="detail-value">
                            {activeWithdrawal.adminNotes}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {activeWithdrawal.status === "pending" && (
                  <div className="review-form">
                    {/* Investment Plan Selector */}
                    <div className="form-group">
                      <label htmlFor="investmentPlan">
                        Investment Plan Selection
                      </label>
                      <select
                        id="investmentPlan"
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                      >
                        <option value="">-- Select Plan --</option>
                        {investmentPlans.map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.name} - {plan.returnRate}% (Level{" "}
                            {plan.minLevel})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Transaction ID field */}
                    <div className="form-group">
                      <label htmlFor="transactionId">
                        Transaction ID (Required for approval)
                      </label>
                      <input
                        type="text"
                        id="transactionId"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID after processing payment"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="adminNotes">Notes (Optional)</label>
                      <textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes or comments..."
                        rows="3"
                      />
                    </div>

                    <div className="review-actions">
                      <button
                        className="reject-button"
                        onClick={() => handleReviewSubmit("rejected")}
                        disabled={loading}
                      >
                        Reject
                      </button>
                      <button
                        className="approve-button"
                        onClick={() => handleReviewSubmit("approved")}
                        disabled={loading}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
