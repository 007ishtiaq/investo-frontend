import React from "react";
import { Link } from "react-router-dom";
import { EthereumIcon } from "../../utils/icons";

/**
 * Fixed Deposit Plan component showing guaranteed returns
 */
const FixedDepositPlan = ({ plan }) => {
  // Calculate total return amount
  const calculateTotalReturn = () => {
    // For fixed deposits, ROI is typically annual, so we calculate based on months
    const monthsInYear = 12;
    const durationInMonths = plan.durationInMonths;
    const annualizedReturn = plan.roi / 100; // Convert percentage to decimal

    // Calculate interest for the given duration
    const interest =
      plan.minAmount * annualizedReturn * (durationInMonths / monthsInYear);

    // Round to 2 decimal places
    return (plan.minAmount + interest).toFixed(2);
  };

  // Format the duration in a human-readable way
  const formatDuration = () => {
    const months = plan.durationInMonths;
    if (months < 12) {
      return `${months} Month${months > 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      if (remainingMonths === 0) {
        return `${years} Year${years > 1 ? "s" : ""}`;
      } else {
        return `${years} Year${years > 1 ? "s" : ""} ${remainingMonths} Month${
          remainingMonths > 1 ? "s" : ""
        }`;
      }
    }
  };

  return (
    <div
      className={`fixed-deposit-plan ${plan.featured ? "featured-plan" : ""}`}
    >
      {plan.featured && <div className="plan-badge">Recommended</div>}

      <div className="plan-header">
        <h3 className="plan-name">{plan.name}</h3>
        <div className="plan-label">{formatDuration()} Fixed Deposit</div>
      </div>

      <div className="plan-roi">
        <span className="roi-value">{plan.roi}%</span>
        <span className="roi-label">Annual ROI</span>
      </div>

      <div className="investment-info">
        <div className="info-item">
          <div className="info-label">Initial Deposit</div>
          <div className="info-value">
            <EthereumIcon size={14} />
            <span>{plan.minAmount} ETH</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">Total Return</div>
          <div className="info-value">
            <EthereumIcon size={14} />
            <span>{calculateTotalReturn()} ETH</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-label">Maturity Period</div>
          <div className="info-value">{formatDuration()}</div>
        </div>
      </div>

      <div className="plan-features">
        <h4 className="features-heading">Features</h4>
        <ul className="features-list">
          {plan.features.map((feature, index) => (
            <li key={index} className="feature-item">
              <span className="feature-icon">✓</span>
              <span className="feature-text">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href={`/invest/${plan.id}`} className="invest-button">
        Invest Now
      </Link>
    </div>
  );
};

export default FixedDepositPlan;

// Add styling for the FixedDepositPlan component
document.head.appendChild(document.createElement("style")).textContent = `
.fixed-deposit-plan {
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.fixed-deposit-plan:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.featured-plan {
  border: 2px solid var(--color-primary);
}

.plan-badge {
  position: absolute;
  top: -10px;
  right: 1.5rem;
  background: var(--gradient-button);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.plan-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.plan-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.plan-roi {
  text-align: center;
  padding: 1rem;
  background-color: var(--color-background-hover);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.roi-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.roi-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.investment-info {
  margin-bottom: 1.5rem;
}

.info-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
}

.info-value svg {
  margin-right: 0.25rem;
  color: var(--color-primary);
}

.plan-features {
  margin-bottom: 1.5rem;
  flex: 1;
}

.features-heading {
  font-size: 1rem;
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
  font-size: 0.875rem;
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
`;
