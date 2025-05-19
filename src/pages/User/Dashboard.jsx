import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import WalletOverview from "../../components/WalletOverview/WalletOverview";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import InvestmentPlans from "../../components/InvestmentPlans/InvestmentPlans";
import { getCurrentUser } from "../../functions/user";
import { useSelector, useDispatch } from "react-redux";
import { Copy, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && user.token) {
      loadUserData();
    }
  }, [user]);

  const handleLogout = () => {
    // Clean up Redux state
    dispatch({
      type: "LOGOUT",
      payload: null,
    });

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }

    // Redirect to login using window.location
    window.location.href = "/login";
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser(user.token);
      // console.log("User data:", res.data);
      setUserData(res.data);
      setLoading(false);
    } catch (err) {
      // console.error("Failed to load user data:", err);
      toast.error("Failed to load user information");
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
      setLoading(false);
    }
  };

  const copyAffiliateCode = () => {
    if (userData?.affiliateCode) {
      navigator.clipboard.writeText(userData.affiliateCode);
      toast.success("Affiliate code copied to clipboard!");
    }
  };

  // Get level color based on user level
  const getLevelColor = (level) => {
    switch (level) {
      case 1:
        return "level-1";
      case 2:
        return "level-2";
      case 3:
        return "level-3";
      case 4:
        return "level-4";
      default:
        return "level-1";
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  if (loading || !userData) {
    return (
      <div className="dashboard-loading">
        <Card className="dashboard-card margin-bottom">
          <CardContent className="card-content-padding">
            <div className="loading-profile-area">
              <div className="loading-avatar"></div>
              <div className="loading-details">
                <div className="loading-title"></div>
                <div className="loading-subtitle"></div>
              </div>
            </div>
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
      {/* Dashboard Profile Area */}
      <Card className="margin-bottom profile-card">
        <CardContent className="card-content-padding profile-content">
          <div className="profile-area">
            <div className="profile-avatar-container">
              <div
                className="profile-avatar-fallback"
                style={{
                  backgroundImage: userData.profileImage
                    ? `url(${userData.profileImage})`
                    : "",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!userData.profileImage && getUserInitials(userData.name)}
              </div>
              <Link to="/profile" className="profile-edit-button">
                <Edit2 size={14} />
              </Link>
            </div>

            <div className="profile-details">
              <h1 className="profile-name">{userData.name}</h1>
              <div className="profile-meta">
                <span className="profile-email">{userData.email}</span>
                <div className="profile-level-text">
                  Level {userData.level} Investor
                </div>
              </div>
            </div>

            <div className="profile-affiliate">
              <div className="affiliate-header">Your Affiliate Code</div>
              <div className="affiliate-code-container-dashboard">
                <div className="affiliate-code">{userData.affiliateCode}</div>
                <button className="copy-button" onClick={copyAffiliateCode}>
                  <Copy size={16} />
                </button>
              </div>
              <div className="affiliate-help">Share to earn commissions</div>
            </div>
          </div>
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
