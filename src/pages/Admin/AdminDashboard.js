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

        {/* User Levels Section */}
        {loading ? null : analytics ? (
          <div className="admin-users-section">
            <h2 className="admin-section-title">User Distribution</h2>
            <div className="admin-levels-grid">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className={`admin-level-card level-${level}`}>
                  <h3>Level {level}</h3>
                  <p className="level-count">
                    {analytics.userLevels[`level${level}`] || 0}
                  </p>
                  <div className={`level-icon level-${level}`}>{level}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Top Users Tables */}
        {loading ? null : analytics && analytics.topUsers ? (
          <div className="admin-tables-section">
            <h2 className="admin-section-title">Top Users</h2>
            <div className="admin-tables-grid">
              <TableCard
                title="Top 5 Users by Balance"
                data={analytics.topUsers.byBalance || []}
                columns={["Email", "Name", "Balance", "Level"]}
              />
              <TableCard
                title="Top 5 Users by Referrals"
                data={analytics.topUsers.byReferrals || []}
                columns={["Email", "Name", "Referrals", "Earnings"]}
              />
            </div>
          </div>
        ) : null}

        {/* Navigation menu */}
        <div className="admin-menu-section">
          <h2 className="admin-section-title">Admin Menu</h2>
          <div className="admin-menu-grid">
            <Link to="/admin/tasks" className="admin-menu-item">
              <div className="admin-menu-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
              </div>
              <h3>Tasks Management</h3>
              <p>Create and manage tasks for users</p>
            </Link>

            <Link to="/admin/users" className="admin-menu-item">
              <div className="admin-menu-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 010 7.75"></path>
                </svg>
              </div>
              <h3>User Management</h3>
              <p>View and manage platform users</p>
            </Link>

            <Link to="/admin/analytics" className="admin-menu-item">
              <div className="admin-menu-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 20V10"></path>
                  <path d="M12 20V4"></path>
                  <path d="M6 20v-6"></path>
                </svg>
              </div>
              <h3>Analytics</h3>
              <p>View detailed platform statistics</p>
            </Link>

            <Link to="/admin/settings" className="admin-menu-item">
              <div className="admin-menu-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                </svg>
              </div>
              <h3>System Settings</h3>
              <p>Configure platform settings</p>
            </Link>

            <Link to="/admin/deposits" className="admin-menu-item">
              <div className="admin-menu-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M2 12h20"></path>
                </svg>
              </div>
              <h3>Deposits</h3>
              <p>View and process user deposits</p>
            </Link>

            <Link to="/admin/withdrawals" className="admin-menu-item">
              <div className="admin-menu-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M2 12h20"></path>
                  <path d="M17 7l-5-5-5 5"></path>
                  <path d="M17 17l-5 5-5-5"></path>
                </svg>
              </div>
              <h3>Withdrawals</h3>
              <p>Review and process withdrawal requests</p>
            </Link>
            <Link to="/admin/taskverification" className="admin-menu-item">
              <div className="admin-menu-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                  <path d="M22 4L12 14.01l-3-3"></path>
                </svg>
              </div>
              <h3>Task Verification</h3>
              <p>Review and verify user task submissions</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
