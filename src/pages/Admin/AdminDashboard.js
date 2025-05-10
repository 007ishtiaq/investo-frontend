// client/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Users,
  Award,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  MessageSquare,
} from "lucide-react";
import { getAdminAnalytics } from "../../functions/admin";
import { formatBalance } from "../../functions/wallet";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "./AdminDashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// StatCard component
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

// ChartCard component with empty data messaging
const ChartCard = ({ title, type, data, labels }) => {
  // Check if data is empty (all zeros)
  const isEmptyData = () => {
    if (type === "financialTrend") {
      return (
        data.deposits.every((val) => val === 0) &&
        data.withdrawals.every((val) => val === 0)
      );
    } else if (type === "userGrowth") {
      return data.every((val) => val === 0);
    }
    return false;
  };

  // If no data is available, show placeholder
  if (!data || !labels || labels.length === 0) {
    return (
      <div className="analytics-chart-card">
        <h3 className="analytics-chart-title">{title}</h3>
        <div className="analytics-chart-container">
          <div className="analytics-chart-placeholder">
            <Activity size={50} color="#ccc" />
            <p>No data available for chart</p>
          </div>
        </div>
      </div>
    );
  }

  // Different chart configurations based on type
  if (type === "financialTrend") {
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Deposits",
          data: data.deposits,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Withdrawals",
          data: data.withdrawals,
          borderColor: "#9333ea",
          backgroundColor: "rgba(147, 51, 234, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += "$" + context.parsed.y.toLocaleString();
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    };

    return (
      <div className="analytics-chart-card">
        <h3 className="analytics-chart-title">{title}</h3>
        <div className="analytics-chart-container">
          <Line data={chartData} options={options} />
          {isEmptyData() && (
            <div className="chart-overlay-message">
              <p>No transaction data in the past 30 days</p>
            </div>
          )}
        </div>
      </div>
    );
  } else if (type === "userGrowth") {
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "New Users",
          data: data,
          backgroundColor: "rgba(79, 70, 229, 0.8)",
          borderRadius: 4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };

    return (
      <div className="analytics-chart-card">
        <h3 className="analytics-chart-title">{title}</h3>
        <div className="analytics-chart-container">
          <Bar data={chartData} options={options} />
          {isEmptyData() && (
            <div className="chart-overlay-message">
              <p>No new users registered in the past 30 days</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default fallback if chart type isn't recognized
  return (
    <div className="analytics-chart-card">
      <h3 className="analytics-chart-title">{title}</h3>
      <div className="analytics-chart-container">
        <div className="analytics-chart-placeholder">
          <Activity size={50} color="#ccc" />
          <p>Chart type not supported</p>
        </div>
      </div>
    </div>
  );
};

// TableCard component
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table-message">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col === "Balance"
                        ? formatBalance(row.balance || 0, "USD")
                        : col === "Earnings"
                        ? formatBalance(row.earnings || 0, "USD")
                        : row[col.toLowerCase().replace(/\s/g, "_")] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main AdminDashboard component
const AdminDashboard = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (user && user.token) {
        try {
          setLoading(true);
          const res = await getAdminAnalytics(user.token);
          console.log("Analytics data from API:", res.data);
          console.log("Chart data:", res.data.charts);
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
        <p>You don't have permission to access the admin panel.</p>
        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage your platform from here</p>

        {/* Financial Overview Section */}
        {loading ? (
          <div className="admin-stats-loading">
            <div className="loading-spinner"></div>
            <p>Loading statistics...</p>
          </div>
        ) : analytics ? (
          <div className="admin-overview-section">
            <h2 className="admin-section-title">Platform Overview</h2>
            <div className="admin-stats-grid">
              <StatCard
                title="Platform Balance"
                value={formatBalance(
                  analytics.financial.platformBalance,
                  "USD"
                )}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Total Deposits"
                value={formatBalance(analytics.financial.totalDeposits, "USD")}
                icon={ArrowDown}
                color="blue"
              />
              <StatCard
                title="Total Withdrawals"
                value={formatBalance(
                  analytics.financial.totalWithdrawals,
                  "USD"
                )}
                icon={ArrowUp}
                color="purple"
              />
              <StatCard
                title="Total Rewards"
                value={formatBalance(analytics.financial.totalRewards, "USD")}
                icon={Award}
                color="gold"
              />
            </div>
          </div>
        ) : null}

        {/* Pending Tasks Section */}
        {loading ? null : analytics ? (
          <div className="admin-pending-section">
            <h2 className="admin-section-title">Pending Tasks</h2>
            <div className="admin-stats-grid">
              <StatCard
                title="Total Users"
                value={analytics.users.totalUsers}
                icon={Users}
                color="indigo"
                change={analytics.users.userChange}
                linkTo="/admin/users"
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
                linkTo="/admin/taskverification"
              />
              <StatCard
                title="New Contact Messages"
                value={analytics.newContactMessages}
                icon={MessageSquare}
                color="blue"
                linkTo="/admin/contact-messages"
              />
            </div>
          </div>
        ) : null}

        {/* Charts Section */}
        {loading ? null : analytics && analytics.charts ? (
          <div className="admin-charts-section">
            <h2 className="admin-section-title">Performance Charts</h2>
            <div className="admin-charts-grid">
              <ChartCard
                title="Deposits vs. Withdrawals (30 Days)"
                type="financialTrend"
                data={analytics.charts.financialTrend}
                labels={analytics.charts.dateLabels}
              />
              <ChartCard
                title="User Growth"
                type="userGrowth"
                data={analytics.charts.userGrowth}
                labels={analytics.charts.dateLabels}
              />
            </div>
          </div>
        ) : null}

        {/* Top Users Section */}
        {loading ? null : analytics && analytics.topUsers ? (
          <div className="admin-tables-section">
            <h2 className="admin-section-title">Top Performers</h2>
            <div className="admin-tables-grid">
              <TableCard
                title="Top Users by Balance"
                data={analytics.topUsers.byBalance}
                columns={["Name", "Email", "Balance", "Level"]}
              />
              <TableCard
                title="Top Referrers"
                data={analytics.topUsers.byReferrals}
                columns={["Name", "Email", "Referrals", "Earnings"]}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
