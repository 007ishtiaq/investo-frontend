import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  ArrowUp,
  DollarSign,
  Users,
  XCircle,
  Clock,
} from "lucide-react";
import { useSelector } from "react-redux";
import { getTransactionHistory } from "../../functions/wallet";
import toast from "react-hot-toast";
import "./RecentTransactions.css";

const TransactionIcon = ({ type, source, status }) => {
  // For pending transactions
  if (status === "pending") {
    return (
      <div className="transaction-icon pending-icon">
        <Clock className="icon-inner" />
      </div>
    );
  }

  // For rejected transactions (both deposit and withdrawal)
  if (status === "failed" || status === "rejected") {
    return (
      <div className="transaction-icon rejected-icon">
        <XCircle className="icon-inner" />
      </div>
    );
  }

  // For normal transactions (existing logic)
  if (type === "credit" && source === "deposit") {
    return (
      <div className="transaction-icon deposit-icon">
        <ArrowDown className="icon-inner" />
      </div>
    );
  } else if (type === "debit") {
    return (
      <div className="transaction-icon withdraw-icon">
        <ArrowUp className="icon-inner" />
      </div>
    );
  } else if (source === "referral") {
    return (
      <div className="transaction-icon referral-icon">
        <Users className="icon-inner" />
      </div>
    );
  } else {
    return (
      <div className="transaction-icon earning-icon">
        <DollarSign className="icon-inner" />
      </div>
    );
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
};

const TransactionItem = ({ transaction }) => {
  const amount = parseFloat(transaction.amount);
  const isPositive = transaction.type === "credit";
  const isPending = transaction.status === "pending";

  let title = "Transaction";
  if (transaction.source === "deposit") {
    if (transaction.status === "pending") {
      title = "Deposit Under Verification";
    } else if (
      transaction.status === "failed" ||
      transaction.status === "rejected"
    ) {
      title = "Rejected Deposit";
    } else {
      title = "Deposit";
    }
  } else if (transaction.source === "withdrawal") {
    // Only show "Withdrawal" for actual withdrawals
    title =
      transaction.status === "failed" || transaction.status === "rejected"
        ? "Rejected Withdrawal"
        : "Withdrawal";
  } else if (transaction.type === "debit" && transaction.source === "other") {
    // Plan purchases and other debit transactions show as "Transaction"
    title = "Transaction";
  } else if (transaction.source === "task_reward") {
    title = "Task Reward";
  } else if (transaction.source === "referral") {
    title = "Referral Bonus";
  } else if (transaction.source === "bonus") {
    title = "Bonus";
  }

  return (
    <div className="transaction-item">
      <TransactionIcon
        type={transaction.type}
        source={transaction.source}
        status={transaction.status}
      />
      <div className="transaction-content">
        <div className="transaction-details">
          <div>
            <p className="transaction-title">
              {title}
              {isPending && (
                <span className="transaction-status-badge pending">
                  Pending
                </span>
              )}
            </p>
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
          </div>
          <span
            className={`transaction-amount ${
              isPositive ? "amount-positive" : "amount-negative"
            } ${isPending ? "amount-pending" : ""}`}
          >
            {isPositive ? "+" : "-"}
            {Math.abs(amount).toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
};

const RecentTransactions = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user && user.token) {
        try {
          setLoading(true);
          const res = await getTransactionHistory(user.token, 1, 6);
          setTransactions(res.data.transactions);
          setLoading(false);
        } catch (err) {
          console.error("Error loading transactions:", err);
          toast.error("Failed to load recent transactions");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="transactions-header">
          <div className="transactions-header-content">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="transactions-loading-view"></div>
          </div>
        </CardHeader>
        <CardContent className="transactions-content-padding-none">
          <div className="transactions-loading">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="transaction-loading-item">
                <div className="transaction-loading-content">
                  <div className="transaction-loading-icon"></div>
                  <div className="transaction-loading-details">
                    <div className="transaction-loading-info">
                      <div>
                        <div className="transaction-loading-title"></div>
                        <div className="transaction-loading-description"></div>
                      </div>
                      <div className="transaction-loading-amount"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="transactions-header">
        <div className="transactions-header-content">
          <CardTitle>Recent Transactions</CardTitle>
          <Link to="/history">
            <div className="transactions-view-all">
              <span>View All</span>
              <ArrowRight className="transactions-arrow-icon" />
            </div>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="transactions-content-padding-none">
        {transactions.length === 0 ? (
          <div className="transactions-empty">No transactions yet</div>
        ) : (
          transactions.map((transaction) => (
            <TransactionItem key={transaction._id} transaction={transaction} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
