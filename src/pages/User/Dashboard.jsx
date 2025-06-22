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
import NoNetModal from "../../components/NoNetModal/NoNetModal"; // Your existing import
import DepositModal from "../../components/DepositModal/DepositModal";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noNetModal, setNoNetModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const dispatch = useDispatch();

  // Add network status monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      console.log("Network came online");
      if (navigator.onLine) {
        setNoNetModal(false);
      }
    };

    const handleOfflineStatus = () => {
      console.log("Network went offline");
      setNoNetModal(true);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // Check initial status
    console.log("Initial network status:", navigator.onLine);
    if (!navigator.onLine) {
      console.log("Setting noNetModal to true");
      setNoNetModal(true);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  useEffect(() => {
    if (user && user.token) {
      loadUserData();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch({
      type: "LOGOUT",
      payload: null,
    });

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }

    window.location.href = "/login";
  };

  const handleOpenDepositModal = () => {
    // Check network status before opening deposit modal
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    setShowDepositModal(true);
  };

  const handleCloseDepositModal = () => {
    setShowDepositModal(false);
  };

  const loadUserData = async () => {
    // Check network status before making API call
    if (!navigator.onLine) {
      console.log("No internet, showing modal");
      setNoNetModal(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getCurrentUser(user.token);
      setUserData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("API Error:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        console.log("Network error detected, showing modal");
        setNoNetModal(true);
      } else {
        toast.error("Failed to load user information");
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
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

  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const handleRetry = () => {
    console.log("Retry clicked, network status:", navigator.onLine);
    if (navigator.onLine) {
      setNoNetModal(false);
      if (user && user.token && !userData) {
        loadUserData();
      }
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  // Add a manual test button (remove this after testing)
  const testModal = () => {
    console.log("Test button clicked");
    setNoNetModal(true);
  };

  console.log("Rendering Dashboard, noNetModal:", noNetModal);

  if (loading || !userData) {
    return (
      <>
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

          <div className="wallet-overview-grid margin-bottom">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="card-content-padding">
                  <div className="loading-wallet-card"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="margin-bottom">
            <CardContent className="card-content-padding">
              <div className="loading-chart"></div>
            </CardContent>
          </Card>
        </div>

        {/* Using your existing NoNetModal with correct props */}
        <NoNetModal
          classDisplay={noNetModal ? "show" : ""}
          setNoNetModal={setNoNetModal}
          handleRetry={handleRetry}
        />
      </>
    );
  }

  return (
    <>
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

      <WalletOverview />

      <div className="dashboard-grid margin-top">
        <RecentTransactions />
        <InvestmentPlans onOpenDepositModal={handleOpenDepositModal} />
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={handleCloseDepositModal}
          onNetworkError={() => setNoNetModal(true)}
        />
      )}

      {/* Using your existing NoNetModal with correct props */}
      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Dashboard;
