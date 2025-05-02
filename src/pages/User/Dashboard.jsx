import React, { useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import WalletOverview from "../../components/WalletOverview/WalletOverview";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import InvestmentPlans from "../../components/InvestmentPlans/InvestmentPlans";
import "./Dashboard.css";

// demo data
const Userjohn = {
  id: 1,
  username: "john",
  password: "password",
  name: "John Doe",
  email: "john@example.com",
  profileImage: "https://i.pravatar.cc/300?img=68", // Adding a profile image
  createdAt: new Date(),
};
const defaultWallet = {
  id: 1,
  userId: 1,
  balance: "5280.00",
  createdAt: new Date(),
};

const Dashboard = () => {
  const user = Userjohn || { name: "User" };
  const loading = !defaultWallet ? true : false;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Card className="dashboard-card margin-bottom">
          <CardContent className="card-content-padding">
            <div className="loading-title"></div>
            <div className="loading-subtitle"></div>
          </CardContent>
        </Card>

        {/* Skeleton for wallet overview */}
        <div className="wallet-overview-grid margin-bottom">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="card-content-padding">
                <div className="loading-wallet-card"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton for chart */}
        <Card className="margin-bottom">
          <CardContent className="card-content-padding">
            <div className="loading-chart"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Welcome */}
      <Card className="margin-bottom">
        <CardContent className="card-content-padding">
          <h1 className="dashboard-title">Welcome, {user.name}!</h1>
          <p className="dashboard-subtitle">Here's your investment overview</p>
        </CardContent>
      </Card>

      {/* Wallet Overview */}
      <WalletOverview />

      {/* Recent Transactions and Investment Plans */}
      <div className="dashboard-grid margin-top">
        <RecentTransactions />
        <InvestmentPlans />
      </div>
    </>
  );
};

export default Dashboard;
