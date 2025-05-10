import React from "react";
import { Link } from "react-router-dom";
import { EthereumIcon } from "../../utils/icons";

/**
 * Investment Card component for displaying investment plans
 */
const InvestmentCard = ({ plan, userLevel, user }) => {
  // Calculate daily and total profit
  const calculateProfit = () => {
    const dailyProfit = plan.minAmount * (plan.dailyRoi / 100);

    // Extract the number of days from the duration string
    const durationMatch = plan.duration.match(/(\d+)/);
    const days = durationMatch ? parseInt(durationMatch[0]) : 30;

    const totalProfit = dailyProfit * days;

    return {
      daily: dailyProfit.toFixed(4),
      total: totalProfit.toFixed(4),
    };
  };

  const profit = calculateProfit();

  // Is user logged in (userLevel will be undefined if not logged in)
  const isLoggedIn = user && user.token !== undefined;

  // Check if this plan matches the user's level
  const isUserLevel = isLoggedIn && plan.level === userLevel;

  // Check if the plan is available to the user based on their level
  const isAvailable = isLoggedIn && userLevel >= plan.level;

  // Check if this plan is higher than user's level (for upgrade button)
  const isHigherLevel = isLoggedIn && plan.level > userLevel;

  // Handler for plan upgrade button
  const handleUpgradeClick = (e) => {
    e.preventDefault();
    // Use the onUpgrade handler from props
    if (plan.onUpgrade) {
      plan.onUpgrade();
    }
  };

  return (
    <div
      className={`investment-card ${
        !isLoggedIn && plan.featured ? "featured-card" : ""
      } ${isLoggedIn && isUserLevel ? "your-level-card" : ""}`}
    >
      {/* Only show "Most Popular" if no user is logged in OR user is logged in but this isn't their level */}
      {!isLoggedIn && plan.featured && (
        <div className="card-badge">Most Popular</div>
      )}

      {/* Only show "Your Level" if user is logged in and this is their level */}
      {isLoggedIn && isUserLevel && (
        <div className="card-badge your-level-badge">Your Account Level</div>
      )}

      <div className="card-header">
        <div
          className={`level-tag ${
            isLoggedIn && isUserLevel ? "your-level-tag" : ""
          }`}
        >
          Level {plan.level}
        </div>
        <h3 className="plan-name">{plan.name}</h3>
      </div>

      <div className="daily-roi">
        <span className="roi-value">{plan.dailyRoi}%</span>
        <span className="roi-label">Daily ROI</span>
      </div>

      <div className="plan-details">
        <div className="detail-item">
          <div className="detail-label">Minimum Investment</div>
          <div className="detail-value">
            <EthereumIcon size={14} />
            <span>{plan.minAmount} ETH</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Daily Profit</div>
          <div className="detail-value">
            <EthereumIcon size={14} />
            <span>{profit.daily} ETH</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">Total Profit</div>
          <div className="detail-value">
            <EthereumIcon size={14} />
            <span>{profit.total} ETH</span>
          </div>
        </div>
      </div>

      <div className="additional-features">
        <h4 className="features-title">Features</h4>
        <ul className="features-list">
          {plan.additionalFeatures.map((feature, index) => (
            <li key={index} className="feature-item">
              <span className="feature-icon">✓</span>
              <span className="feature-text">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {isLoggedIn ? (
        isHigherLevel ? (
          // Show "Upgrade Now" button for plans higher than the user's level
          <button onClick={handleUpgradeClick} className="invest-button">
            Upgrade Now
          </button>
        ) : isUserLevel ? (
          // Show "Current Plan" for user's current level
          <div className="current-plan-message">Current Plan</div>
        ) : (
          // Show "Base Plan" for levels below the user's current level
          <div className="base-plan-message">Base Plan</div>
        )
      ) : (
        <Link to={`/login`} className="invest-button">
          Invest Now
        </Link>
      )}
    </div>
  );
};

export default InvestmentCard;

// Add styling for the InvestmentCard component
document.head.appendChild(document.createElement("style")).textContent = `
.investment-card {
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.investment-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.featured-card {
  border: 2px solid var(--color-primary);
}

.your-level-card {
  border: 2px solid #00d0ff;
  box-shadow: 0 0 15px rgba(0, 208, 255, 0.3);
}

.card-badge {
  position: absolute;
  top: -10px;
  right: 1.5rem;
  background: var(--gradient-button);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  z-index: 1;
}

.your-level-badge {
  background: linear-gradient(45deg, #00c3ff, #00e5ff);
  left: 1.5rem;
  right: auto;
}

.card-header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
  margin-top: 1rem;
}

.plan-duration {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.level-tag {
  margin: 0 auto;
  width: 5rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(45deg, #627eea, #3d5afe);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 1rem;
  display: inline-block;
}

.your-level-tag {
  background: linear-gradient(45deg, #00c3ff, #00e5ff);
  font-weight: 700;
  transform: scale(1.05);
}

.daily-roi {
  text-align: center;
  padding: 1rem;
  background-color: var(--color-background-hover);
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
}

.roi-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.roi-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.plan-details {
  margin-bottom: 1.25rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
}

.detail-value svg {
  margin-right: 0.25rem;
  color: var(--color-primary);
}

.additional-features {
  margin-bottom: 1.25rem;
  flex: 1;
}

.features-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.features-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.feature-item {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-start;
}

.feature-icon {
  color: var(--color-success);
  margin-right: 0.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.feature-text {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.invest-button {
  display: block;
  padding: 0.75rem;
  background: var(--gradient-button);
  color: white;
  text-align: center;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: opacity var(--transition-fast);
  text-decoration: none;
  margin-top: auto;
}

.invest-button:hover {
  opacity: 0.9;
}

.locked-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: #f5f5f5;
  color: #666;
  text-align: center;
  border-radius: 0.5rem;
  font-weight: 500;
  margin-top: auto;
  gap: 0.5rem;
}

.lock-icon {
  font-size: 1.1rem;
}

.your-level-card .invest-button {
  background: linear-gradient(45deg, #00c3ff, #00e5ff);
  font-weight: 600;
}
`;
