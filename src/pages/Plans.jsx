import React, { useState, useEffect } from "react";
import InvestmentCard from "../components/InvestmentCard/InvestmentCard";
import { useSelector } from "react-redux";
import { getInvestmentPlans } from "../functions/investmentplans";
import { getUserLevel } from "../functions/user"; // Import the getUserLevel function
import { useWallet } from "../contexts/WalletContext";
import toast from "react-hot-toast";
import "./Plans.css";
import PlanUpgradeModal from "../components/PlanUpgradeModal/PlanUpgradeModal";

/**
 * Investment page component displaying available investment plans
 */
const Plans = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const { walletBalance, walletCurrency } = useWallet();
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [investmentPlans, setInvestmentPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Function to handle plan upgrade button click
  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  // Fetch user level from backend using the getUserLevel function
  useEffect(() => {
    const fetchUserLevel = async () => {
      if (user && user.token) {
        try {
          const level = await getUserLevel(user.token);
          setUserLevel(level);
        } catch (error) {
          console.error("Error fetching user level:", error);
          // Default to level 1 if there's an error (not 2 as it was before)
          setUserLevel(1);
        }
      }
    };

    fetchUserLevel();
  }, [user]);

  // Fetch investment plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const plans = await getInvestmentPlans();
        console.log("plans", plans);

        // Separate plans into daily income and fixed deposit
        const dailyPlans = plans.filter((plan) => !plan.isFixedDeposit);

        setInvestmentPlans(dailyPlans);
      } catch (error) {
        console.error("Error fetching investment plans:", error);
        toast.error("Failed to load investment plans");
      } finally {
        setLoading(false);
      }
    };

    // if (user && user.token) {
    fetchPlans();
    // } else {
    //   setLoading(false);
    // }
  }, [user]);

  // Map database fields to component props for daily plans
  const mapDailyPlanProps = (plan) => ({
    id: plan._id,
    name: plan.name,
    level: plan.minLevel,
    dailyRoi: plan.dailyIncome,
    duration: `${plan.durationInDays} Days`,
    minAmount: plan.minAmount,
    featured: plan.featured,
    additionalFeatures: plan.features,
    // Add this prop to enable upgrade modal
    onUpgrade: () => handleUpgradeClick(plan),
  });

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

        {loading ? (
          <div className="loading-spinner">Loading plans...</div>
        ) : (
          <div className="investment-grid">
            {investmentPlans.map((plan) => (
              <div key={plan._id} className="investment-grid-item">
                <InvestmentCard
                  plan={mapDailyPlanProps(plan)}
                  userLevel={userLevel}
                  user={user}
                />
              </div>
            ))}
          </div>
        )}

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

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        plan={selectedPlan}
        walletBalance={walletBalance}
        walletCurrency={walletCurrency}
        userToken={user?.token}
      />
    </div>
  );
};

export default Plans;
