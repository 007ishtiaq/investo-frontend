import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import WalletOverview from "../../components/WalletOverview/WalletOverview";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import InvestmentPlans from "../../components/InvestmentPlans/InvestmentPlans";
import { getCurrentUser } from "../../functions/user";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.token) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser(user.token);
      setUserData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load user data:", err);
      toast.error("Failed to load user information");
      setLoading(false);
    }
  };

  if (loading || !userData) {
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
          <h1 className="dashboard-title">Welcome, {userData.name}!</h1>
          <p className="dashboard-subtitle">
            Here's your investment overview
            <span className="affiliate-code-badge">
              Affiliate Code: {userData.affiliateCode}
            </span>
          </p>
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
