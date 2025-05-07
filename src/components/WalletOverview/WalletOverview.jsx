import React, { useState, useEffect } from "react";
import {
  Wallet2,
  TrendingUp,
  LineChart,
  Trophy,
  ArrowDown,
  ArrowUp,
  Users,
} from "lucide-react";
import { useWallet } from "../../contexts/WalletContext";
import { formatBalance } from "../../functions/wallet";
import { useSelector } from "react-redux";
import { getInvestmentPlans } from "../../functions/investmentplans";
import { getUserLevel } from "../../functions/user";
import {
  getTotalDeposits,
  getTotalWithdrawals,
  getTeamEarnings,
  getTotalEarnings,
} from "../../functions/user"; // Add these functions
import toast from "react-hot-toast";
import "./WalletOverview.css";

const WalletOverview = () => {
  const { walletBalance, walletCurrency, loading: walletLoading } = useWallet();
  const { user } = useSelector((state) => ({ ...state }));
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [teamEarnings, setTeamEarnings] = useState(0);

  // Fetch user investment plan and level
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.token) {
        try {
          setLoading(true);
          // Fetch user level
          const level = await getUserLevel(user.token);
          setUserLevel(level);

          // Fetch available plans
          const plans = await getInvestmentPlans(user.token);

          // Find the user's active plan based on wallet balance
          // Plans are sorted by minAmount to find the highest plan the user qualifies for
          const dailyPlans = plans
            .filter((plan) => !plan.isFixedDeposit)
            .sort((a, b) => parseFloat(b.minAmount) - parseFloat(a.minAmount));

          const eligiblePlan = dailyPlans.find(
            (plan) => parseFloat(walletBalance) >= parseFloat(plan.minAmount)
          );

          setActivePlan(eligiblePlan || null);

          // Fetch financial metrics
          const depositsResponse = await getTotalDeposits(user.token);
          setTotalDeposits(depositsResponse.data.total || 0);
          console.log(
            "depositsResponse.data.total",
            depositsResponse.data.total
          );

          const withdrawalsResponse = await getTotalWithdrawals(user.token);
          setTotalWithdrawals(withdrawalsResponse.data.total || 0);

          const teamResponse = await getTeamEarnings(user.token);
          setTeamEarnings(teamResponse.data.total || 0);

          // Replace the hardcoded total earnings with actual API call
          const earningsResponse = await getTotalEarnings(user.token);
          setTotalEarnings(earningsResponse.data.total || 0);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load investment data");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, walletBalance]);

  // Combine loading states
  const isLoading = loading || walletLoading;

  if (isLoading) {
    return (
      <div className="wallet-overview-grid">
        {/* Balance card skeleton */}
        <div className="wallet-card wallet-card-dashboard">
          <div className="wallet-card-content wallet-skeleton">
            <div className="wallet-skeleton-header">
              <div className="wallet-skeleton-title"></div>
              <div className="wallet-skeleton-icon"></div>
            </div>
            <div className="wallet-skeleton-amount"></div>
            <div className="wallet-skeleton-bar"></div>
          </div>
        </div>

        {/* Investments card skeleton */}
        <div className="wallet-card wallet-card-dashboard">
          <div className="wallet-card-content wallet-skeleton">
            <div className="wallet-skeleton-header">
              <div className="wallet-skeleton-title"></div>
              <div className="wallet-skeleton-icon"></div>
            </div>
            <div className="wallet-skeleton-amount"></div>
            <div className="wallet-skeleton-bar"></div>
          </div>
        </div>

        {/* Earnings card skeleton */}
        <div className="wallet-card wallet-card-dashboard">
          <div className="wallet-card-content wallet-skeleton">
            <div className="wallet-skeleton-header">
              <div className="wallet-skeleton-title"></div>
              <div className="wallet-skeleton-icon"></div>
            </div>
            <div className="wallet-skeleton-amount"></div>
            <div className="wallet-skeleton-bar"></div>
          </div>
        </div>

        {/* Total Deposits card skeleton */}
        <div className="wallet-card wallet-card-dashboard">
          <div className="wallet-card-content wallet-skeleton">
            <div className="wallet-skeleton-header">
              <div className="wallet-skeleton-title"></div>
              <div className="wallet-skeleton-icon"></div>
            </div>
            <div className="wallet-skeleton-amount"></div>
            <div className="wallet-skeleton-bar"></div>
          </div>
        </div>

        {/* Total Withdrawals card skeleton */}
        <div className="wallet-card wallet-card-dashboard">
          <div className="wallet-card-content wallet-skeleton">
            <div className="wallet-skeleton-header">
              <div className="wallet-skeleton-title"></div>
              <div className="wallet-skeleton-icon"></div>
            </div>
            <div className="wallet-skeleton-amount"></div>
            <div className="wallet-skeleton-bar"></div>
          </div>
        </div>

        {/* Team Earnings card skeleton */}
        <div className="wallet-card wallet-card-dashboard">
          <div className="wallet-card-content wallet-skeleton">
            <div className="wallet-skeleton-header">
              <div className="wallet-skeleton-title"></div>
              <div className="wallet-skeleton-icon"></div>
            </div>
            <div className="wallet-skeleton-amount"></div>
            <div className="wallet-skeleton-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default values if no active plan
  const dailyRate = activePlan
    ? `${activePlan.dailyIncome}% daily`
    : "0% daily";
  const weeklyGrowth = 7.5; // This should come from your actual data

  return (
    <div className="wallet-overview-grid">
      {/* Available Balance Card */}
      <div className="wallet-card wallet-card-dashboard">
        <div className="wallet-card-content">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Wallet Balance</h3>
            <Wallet2 className="wallet-card-icon primary-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              {formatBalance(walletBalance, walletCurrency)}
            </span>
            <div className="user-level-badge">
              <Trophy className="level-icon" />
              <span>Level {userLevel}</span>
            </div>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>Available</span>
              <span>100%</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill primary-gradient"
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              Available for withdrawal or reinvestment
            </p>
          </div>
        </div>
      </div>

      {/* Active Investments Card */}
      <div className="wallet-card wallet-card-dashboard">
        <div className="wallet-card-content">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">
              Daily Return
              {activePlan && (
                <span className="plan-name-badge">{activePlan.name}</span>
              )}
            </h3>
            <TrendingUp className="wallet-card-icon yellow-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              {formatBalance(
                (parseFloat(walletBalance) *
                  parseFloat(activePlan.dailyIncome)) /
                  100,
                walletCurrency
              )}
            </span>
            <span className="wallet-rate">{dailyRate}</span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>{activePlan ? "Active Plan" : "No Active Plan"}</span>
              <span>
                {activePlan ? activePlan.minLevel : "Level 1"} Required
              </span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill yellow-green-gradient"
                style={{ width: activePlan ? "100%" : "0%" }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              {activePlan
                ? `You're earning ${activePlan.dailyIncome}% daily returns`
                : "Deposit funds to activate an investment plan"}
            </p>
          </div>
        </div>
      </div>

      {/* Total Earnings Card */}
      <div className="wallet-card wallet-card-dashboard">
        <div className="wallet-card-content">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Total Earnings</h3>
            <LineChart className="wallet-card-icon green-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              {formatBalance(totalEarnings, walletCurrency)}
            </span>
            <span className="wallet-percent positive">
              <TrendingUp className="wallet-arrow-icon" />
              {weeklyGrowth}%
            </span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>This Week</span>
              <span>Last Week</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill green-primary-gradient"
                style={{ width: "75%" }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              Week-over-week earnings growth
            </p>
          </div>
        </div>
      </div>

      {/* Total Deposits Card */}
      <div className="wallet-card wallet-card-dashboard">
        <div className="wallet-card-content">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Total Deposits</h3>
            <ArrowDown className="wallet-card-icon blue-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              {formatBalance(totalDeposits, walletCurrency)}
            </span>
            <span className="wallet-rate">Lifetime</span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>All time</span>
              <span>Success rate: 100%</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill blue-gradient"
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              Total amount deposited in your account
            </p>
          </div>
        </div>
      </div>

      {/* Total Withdrawals Card */}
      <div className="wallet-card wallet-card-dashboard">
        <div className="wallet-card-content">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Total Withdrawals</h3>
            <ArrowUp className="wallet-card-icon purple-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              {formatBalance(totalWithdrawals, walletCurrency)}
            </span>
            <span className="wallet-rate">Lifetime</span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>All time</span>
              <span>
                {Math.round(
                  (totalWithdrawals / (totalDeposits + totalEarnings)) * 100
                ) || 0}
                % of total
              </span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill purple-gradient"
                style={{
                  width: `${
                    Math.min(
                      (totalWithdrawals / (totalDeposits + totalEarnings)) *
                        100,
                      100
                    ) || 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              Total amount withdrawn from your account
            </p>
          </div>
        </div>
      </div>

      {/* Team Earnings Card */}
      <div className="wallet-card wallet-card-dashboard">
        <div className="wallet-card-content">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Team Earnings</h3>
            <Users className="wallet-card-icon orange-icon" />
          </div>
          <div className="wallet-amount-container">
            <span className="wallet-amount">
              {formatBalance(teamEarnings, walletCurrency)}
            </span>
            <span className="wallet-percent positive">
              <TrendingUp className="wallet-arrow-icon" />
              {Math.round((teamEarnings / totalEarnings) * 100) || 0}%
            </span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>Referral earnings</span>
              <span>Of total earnings</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill orange-gradient"
                style={{
                  width: `${
                    Math.min((teamEarnings / totalEarnings) * 100, 100) || 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              Earnings from your referral network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverview;
