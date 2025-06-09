// client/src/pages/Wallet.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { getUserWallet, getTransactionHistory } from "../functions/wallet";
import { EthereumIcon } from "../utils/icons";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Users,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Filter,
} from "lucide-react";
import NoNetModal from "../components/NoNetModal/NoNetModal";
import "./Wallet.css";

const TransactionTypeIcon = ({ type, source, status }) => {
  // For pending transactions (both deposits and withdrawals)
  if (status === "pending") {
    return (
      <div className="transaction-icon transaction-icon-pending">
        <Clock className="transaction-icon-svg" />
      </div>
    );
  }

  // For rejected transactions
  if (status === "failed" || status === "rejected") {
    if (source === "deposit") {
      return (
        <div className="transaction-icon transaction-icon-rejected-deposit">
          <XCircle className="transaction-icon-svg" />
        </div>
      );
    } else if (source === "withdrawal") {
      return (
        <div className="transaction-icon transaction-icon-rejected-withdrawal">
          <AlertTriangle className="transaction-icon-svg" />
        </div>
      );
    }
  }

  // For normal transactions
  if (type === "credit" && source === "deposit") {
    return (
      <div className="transaction-icon transaction-icon-deposit">
        <ArrowDown className="transaction-icon-svg" />
      </div>
    );
  } else if (type === "debit") {
    return (
      <div className="transaction-icon transaction-icon-withdraw">
        <ArrowUp className="transaction-icon-svg" />
      </div>
    );
  } else if (source === "referral") {
    return (
      <div className="transaction-icon transaction-icon-referral">
        <Users className="transaction-icon-svg" />
      </div>
    );
  } else {
    return (
      <div className="transaction-icon transaction-icon-earning">
        <DollarSign className="transaction-icon-svg" />
      </div>
    );
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Wallet = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  useEffect(() => {
    if (!user || !user.token) return;

    loadWallet();
    loadTransactions(1);
  }, [user]);

  const loadWallet = async () => {
    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await getUserWallet(user.token);
      setWallet(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error loading wallet:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        setError("Failed to load wallet information");
        toast.error("Failed to load wallet information");
      }
    }
  };

  const loadTransactions = async (page) => {
    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    try {
      const res = await getTransactionHistory(user.token, page, 5); // Show only 5 transactions on wallet page
      setTransactions(res.data.transactions);
      setCurrentPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Error loading transactions:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error("Failed to load transaction history");
      }
    }
  };

  const handlePageChange = (page) => {
    // Check network status before changing page
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    setCurrentPage(page);
    loadTransactions(page);
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      if (user && user.token) {
        if (!wallet) {
          loadWallet();
        }
        if (transactions.length === 0) {
          loadTransactions(1);
        }
      }
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  const handleRedirectToHistory = () => {
    // Check network status before redirecting
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    window.location.href = "/history";
  };

  if (!user || !user.token) {
    return (
      <>
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

        <NoNetModal
          classDisplay={noNetModal ? "show" : ""}
          setNoNetModal={setNoNetModal}
          handleRetry={handleRetry}
        />
      </>
    );
  }

  return (
    <>
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
                  <div className="balance-amount-wallet">
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

              {/* History Redirect Section */}
              <div className="history-redirect-section">
                <div className="history-redirect-content">
                  <div className="history-redirect-text">
                    <Filter className="history-redirect-icon" />
                    <div>
                      <h3>Need More History & Filtering?</h3>
                      <p>
                        View complete transaction history with advanced filters,
                        search functionality, and detailed insights.
                      </p>
                    </div>
                  </div>
                  <button
                    className="history-redirect-button"
                    onClick={handleRedirectToHistory}
                  >
                    <span>Go to History</span>
                  </button>
                </div>
              </div>

              {/* Recent Transactions Section */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h2>Recent Transactions</h2>
                  <span className="transactions-subtitle">
                    Showing latest 5 transactions
                  </span>
                </div>

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
                    <div className="transactions-container">
                      {/* Desktop view - Table */}
                      <div className="desktop-view">
                        <table className="transaction-table">
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Description</th>
                              <th>Date</th>
                              <th className="amount-column">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction) => {
                              const amount = parseFloat(transaction.amount);

                              // Updated logic for amount styling
                              let isPositive;
                              const isPending =
                                transaction.status === "pending";
                              const isRejected =
                                transaction.status === "failed" ||
                                transaction.status === "rejected";

                              // For rejected deposits, treat as negative (show red)
                              if (
                                isRejected &&
                                transaction.source === "deposit"
                              ) {
                                isPositive = false;
                              }
                              // For rejected withdrawals, also treat as negative (show red)
                              else if (
                                isRejected &&
                                transaction.source === "withdrawal"
                              ) {
                                isPositive = false;
                              }
                              // For normal transactions, use the original logic
                              else {
                                isPositive = transaction.type === "credit";
                              }

                              let type = "Transaction";
                              if (transaction.source === "deposit") {
                                if (transaction.status === "pending") {
                                  type = "Deposit Under Verification";
                                } else if (
                                  transaction.status === "failed" ||
                                  transaction.status === "rejected"
                                ) {
                                  type = "Rejected Deposit";
                                } else {
                                  type = "Deposit";
                                }
                              } else if (transaction.source === "withdrawal") {
                                if (transaction.status === "pending") {
                                  type = "Withdrawal Under Verification";
                                } else if (
                                  transaction.status === "failed" ||
                                  transaction.status === "rejected"
                                ) {
                                  type = "Rejected Withdrawal";
                                } else {
                                  type = "Withdrawal";
                                }
                              } else if (transaction.source === "task_reward") {
                                type = "Task Reward";
                              } else if (transaction.source === "referral") {
                                type = "Referral Bonus";
                              } else if (transaction.source === "bonus") {
                                type = "Bonus";
                              }

                              return (
                                <tr
                                  key={transaction._id}
                                  className={`transaction-row ${
                                    isPending ? "pending-row" : ""
                                  }`}
                                >
                                  <td className="type-cell">
                                    <div className="type-content">
                                      <TransactionTypeIcon
                                        type={transaction.type}
                                        source={transaction.source}
                                        status={transaction.status}
                                      />
                                      <span className="type-text">{type}</span>
                                    </div>
                                  </td>
                                  <td className="description-cell">
                                    <span className="description-text">
                                      {transaction.description}
                                    </span>
                                  </td>
                                  <td className="date-cell">
                                    <span className="date-text">
                                      {formatDate(transaction.createdAt)}
                                    </span>
                                  </td>
                                  <td className="amount-cell">
                                    <span
                                      className={`amount-text ${
                                        isPositive ? "positive" : "negative"
                                      } ${isPending ? "pending-amount" : ""}`}
                                    >
                                      {/* Show + for successful credits, - for everything else */}
                                      {isPositive && !isRejected ? "+" : "-"}$
                                      {amount.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile view - Cards */}
                      <div className="mobile-view">
                        {transactions.map((transaction) => {
                          const amount = parseFloat(transaction.amount);

                          // Updated logic for amount styling (same as desktop)
                          let isPositive;
                          const isPending = transaction.status === "pending";
                          const isRejected =
                            transaction.status === "failed" ||
                            transaction.status === "rejected";

                          // For rejected deposits, treat as negative (show red)
                          if (isRejected && transaction.source === "deposit") {
                            isPositive = false;
                          }
                          // For rejected withdrawals, also treat as negative (show red)
                          else if (
                            isRejected &&
                            transaction.source === "withdrawal"
                          ) {
                            isPositive = false;
                          }
                          // For normal transactions, use the original logic
                          else {
                            isPositive = transaction.type === "credit";
                          }

                          let type = "Transaction";
                          if (transaction.source === "deposit") {
                            if (transaction.status === "pending") {
                              type = "Deposit Under Verification";
                            } else if (
                              transaction.status === "failed" ||
                              transaction.status === "rejected"
                            ) {
                              type = "Rejected Deposit";
                            } else {
                              type = "Deposit";
                            }
                          } else if (transaction.source === "withdrawal") {
                            if (transaction.status === "pending") {
                              type = "Withdrawal Under Verification";
                            } else if (
                              transaction.status === "failed" ||
                              transaction.status === "rejected"
                            ) {
                              type = "Rejected Withdrawal";
                            } else {
                              type = "Withdrawal";
                            }
                          } else if (transaction.source === "task_reward") {
                            type = "Task Reward";
                          } else if (transaction.source === "referral") {
                            type = "Referral Bonus";
                          } else if (transaction.source === "bonus") {
                            type = "Bonus";
                          }

                          return (
                            <div
                              key={transaction._id}
                              className={`transaction-card ${
                                isPending ? "pending-card" : ""
                              }`}
                            >
                              <div className="transaction-card-header">
                                <div className="transaction-card-type">
                                  <TransactionTypeIcon
                                    type={transaction.type}
                                    source={transaction.source}
                                    status={transaction.status}
                                  />
                                  <span className="transaction-card-type-text">
                                    {type}
                                  </span>
                                </div>
                                <span
                                  className={`transaction-card-amount ${
                                    isPositive ? "positive" : "negative"
                                  } ${isPending ? "pending-amount" : ""}`}
                                >
                                  {/* Show + for successful credits, - for everything else */}
                                  {isPositive && !isRejected ? "+" : "-"}$
                                  {amount.toFixed(2)}
                                </span>
                              </div>
                              <div className="transaction-card-body">
                                <div className="transaction-card-description">
                                  {transaction.description}
                                </div>
                                <div className="transaction-card-date">
                                  {formatDate(transaction.createdAt)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Wallet;
