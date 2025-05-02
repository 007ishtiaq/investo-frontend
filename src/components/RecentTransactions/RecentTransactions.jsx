import React from "react";
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
} from "lucide-react";

import "./RecentTransactions.css";

const TransactionIcon = ({ type }) => {
  if (type === "deposit") {
    return (
      <div className="transaction-icon deposit-icon">
        <ArrowDown className="icon-inner" />
      </div>
    );
  } else if (type === "withdraw") {
    return (
      <div className="transaction-icon withdraw-icon">
        <ArrowUp className="icon-inner" />
      </div>
    );
  } else if (type === "referral") {
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
  const isPositive = amount > 0;

  let title = "Transaction";
  if (transaction.type === "deposit") {
    title = "Deposit";
  } else if (transaction.type === "withdraw") {
    title = "Withdrawal";
  } else if (transaction.type === "earning") {
    title = "Daily Earnings";
  } else if (transaction.type === "referral") {
    title = "Referral Bonus";
  }

  return (
    <div className="transaction-item">
      <TransactionIcon type={transaction.type} />
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
          </div>
          <span
            className={`transaction-amount ${
              isPositive ? "amount-positive" : "amount-negative"
            }`}
          >
            {isPositive ? "+" : ""}
            {amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

// demo data
const defaultWallet = {
  id: 1,
  userId: 1,
  balance: "5280.00",
  createdAt: new Date(),
};

const transactions = [
  {
    id: 1,
    walletId: "abc123",
    type: "deposit",
    amount: "1000.00",
    description: "Initial deposit - Standard Plan",
    createdAt: "2025-01-13T00:00:00.000Z",
  },
  {
    id: 2,
    walletId: "abc123",
    type: "earning",
    amount: "5.00",
    description: "Daily earnings - Standard Plan",
    createdAt: "2025-01-14T00:00:00.000Z",
  },
  {
    id: 3,
    walletId: "abc123",
    type: "earning",
    amount: "5.03",
    description: "Daily earnings - Standard Plan",
    createdAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: 17,
    walletId: "abc123",
    type: "deposit",
    amount: "2500.00",
    description: "Additional investment - Premium Plan upgrade",
    createdAt: "2025-01-29T00:00:00.000Z",
  },
  {
    id: 18,
    walletId: "abc123",
    type: "earning",
    amount: "28.00",
    description: "Daily earnings - Premium Plan",
    createdAt: "2025-01-30T00:00:00.000Z",
  },
  {
    id: 38,
    walletId: "abc123",
    type: "withdraw",
    amount: "-500.00",
    description: "Partial withdrawal - Premium Plan",
    createdAt: "2025-02-19T00:00:00.000Z",
  },
  {
    id: 63,
    walletId: "abc123",
    type: "deposit",
    amount: "5000.00",
    description: "Additional investment - Gold Plan upgrade",
    createdAt: "2025-03-01T00:00:00.000Z",
  },
  {
    id: 79,
    walletId: "abc123",
    type: "referral",
    amount: "250.00",
    description: "Referral bonus - Jane Smith joined",
    createdAt: "2025-03-17T00:00:00.000Z",
  },
  {
    id: 92,
    walletId: "abc123",
    type: "earning",
    amount: "95.48",
    description: "Daily earnings - Gold Plan",
    createdAt: "2025-04-12T00:00:00.000Z",
  },
];

const RecentTransactions = () => {
  // here will be correct statement
  // const transactions = transactions || [];
  const loading = !defaultWallet ? true : false;

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
          transactions
            .slice(0, 5)
            .map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
