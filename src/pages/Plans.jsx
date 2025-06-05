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
import LoadingSpinner from "../hooks/LoadingSpinner";
import NoNetModal from "../components/NoNetModal/NoNetModal";
import DepositModal from "../../components/DepositModal/DepositModal";

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
  const [noNetModal, setNoNetModal] = useState(false);

  // Refs for intersection observer
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const sectionHeaderRef = useRef(null);
  const gridRef = useRef(null);
  const faqRef = useRef(null);

  // Add network status monitoring
  useEffect(() => {
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        setNoNetModal(false);
      }
    };

    const handleOfflineStatus = () => {
      setNoNetModal(true);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    // Check initial status
    if (!navigator.onLine) {
      setNoNetModal(true);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

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

          // Trigger animation specifically when stats section comes into view
          if (entry.target === statsRef.current) {
            setAnimationTriggered(true);
          }

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
        // Check network status before making API call
        if (!navigator.onLine) {
          setNoNetModal(true);
          return;
        }

        try {
          const level = await getUserLevel(user.token);
          setUserLevel(level);
        } catch (error) {
          console.error("Error fetching user level:", error);

          // Check if it's a network error
          if (
            (error.message && error.message.includes("network")) ||
            error.code === "NETWORK_ERROR" ||
            !navigator.onLine
          ) {
            setNoNetModal(true);
          } else {
            // Default to level 1 if there's an error
            setUserLevel(1);
          }
        }
      }
    };

    fetchUserLevel();
  }, [user]);

  // Fetch investment plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      // Check network status before making API call
      if (!navigator.onLine) {
        setNoNetModal(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getInvestmentPlans();
        // console.log("plans", response);

        // Check if response is valid and contains data
        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid response from server");
        }

        // Separate plans into daily income and fixed deposit
        const dailyPlans = response.filter((plan) => !plan.isFixedDeposit);

        setInvestmentPlans(dailyPlans);
      } catch (error) {
        console.error("Error fetching investment plans:", error);

        // Check if it's a network error
        if (
          (error.message && error.message.includes("network")) ||
          error.code === "NETWORK_ERROR" ||
          !navigator.onLine
        ) {
          setNoNetModal(true);
        } else {
          toast.error("Failed to load investment plans");
        }

        setInvestmentPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user]);

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      // Reload the page to refetch data
      window.location.reload();
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

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
    // Add network error handler
    onNetworkError: () => setNoNetModal(true),
  });

  return (
    <>
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
                  <div className="stats-value-plans">
                    <StatsCounter
                      value={10000}
                      suffix="+"
                      duration={2}
                      triggerAnimation={animationTriggered}
                    />
                  </div>
                  <div className="stat-label">Active Investors</div>
                  <div className="stat-icon-plans investor-icon"></div>
                </div>
                <div className="stat-item">
                  <div className="stats-value-plans">
                    <span className="stat-prefix">$</span>
                    <StatsCounter
                      value={25}
                      suffix="M+"
                      duration={2}
                      triggerAnimation={animationTriggered}
                    />
                  </div>
                  <div className="stat-label">Total Invested</div>
                  <div className="stat-icon-plans investment-icon"></div>
                </div>
                <div className="stat-item">
                  <div className="stats-value-plans">
                    <StatsCounter
                      value={99.9}
                      suffix="%"
                      duration={2}
                      triggerAnimation={animationTriggered}
                    />
                  </div>
                  <div className="stat-label">Uptime</div>
                  <div className="stat-icon-plans uptime-icon"></div>
                </div>
                <div className="stat-item">
                  <div className="stats-value-plans">24/7</div>
                  <div className="stat-label">Support</div>
                  <div className="stat-icon-plans support-icon"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-header" ref={sectionHeaderRef}>
            <h2 className="section-title">Daily Profit Plans</h2>
            <p className="section-description">
              Invest in our daily profit plans and receive returns every 24
              hours. Perfect for investors looking for regular income.
            </p>
          </div>

          {loading ? (
            <div className="loading-container loading-container-grid">
              <LoadingSpinner />
            </div>
          ) : investmentPlans.length === 0 ? (
            <div className="network-error-container-plans">
              <div className="network-error-content">
                <div className="network-error-icon">
                  <div className="wifi-icon">
                    <div className="wifi-circle wifi-circle-1"></div>
                    <div className="wifi-circle wifi-circle-2"></div>
                    <div className="wifi-circle wifi-circle-3"></div>
                    <div className="wifi-base"></div>
                    <div className="wifi-slash"></div>
                  </div>
                </div>
                <div className="network-error-text">
                  <h3>Failed to Load Investment Plans</h3>
                  <p>
                    It looks like you're not connected to the internet. Please
                    check your connection and try again.
                  </p>
                </div>
                <div className="network-error-actions">
                  <button
                    className="retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                    Try Again
                  </button>
                  <button
                    className="offline-mode-btn"
                    onClick={() =>
                      toast.info("Offline mode - Some features may be limited")
                    }
                  >
                    Continue Offline
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="investment-grid">
              {investmentPlans.map((plan) => (
                <div key={plan._id} className="investment-grid-item">
                  <InvestmentCard
                    plan={mapDailyPlanProps(plan)}
                    userLevel={userLevel}
                    user={user}
                    onNetworkError={() => setNoNetModal(true)}
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
                Profits are distributed daily to your wallet. Fixed deposit
                plans pay the full amount at the end of the investment period.
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

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Plans;
