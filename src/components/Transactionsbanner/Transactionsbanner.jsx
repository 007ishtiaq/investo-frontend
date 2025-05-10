import React from "react";
import "./Transactionsbanner.css";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";

const Transactionsbanner = ({ transactions = [] }) => {
  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h2 className="transactions-title">Latest Transactions</h2>
        <a href="/transactions" className="view-all-link">
          View All <ExternalLink size={14} />
        </a>
      </div>

      <div className="transactions-list">
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <div key={index} className="transaction-item">
              <div className="transaction-icon-container">
                {transaction.type === "deposit" ? (
                  <ArrowDownRight
                    size={18}
                    className="transaction-icon deposit"
                  />
                ) : (
                  <ArrowUpRight
                    size={18}
                    className="transaction-icon withdraw"
                  />
                )}
              </div>
              <div className="transaction-info">
                <div className="transaction-top">
                  <h4 className="transaction-title">
                    {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                  </h4>
                  <span
                    className={`transaction-amount ${
                      transaction.type === "deposit" ? "deposit" : "withdraw"
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}$
                    {transaction.amount}
                  </span>
                </div>
                <div className="transaction-bottom">
                  <span className="transaction-user">{transaction.user}</span>
                  <span className="transaction-time">{transaction.time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-transactions">
            <div className="no-data-icon">$</div>
            <p>No recent transactions</p>
          </div>
        )}
      </div>

      <div className="transactions-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
      </div>
    </div>
  );
};

export default Transactionsbanner;
