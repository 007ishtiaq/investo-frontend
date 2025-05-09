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
import "./History.css";

const TransactionTypeIcon = ({ type, source, status }) => {
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

const History = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user && user.token) {
      loadTransactions(currentPage);
    }
  }, [user, currentPage]);

  const loadTransactions = async (page) => {
    try {
      setLoading(true);
      const res = await getTransactionHistory(user.token, page, itemsPerPage);
      setTransactions(res.data.transactions);
      setCurrentPage(res.data.pagination.currentPage);
      setTotalPages(res.data.pagination.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Failed to load transaction history");
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filter transactions based on type, status, and search term
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type and status
    if (filter === "deposit" && transaction.source !== "deposit") {
      return false;
    }
    if (filter === "withdraw" && transaction.type !== "debit") {
      return false;
    }
    if (
      filter === "earning" &&
      transaction.source !== "task_reward" &&
      transaction.source !== "referral" &&
      transaction.source !== "bonus"
    ) {
      return false;
    }

    // New filter options for rejected transactions
    if (
      filter === "rejected" &&
      transaction.status !== "failed" &&
      transaction.status !== "rejected"
    ) {
      return false;
    }
    if (
      filter === "rejected_deposit" &&
      !(
        transaction.source === "deposit" &&
        (transaction.status === "failed" || transaction.status === "rejected")
      )
    ) {
      return false;
    }
    if (
      filter === "rejected_withdraw" &&
      !(
        transaction.source === "withdrawal" &&
        (transaction.status === "failed" || transaction.status === "rejected")
      )
    ) {
      return false;
    }

    if (
      filter !== "all" &&
      filter !== "deposit" &&
      filter !== "withdraw" &&
      filter !== "earning" &&
      filter !== "rejected" &&
      filter !== "rejected_deposit" &&
      filter !== "rejected_withdraw"
    ) {
      // If filter is not one of the predefined ones, don't filter
      return true;
    }

    // Filter by search term in description
    if (
      search &&
      !transaction.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  if (!user || !user.token) {
    return (
      <div className="auth-message">
        <h2>Please Login</h2>
        <p>You need to be logged in to view your transaction history.</p>
        <a href="/login" className="auth-button">
          Login
        </a>
      </div>
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
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="filter-select">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdraw">Withdrawals</SelectItem>
                    <SelectItem value="earning">Earnings</SelectItem>
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
                <Button
                  variant="outline"
                  size="icon"
                  className="filter-reset-button"
                  onClick={() => {
                    setFilter("all");
                    setSearch("");
                  }}
                  disabled={filter === "all" && search === ""}
                >
                  <FilterX className="filter-reset-icon" />
                </Button>
              </div>
              <div className="search-container">
                <Search className="search-icon" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="history-content">
          {filteredTransactions.length === 0 ? (
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
                    {filteredTransactions.map((transaction) => {
                      const amount = parseFloat(transaction.amount);
                      const isPositive = transaction.type === "credit";

                      let type = "Transaction";
                      if (transaction.source === "deposit") {
                        type =
                          transaction.status === "failed" ||
                          transaction.status === "rejected"
                            ? "Rejected Deposit"
                            : "Deposit";
                      } else if (transaction.type === "debit") {
                        type =
                          transaction.status === "failed" ||
                          transaction.status === "rejected"
                            ? "Rejected Withdrawal"
                            : "Withdrawal";
                      } else if (
                        transaction.source === "task_reward" ||
                        transaction.source === "referral" ||
                        transaction.source === "bonus"
                      ) {
                        type = "Earnings";
                      }

                      return (
                        <tr key={transaction._id}>
                          <td>
                            <div className="transaction-type">
                              <TransactionTypeIcon
                                type={transaction.type}
                                source={transaction.source}
                                status={transaction.status}
                              />
                              <span className="transaction-type-text">
                                {type}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="transaction-info">
                              <div className="transaction-description">
                                {transaction.description || type}
                              </div>
                              <span className="transaction-source">
                                {transaction.source
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            </div>
                          </td>
                          <td>{formatDate(transaction.createdAt)}</td>
                          <td
                            className={`amount-cell ${
                              isPositive ? "amount-positive" : "amount-negative"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {Math.abs(amount).toFixed(3)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Transaction Items like RecentTransactions */}
              <div className="mobile-view">
                {filteredTransactions.map((transaction) => {
                  const amount = parseFloat(transaction.amount);
                  const isPositive = transaction.type === "credit";

                  let title = "Transaction";
                  if (transaction.source === "deposit") {
                    title =
                      transaction.status === "failed" ||
                      transaction.status === "rejected"
                        ? "Rejected Deposit"
                        : "Deposit";
                  } else if (transaction.type === "debit") {
                    title =
                      transaction.status === "failed" ||
                      transaction.status === "rejected"
                        ? "Rejected Withdrawal"
                        : "Withdrawal";
                  } else if (transaction.source === "task_reward") {
                    title = "Task Reward";
                  } else if (transaction.source === "referral") {
                    title = "Referral Bonus";
                  } else if (transaction.source === "bonus") {
                    title = "Bonus";
                  }

                  return (
                    <div key={transaction._id} className="transaction-item">
                      <TransactionTypeIcon
                        type={transaction.type}
                        source={transaction.source}
                        status={transaction.status}
                      />
                      <div className="transaction-content">
                        <div className="transaction-details">
                          <div>
                            <p className="transaction-title">{title}</p>
                            <p className="transaction-description">
                              {transaction.description ? (
                                <span
                                  className="transaction-description-text"
                                  title={transaction.description}
                                >
                                  {transaction.description}
                                </span>
                              ) : null}
                              <span>{formatDate(transaction.createdAt)}</span>
                            </p>
                            <span className="transaction-source mobile-source">
                              {transaction.source
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </div>
                          <span
                            className={`transaction-amount ${
                              isPositive ? "amount-positive" : "amount-negative"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {Math.abs(amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default History;
