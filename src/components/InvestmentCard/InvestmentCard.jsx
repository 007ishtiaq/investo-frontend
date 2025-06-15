// components/InvestmentCard/InvestmentCard.js
import React from "react";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { EthereumIcon } from "../../utils/icons";
/**
 * Investment Card component for displaying investment plans
 */
const InvestmentCard = ({
  id,
  name,
  level,
  dailyRoi,
  duration,
  minAmount,
  maxAmount,
  featured,
  additionalFeatures,
  description,
  returnRate,
  userLevel,
  userBalance,
  currency,
  userInvestments, // Array of user's investments
  onUpgrade,
  onOpenDepositModal,
  onNetworkError,
}) => {
  const history = useHistory();
  const { user } = useSelector((state) => ({ ...state })); // Get user from Redux
  // Calculate daily and total profit based on backend data
  const calculateProfit = () => {
    let dailyProfit = 0;
    // Use minAmount for calculation, handle special case where minAmount might be 0
    if (minAmount === 0) {
      // For plans with minAmount 0, use a base amount for display calculation
      const baseAmount = 100;
      dailyProfit = baseAmount * (dailyRoi / 100);
    } else {
      dailyProfit = minAmount * (dailyRoi / 100);
    }
    // Total profit calculation (365 days for annual profit)
    const totalProfit = dailyProfit * 365;
    return {
      daily: dailyProfit.toFixed(2),
      total: totalProfit.toFixed(2),
    };
  };
  const profit = calculateProfit();
  // Check if user is logged in using Redux state
  const isLoggedIn = user && user.token;
  // Check if user has purchased this plan before
  const hasPurchasedPlan = userInvestments?.some(
    (investment) => investment.plan._id === id || investment.plan === id
  );
  // Check if this plan matches the user's level
  const isUserLevel = isLoggedIn && level === userLevel;
  // Check if this plan is higher than user's level (for upgrade button)
  const isHigherLevel = isLoggedIn && level > userLevel;
  // Check if this plan is lower than user's level
  const isLowerLevel = isLoggedIn && level < userLevel;
  // Check if user has level 0 (no plan purchased)
  const hasNoPlan = isLoggedIn && userLevel === 0;
  // Determine if this is the first (Basic) plan based on level and minAmount
  const isBasicPlan = level === 1 && minAmount === 0;
  // Handler for plan upgrade button with network checking
  const handleUpgradeClick = (e) => {
    e.preventDefault();

    // If user is not logged in, redirect to login
    if (!isLoggedIn) {
      history.push("/login");
      return;
    }
    // Check network status before proceeding
    if (!navigator.onLine) {
      // Call the network error handler passed from parent
      if (onNetworkError) {
        onNetworkError();
      }
      return;
    }

    // Use the onUpgrade handler from props
    if (onUpgrade) {
      onUpgrade();
    }
  };
  // Handler for invest now button (for non-logged in users)
  const handleInvestNowClick = (e) => {
    e.preventDefault();
    history.push("/login");
  };
  // Determine ROI display ($ or %)
  const roiDisplay = isBasicPlan ? `$${dailyRoi}` : `${dailyRoi}%`;
  // Determine ROI label
  const roiLabel = isBasicPlan ? "Daily Reward" : "Daily ROI";
  // Determine profit labels - all plans show Annual Profit
  const dailyProfitLabel = "Daily Profit";
  const totalProfitLabel = "Annual Profit";
  return (
    <div
      className={`investment-card ${
        !isLoggedIn && featured ? "featured-card" : ""
      } ${isLoggedIn && isUserLevel ? "your-level-card" : ""} ${
        hasNoPlan ? "no-plan-card" : ""
      } ${hasPurchasedPlan ? "purchased-card" : ""}`}
    >
      {/* Only show "Most Popular" if no user is logged in OR user is logged in but this isn't their level */}
      {!isLoggedIn && featured && (
        <div className="card-badge">Most Popular</div>
      )}
      {/* Only show "Your Level" if user is logged in and this is their level */}
      {isLoggedIn && isUserLevel && userLevel > 0 && (
        <div className="card-badge your-level-badge">Your Account Level</div>
      )}

      <div className="card-header-investment">
        <div
          className={`level-tag ${
            isLoggedIn && isUserLevel ? "your-level-tag" : ""
          } ${hasNoPlan ? "no-plan-level-tag" : ""} ${
            hasPurchasedPlan ? "purchased-level-tag" : ""
          }`}
        >
          Level {level}
        </div>
        <h3 className="plan-name">{name}</h3>
        {description && <p className="plan-description">{description}</p>}
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
            <span>{minAmount} USD</span>
          </div>
        </div>
        {maxAmount && (
          <div className="detail-item-plancard">
            <div className="detail-label">Maximum to Invest</div>
            <div className="detail-value">
              <EthereumIcon size={14} />
              <span>{maxAmount} USD</span>
            </div>
          </div>
        )}
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
        {duration && (
          <div className="detail-item-plancard">
            <div className="detail-label">Duration</div>
            <div className="detail-value">
              <span>{duration}</span>
            </div>
          </div>
        )}
      </div>
      {additionalFeatures && additionalFeatures.length > 0 && (
        <div className="additional-features">
          <h4 className="features-title">Features</h4>
          <ul className="features-list">
            {additionalFeatures.map((feature, index) => (
              <li key={index} className="feature-item-plancard">
                <span className="feature-icon-plancard">✓</span>
                <span className="feature-text-plancard">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Button Logic */}
      {isLoggedIn ? (
        hasNoPlan ? (
          // For level 0 users - show "Purchase Now" on all plans
          <div>
            <button
              onClick={handleUpgradeClick}
              className="invest-button purchase-button"
            >
              Purchase Now
            </button>
          </div>
        ) : isHigherLevel ? (
          // Show "Upgrade Now" button for plans higher than the user's level
          <div>
            <button onClick={handleUpgradeClick} className="invest-button">
              Upgrade Now
            </button>
          </div>
        ) : isUserLevel ? (
          // Show "Current Plan" for user's current level
          <div className="current-plan-message">Current Plan</div>
        ) : isLowerLevel ? (
          // For plans below user's level - check if purchased
          hasPurchasedPlan ? (
            <div className="purchased-plan-message">Purchased</div>
          ) : (
            <div>
              <button
                onClick={handleUpgradeClick}
                className="invest-button purchase-button"
              >
                Purchase Now
              </button>
            </div>
          )
        ) : (
          // Fallback
          <div className="base-plan-message">Base Plan</div>
        )
      ) : (
        // For non-logged in users: All plans redirect to login
        <div>
          {isBasicPlan ? (
            <div className="base-plan-message">Base Plan</div>
          ) : (
            <button onClick={handleInvestNowClick} className="invest-button">
              Invest Now
            </button>
          )}
        </div>
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

.no-plan-card {
  border: 2px solid #e5e7eb;
  box-shadow: 0 0 15px #eeeeee;
}

.purchased-card {
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

.purchased-badge {
  background: linear-gradient(45deg, #8b5cf6, #a78bfa);
  left: 1.5rem;
  right: auto;
}

.available-badge {
  background: linear-gradient(45deg, #8b5cf6, #a78bfa);
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

.plan-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
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
  background: linear-gradient(45deg, #00d0ff, #00d0ff);
  font-weight: 700;
  transform: scale(1.05);
}

.no-plan-level-tag {
  background: linear-gradient(45deg, #8b5cf6, #a78bfa);
  font-weight: 600;
}

.purchased-level-tag {
  background: linear-gradient(45deg, #8b5cf6, #a78bfa);
  font-weight: 600;
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
  border: none;
  cursor: pointer;
}

.invest-button:hover {
  opacity: 0.9;
}

.purchase-button {
  background: var(--gradient-button);
  font-weight: 600;
}

.purchase-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
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
.base-plan-message,
.purchased-plan-message {
  display: block;
  padding: 0.75rem;
  background-color: var(--color-background-hover);
  color: var(--color-text-secondary);
  text-align: center;
  border-radius: 0.5rem;
  font-weight: 500;
  margin-top: auto;
}

.purchased-plan-message {
  background-color: #f3f4f6;
  color: #8b5cf6;
  font-weight: 600;
}

@media (max-width: 768px) {
  .investment-card {
    padding: 1.25rem 0.875rem 0.875rem;
  }
  
  .plan-name {
    font-size: 1.125rem;
  }
  
  .roi-value {
    font-size: 1.5rem;
  }
}
`;
