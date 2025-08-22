import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  getUserInvestments,
  getInvestmentsByUser,
} from "../../functions/admin";
import { formatBalance } from "../../functions/wallet";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import LoadingSpinner from "../../hooks/LoadingSpinner";
import "./InvestmentDetail.css";

const InvestmentDetail = ({ selectedUser, onClose }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [investments, setInvestments] = useState([]);
  const [investmentStats, setInvestmentStats] = useState({
    totalInvestment: 0,
    activeInvestments: 0,
    completedInvestments: 0,
    totalProfit: 0,
    investmentsByLevel: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedUser && user?.token) {
      loadInvestmentData();
    }
  }, [selectedUser, user]);

  const loadInvestmentData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading investment data for user:", selectedUser._id);

      const response = await getUserInvestments(user.token, selectedUser._id);

      console.log("Investment API Response:", response);

      if (response && response.data && response.data.success) {
        const { investments, stats } = response.data.data;

        setInvestments(investments || []);
        setInvestmentStats(
          stats || {
            totalInvestment: 0,
            activeInvestments: 0,
            completedInvestments: 0,
            totalProfit: 0,
            investmentsByLevel: {},
          }
        );

        console.log("Investments loaded:", investments?.length || 0);
      } else {
        throw new Error(
          response?.data?.message || "Failed to load investment data"
        );
      }
    } catch (error) {
      console.error(
        "Error loading investment data (investment details):",
        error
      );
      setError(error.message || "Failed to load investment data");
      if (error.message && error.message.includes(401)) {
        toast.error("Session Expired, Please reload the page");
      } else {
        toast.error(error.message || "Failed to load investment data");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "status-active";
      case "completed":
        return "status-completed";
      case "expired":
        return "status-expired";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 4:
        return "level-4";
      case 3:
        return "level-3";
      case 2:
        return "level-2";
      case 1:
        return "level-1";
      case 0:
      default:
        return "level-0";
    }
  };

  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const total = end - start;
    const elapsed = now - start;
    const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);

    return Math.round(progress);
  };

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="investment-detail-overlay">
      <div className="investment-detail-container">
        {/* Header */}
        <div className="investment-detail-header">
          <button onClick={onClose} className="back-button">
            <ArrowLeft size={20} />
            <span>Back to User Management</span>
          </button>
          <div className="user-info-header">
            <h1>Investment Details</h1>
            <div className="selected-user-info">
              <span className="user-name">
                {selectedUser.name || "Unknown"}
              </span>
              <span className="user-email">{selectedUser.email}</span>
              <span
                className={`level-badge ${getLevelBadgeClass(
                  selectedUser.level
                )}`}
              >
                Level {selectedUser.level || 0}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
            <p>Loading investment data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <h3>Error Loading Data</h3>
              <p>{error}</p>
              <button onClick={loadInvestmentData} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Investment Stats Overview */}
            <div className="investment-stats-overview">
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatBalance(investmentStats.totalInvestment, "USD")}
                  </div>
                  <div className="stat-label">Total Investment</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Activity size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {investmentStats.activeInvestments}
                  </div>
                  <div className="stat-label">Active Investments</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatBalance(investmentStats.totalProfit, "USD")}
                  </div>
                  <div className="stat-label">Total Profit</div>
                </div>
              </div>
            </div>

            {/* Investment History Table */}
            <div className="investment-table-container">
              <div className="investment-table-header">
                <h2>Investment History</h2>
                <p>
                  Complete investment history with plan details and performance
                </p>
              </div>

              {investments.length === 0 ? (
                <div className="no-investments">
                  <DollarSign size={48} />
                  <h3>No Investments Found</h3>
                  <p>This user hasn't made any investments yet.</p>
                </div>
              ) : (
                <div className="investment-table-wrapper">
                  <table className="investment-table">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Level</th>
                        <th>Amount</th>
                        <th>Profit</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Start Date</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((investment, index) => (
                        <tr key={investment._id || index}>
                          <td>
                            <div className="plan-info">
                              <div className="plan-name">
                                {investment.plan?.name || "Unknown Plan"}
                              </div>
                              <div className="plan-description">
                                {investment.plan?.description || ""}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`level-badge ${getLevelBadgeClass(
                                investment.plan?.minLevel
                              )}`}
                            >
                              Level {investment.plan?.minLevel || 0}
                            </span>
                          </td>
                          <td className="investment-amount">
                            <div className="amount-info">
                              <span className="current-amount">
                                {formatBalance(investment.amount, "USD")}
                              </span>
                              {investment.initialAmount !==
                                investment.amount && (
                                <span className="initial-amount">
                                  Initial:{" "}
                                  {formatBalance(
                                    investment.initialAmount,
                                    "USD"
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="profit-amount">
                            <span
                              className={`amount ${
                                investment.profit > 0 ? "positive" : "zero"
                              }`}
                            >
                              {formatBalance(investment.profit || 0, "USD")}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${getStatusBadgeClass(
                                investment.status
                              )}`}
                            >
                              {investment.status}
                            </span>
                          </td>
                          <td className="progress-cell">
                            {investment.status === "active" ? (
                              <div className="progress-container">
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{
                                      width: `${calculateProgress(
                                        investment.startDate,
                                        investment.endDate
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="progress-text">
                                  {calculateProgress(
                                    investment.startDate,
                                    investment.endDate
                                  )}
                                  %
                                </span>
                              </div>
                            ) : (
                              <span className="progress-text">
                                {investment.status === "completed"
                                  ? "100%"
                                  : "0%"}
                              </span>
                            )}
                          </td>
                          <td className="date-cell">
                            <div className="date-info">
                              <Calendar size={14} />
                              <span>{formatDate(investment.startDate)}</span>
                            </div>
                          </td>
                          <td className="duration-cell">
                            <span>
                              {investment.plan?.durationInDays || 0} days
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvestmentDetail;
