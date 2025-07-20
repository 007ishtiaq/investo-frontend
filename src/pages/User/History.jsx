import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Search,
  FilterX,
  Users,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useSelector } from "react-redux";
import { getTransactionHistory } from "../../functions/wallet";
import toast from "react-hot-toast";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import "./History.css";
import "../Wallet.css";

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

const History = ({ refreshTrigger }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [noNetModal, setNoNetModal] = useState(false);
  const itemsPerPage = 10;

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

  // Load transactions when user, page, filter, or search changes
  useEffect(() => {
    if (user && user.token) {
      loadTransactions(currentPage);
    }
  }, [user, currentPage, filter, search]);

  // Add this to History.js
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadTransactions(currentPage);
    }
  }, [refreshTrigger]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filter, search]);

  const loadTransactions = async (page) => {
    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getTransactionHistory(
        user.token,
        page,
        itemsPerPage,
        filter,
        search
      );
      setTransactions(res.data.transactions);
      console.log("res.data.transactions", res.data.transactions);

      setCurrentPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
      setLoading(false);
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
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    // Check network status before changing page
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    setCurrentPage(page);
  };

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      if (user && user.token) {
        loadTransactions(currentPage);
      }
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilter("all");
    setSearch("");
    setCurrentPage(1);
  };

  if (!user || !user.token) {
    return (
      <>
        <div className="auth-message">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your transaction history.</p>
          <a href="/login" className="auth-button">
            Login
          </a>
        </div>

        <NoNetModal
          classDisplay={noNetModal ? "show" : ""}
          setNoNetModal={setNoNetModal}
          handleRetry={handleRetry}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="skeleton-container">
        <Card className="skeleton-header-card">
          <CardContent className="skeleton-header-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="skeleton-card-title"></div>
          </CardHeader>
          <CardContent>
            <div className="skeleton-table"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card className="history-header-card">
        <CardContent className="history-header-content">
          <h1 className="history-title">Transaction History</h1>
          <p className="history-description">
            View and filter all your wallet transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="history-filter-container">
            <CardTitle>All Transactions</CardTitle>
            <div className="filter-controls">
              <div className="filter-type-container">
                <Button
                  variant="outline"
                  size="icon"
                  className={`filter-reset-button ${
                    filter !== "all" || search !== ""
                      ? "filter-reset-button-active"
                      : ""
                  }`}
                  onClick={handleFilterReset}
                  disabled={filter === "all" && search === ""}
                >
                  {filter !== "all" || search !== "" ? (
                    <X className="filter-reset-icon" />
                  ) : (
                    <FilterX className="filter-reset-icon" />
                  )}
                </Button>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="filter-select">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdraw">Withdrawals</SelectItem>
                    <SelectItem value="earning">Earnings</SelectItem>
                    <SelectItem value="pending">
                      Pending Transactions
                    </SelectItem>
                    <SelectItem value="rejected">
                      Rejected Transactions
                    </SelectItem>
                    <SelectItem value="rejected_deposit">
                      Rejected Deposits
                    </SelectItem>
                    <SelectItem value="rejected_withdraw">
                      Rejected Withdrawals
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="search-container">
                <Search className="search-icon" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div> */}
              {/* <div className="search-container">
                <Search className="search-icon" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="history-content">
          {transactions.length === 0 ? (
            <div className="empty-message">
              No transactions found matching your criteria
            </div>
          ) : (
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
                  else if (isRejected && transaction.source === "withdrawal") {
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
          )}

          {/* Pagination */}
          {/* {totalPages > 1 && (
            <div className="pagination pagination-history">
              <Button
                variant="outline"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          )} */}
          {totalPages > 1 && (
            <div className="pagination pagination-history">
              <Button
                variant="outline"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <ChevronFirst className="pagination-icon" />
                <span className="pagination-text">First</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft className="pagination-icon" />
                <span className="pagination-text">Previous</span>
              </Button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                <span className="pagination-text">Next</span>
                <ChevronRight className="pagination-icon" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                <span className="pagination-text">Last</span>
                <ChevronLast className="pagination-icon" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default History;
