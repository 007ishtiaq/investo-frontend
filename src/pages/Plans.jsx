import React, { useState, useEffect } from "react";
import InvestmentCard from "../components/InvestmentCard/InvestmentCard";
import FixedDepositPlan from "../components/FixedDepositPlan/FixedDepositPlan";
import axios from "axios";
import { useSelector } from "react-redux";

/**
 * Investment page component displaying available investment plans
 */
const Plans = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch user level from backend
  useEffect(() => {
    const fetchUserLevel = async () => {
      if (user && user.token) {
        try {
          const res = await axios.get("/api/user/level", {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          setUserLevel(res.data.level || 2);
        } catch (error) {
          console.error("Error fetching user level:", error);
          // Default to level 1 if there's an error
          setUserLevel(2);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserLevel();
  }, [user]);

  // Sample investment plan data
  const [investmentPlans] = useState([
    {
      id: 1,
      name: "Basic Plan",
      level: 1,
      dailyRoi: 0.5,
      duration: "30 Days",
      minAmount: 0.1,
      featured: false,
      additionalFeatures: [
        "Daily profit distribution",
        "No early withdrawal fee",
        "Automatic reinvestment option",
      ],
    },
    {
      id: 2,
      name: "Standard Plan",
      level: 2,
      dailyRoi: 0.8,
      duration: "60 Days",
      minAmount: 0.5,
      featured: true,
      additionalFeatures: [
        "Daily profit distribution",
        "Priority customer support",
        "Automatic reinvestment option",
        "Weekly performance reports",
      ],
    },
    {
      id: 3,
      name: "Premium Plan",
      level: 3,
      dailyRoi: 1.2,
      duration: "90 Days",
      minAmount: 1.0,
      featured: false,
      additionalFeatures: [
        "Daily profit distribution",
        "Priority customer support",
        "Automatic reinvestment option",
        "Weekly performance reports",
        "Access to exclusive investment pools",
      ],
    },
    {
      id: 4,
      name: "Elite Plan",
      level: 4,
      dailyRoi: 1.5,
      duration: "180 Days",
      minAmount: 2.0,
      featured: false,
      additionalFeatures: [
        "Guaranteed returns",
        "Priority customer support",
        "Automatic reinvestment option",
        "Weekly performance reports",
        "Access to exclusive investment pools",
        "One-on-one investment consultation",
      ],
    },
  ]);

  // Sample fixed deposit data
  const [fixedDepositPlans] = useState([
    {
      id: 101,
      name: "Silver Deposit",
      roi: 8,
      durationInMonths: 3,
      minAmount: 0.5,
      featured: false,
      features: [
        "Guaranteed fixed returns",
        "One-time payout at maturity",
        "Low minimum deposit",
        "No maintenance fees",
      ],
    },
    {
      id: 102,
      name: "Gold Deposit",
      roi: 12,
      durationInMonths: 6,
      minAmount: 1.0,
      featured: true,
      features: [
        "Guaranteed fixed returns",
        "One-time payout at maturity",
        "Early withdrawal option (with fee)",
        "Priority customer support",
        "Monthly performance report",
      ],
    },
    {
      id: 103,
      name: "Platinum Deposit",
      roi: 18,
      durationInMonths: 12,
      minAmount: 3.0,
      featured: false,
      features: [
        "Guaranteed fixed returns",
        "One-time payout at maturity",
        "Early withdrawal option (with fee)",
        "Priority customer support",
        "Quarterly consultation calls",
        "Access to exclusive investment opportunities",
      ],
    },
  ]);

  return (
    <div className="investment-page">
      <div className="container">
        <div className="investment-header">
          <h1 className="page-title">Investment Plans</h1>
          <p className="page-description">
            Invest your crypto assets and earn daily returns with our range of
            investment plans. Choose the plan that suits your investment goals
            and risk appetite.
          </p>
        </div>

        <div className="investment-stats">
          <div className="stat-item">
            <div className="stat-value">10,000+</div>
            <div className="stat-label">Active Investors</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">$25M+</div>
            <div className="stat-label">Total Invested</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">Daily Profit Plans</h2>
          <p className="section-description">
            Invest in our daily profit plans and receive returns every 24 hours.
            Perfect for investors looking for regular income.
          </p>
        </div>

        <div className="investment-grid">
          {investmentPlans.map((plan) => (
            <div key={plan.id} className="investment-grid-item">
              <InvestmentCard plan={plan} userLevel={userLevel} user={user} />
            </div>
          ))}
        </div>

        <div className="section-header">
          <h2 className="section-title">Fixed Deposit Plans</h2>
          <p className="section-description">
            Our fixed deposit plans offer guaranteed returns at maturity. Ideal
            for investors looking for predictable growth over time.
          </p>
        </div>

        <div className="fixed-deposit-grid">
          {fixedDepositPlans.map((plan) => (
            <div key={plan.id} className="fixed-deposit-grid-item">
              <FixedDepositPlan plan={plan} />
            </div>
          ))}
        </div>

        <div className="investment-faq">
          <h2 className="faq-title">Frequently Asked Questions</h2>

          <div className="faq-item">
            <h3 className="faq-question">How do investment plans work?</h3>
            <p className="faq-answer">
              Our investment plans allow you to stake your crypto assets for a
              specified period and earn daily returns. The returns are
              automatically credited to your wallet each day.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">When will I receive my profits?</h3>
            <p className="faq-answer">
              Profits are distributed daily to your wallet. Fixed deposit plans
              pay the full amount at the end of the investment period.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">
              Can I withdraw early from an investment plan?
            </h3>
            <p className="faq-answer">
              Yes, most plans allow early withdrawal with a small fee. Fixed
              deposit plans have higher early withdrawal fees due to their
              guaranteed return structure.
            </p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">
              Is there a maximum investment amount?
            </h3>
            <p className="faq-answer">
              No, there is no maximum investment amount for our plans. You can
              invest as much as you want based on your financial capacity and
              risk tolerance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;

// Add styling for the Investment page
document.head.appendChild(document.createElement("style")).textContent = `
.investment-page {
  padding: 3rem 0;
}

.investment-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 800px;
  margin: 0 auto;
}

.investment-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
  text-align: center;
}

@media (min-width: 768px) {
  .investment-stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-item {
  background-color: var(--color-card-bg);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.investment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

@media (min-width: 640px) {
  .investment-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .investment-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.875rem;
  color: var(--color-text-primary);
}

.section-description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 800px;
  margin: 0 auto;
}

.fixed-deposit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

@media (min-width: 640px) {
  .fixed-deposit-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .fixed-deposit-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.fixed-deposit-grid-item {
  height: 100%;
}

.investment-faq {
  max-width: 800px;
  margin: 0 auto;
}

.faq-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--color-text-primary);
}

.faq-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.faq-question {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.faq-answer {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
`;
