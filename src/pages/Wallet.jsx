// client/src/pages/Wallet.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { getUserWallet, getTransactionHistory } from "../functions/wallet";
import { EthereumIcon } from "../utils/icons";
import "./Wallet.css";

const Wallet = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user || !user.token) return;

    loadWallet();
    loadTransactions(1);
  }, [user]);

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getUserWallet(user.token);
      setWallet(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error loading wallet:", err);
      setError("Failed to load wallet information");
      toast.error("Failed to load wallet information");
    }
  };

  const loadTransactions = async (page) => {
    try {
      const res = await getTransactionHistory(user.token, page, 10);
      setTransactions(res.data.transactions);
      setCurrentPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load transaction history");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  const getTransactionIcon = (type, source) => {
    if (type === "credit") {
      if (source === "task_reward") return "🏆";
      if (source === "referral") return "👥";
      if (source === "bonus") return "🎁";
      return "⬆️";
    } else {
      return "⬇️";
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadTransactions(page);
  };

  if (!user || !user.token) {
    return (
      <div className="wallet-page">
        <div className="container">
          <div className="auth-message">
            <h2>Please Login</h2>
            <p>You need to be logged in to view your wallet.</p>
            <a href="/login" className="auth-button">
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />

      <div className="container">
        <h1 className="page-title">Your Wallet</h1>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading wallet information...</p>
          </div>
        ) : wallet ? (
          <>
            <div className="wallet-card">
              <div className="wallet-balance-section">
                <div className="balance-label">Available Balance</div>
                <div className="balance-amount">
                  <EthereumIcon size={24} />
                  <span>${wallet.balance.toFixed(3)} USD</span>
                </div>
                <div className="wallet-info">
                  <div className="wallet-id">Wallet ID: {wallet._id}</div>
                  <div className="last-updated">
                    Last updated: {formatDate(wallet.lastUpdated)}
                  </div>
                </div>
              </div>
            </div>

            <div className="transactions-section">
              <h2>Transaction History</h2>

              {transactions.length === 0 ? (
                <div className="no-transactions">
                  <p>No transactions found in your wallet yet.</p>
                  <p>
                    Complete tasks to earn rewards and see your transaction
                    history here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="transactions-list">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className={`transaction-item ${transaction.type}`}
                      >
                        <div className="transaction-icon">
                          {getTransactionIcon(
                            transaction.type,
                            transaction.source
                          )}
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-description">
                            {transaction.description}
                          </div>
                          <div className="transaction-meta">
                            <span className="transaction-date">
                              {formatDate(transaction.createdAt)}
                            </span>
                            <span className="transaction-source">
                              {transaction.source
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`transaction-amount ${
                            transaction.type === "credit" ? "credit" : "debit"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}$
                          {transaction.amount.toFixed(3)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="page-button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        &lt; Previous
                      </button>
                      <div className="page-info">
                        Page {currentPage} of {totalPages}
                      </div>
                      <button
                        className="page-button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next &gt;
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="no-wallet">
            <p>No wallet information available. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
