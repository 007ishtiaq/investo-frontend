import React from "react";
import { Link } from "react-router-dom";
import { EthereumIcon } from "../../utils/icons";

/**
 * Investment Card component for displaying investment plans
 */
const InvestmentCard = ({ plan, userLevel, user }) => {
  // Calculate daily and total profit
  const calculateProfit = () => {
    // Calculate profit normally for all plans (including first plan)
    let dailyProfit = 0;

    // For the first (Basic) plan, we need to handle minAmount=0 special case
    if (plan.minAmount === 0) {
      // Use a base investment amount of 100 for calculation purposes
      // (since multiplying by 0 would always give 0)
      const baseAmount = 100;
      dailyProfit = baseAmount * (plan.dailyRoi / 100);
    } else {
      dailyProfit = plan.minAmount * (plan.dailyRoi / 100);
    }

    // Total profit calculation (365 days for annual profit)
    const totalProfit = dailyProfit * 365;

    return {
      daily: dailyProfit.toFixed(2),
      total: totalProfit.toFixed(2),
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

  // Determine if this is the first (Basic) plan based on level and minAmount
  const isBasicPlan = plan.level === 1 && plan.minAmount === 0;

  // Handler for plan upgrade button
  const handleUpgradeClick = (e) => {
    e.preventDefault();
    // Use the onUpgrade handler from props
    if (plan.onUpgrade) {
      plan.onUpgrade();
    }
  };

  // Determine ROI display ($ or %)
  const roiDisplay = isBasicPlan ? `$${plan.dailyRoi}` : `${plan.dailyRoi}%`;

  // Determine ROI label
  const roiLabel = isBasicPlan ? "Daily Reward" : "Daily ROI";

  // Determine profit labels - all plans show Annual Profit
  const dailyProfitLabel = "Daily Profit";
  const totalProfitLabel = "Annual Profit";

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

      <div className="card-header-investment">
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
        <span className="roi-value">{roiDisplay}</span>
        <span className="roi-label">{roiLabel}</span>
      </div>

      <div className="plan-details">
        <div className="detail-item-plancard">
          <div className="detail-label">Minimum to Invest</div>
          <div className="detail-value">
            <EthereumIcon size={14} />
            <span>{plan.minAmount} USD</span>
          </div>
        </div>

        <div className="detail-item-plancard">
          <div className="detail-label">{dailyProfitLabel}</div>
          <div className="detail-value">
            <EthereumIcon size={14} />
            <span>{profit.daily} USD</span>
          </div>
        </div>

        <div className="detail-item-plancard">
          <div className="detail-label">{totalProfitLabel}</div>
          <div className="detail-value">
            <EthereumIcon size={14} />
            <span>{profit.total} USD</span>
          </div>
        </div>
      </div>

      <div className="additional-features">
        <h4 className="features-title">Features</h4>
        <ul className="features-list">
          {plan.additionalFeatures.map((feature, index) => (
            <li key={index} className="feature-item-plancard">
              <span className="feature-icon-plancard">✓</span>
              <span className="feature-text-plancard">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {isLoggedIn ? (
        isHigherLevel ? (
          // Show "Upgrade Now" button for plans higher than the user's level
          <div>
            <button onClick={handleUpgradeClick} className="invest-button">
              Upgrade Now
            </button>
          </div>
        ) : isUserLevel ? (
          // Show "Current Plan" for user's current level
          <div className="current-plan-message">Current Plan</div>
        ) : (
          // Show "Base Plan" for levels below the user's current level
          <div className="base-plan-message">Base Plan</div>
        )
      ) : (
        // For non-logged in users: Basic Plan gets "Base Plan", others get "Invest Now"
        <div>
          {isBasicPlan ? (
            <div className="base-plan-message">Base Plan</div>
          ) : (
            <Link to={`/login`} className="invest-button">
              Invest Now
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestmentCard;

// Styling remains the same

// Styling remains the same

// Add styling for the InvestmentCard component
document.head.appendChild(document.createElement("style")).textContent = `
.investment-card {
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  padding: 1.5rem 1rem 1rem;
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

.card-header-investment {
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

.detail-item-plancard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item-plancard:last-child {
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

.feature-item-plancard {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-start;
}

.feature-icon-plancard {
  color: var(--color-success);
  margin-right: 0.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.feature-text-plancard {
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

.current-plan-message,
.base-plan-message {
  display: block;
  padding: 0.75rem;
  background-color: var(--color-background-hover);
  color: var(--color-text-secondary);
  text-align: center;
  border-radius: 0.5rem;
  font-weight: 500;
  margin-top: auto;
}
`;
