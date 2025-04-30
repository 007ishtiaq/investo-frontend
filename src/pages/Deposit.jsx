// client/src/pages/Deposit.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  getUserDeposits,
  submitDeposit,
  getStatusBadgeClass,
  formatPaymentMethod,
} from "../functions/deposit";
import toast from "react-hot-toast";
import "./Deposit.css";

const Deposit = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const data = await getUserDeposits(user.token);
      setDeposits(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Error loading deposit history");
      setLoading(false);
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

    if (!amount || !paymentMethod || !screenshot) {
      return toast.error(
        "Please fill all required fields and upload a screenshot"
      );
    }

    try {
      setLoading(true);
      setUploading(true);

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

      // Reload deposits
      loadDeposits();

      toast.success("Deposit request submitted successfully");
      setUploading(false);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Failed to submit deposit request");
      setUploading(false);
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "badge-success";
      case "rejected":
        return "badge-danger";
      default:
        return "badge-warning";
    }
  };

  return (
    <div className="deposit-page">
      <div className="container">
        <div className="page-header">
          <h1>Deposit Funds</h1>
          <p>
            Deposit funds to invest in our plans. Upload proof of payment for
            verification.
          </p>
        </div>

        <div className="deposit-grid">
          <div className="deposit-form-container">
            <h2>Make a Deposit</h2>
            <form onSubmit={handleSubmit} className="deposit-form">
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
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="litecoin">Litecoin</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

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

              {previewUrl && (
                <div className="screenshot-preview">
                  <img src={previewUrl} alt="Payment proof" />
                </div>
              )}

              <div className="payment-instructions">
                <h3>Payment Instructions</h3>
                {paymentMethod === "bitcoin" && (
                  <div className="payment-address">
                    <p>Bitcoin Address:</p>
                    <code>bc1q98y7heu5glx5q7v93qjh0x9dsw29ruvjz35g7k</code>
                  </div>
                )}
                {paymentMethod === "ethereum" && (
                  <div className="payment-address">
                    <p>Ethereum Address:</p>
                    <code>0x4A9E7A088D32B12218e9E67F56beF3A22E5D9298</code>
                  </div>
                )}
                {paymentMethod === "litecoin" && (
                  <div className="payment-address">
                    <p>Litecoin Address:</p>
                    <code>ltc1qz94vf5kj4eev3yn6xmc8c7pd2dtgr4uwxjq5sa</code>
                  </div>
                )}
                {paymentMethod === "bank_transfer" && (
                  <div className="bank-details">
                    <p>Bank: Global Investment Bank</p>
                    <p>Account Name: Investment Platform Inc.</p>
                    <p>Account Number: 1234567890</p>
                    <p>SWIFT/BIC: GIBAUS123</p>
                    <p>
                      Reference: Please include your username in the transfer
                      description.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading || uploading}
              >
                {loading || uploading
                  ? "Processing..."
                  : "Submit Deposit Request"}
              </button>
            </form>
          </div>

          <div className="deposit-history-container">
            <h2>Deposit History</h2>
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : deposits.length === 0 ? (
              <div className="no-deposits">
                <p>You haven't made any deposits yet.</p>
              </div>
            ) : (
              <div className="deposits-list">
                {deposits.map((deposit) => (
                  <div key={deposit._id} className="deposit-item">
                    <div className="deposit-info">
                      <div className="deposit-amount">
                        ${deposit.amount.toFixed(2)}
                      </div>
                      <div className="deposit-date">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </div>
                      <div
                        className={`deposit-status ${getStatusBadgeClass(
                          deposit.status
                        )}`}
                      >
                        {deposit.status.charAt(0).toUpperCase() +
                          deposit.status.slice(1)}
                      </div>
                    </div>
                    <div className="deposit-details">
                      <div className="detail-item">
                        <span className="detail-label">Payment Method:</span>
                        <span className="detail-value">
                          {deposit.paymentMethod.charAt(0).toUpperCase() +
                            deposit.paymentMethod.slice(1).replace("_", " ")}
                        </span>
                      </div>
                      {deposit.assignedPlan && (
                        <div className="detail-item">
                          <span className="detail-label">Assigned Plan:</span>
                          <span className="detail-value">
                            {deposit.assignedPlan.name}
                          </span>
                        </div>
                      )}
                      {deposit.adminNotes && (
                        <div className="detail-item">
                          <span className="detail-label">Admin Notes:</span>
                          <span className="detail-value">
                            {deposit.adminNotes}
                          </span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Screenshot:</span>
                        <a
                          href={deposit.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="screenshot-link"
                        >
                          View Screenshot
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
