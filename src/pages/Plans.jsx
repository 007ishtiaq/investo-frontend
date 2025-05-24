import React, { useState, useEffect, useRef } from "react";
import InvestmentCard from "../components/InvestmentCard/InvestmentCard";
import { useSelector } from "react-redux";
import { getInvestmentPlans } from "../functions/investmentplans";
import { getUserLevel } from "../functions/user"; // Import the getUserLevel function
import { useWallet } from "../contexts/WalletContext";
import toast from "react-hot-toast";
import "./Plans.css";
import PlanUpgradeModal from "../components/PlanUpgradeModal/PlanUpgradeModal";
import StatsCounter from "../components/StatsCounter/StatsCounter";

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
  const [animationTriggered, setAnimationTriggered] = useState(false);

  // Refs for intersection observer
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const sectionHeaderRef = useRef(null);
  const gridRef = useRef(null);
  const faqRef = useRef(null);

  // Function to handle plan upgrade button click
  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  // Set up intersection observer for animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          // Remove observer once animation is triggered
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements
    if (headerRef.current) observer.observe(headerRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    if (sectionHeaderRef.current) observer.observe(sectionHeaderRef.current);
    if (gridRef.current) observer.observe(gridRef.current);
    if (faqRef.current) observer.observe(faqRef.current);

    // Set animation triggered to true after initial load
    setTimeout(() => setAnimationTriggered(true), 500);

    return () => {
      // Clean up observers
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (statsRef.current) observer.unobserve(statsRef.current);
      if (sectionHeaderRef.current)
        observer.unobserve(sectionHeaderRef.current);
      if (gridRef.current) observer.unobserve(gridRef.current);
      if (faqRef.current) observer.unobserve(faqRef.current);
    };
  }, []);

  // Fetch user level from backend using the getUserLevel function
  useEffect(() => {
    const fetchUserLevel = async () => {
      if (user && user.token) {
        try {
          const level = await getUserLevel(user.token);
          setUserLevel(level);
        } catch (error) {
          console.error("Error fetching user level:", error);
          // Default to level 1 if there's an error
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
        const response = await getInvestmentPlans();
        console.log("plans", response);

        // Check if response is valid and contains data
        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid response from server");
        }

        // Separate plans into daily income and fixed deposit
        const dailyPlans = response.filter((plan) => !plan.isFixedDeposit);

        setInvestmentPlans(dailyPlans);
      } catch (error) {
        console.error("Error fetching investment plans:", error);
        toast.error("Failed to load investment plans");

        setInvestmentPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
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
    additionalFeatures: plan.features || [],
    // Add this prop to enable upgrade modal
    onUpgrade: () => handleUpgradeClick(plan),
  });

  return (
    <div className="investment-page">
      <div className="container">
        <div className="investment-hero">
          <div className="container">
            <div className="investment-header" ref={headerRef}>
              <div className="header-content-plans">
                <h1 className="page-title">Investment Plans</h1>
                <p className="page-description">
                  Invest your crypto assets and earn daily returns with our
                  range of investment plans. Choose the plan that suits your
                  investment goals and risk appetite.
                </p>
                <div className="header-actions">
                  <button className="learn-more-btn">
                    <span className="btn-text">Learn More</span>
                    <span className="btn-icon">→</span>
                  </button>
                </div>
              </div>
              <div className="header-graphic">
                <div className="investment-graphic-container animate-float">
                  <div className="investment-graphic-inner">
                    <div className="investment-graphic-circle circle-1"></div>
                    <div className="investment-graphic-circle circle-2"></div>
                    <div className="investment-graphic-circle circle-3"></div>
                    <div className="investment-graphic-chart"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="investment-stats" ref={statsRef}>
              <div className="stat-item">
                <StatsCounter
                  value={10000}
                  suffix="+"
                  duration={2}
                  triggerAnimation={animationTriggered}
                />
                <div className="stat-label">Active Investors</div>
                <div className="stat-icon investor-icon"></div>
              </div>
              <div className="stat-item">
                <div className="stat-prefix">$</div>
                <StatsCounter
                  value={25}
                  suffix="M+"
                  duration={2}
                  triggerAnimation={animationTriggered}
                />
                <div className="stat-label">Total Invested</div>
                <div className="stat-icon investment-icon"></div>
              </div>
              <div className="stat-item">
                <StatsCounter
                  value={99.9}
                  suffix="%"
                  duration={2}
                  triggerAnimation={animationTriggered}
                />
                <div className="stat-label">Uptime</div>
                <div className="stat-icon uptime-icon"></div>
              </div>
              <div className="stat-item">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Support</div>
                <div className="stat-icon support-icon"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-header" ref={sectionHeaderRef}>
          <h2 className="section-title">Daily Profit Plans</h2>
          <p className="section-description">
            Invest in our daily profit plans and receive returns every 24 hours.
            Perfect for investors looking for regular income.
          </p>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading plans...</div>
        ) : investmentPlans.length === 0 ? (
          <div className="no-plans-message">
            No investment plans available at the moment. Please check back
            later.
          </div>
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

        <div className="investment-faq" ref={faqRef}>
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
