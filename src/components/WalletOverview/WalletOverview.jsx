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
import { Link } from "react-router-dom";
import { useWallet } from "../../contexts/WalletContext";
import { formatBalance } from "../../functions/wallet";
import { useSelector } from "react-redux";
import { getInvestmentPlans } from "../../functions/investmentplans";
import { getUserLevel, getUserInvestments } from "../../functions/user";
import {
  getTotalDeposits,
  getTotalWithdrawals,
  getTeamEarnings,
  getTotalEarnings,
} from "../../functions/user";
import toast from "react-hot-toast";
import "./WalletOverview.css";

const WalletOverview = () => {
  const { walletBalance, walletCurrency, loading: walletLoading } = useWallet();
  const { user } = useSelector((state) => ({ ...state }));
  const [userLevel, setUserLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userInvestments, setUserInvestments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);

  // Level configurations for reward calculation
  const levelConfig = {
    1: { rewardPercentage: 0.5 },
    2: { rewardPercentage: 2.0 },
    3: { rewardPercentage: 3.0 },
    4: { rewardPercentage: 4.0 },
  };

  // Calculate total daily rewards from all user investments
  const calculateTotalDailyRewards = () => {
    if (!userInvestments || userInvestments.length === 0) return 0;

    let totalDailyRewards = 0;

    userInvestments.forEach((investment) => {
      const planLevel = investment.plan?.minLevel || investment.plan?.level;
      const levelPercentage = levelConfig[planLevel]?.rewardPercentage || 0;
      const levelTotalReward = (investment.amount * levelPercentage) / 100;
      totalDailyRewards += levelTotalReward;
    });

    return totalDailyRewards;
  };

  // Fetch user investment data and level
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.token) {
        try {
          setLoading(true);

          // Fetch user level
          const level = await getUserLevel(user.token);
          setUserLevel(level);

          // Fetch user investments
          const investments = await getUserInvestments(user.token);
          setUserInvestments(investments || []);

          // Fetch financial metrics
          const depositsResponse = await getTotalDeposits(user.token);
          setTotalDeposits(depositsResponse.data.total || 0);

          const withdrawalsResponse = await getTotalWithdrawals(user.token);
          setTotalWithdrawals(withdrawalsResponse.data.total || 0);

          const teamResponse = await getTeamEarnings(user.token);
          setTeamEarnings(teamResponse.data.total || 0);

          const earningsResponse = await getTotalEarnings(user.token);
          setTotalEarnings(earningsResponse.data.total || 0);
          setWeeklyGrowth(earningsResponse.data.weeklyGrowth || 0);
        } catch (error) {
          console.error("Error fetching user data:", error);

          if (error.message && error.message.includes(401)) {
            toast.error("Session Expired, Please reload the page");
          } else {
            toast.error(error.message || "Failed to load investment data");
          }
          setUserInvestments([]);
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

  // Calculate daily rewards
  const totalDailyRewards = calculateTotalDailyRewards();
  const hasInvestments = userInvestments.length > 0;

  if (isLoading) {
    return (
      <div className="wallet-overview-grid">
        {/* Skeleton loading cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="wallet-card wallet-card-dashboard">
            <div className="wallet-card-content wallet-skeleton">
              <div className="wallet-skeleton-header">
                <div className="wallet-skeleton-title"></div>
                <div className="wallet-skeleton-icon"></div>
              </div>
              <div className="wallet-skeleton-amount"></div>
              <div className="wallet-skeleton-bar"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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

      {/* Daily Return Card - Updated Logic */}
      <div className="wallet-card wallet-card-dashboard">
        <div className="wallet-card-content">
          <div className="wallet-card-header">
            <h3 className="wallet-card-title">Daily Return</h3>
            <TrendingUp className="wallet-card-icon yellow-icon" />
          </div>

          {!hasInvestments && userLevel === 0 ? (
            // No plan purchased state
            <div className="wallet-amount-container">
              <span className="wallet-amount no-plan-text-dash">
                No Plan Purchased
              </span>
              <Link to="/plans" className="purchase-plan-btn">
                View Plans
              </Link>
            </div>
          ) : (
            // Has investments state
            <div className="wallet-amount-container">
              <span className="wallet-amount">
                {formatBalance(totalDailyRewards, walletCurrency)}
              </span>
              <span className="wallet-rate">
                {userInvestments.length} Active Plan
                {userInvestments.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>{hasInvestments ? "Active Plans" : "No Active Plan"}</span>
              <span>
                {hasInvestments
                  ? `${userInvestments.length} Investment${
                      userInvestments.length !== 1 ? "s" : ""
                    }`
                  : "Purchase Required"}
              </span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill yellow-green-gradient"
                style={{ width: hasInvestments ? "100%" : "0%" }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              {hasInvestments
                ? `Total daily rewards from all your investment plans`
                : "Purchase an investment plan to start earning daily rewards"}
            </p>
          </div>
        </div>
      </div>

      {/* Total Earnings Card - Updated to show team + task earnings */}
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
            <span
              className={`wallet-percent ${
                weeklyGrowth >= 0 ? "positive" : "negative"
              }`}
            >
              <TrendingUp className="wallet-arrow-icon" />
              {Math.abs(weeklyGrowth).toFixed(1)}%
            </span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>This Week</span>
              <span>All Sources</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill green-primary-gradient"
                style={{ width: "75%" }}
              ></div>
            </div>
            <p className="wallet-progress-text">
              Combined earnings from tasks, referrals & bonuses
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
              <span>Success rate: 100%</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill purple-gradient"
                style={{ width: "80%" }}
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
            <span className="wallet-rate">From referrals</span>
          </div>
          <div className="wallet-progress-container">
            <div className="wallet-progress-labels">
              <span>Team performance</span>
              <span>Growing</span>
            </div>
            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill orange-gradient"
                style={{ width: "60%" }}
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
