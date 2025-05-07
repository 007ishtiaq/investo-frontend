// client/src/pages/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Users,
  Award,
  Activity,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { getAdminAnalytics } from "../../functions/admin";
import { formatBalance } from "../../functions/wallet";
import toast from "react-hot-toast";
import "./AdminAnalytics.css";

const StatCard = ({ title, value, icon, color, change, linkTo }) => {
  const Icon = icon;
  return (
    <div className="analytics-stat-card">
      <div className={`analytics-stat-card-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div className="analytics-stat-card-content">
        <h3 className="analytics-stat-card-title">{title}</h3>
        <div className="analytics-stat-card-value-container">
          <p className="analytics-stat-card-value">{value}</p>
          {change && (
            <span
              className={`analytics-stat-card-change ${
                change > 0 ? "positive" : "negative"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
      </div>
      {linkTo && (
        <Link to={linkTo} className="analytics-stat-card-link">
          View all
        </Link>
      )}
    </div>
  );
};

const ChartCard = ({ title, data, labels, type }) => {
  return (
    <div className="analytics-chart-card">
      <h3 className="analytics-chart-title">{title}</h3>
      <div className="analytics-chart-container">
        {/* For simplicity, we'll just display a placeholder */}
        <div className="analytics-chart-placeholder">
          <Activity size={50} color="#ccc" />
          <p>Chart visualization would appear here</p>
        </div>
      </div>
    </div>
  );
};

const TableCard = ({ title, data, columns }) => {
  return (
    <div className="analytics-table-card">
      <h3 className="analytics-table-title">{title}</h3>
      <div className="analytics-table-container">
        <table className="analytics-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {row[col.toLowerCase().replace(/\s/g, "_")] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MetricCard = ({ title, metrics }) => {
  return (
    <div className="analytics-metric-card">
      <h3 className="analytics-metric-title">{title}</h3>
      <div className="analytics-metric-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="analytics-metric-item">
            <span className="analytics-metric-label">{metric.label}</span>
            <span className="analytics-metric-value">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (user && user.token) {
        try {
          setLoading(true);
          const res = await getAdminAnalytics(user.token);
          setAnalytics(res.data);
          setLoading(false);
        } catch (error) {
          console.error("Error loading analytics:", error);
          toast.error("Failed to load analytics data");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin analytics.</p>
        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="analytics-loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-error">
        <h2>Data Error</h2>
        <p>Failed to load analytics data. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="analytics-reload-btn"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>Platform Analytics</h1>
        <p>Overview of platform performance and metrics</p>
      </div>

      <div className="analytics-section">
        <h2 className="analytics-section-title">Financial Overview</h2>
        <div className="analytics-stat-grid">
          <StatCard
            title="Total Deposits"
            value={formatBalance(analytics.financial.totalDeposits, "USD")}
            icon={ArrowDown}
            color="blue"
            change={analytics.financial.depositChange}
          />
          <StatCard
            title="Total Withdrawals"
            value={formatBalance(analytics.financial.totalWithdrawals, "USD")}
            icon={ArrowUp}
            color="purple"
            change={analytics.financial.withdrawalChange}
          />
          <StatCard
            title="Total Rewards"
            value={formatBalance(analytics.financial.totalRewards, "USD")}
            icon={Award}
            color="gold"
            change={analytics.financial.rewardChange}
          />
          <StatCard
            title="Platform Balance"
            value={formatBalance(analytics.financial.platformBalance, "USD")}
            icon={DollarSign}
            color="green"
            change={analytics.financial.balanceChange}
          />
        </div>
      </div>

      <div className="analytics-section">
        <h2 className="analytics-section-title">Admin Tasks</h2>
        <div className="analytics-stat-grid">
          <StatCard
            title="Total Users"
            value={analytics.users.totalUsers}
            icon={Users}
            color="indigo"
            change={analytics.users.userChange}
          />
          <StatCard
            title="Pending Deposits"
            value={analytics.pendingDeposits}
            icon={Clock}
            color="amber"
            linkTo="/admin/deposits"
          />
          <StatCard
            title="Pending Withdrawals"
            value={analytics.pendingWithdrawals}
            icon={AlertCircle}
            color="red"
            linkTo="/admin/withdrawals"
          />
          <StatCard
            title="Pending Verification Tasks"
            value={analytics.pendingTasks}
            icon={FileText}
            color="emerald"
            linkTo="/admin/tasks"
          />
        </div>
      </div>

      <div className="analytics-charts-grid">
        <ChartCard
          title="Deposits vs. Withdrawals (30 Days)"
          data={analytics.charts.financialTrend}
          labels={analytics.charts.dateLabels}
          type="line"
        />
        <ChartCard
          title="User Growth"
          data={analytics.charts.userGrowth}
          labels={analytics.charts.dateLabels}
          type="line"
        />
      </div>

      <div className="analytics-detail-section">
        <div className="analytics-detail-grid">
          <MetricCard
            title="User Distribution by Level"
            metrics={[
              { label: "Level 1", value: analytics.userLevels.level1 },
              { label: "Level 2", value: analytics.userLevels.level2 },
              { label: "Level 3", value: analytics.userLevels.level3 },
              { label: "Level 4", value: analytics.userLevels.level4 },
            ]}
          />
        </div>
      </div>

      <div className="analytics-tables-section">
        <TableCard
          title="Top 5 Users by Balance"
          data={analytics.topUsers.byBalance}
          columns={["Email", "Name", "Balance", "Level"]}
        />
        <TableCard
          title="Top 5 Users by Referrals"
          data={analytics.topUsers.byReferrals}
          columns={["Email", "Name", "Referrals", "Earnings"]}
        />
      </div>
    </div>
  );
};

export default AdminAnalytics;
