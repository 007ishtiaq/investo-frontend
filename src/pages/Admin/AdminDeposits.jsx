// client/src/pages/admin/AdminDeposits.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getDeposits,
  getInvestmentPlans,
  reviewDeposit,
  formatDate,
} from "../../functions/adminDeposit";
import "./AdminDeposits.css";

const AdminDeposits = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [investmentPlans, setInvestmentPlans] = useState([]);
  const [activeDeposit, setActiveDeposit] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    loadDeposits();
    loadInvestmentPlans();
  }, [filter]);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const data = await getDeposits(user.token, filter);
      setDeposits(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Error loading deposits");
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

  const openReviewModal = (deposit) => {
    setActiveDeposit(deposit);
    setSelectedPlanId("");
    setAdminNotes("");
  };

  const closeReviewModal = () => {
    setActiveDeposit(null);
  };

  const handleReviewSubmit = async (status) => {
    if (status === "approved" && !selectedPlanId) {
      return toast.error("Please select an investment plan");
    }
    try {
      setLoading(true);
      await reviewDeposit(
        activeDeposit._id,
        {
          status,
          planId: selectedPlanId,
          adminNotes,
        },
        user.token
      );
      toast.success(`Deposit ${status} successfully`);
      loadDeposits();
      closeReviewModal();
      setLoading(false);
    } catch (error) {
      toast.error(error.message || `Failed to ${status} deposit`);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-deposits-page">
      <div className="container">
        <div className="page-header">
          <h1>Deposit Management</h1>
          <div className="filter-controls">
            <button
              className={`filter-button ${
                filter === "pending" ? "active" : ""
              }`}
              onClick={() => setFilter("pending")}
            >
              Pending Deposits
            </button>
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Deposits
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : deposits.length === 0 ? (
          <div className="no-deposits">
            <p>No {filter === "pending" ? "pending" : ""} deposits found.</p>
          </div>
        ) : (
          <div className="deposits-table-container">
            <table className="deposits-table">
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
                {deposits.map((deposit) => (
                  <tr key={deposit._id}>
                    <td>{deposit.user.username || deposit.user.email}</td>
                    <td>${deposit.amount.toFixed(2)}</td>
                    <td>
                      {deposit.paymentMethod.charAt(0).toUpperCase() +
                        deposit.paymentMethod.slice(1).replace("_", " ")}
                    </td>
                    <td>{formatDate(deposit.createdAt)}</td>
                    <td>
                      <span className={`status-badge status-${deposit.status}`}>
                        {deposit.status.charAt(0).toUpperCase() +
                          deposit.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="view-button"
                        onClick={() => openReviewModal(deposit)}
                      >
                        {deposit.status === "pending" ? "Review" : "View"}
                      </button>
                      <a
                        href={deposit.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="screenshot-button"
                      >
                        Screenshot
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeDeposit && (
          <div className="modal-overlay">
            <div className="deposit-review-modal">
              <div className="modal-header">
                <h2>
                  {activeDeposit.status === "pending"
                    ? "Review Deposit"
                    : "Deposit Details"}
                </h2>
                <button className="close-button" onClick={closeReviewModal}>
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="deposit-details">
                  <div className="detail-row">
                    <span className="detail-label">User:</span>
                    <span className="detail-value">
                      {activeDeposit.user.username || activeDeposit.user.email}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">
                      ${activeDeposit.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">
                      {activeDeposit.paymentMethod.charAt(0).toUpperCase() +
                        activeDeposit.paymentMethod.slice(1).replace("_", " ")}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">
                      {activeDeposit.transactionId || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {formatDate(activeDeposit.createdAt)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span
                      className={`status-badge status-${activeDeposit.status}`}
                    >
                      {activeDeposit.status.charAt(0).toUpperCase() +
                        activeDeposit.status.slice(1)}
                    </span>
                  </div>

                  {activeDeposit.status !== "pending" && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Reviewed By:</span>
                        <span className="detail-value">
                          {activeDeposit.approvedBy
                            ? activeDeposit.approvedBy.username ||
                              activeDeposit.approvedBy.email
                            : "N/A"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Review Date:</span>
                        <span className="detail-value">
                          {activeDeposit.approvedAt
                            ? formatDate(activeDeposit.approvedAt)
                            : "N/A"}
                        </span>
                      </div>
                      {activeDeposit.assignedPlan && (
                        <div className="detail-row">
                          <span className="detail-label">Assigned Plan:</span>
                          <span className="detail-value">
                            {activeDeposit.assignedPlan.name}
                          </span>
                        </div>
                      )}
                      {activeDeposit.adminNotes && (
                        <div className="detail-row">
                          <span className="detail-label">Admin Notes:</span>
                          <span className="detail-value">
                            {activeDeposit.adminNotes}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="screenshot-container">
                  <h3>Payment Screenshot</h3>
                  <img
                    src={activeDeposit.screenshotUrl}
                    alt="Payment proof"
                    className="deposit-screenshot"
                  />
                </div>

                {activeDeposit.status === "pending" && (
                  <div className="review-form">
                    <div className="form-group">
                      <label htmlFor="investmentPlan">
                        Select Investment Plan
                      </label>
                      <select
                        id="investmentPlan"
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        required
                      >
                        <option value="">-- Select Plan --</option>
                        {investmentPlans.map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.name} - {plan.returnRate}% (
                            {plan.durationInDays} days)
                          </option>
                        ))}
                      </select>
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
                        disabled={loading || !selectedPlanId}
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

export default AdminDeposits;
