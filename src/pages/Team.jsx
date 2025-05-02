// client/src/pages/Team.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { getTeamMembers, getAffiliateCode } from "../functions/team";
import { formatBalance } from "../functions/wallet";
import { getUserLevel } from "../functions/user";
import "./Team.css";

const Team = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    affiliateEarnings: 0,
  });
  const [affiliateCode, setAffiliateCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userLevel, setUserLevel] = useState(1); // New state for user level

  useEffect(() => {
    if (user && user.token) {
      loadTeamData();
      loadUserLevel(); // New function to load user level
    }
  }, [user]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      // Fetch team members
      const membersRes = await getTeamMembers(user.token);
      if (membersRes && membersRes.data) {
        setTeamMembers(membersRes.data.teamMembers || []);
        setStats(
          membersRes.data.stats || {
            totalMembers: 0,
            activeMembers: 0,
            affiliateEarnings: 0,
          }
        );
      }

      // Fetch affiliate code
      const codeRes = await getAffiliateCode(user.token);

      if (codeRes && codeRes.data) {
        setAffiliateCode(codeRes.data.affiliateCode || "");
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch user level
  const loadUserLevel = async () => {
    try {
      const level = await getUserLevel(user.token);
      setUserLevel(level);
    } catch (error) {
      console.error("Error loading user level:", error);
      // We'll keep the default level 1 if there's an error
    }
  };

  const copyToClipboard = () => {
    const affiliateLink = `${window.location.origin}/register?ref=${affiliateCode}`;
    navigator.clipboard
      .writeText(affiliateLink)
      .then(() => {
        setCopied(true);
        toast.success("Affiliate link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      });
  };

  if (!user || !user.token) {
    return (
      <div className="team-page">
        <div className="container">
          <div className="auth-message">
            <p>Please login to view your team.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      <div className="container">
        <h1 className="page-title">My Team</h1>

        <div className="team-dashboard">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalMembers}</span>
              <span className="stat-label">Total Referrals</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.activeMembers}</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {formatBalance(stats.affiliateEarnings, "USD")}
              </span>
              <span className="stat-label">Earnings By team</span>
            </div>
            <div className="stat-card">
              {/* Updated to use the fetched userLevel */}
              <span className="stat-value">{userLevel}</span>
              <span className="stat-label">Your Account Level</span>
            </div>
          </div>

          {/* Rest of the component remains the same */}
          {/* Affiliate Link Section */}
          <div className="affiliate-section">
            <h2>Share Your Affiliate Link</h2>
            <p>
              Invite friends and earn rewards when they join and complete tasks.
            </p>

            <div className="affiliate-code-container">
              <div className="affiliate-code">
                <span>{affiliateCode}</span>
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  onClick={copyToClipboard}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <p className="affiliate-info">
                Share this code with friends or use the copy button to get your
                full referral link.
              </p>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="team-members-section">
            <h2>Your Team Members</h2>

            {loading ? (
              <div className="loading">Loading team data...</div>
            ) : teamMembers.length === 0 ? (
              <div className="no-members">
                <p>
                  You don't have any team members yet. Share your affiliate link
                  to start building your team!
                </p>
              </div>
            ) : (
              <div className="team-table-container">
                <table className="team-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Level</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member._id}>
                        <td>{member.name || "Anonymous"}</td>
                        <td>{member.email}</td>
                        <td>Level {member.level}</td>
                        <td>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Level Benefits */}
          <div className="level-benefits-section">
            <div className="team-commission-section">
              <h2>Affiliate Commission Rates</h2>
              <div className="commission-table-container">
                <table className="commission-table">
                  <thead>
                    <tr>
                      <th>Your Account Level</th>
                      <th>Level 1 Referrals</th>
                      <th>Level 2 Referrals</th>
                      <th>Level 3 Referrals</th>
                      <th>Level 4 Referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="level-badge-team level-1">
                          Level 1
                        </span>
                      </td>
                      <td>0.01$ daily</td>
                      <td>0.10% daily</td>
                      <td>0.50% daily</td>
                      <td>1.00% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-2">
                          Level 2
                        </span>
                      </td>
                      <td>0.02$ daily</td>
                      <td>0.20% daily</td>
                      <td>1.00% daily</td>
                      <td>1.50% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-3">
                          Level 3
                        </span>
                      </td>
                      <td>0.03$ daily</td>
                      <td>0.30% daily</td>
                      <td>1.50% daily</td>
                      <td>2.00% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-4">
                          Level 4
                        </span>
                      </td>
                      <td>0.05$ daily</td>
                      <td>0.50% daily</td>
                      <td>2.00% daily</td>
                      <td>3.00% daily</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
