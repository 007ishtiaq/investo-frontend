import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import WalletOverview from "../../components/WalletOverview/WalletOverview";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import InvestmentPlans from "../../components/InvestmentPlans/InvestmentPlans";
import { getCurrentUser } from "../../functions/user";
import { useSelector, useDispatch } from "react-redux";
import { Copy, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import NoNetModal from "../../components/NoNetModal/NoNetModal";
import DepositModal from "../../components/DepositModal/DepositModal";
import "./Dashboard.css";

const Dashboard = ({ onTransactionUpdate }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noNetModal, setNoNetModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [transactionUpdateTrigger, setTransactionUpdateTrigger] = useState(0);
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false); // Add this flag

  // Ref to access RecentTransactions component methods
  const recentTransactionsRef = useRef(null);

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

  // Modified useEffect - only load once when component mounts if user exists
  useEffect(() => {
    if (user && user.token && !hasLoadedUserData) {
      loadUserData();
    }
  }, [user?.token, hasLoadedUserData]); // Only depend on token, not entire user object

  // Watch for external transaction updates (from Layout modals)
  useEffect(() => {
    if (onTransactionUpdate) {
      // Create a wrapper function that triggers our local state
      const handleExternalUpdate = () => {
        console.log("External transaction update received");
        setTransactionUpdateTrigger((prev) => prev + 1);

        // Also refresh user data
        if (user && user.token) {
          refreshUserDataOnly(); // Use a separate function that doesn't update Redux
        }
      };

      // Store the function reference so Layout can call it
      window.dashboardTransactionUpdate = handleExternalUpdate;
    }
  }, [onTransactionUpdate, user]);

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

  // Handle successful transaction submissions
  const handleTransactionSuccess = () => {
    console.log("Dashboard: Local transaction success");
    // Trigger RecentTransactions refresh using local state
    setTransactionUpdateTrigger((prev) => prev + 1);

    // Also refresh user data to update wallet balance
    if (user && user.token) {
      refreshUserDataOnly(); // Use separate function that doesn't update Redux
    }
  };

  // Main function for initial load - updates Redux/localStorage
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

      // UPDATE REDUX STORE AND LOCAL STORAGE with fresh data from server
      const updatedUser = {
        ...user,
        name: res.data.name,
        email: res.data.email,
        profileImage: res.data.profileImage || null,
        contact: res.data.contact,
        role: res.data.role || user.role,
        _id: res.data._id || user._id,
        balance: res.data.balance || user.balance,
        token: user.token,
      };

      // Dispatch to Redux store
      dispatch({
        type: "LOGGED_IN_USER",
        payload: updatedUser,
      });

      // Update localStorage
      if (window !== undefined) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setHasLoadedUserData(true); // Set flag to prevent re-loading
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
        if (err.response && err.response.status === 401) {
          toast.error("Session Expired, Please reload the page");
          handleLogout();
        } else {
          toast.error("Failed to load user information");
        }
      }
      setLoading(false);
    }
  };

  // Separate function for refreshing data without updating Redux/localStorage
  // Use this for transaction updates and other refreshes
  const refreshUserDataOnly = async () => {
    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    try {
      const res = await getCurrentUser(user.token);
      setUserData(res.data);
      // Don't update Redux/localStorage here - only update local component state
    } catch (err) {
      console.error("API Error:", err);

      // Check if it's a network error
      if (
        (err.message && err.message.includes("network")) ||
        err.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      } else {
        toast.error("Failed to refresh user information");
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
      }
    }
  };

  const copyAffiliateCode = () => {
    if (!userData?.affiliateCode) {
      toast.error("No affiliate code available");
      return;
    }

    const affiliateCode = userData.affiliateCode;

    // Function to copy text using the modern clipboard API
    const copyWithClipboardAPI = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error("Clipboard API failed:", err);
        return false;
      }
    };

    // Fallback function for older browsers or mobile devices
    const copyWithFallback = (text) => {
      try {
        // Create a temporary textarea element
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Make it invisible
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.style.pointerEvents = "none";

        // Add to DOM
        document.body.appendChild(textArea);

        // Focus and select
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices

        // Copy the text
        const successful = document.execCommand("copy");

        // Remove the textarea
        document.body.removeChild(textArea);

        return successful;
      } catch (err) {
        console.error("Fallback copy failed:", err);
        return false;
      }
    };

    // Main copy function
    const performCopy = async () => {
      let success = false;

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        success = await copyWithClipboardAPI(affiliateCode);
      }

      // If clipboard API failed, use fallback method
      if (!success) {
        success = copyWithFallback(affiliateCode);
      }

      // Show appropriate message
      if (success) {
        toast.success("Affiliate code copied to clipboard!");
      } else {
        // If all methods fail, show the code in an alert as last resort
        toast.error("Copy failed. Code: " + affiliateCode);

        // Optional: Show a prompt with the code for manual copying
        setTimeout(() => {
          if (
            window.confirm(
              "Copy failed. Would you like to see the affiliate code to copy manually?"
            )
          ) {
            prompt("Copy this affiliate code manually:", affiliateCode);
          }
        }, 1000);
      }
    };

    // Execute the copy operation
    performCopy();
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
        <RecentTransactions
          ref={recentTransactionsRef}
          refreshTrigger={transactionUpdateTrigger}
        />
        <InvestmentPlans onOpenDepositModal={handleOpenDepositModal} />
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={handleCloseDepositModal}
          onSuccess={handleTransactionSuccess}
          onNetworkError={() => setNoNetModal(true)}
        />
      )}

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Dashboard;
