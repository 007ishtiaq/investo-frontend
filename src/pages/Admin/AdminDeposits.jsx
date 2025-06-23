// client/src/pages/admin/AdminDeposits.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getDeposits,
  getInvestmentPlans,
  reviewDeposit,
  createManualDeposit,
  searchUserByEmail,
} from "../../functions/adminDeposit";
import "./AdminDeposits.css";
import { useWallet } from "../../contexts/WalletContext";

const AdminDeposits = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const { refreshWalletBalance } = useWallet();

  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [investmentPlans, setInvestmentPlans] = useState([]);
  const [activeDeposit, setActiveDeposit] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState("pending");
  const [editedAmount, setEditedAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Manual deposit state
  const [showManualDepositForm, setShowManualDepositForm] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [manualDepositAmount, setManualDepositAmount] = useState("");
  const [manualDepositPlanId, setManualDepositPlanId] = useState("");
  const [manualDepositNotes, setManualDepositNotes] = useState("");

  useEffect(() => {
    loadDeposits();
    loadInvestmentPlans();
  }, [filter, currentPage]);

  const loadDeposits = async () => {
    try {
      setLoading(true);

      if (filter === "pending") {
        // For pending deposits, load without pagination
        const data = await getDeposits(user.token, filter);
        setDeposits(data);
      } else {
        // For all deposits, load with pagination
        const data = await getDeposits(
          user.token,
          filter,
          currentPage,
          itemsPerPage
        );
        setDeposits(data.deposits);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      }

      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Error loading deposits");
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
    setEditedAmount(deposit.amount);
  };

  const closeReviewModal = () => {
    setActiveDeposit(null);
  };

  const handleReviewSubmit = async (status) => {
    if (status === "approved" && !selectedPlanId) {
      return toast.error("Please select an investment plan");
    }

    // Validate amount
    if (editedAmount <= 0) {
      return toast.error("Amount must be greater than zero");
    }

    try {
      setLoading(true);
      await reviewDeposit(
        activeDeposit._id,
        {
          status,
          planId: selectedPlanId,
          adminNotes,
          amount: editedAmount,
        },
        user.token
      );
      toast.success(`Deposit ${status} successfully`);
      loadDeposits();
      refreshWalletBalance();
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

  const toggleManualDepositForm = () => {
    setShowManualDepositForm(!showManualDepositForm);
    if (!showManualDepositForm) {
      // Reset form when opening
      setSearchEmail("");
      setSearchedUser(null);
      setManualDepositAmount("");
      setManualDepositPlanId("");
      setManualDepositNotes("");
    }
  };

  const handleUserSearch = async () => {
    if (!searchEmail.trim()) {
      return toast.error("Please enter a user email");
    }

    try {
      setIsSearching(true);
      const result = await searchUserByEmail(user.token, searchEmail);
      setSearchedUser(result.data);
      setIsSearching(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "User not found");
      setSearchedUser(null);
      setIsSearching(false);
    }
  };

  const handleManualDepositSubmit = async (e) => {
    e.preventDefault();

    if (!searchedUser) {
      return toast.error("Please search for a user first");
    }

    if (!manualDepositAmount || parseFloat(manualDepositAmount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    try {
      setLoading(true);
      await createManualDeposit(user.token, {
        userId: searchedUser._id,
        planId: manualDepositPlanId,
        amount: parseFloat(manualDepositAmount),
        adminNotes: manualDepositNotes,
      });

      toast.success("Manual deposit created successfully");
      loadDeposits();
      setShowManualDepositForm(false);
      setSearchEmail("");
      setSearchedUser(null);
      setManualDepositAmount("");
      setManualDepositPlanId("");
      setManualDepositNotes("");
      setLoading(false);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to create manual deposit"
      );
      setLoading(false);
    }
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
              onClick={() => {
                setFilter("pending");
                setCurrentPage(1);
              }}
            >
              Pending Deposits
            </button>
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => {
                setFilter("all");
                setCurrentPage(1);
              }}
            >
              All Deposits
            </button>
            <button
              className="manual-deposit-button"
              onClick={toggleManualDepositForm}
            >
              {showManualDepositForm ? "Cancel" : "Manual Deposit"}
            </button>
          </div>
        </div>

        {showManualDepositForm && (
          <div className="manual-deposit-form-container">
            <h2>Create Manual Deposit</h2>
            <div className="user-search-section">
              <div className="search-input-group">
                <input
                  type="email"
                  placeholder="Search user by email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
                <button
                  onClick={handleUserSearch}
                  disabled={isSearching}
                  className="search-button"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>

              {searchedUser && (
                <div className="searched-user-info">
                  <h3>User Information</h3>
                  <div className="user-info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">
                        {searchedUser.name || "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{searchedUser.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">User Level:</span>
                      <span className="info-value">{searchedUser.level}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Wallet Balance:</span>
                      <span className="info-value">
                        ${searchedUser.wallet?.balance.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {searchedUser && (
              <form
                onSubmit={handleManualDepositSubmit}
                className="manual-deposit-form"
              >
                <div className="form-group">
                  <label htmlFor="depositAmount">Deposit Amount ($)</label>
                  <input
                    id="depositAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={manualDepositAmount}
                    onChange={(e) => setManualDepositAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manualDepositPlan">Investment Plan</label>
                  <select
                    id="manualDepositPlan"
                    value={manualDepositPlanId}
                    onChange={(e) => setManualDepositPlanId(e.target.value)}
                  >
                    <option value="">-- Select Plan --</option>
                    {investmentPlans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} - {plan.returnRate}% (Level {plan.minLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="manualDepositNotes">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    id="manualDepositNotes"
                    value={manualDepositNotes}
                    onChange={(e) => setManualDepositNotes(e.target.value)}
                    placeholder="Add notes about this manual deposit..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Create Deposit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!showManualDepositForm && (
          <>
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : deposits.length === 0 ? (
              <div className="no-deposits">
                <p>
                  No {filter === "pending" ? "pending" : ""} deposits found.
                </p>
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
                        <td>{deposit.user.name || deposit.user.email}</td>
                        <td>${deposit.amount.toFixed(2)}</td>
                        <td>
                          {deposit.paymentMethod.charAt(0).toUpperCase() +
                            deposit.paymentMethod.slice(1).replace("_", " ")}
                        </td>
                        <td>{formatDate(deposit.createdAt)}</td>
                        <td>
                          <span
                            className={`status-badge status-${deposit.status}`}
                          >
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add pagination only for "all" filter */}
                {filter === "all" && totalPages > 0 && (
                  <div className="pagination">
                    <button
                      className="page-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {totalPages} ({totalItems} deposits)
                    </span>
                    <button
                      className="page-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
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
                      {activeDeposit.user.name || activeDeposit.user.email}
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
                  {activeDeposit.proofOfPayment && (
                    <div className="proof-of-payment">
                      <h3>Proof of Payment</h3>
                      <div className="payment-proof-container">
                        <a
                          href={activeDeposit.proofOfPayment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="payment-proof-link"
                        >
                          View Payment Proof
                        </a>
                      </div>
                    </div>
                  )}
                  {activeDeposit.status !== "pending" && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Reviewed By:</span>
                        <span className="detail-value">
                          {activeDeposit.approvedBy?.email || "N/A"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          Assigned Investment Plan:
                        </span>
                        <span className="detail-value">
                          {activeDeposit.assignedPlan?.name || "N/A"}
                        </span>
                      </div>
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

                {activeDeposit.status === "pending" && (
                  <div className="review-form">
                    <h3>Review Deposit</h3>
                    <div className="form-group">
                      <label htmlFor="editAmount">Amount ($)</label>
                      <input
                        id="editAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editedAmount}
                        onChange={(e) =>
                          setEditedAmount(parseFloat(e.target.value))
                        }
                      />
                      <p className="form-hint">
                        You can adjust the amount if needed
                      </p>
                    </div>
                    <div className="form-group">
                      <label htmlFor="investmentPlan">
                        Select Investment Plan
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
                    <div className="form-group">
                      <label htmlFor="adminNotes">Admin Notes (Optional)</label>
                      <textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this review..."
                        rows="3"
                      />
                    </div>
                    <div className="modal-actions">
                      <button
                        className="reject-button"
                        onClick={() => handleReviewSubmit("rejected")}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Reject"}
                      </button>
                      <button
                        className="approve-button"
                        onClick={() => handleReviewSubmit("approved")}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Approve"}
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
