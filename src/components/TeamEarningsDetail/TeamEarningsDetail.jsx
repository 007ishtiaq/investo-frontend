import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { getTeamMembersByUserId } from "../../functions/team";
import { formatBalance } from "../../functions/wallet";
import {
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react";
import LoadingSpinner from "../../hooks/LoadingSpinner";
import "./TeamEarningsDetail.css";

const TeamEarningsDetail = ({ selectedUser, onClose }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    affiliateEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedUser && user?.token) {
      loadTeamEarningsData();
    }
  }, [selectedUser, user]);

  const loadTeamEarningsData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading team data for user:", selectedUser._id);

      // Use the new function to get team members by user ID
      const response = await getTeamMembersByUserId(
        user.token,
        selectedUser._id
      );

      console.log("API Response:", response);

      if (response && response.data && response.data.success) {
        const { teamMembers, stats } = response.data.data;

        setTeamMembers(teamMembers || []);
        setStats(
          stats || {
            totalMembers: 0,
            activeMembers: 0,
            affiliateEarnings: 0,
          }
        );

        console.log("Team members loaded:", teamMembers?.length || 0);
      } else {
        throw new Error(response?.data?.message || "Failed to load team data");
      }
    } catch (error) {
      console.error("Error loading team earnings data:", error);
      setError(error.message || "Failed to load team earnings data");
      toast.error(error.message || "Failed to load team earnings data");
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

  if (!selectedUser) {
    return null;
  }

  return (
    <div className="team-earnings-detail-overlay">
      <div className="team-earnings-detail-container">
        {/* Header */}
        <div className="team-earnings-header">
          <button onClick={onClose} className="back-button">
            <ArrowLeft size={20} />
            <span>Back to User Management</span>
          </button>
          <div className="user-info-header">
            <h1>Team Earnings Details</h1>
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
            <p>Loading team earnings data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <h3>Error Loading Data</h3>
              <p>{error}</p>
              <button onClick={loadTeamEarningsData} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="earnings-stats-overview">
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalMembers}</div>
                  <div className="stat-label">Total Team Members</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.activeMembers}</div>
                  <div className="stat-label">Active Members</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatBalance(stats.affiliateEarnings, "USD")}
                  </div>
                  <div className="stat-label">Total Team Earnings</div>
                </div>
              </div>
            </div>

            {/* Commission Table */}
            <div className="commission-table-container">
              <div className="commission-table-header">
                <h2>Team Members Commission Details</h2>
                <p>
                  Detailed breakdown of earnings from team member activities
                </p>
              </div>

              {teamMembers.length === 0 ? (
                <div className="no-team-members">
                  <Users size={48} />
                  <h3>No Team Members Found</h3>
                  <p>This user hasn't referred anyone to the platform yet.</p>
                </div>
              ) : (
                <div className="commission-table-wrapper">
                  <table className="commission-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>User Level at Purchase</th>
                        <th>Affiliate First Purchase Level</th>
                        <th>Investment Amount</th>
                        <th>Commission Earned</th>
                        <th>Joined Date</th>
                        <th>First Investment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member, index) => (
                        <tr key={member._id || index}>
                          <td>
                            <div className="member-info">
                              <div className="member-name">
                                {member.name || "Unknown"}
                              </div>
                              <div className="member-email">
                                {member.email || "Unknown"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`level-badge ${getLevelBadgeClass(
                                member.mainUserLevelAtPurchase
                              )}`}
                            >
                              Level {member.mainUserLevelAtPurchase || 0}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`level-badge ${getLevelBadgeClass(
                                member.memberFirstPurchaseLevel
                              )}`}
                            >
                              {member.memberFirstPurchaseLevel > 0
                                ? `Level ${member.memberFirstPurchaseLevel}`
                                : "No Purchase"}
                            </span>
                          </td>
                          <td className="investment-amount">
                            {member.firstInvestmentAmount
                              ? formatBalance(
                                  member.firstInvestmentAmount,
                                  "USD"
                                )
                              : "No Investment"}
                          </td>
                          <td className="commission-amount">
                            <span
                              className={`amount ${
                                member.commissionEarned > 0
                                  ? "positive"
                                  : "zero"
                              }`}
                            >
                              {formatBalance(
                                member.commissionEarned || 0,
                                "USD"
                              )}
                            </span>
                          </td>
                          <td className="date-cell">
                            <div className="date-info">
                              <Calendar size={14} />
                              <span>{formatDate(member.joinedDate)}</span>
                            </div>
                          </td>
                          <td className="date-cell">
                            <div className="date-info">
                              <Calendar size={14} />
                              <span>
                                {member.firstInvestmentDate
                                  ? formatDate(member.firstInvestmentDate)
                                  : "No Investment"}
                              </span>
                            </div>
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

export default TeamEarningsDetail;
