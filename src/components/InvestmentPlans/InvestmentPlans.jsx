import React, { useState, useEffect } from "react";
import { getInvestmentPlans } from "../../functions/investmentplans";
import { getUserLevel } from "../../functions/user";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "./InvestmentPlans.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp } from "lucide-react";
import { useWallet } from "../../contexts/WalletContext";
import PlanUpgradeModal from "../../components/PlanUpgradeModal/PlanUpgradeModal";

const PlanItem = ({
  plan,
  walletBalance,
  userLevel,
  detailed = false,
  onOpenDepositModal,
}) => {
  const { user } = useSelector((state) => ({ ...state }));
  const { walletCurrency } = useWallet();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const minAmount = parseFloat(plan.minAmount);
  const dailyRate = parseFloat(plan.dailyIncome);
  const parsedWalletBalance = parseFloat(walletBalance || 0);

  // Check if user has enough balance for this plan
  const hasEnoughBalance = parsedWalletBalance >= minAmount;

  // Check if user's current level is at or above this plan's level
  const isCurrentOrLower = userLevel >= plan.minLevel;

  // Check if this is exactly the user's current level plan
  const isCurrentLevel = userLevel === plan.minLevel;

  // Check if this plan requires a higher level than the user's current level
  const isHigherLevel = plan.minLevel > userLevel;

  // Check if the plan is available for upgrade (higher level AND enough balance)
  const isAvailableForUpgrade = isHigherLevel && hasEnoughBalance;

  // For progress bar, we'll use wallet balance
  const percentComplete = Math.min(
    100,
    (parsedWalletBalance / minAmount) * 100
  );

  // Calculate monthly and yearly returns
  const monthlyReturn = (dailyRate * 30).toFixed(1);
  const yearlyReturn = (dailyRate * 365).toFixed(1);

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  return (
    <>
      <div
        className={`plan-item ${isCurrentLevel ? "plan-item-active" : ""} ${
          isAvailableForUpgrade ? "plan-item-available" : ""
        }`}
      >
        <div className="plan-header">
          <div>
            <h3 className="plan-title">{plan.name}</h3>
            <p className="plan-description">{plan.description}</p>
          </div>
          {isCurrentLevel ? (
            <span className="plan-status plan-status-active">Current</span>
          ) : isCurrentOrLower ? (
            <span className="plan-status plan-status-base">Base</span>
          ) : isAvailableForUpgrade ? (
            <span className="plan-status plan-status-available">Available</span>
          ) : (
            <span className="plan-status plan-status-locked">Locked</span>
          )}
        </div>

        {detailed && (
          <div className="plan-stats-grid">
            <div className="plan-stat-box">
              <div className="plan-stat-label">Daily</div>
              <div className="plan-stat-value">{dailyRate}%</div>
            </div>
            <div className="plan-stat-box">
              <div className="plan-stat-label">Monthly</div>
              <div className="plan-stat-value">~{monthlyReturn}%</div>
            </div>
            <div className="plan-stat-box">
              <div className="plan-stat-label">Yearly</div>
              <div className="plan-stat-value">~{yearlyReturn}%</div>
            </div>
          </div>
        )}

        <div className="plan-progress-container">
          <div className="plan-progress-header">
            <span className="plan-min-amount">
              Min: ${minAmount.toFixed(2)}
            </span>
            <span className="plan-daily-rate">{dailyRate}% daily</span>
          </div>
          <div className="plan-progress-bar">
            <div
              className={`plan-progress-fill ${
                hasEnoughBalance
                  ? "plan-progress-fill-active"
                  : "plan-progress-fill-locked"
              }`}
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          <div className="plan-balance-text">
            Your balance: ${parsedWalletBalance.toFixed(2)}
          </div>
        </div>

        {/* Show the upgrade button only for higher-level plans */}
        {isHigherLevel && (
          <Button
            className={`plan-upgrade-button ${
              hasEnoughBalance ? "plan-upgrade-button-available" : ""
            }`}
            size="sm"
            onClick={handleUpgradeClick}
          >
            <ArrowUp className="plan-upgrade-icon" /> Upgrade Plan
          </Button>
        )}
      </div>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        plan={plan}
        walletBalance={parsedWalletBalance}
        walletCurrency={walletCurrency || "USD"}
        userToken={user?.token}
        onOpenDepositModal={onOpenDepositModal} // Pass the prop down
      />
    </>
  );
};

const InvestmentPlans = ({
  showAll = false,
  showDetailed = false,
  maxItems = 3,
  title = "Investment Plans",
  onOpenDepositModal,
}) => {
  const { user } = useSelector((state) => ({ ...state }));
  const { walletBalance } = useWallet();
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  // Fetch user level from backend
  useEffect(() => {
    const fetchUserLevel = async () => {
      if (user && user.token) {
        try {
          const level = await getUserLevel(user.token);
          setUserLevel(level);
        } catch (error) {
          console.error("Error fetching user level:", error);
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
        const plansData = await getInvestmentPlans(user?.token);

        // Separate plans into daily income and fixed deposit
        const dailyPlans = plansData.filter((plan) => !plan.isFixedDeposit);

        setPlans(dailyPlans);
      } catch (error) {
        console.error("Error fetching investment plans:", error);
        toast.error("Failed to load investment plans");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.token) {
      fetchPlans();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Sort plans by minimum amount (ascending)
  const sortedPlans = [...plans].sort(
    (a, b) => parseFloat(a.minAmount) - parseFloat(b.minAmount)
  );

  // Show only a subset of plans unless showAll is true
  const displayedPlans = showAll ? sortedPlans : sortedPlans.slice(0, maxItems);

  if (loading) {
    return (
      <Card>
        <CardHeader className="plans-header">
          <div className="plans-header-content">
            <CardTitle>{title}</CardTitle>
            <div className="plans-loading-view"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="plans-loading">
            {Array(showAll ? 5 : Math.min(2, maxItems))
              .fill(0)
              .map((_, i) => (
                <div key={i} className="plan-loading-item">
                  <div className="plan-loading-header">
                    <div>
                      <div className="plan-loading-title"></div>
                      <div className="plan-loading-description"></div>
                    </div>
                    <div className="plan-loading-status"></div>
                  </div>
                  {showDetailed && (
                    <div className="plan-loading-stats">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="plan-loading-stat"></div>
                      ))}
                    </div>
                  )}
                  <div className="plan-loading-progress">
                    <div className="plan-loading-progress-header">
                      <div className="plan-loading-min"></div>
                      <div className="plan-loading-rate"></div>
                    </div>
                    <div className="plan-loading-bar"></div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="plans-header">
        <div className="plans-header-content">
          <CardTitle>{title}</CardTitle>
          {!showAll && (
            <Link to="/invest">
              <div className="plans-view-all">
                <span>View All</span>
                <ArrowRight className="plans-arrow-icon" />
              </div>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`plans-grid ${showAll ? "plans-grid-full" : ""}`}>
          {displayedPlans.map((plan) => (
            <PlanItem
              key={plan._id}
              plan={plan}
              walletBalance={walletBalance || "0"}
              userLevel={userLevel}
              detailed={showDetailed}
              onOpenDepositModal={onOpenDepositModal} // Pass the prop down
            />
          ))}
        </div>

        {displayedPlans.length === 0 && (
          <div className="plans-empty">No investment plans available.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentPlans;
