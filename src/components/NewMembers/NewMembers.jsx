import React from "react";
import "./NewMembers.css";
import { UserPlus, Star, Calendar } from "lucide-react";

const NewMembers = ({ members = [] }) => {
  return (
    <div className="new-members-container">
      <div className="members-header">
        <div className="header-left">
          <h2 className="members-title">New Investors</h2>
          <div className="members-badge">
            <UserPlus size={14} />
            <span>Recent Joins</span>
          </div>
        </div>
        <div className="total-count">
          <span className="count-number">{178}</span>
          <span className="count-label">this week</span>
        </div>
      </div>

      <div className="members-list">
        {members.length > 0 ? (
          members.map((member, index) => (
            <div key={index} className="member-item">
              <div
                className="member-avatar"
                style={{ backgroundColor: member.color || "#7c3aed" }}
              >
                {member.name.charAt(0)}
              </div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-details">
                  <div className="member-detail">
                    <Calendar size={12} />
                    <span>{member.joinDate}</span>
                  </div>
                  <div className="member-detail">
                    <Star size={12} />
                    <span>${member.initialInvestment}</span>
                  </div>
                </div>
              </div>
              <div className="member-level">Level {member.level}</div>
            </div>
          ))
        ) : (
          <div className="no-members">
            <div className="no-data-icon">
              <UserPlus size={24} />
            </div>
            <p>No new members yet</p>
          </div>
        )}
      </div>

      <div className="welcome-message">
        <div className="welcome-icon">🎉</div>
        <div className="welcome-text">
          <h3>Welcome our new investors!</h3>
          <p>Each new member brings us closer to our community goals</p>
        </div>
      </div>
    </div>
  );
};

export default NewMembers;
