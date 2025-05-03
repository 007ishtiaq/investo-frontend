import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ArrowDown, ArrowUp, DollarSign, Search, FilterX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import "./History.css";

// Sample transaction data for demonstration purposes
const SAMPLE_TRANSACTIONS = [
  {
    id: 1,
    type: "deposit",
    amount: 5000.0,
    description: "Initial deposit",
    createdAt: "2025-01-15T10:30:00Z",
    walletId: 1,
  },
  {
    id: 2,
    type: "earning",
    amount: 15.0,
    description: "Daily return - Starter Plan",
    createdAt: "2025-01-16T00:00:00Z",
    walletId: 1,
  },
  {
    id: 3,
    type: "earning",
    amount: 15.0,
    description: "Daily return - Starter Plan",
    createdAt: "2025-01-17T00:00:00Z",
    walletId: 1,
  },
  {
    id: 4,
    type: "deposit",
    amount: 2500.0,
    description: "Additional investment",
    createdAt: "2025-01-20T14:25:00Z",
    walletId: 1,
  },
  {
    id: 5,
    type: "earning",
    amount: 22.5,
    description: "Daily return - Standard Plan",
    createdAt: "2025-01-21T00:00:00Z",
    walletId: 1,
  },
  {
    id: 6,
    type: "withdraw",
    amount: -1000.0,
    description: "Partial withdrawal",
    createdAt: "2025-02-01T09:45:00Z",
    walletId: 1,
  },
  {
    id: 7,
    type: "earning",
    amount: 19.5,
    description: "Daily return - Standard Plan",
    createdAt: "2025-02-02T00:00:00Z",
    walletId: 1,
  },
  {
    id: 8,
    type: "deposit",
    amount: 10000.0,
    description: "Premium plan upgrade",
    createdAt: "2025-02-15T11:20:00Z",
    walletId: 1,
  },
  {
    id: 9,
    type: "earning",
    amount: 131.25,
    description: "Daily return - Premium Plan",
    createdAt: "2025-02-16T00:00:00Z",
    walletId: 1,
  },
  {
    id: 10,
    type: "earning",
    amount: 131.25,
    description: "Daily return - Premium Plan",
    createdAt: "2025-02-17T00:00:00Z",
    walletId: 1,
  },
  {
    id: 11,
    type: "withdraw",
    amount: -2500.0,
    description: "Monthly profit withdrawal",
    createdAt: "2025-03-01T10:15:00Z",
    walletId: 1,
  },
];

const TransactionTypeIcon = ({ type }) => {
  if (type === "deposit") {
    return (
      <div className="transaction-icon transaction-icon-deposit">
        <ArrowDown className="transaction-icon-svg" />
      </div>
    );
  } else if (type === "withdraw") {
    return (
      <div className="transaction-icon transaction-icon-withdraw">
        <ArrowUp className="transaction-icon-svg" />
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
  // Use the sample data or data from wallet context
  const transactions = SAMPLE_TRANSACTIONS;
  const loading = false;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filter !== "all" && transaction.type !== filter) {
      return false;
    }

    // Filter by search term
    if (
      search &&
      !transaction.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

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
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="empty-message">
              No transactions found matching your criteria
            </div>
          ) : (
            <div className="table-container">
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
                    const isPositive = amount > 0;

                    let type = "Transaction";
                    if (transaction.type === "deposit") {
                      type = "Deposit";
                    } else if (transaction.type === "withdraw") {
                      type = "Withdrawal";
                    } else if (transaction.type === "earning") {
                      type = "Earnings";
                    }

                    return (
                      <tr key={transaction.id}>
                        <td>
                          <div className="transaction-type">
                            <TransactionTypeIcon type={transaction.type} />
                            <span>{type}</span>
                          </div>
                        </td>
                        <td>{transaction.description || type}</td>
                        <td>{formatDate(transaction.createdAt)}</td>
                        <td
                          className={`amount-cell ${
                            isPositive ? "amount-positive" : "amount-negative"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {Math.abs(amount).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default History;
