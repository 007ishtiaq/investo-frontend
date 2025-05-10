import React, { useState, useEffect } from "react";
import "./PlatformStats.css";
import { DollarSign, Users, Award, Percent } from "lucide-react";

const Counter = ({ end, duration = 2000, decimal = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let frameId;

    // Animation function
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      setCount(
        decimal ? (percentage * end).toFixed(1) : Math.floor(percentage * end)
      );

      if (percentage < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [end, duration, decimal]);

  return decimal ? count : count.toLocaleString();
};

const PlatformStats = ({ stats = {} }) => {
  return (
    <div className="platform-stats-container">
      <div className="platform-stats-header">
        <h2 className="platform-stats-title">Platform Overview</h2>
        <div className="platform-stats-badge">Live Data</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <DollarSign size={20} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">
              $<Counter end={stats.totalInvested || 1250000} />
            </h3>
            <p className="stat-name">Total Invested</p>
          </div>
          <div className="stat-change positive">
            +<Counter end={stats.investmentGrowth || 8.5} decimal={true} />%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Users size={20} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">
              <Counter end={stats.totalUsers || 12574} />
            </h3>
            <p className="stat-name">Total Users</p>
          </div>
          <div className="stat-change positive">
            +<Counter end={stats.userGrowth || 12.7} decimal={true} />%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper gold">
            <Award size={20} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">
              $<Counter end={stats.totalRewards || 385000} />
            </h3>
            <p className="stat-name">Rewards Paid</p>
          </div>
          <div className="stat-change positive">
            +<Counter end={stats.rewardsGrowth || 5.9} decimal={true} />%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <Percent size={20} className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">
              <Counter end={stats.avgReturn || 21.5} decimal={true} />%
            </h3>
            <p className="stat-name">Avg. Return Rate</p>
          </div>
          <div className="stat-change positive">
            +<Counter end={stats.returnGrowth || 2.3} decimal={true} />%
          </div>
        </div>
      </div>

      <div className="stats-note">
        *All statistics are updated in real-time based on platform activity
      </div>
    </div>
  );
};

export default PlatformStats;
