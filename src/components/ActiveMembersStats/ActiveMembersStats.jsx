import React from "react";
import "./ActiveMembersStats.css";
import { Users, Award, TrendingUp } from "lucide-react";

const ActiveMembersStats = ({
  stats = { active: 253, total: 1503, growth: 76 },
}) => {
  return (
    <div className="active-members-container">
      <div className="members-header">
        <h2 className="members-title">Platform Activity</h2>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>Live Updates</span>
        </div>
      </div>

      <div className="members-stats-grid">
        <div className="member-stat-card">
          <div className="stat-icon-container">
            <Users size={24} className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.active.toLocaleString()}</h3>
            <p className="stat-label">Active Members</p>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            <span>Live</span>
          </div>
        </div>

        <div className="member-stat-card">
          <div className="stat-icon-container gold">
            <Award size={24} className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.total.toLocaleString()}</h3>
            <p className="stat-label">Total Investors</p>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            <span>+{stats.growth}%</span>
          </div>
        </div>
      </div>

      <div className="active-members-visual">
        <div className="member-avatars">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`member-avatar avatar-${i + 1}`}>
              <span className="member-status-indicator"></span>
            </div>
          ))}
          <div className="more-members">+{stats.active - 8}</div>
        </div>
        <div className="activity-pulse"></div>
      </div>
    </div>
  );
};

export default ActiveMembersStats;
