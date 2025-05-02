import React from "react";
import { Wallet2, Coins, DollarSign, ArrowUp } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import "./WalletOverview.css";

// demo data
const defaultWallet = {
  id: 1,
  userId: 1,
  balance: "5280.00",
  createdAt: new Date(),
};

const WalletOverview = () => {
  const wallet = defaultWallet || null;
  const loading = !defaultWallet ? true : false;
  const getStats = () => ({
    dailyEarnings: "0.00",
    totalEarnings: "0.00",
    percentChange: "0.00",
  });

  if (loading || !wallet) {
    return (
      <div className="wallet-overview-grid">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="wallet-card">
            <CardContent className="wallet-card-content">
              <div className="wallet-skeleton">
                <div className="wallet-skeleton-header">
                  <div className="wallet-skeleton-title"></div>
                  <div className="wallet-skeleton-icon"></div>
                </div>
                <div className="wallet-skeleton-amount"></div>
                <div className="wallet-skeleton-bar"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { dailyEarnings, totalEarnings, percentChange } = getStats();

  return (
    <div className="wallet-overview-grid">
      {/* Wallet Balance */}
      <Card className="wallet-card">
        <CardContent className="wallet-card-content">
          <div className="wallet-card-header">
            <h2 className="wallet-card-title">Wallet Balance</h2>
            <Wallet2 className="wallet-card-icon primary-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              ${parseFloat(wallet.balance).toFixed(2)}
            </span>
            <span className="wallet-percent positive">
              <ArrowUp className="wallet-arrow-icon" />
              <span>{percentChange}%</span>
            </span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill primary-gradient"
                style={{ width: "75%" }}
              ></div>
            </div>
            <div className="wallet-progress-text">Daily growth target: 75%</div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Earnings */}
      <Card className="wallet-card">
        <CardContent className="wallet-card-content">
          <div className="wallet-card-header">
            <h2 className="wallet-card-title">Daily Earnings</h2>
            <Coins className="wallet-card-icon yellow-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              ${parseFloat(dailyEarnings).toFixed(2)}
            </span>
            <span className="wallet-rate">@ 0.5% daily</span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>Today</span>
              <span>vs Yesterday</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill yellow-green-gradient"
                style={{ width: "50%" }}
              ></div>
            </div>
            <div className="wallet-progress-text">
              ${parseFloat(dailyEarnings).toFixed(2)} vs $
              {(parseFloat(dailyEarnings) * 0.95).toFixed(2)} (+5.2%)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Earnings */}
      <Card className="wallet-card">
        <CardContent className="wallet-card-content">
          <div className="wallet-card-header">
            <h2 className="wallet-card-title">Total Earnings</h2>
            <DollarSign className="wallet-card-icon green-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              ${parseFloat(totalEarnings).toFixed(2)}
            </span>
            <span className="wallet-percent positive">
              <ArrowUp className="wallet-arrow-icon" />
              <span>6.2%</span>
            </span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>This Month</span>
              <span>All Time</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill green-primary-gradient"
                style={{ width: "25%" }}
              ></div>
            </div>
            <div className="wallet-progress-text">
              ${(parseFloat(totalEarnings) * 0.44).toFixed(2)} of $
              {parseFloat(totalEarnings).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletOverview;
