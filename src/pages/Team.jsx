// client/src/pages/Team.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getTeamMembers,
  getAffiliateCode,
  getTeamEarnings,
} from "../functions/team";
import { formatBalance } from "../functions/wallet";
import { getUserLevel } from "../functions/user";
import "./Team.css";

const Team = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    affiliateEarnings: 0,
  });
  const [earnings, setEarnings] = useState({
    total: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
    byLevel: {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
    },
  });
  const [membersByLevel, setMembersByLevel] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
  });
  const [recentRewards, setRecentRewards] = useState([]);
  const [affiliateCode, setAffiliateCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  // Refs for animation
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const affiliateSectionRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const commissionRatesRef = useRef(null);
  const testimonialRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);
  const [animationTriggered, setAnimationTriggered] = useState(false);

  // Set up animation observer
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
    const refs = [
      headerRef,
      statsRef,
      affiliateSectionRef,
      benefitsRef,
      howItWorksRef,
      commissionRatesRef,
      testimonialRef,
      faqRef,
      ctaRef,
    ];

    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    // Set animation triggered to true after initial load
    setTimeout(() => setAnimationTriggered(true), 500);

    return () => {
      // Clean up observers
      refs.forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  useEffect(() => {
    if (user && user.token) {
      loadTeamData();
      loadUserLevel();
      loadTeamEarnings();
    }
  }, [user]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      // Fetch team members
      const membersRes = await getTeamMembers(user.token);
      if (membersRes && membersRes.data) {
        setTeamMembers(membersRes.data.teamMembers || []);
        setStats(
          membersRes.data.stats || {
            totalMembers: 0,
            activeMembers: 0,
            affiliateEarnings: 0,
          }
        );
      }

      // Fetch affiliate code
      const codeRes = await getAffiliateCode(user.token);

      if (codeRes && codeRes.data) {
        setAffiliateCode(codeRes.data.affiliateCode || "");
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  // New function to load team earnings
  const loadTeamEarnings = async () => {
    setEarningsLoading(true);
    try {
      const res = await getTeamEarnings(user.token);
      if (res && res.data && res.data.success) {
        setEarnings(res.data.earnings);
        setMembersByLevel(res.data.membersByLevel);
        setRecentRewards(res.data.recentRewards || []);

        // Update the total earnings in stats
        setStats((prev) => ({
          ...prev,
          affiliateEarnings: res.data.earnings.total,
        }));
      }
    } catch (error) {
      console.error("Error loading team earnings:", error);
      toast.error("Failed to load team earnings");
    } finally {
      setEarningsLoading(false);
    }
  };

  const loadUserLevel = async () => {
    try {
      const level = await getUserLevel(user.token);
      setUserLevel(level);
    } catch (error) {
      console.error("Error loading user level:", error);
    }
  };

  const copyToClipboard = () => {
    const affiliateLink = `${window.location.origin}/register?ref=${affiliateCode}`;
    navigator.clipboard
      .writeText(affiliateLink)
      .then(() => {
        setCopied(true);
        toast.success("Affiliate link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      });
  };

  if (!user || !user.token) {
    return (
      <div className="team-page">
        {/* Hero Section for non-logged in users */}
        <div className="team-hero">
          <div className="container">
            <div className="team-header" ref={headerRef}>
              <div className="header-content-team">
                <h1 className="page-title">Affiliate Program</h1>
                <p className="page-description">
                  Join our powerful multi-level affiliate system and earn
                  passive income by referring friends and building your network.
                  The more your team grows, the more you earn!
                </p>
                <div className="header-actions">
                  <Link to="/register" className="register-button">
                    <span className="btn-text">Join Now</span>
                    <span className="btn-icon">→</span>
                  </Link>
                </div>
              </div>
              <div className="header-graphic">
                <div className="team-graphic-container animate-float">
                  <div className="team-graphic-inner">
                    <div className="team-graphic-circle circle-1"></div>
                    <div className="team-graphic-circle circle-2"></div>
                    <div className="team-graphic-circle circle-3"></div>
                    <div className="team-graphic-network"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="team-statistics" ref={statsRef}>
              <div className="stat-item">
                <div className="stat-value">4 Levels</div>
                <div className="stat-label">Affiliate Structure</div>
                <div className="stat-icon network-icon"></div>
              </div>
              <div className="stat-item">
                <div className="stat-value">Up to 3%</div>
                <div className="stat-label">Daily Commission</div>
                <div className="stat-icon commission-icon"></div>
              </div>
              <div className="stat-item">
                <div className="stat-value">Unlimited</div>
                <div className="stat-label">Team Size</div>
                <div className="stat-icon team-icon"></div>
              </div>
              <div className="stat-item">
                <div className="stat-value">Instant</div>
                <div className="stat-label">Commission Payouts</div>
                <div className="stat-icon payout-icon"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* How It Works Section */}
          <div className="how-it-works-section" ref={howItWorksRef}>
            <h2 className="section-title">How Our Affiliate Program Works</h2>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Create Your Account</h3>
                  <p>
                    Sign up for a free account and get your personal affiliate
                    link instantly.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Share Your Link</h3>
                  <p>
                    Share your affiliate link with friends, on social media, or
                    your website.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Build Your Network</h3>
                  <p>
                    As people join using your link, they become part of your
                    team.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Earn Commissions</h3>
                  <p>
                    Earn daily commissions based on your team's activity and
                    investments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="benefits-section" ref={benefitsRef}>
            <h2 className="section-title">Benefits of Our Affiliate Program</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon passive-icon"></div>
                <h3>Passive Income</h3>
                <p>Earn money 24/7 even when you're not actively working.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon multi-level-icon"></div>
                <h3>Multi-Level Structure</h3>
                <p>Earn from up to 4 levels deep in your referral network.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon daily-icon"></div>
                <h3>Daily Payouts</h3>
                <p>
                  Receive commissions daily directly to your account balance.
                </p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon easy-icon"></div>
                <h3>Easy to Start</h3>
                <p>No technical skills required - just share your link.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon growth-icon"></div>
                <h3>Exponential Growth</h3>
                <p>Your earnings grow exponentially as your team expands.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon levels-icon"></div>
                <h3>Account Level Benefits</h3>
                <p>Higher account levels unlock increased commission rates.</p>
              </div>
            </div>
          </div>

          {/* Level Benefits Section */}
          <div className="level-benefits-section" ref={commissionRatesRef}>
            <div className="team-commission-section">
              <h2 className="section-title">Affiliate Commission Rates</h2>
              <p className="section-description">
                Our multi-level commission structure rewards you for building a
                strong team. As your account level increases, your commission
                rates increase too!
              </p>
              <div className="commission-table-container">
                <table className="commission-table">
                  <thead>
                    <tr>
                      <th>Your Account Level</th>
                      <th>Level 1 Referrals</th>
                      <th>Level 2 Referrals</th>
                      <th>Level 3 Referrals</th>
                      <th>Level 4 Referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="level-badge-team level-1-team">
                          Level 1
                        </span>
                      </td>
                      <td>0.01$ daily</td>
                      <td>0.10% daily</td>
                      <td>0.50% daily</td>
                      <td>1.00% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-2-team">
                          Level 2
                        </span>
                      </td>
                      <td>0.02$ daily</td>
                      <td>0.20% daily</td>
                      <td>1.00% daily</td>
                      <td>1.50% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-3-team">
                          Level 3
                        </span>
                      </td>
                      <td>0.03$ daily</td>
                      <td>0.30% daily</td>
                      <td>1.50% daily</td>
                      <td>2.00% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-4-team">
                          Level 4
                        </span>
                      </td>
                      <td>0.05$ daily</td>
                      <td>0.50% daily</td>
                      <td>2.00% daily</td>
                      <td>3.00% daily</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Example Earnings Section */}
          <div className="example-earnings-section" ref={testimonialRef}>
            <h2 className="section-title">Potential Earnings Example</h2>
            <div className="earnings-example-container">
              <div className="earnings-scenario">
                <div className="scenario-header">
                  <h3>Level 2 Account with 10 Direct Referrals</h3>
                </div>
                <div className="scenario-details">
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 1 (10 direct referrals):
                    </div>
                    <div className="scenario-value">
                      10 × $0.02 = $0.20 daily
                    </div>
                  </div>
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 2 (50 indirect referrals averaging $100 investment):
                    </div>
                    <div className="scenario-value">
                      50 × $100 × 0.20% = $10 daily
                    </div>
                  </div>
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 3 (200 indirect referrals averaging $100
                      investment):
                    </div>
                    <div className="scenario-value">
                      200 × $100 × 1.00% = $200 daily
                    </div>
                  </div>
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 4 (500 indirect referrals averaging $100
                      investment):
                    </div>
                    <div className="scenario-value">
                      500 × $100 × 1.50% = $750 daily
                    </div>
                  </div>
                  <div className="scenario-total">
                    <div className="total-label">Total Daily Earnings:</div>
                    <div className="total-value">$960.20</div>
                  </div>
                  <div className="scenario-total">
                    <div className="total-label">Total Monthly Earnings:</div>
                    <div className="total-value">$28,806.00</div>
                  </div>
                </div>
                <div className="scenario-note">
                  <p>
                    * This is just an example and actual earnings depend on your
                    team's size, activity, and investment levels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section" ref={faqRef}>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-container-team">
              <div className="faq-item">
                <h3 className="faq-question">
                  How do I join the affiliate program?
                </h3>
                <p className="faq-answer">
                  Simply create an account on our platform. Every user
                  automatically gets an affiliate link they can start sharing.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  How are commissions calculated?
                </h3>
                <p className="faq-answer">
                  Commissions are calculated based on your account level and the
                  level of the referral in your network. Level 1 referrals
                  (direct) earn a fixed amount daily, while deeper levels earn a
                  percentage of their investment.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  When do I receive my commission payments?
                </h3>
                <p className="faq-answer">
                  Commissions are calculated and added to your account balance
                  daily at midnight UTC.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  How do I increase my account level?
                </h3>
                <p className="faq-answer">
                  Your account level increases based on your activity on the
                  platform, including completed tasks and investment amounts.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  Is there a limit to how many people I can refer?
                </h3>
                <p className="faq-answer">
                  No, there's no limit. You can refer as many people as you want
                  and build your team as large as possible.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">Do my referrals expire?</h3>
                <p className="faq-answer">
                  No, once someone joins using your affiliate link, they remain
                  in your team permanently.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section" ref={ctaRef}>
            <div className="cta-content">
              <h2>Ready to Start Earning?</h2>
              <p>
                Join thousands of successful affiliates who are building passive
                income streams with our program.
              </p>
              <Link to="/register" className="cta-button">
                Create Your Account Now
              </Link>
            </div>
            <div className="cta-graphic">
              <div className="cta-circles">
                <div className="cta-circle circle-1"></div>
                <div className="cta-circle circle-2"></div>
                <div className="cta-circle circle-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      <div className="team-hero">
        <div className="container">
          <div className="team-header" ref={headerRef}>
            <div className="header-content-team">
              <h1 className="page-title">My Affiliate Team</h1>
              <p className="page-description">
                Build your network, refer friends, and earn passive income
                through our multi-level affiliate program.
              </p>
              <div className="header-actions">
                <button className="share-button" onClick={copyToClipboard}>
                  <span className="btn-text">Share Your Link</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
            <div className="header-graphic">
              <div className="team-graphic-container animate-float">
                <div className="team-graphic-inner">
                  <div className="team-graphic-circle circle-1"></div>
                  <div className="team-graphic-circle circle-2"></div>
                  <div className="team-graphic-circle circle-3"></div>
                  <div className="team-graphic-network"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="team-dashboard">
          {/* Stats Cards */}
          <div
            className="stats-grid team-statistics team-statistics-auth"
            ref={statsRef}
          >
            <div className="stat-card stat-item">
              <span className="stat-value">{stats.totalMembers}</span>
              <span className="stat-label">Total Referrals</span>
            </div>
            <div className="stat-card stat-item">
              <span className="stat-value">{stats.activeMembers}</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-card stat-item">
              <span className="stat-value">
                {formatBalance(stats.affiliateEarnings, "USD")}
              </span>
              <span className="stat-label">Earnings By Team</span>
            </div>
            <div className="stat-card stat-item">
              <span className="stat-value">{userLevel}</span>
              <span className="stat-label">Your Account Level</span>
            </div>
          </div>

          {/* Affiliate Link Section */}
          <div className="affiliate-section" ref={affiliateSectionRef}>
            <h2>Share Your Affiliate Link</h2>
            <p>
              Invite friends and earn rewards when they join and complete tasks.
            </p>

            <div className="affiliate-code-container">
              <div className="affiliate-code-team">
                <span>{affiliateCode}</span>
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  onClick={copyToClipboard}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <p className="affiliate-info">
                Share this code with friends or use the copy button to get your
                full referral link.
              </p>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="team-members-section">
            <h2>Your Team Members</h2>

            {loading ? (
              <div className="loading">Loading team data...</div>
            ) : teamMembers.length === 0 ? (
              <div className="no-members">
                <p>
                  You don't have any team members yet. Share your affiliate link
                  to start building your team!
                </p>
              </div>
            ) : (
              <div className="team-table-container">
                <table className="team-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Level</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member._id}>
                        <td>{member.name || "Anonymous"}</td>
                        <td>{member.email}</td>
                        <td>Level {member.level}</td>
                        <td>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Level Benefits */}
          <div className="level-benefits-section" ref={benefitsRef}>
            <div className="team-commission-section">
              <h2>Affiliate Commission Rates</h2>
              <div className="commission-table-container">
                <table className="commission-table">
                  <thead>
                    <tr>
                      <th>Your Account Level</th>
                      <th>Level 1 Referrals</th>
                      <th>Level 2 Referrals</th>
                      <th>Level 3 Referrals</th>
                      <th>Level 4 Referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="level-badge-team level-1-team">
                          Level 1
                        </span>
                      </td>
                      <td>0.01$ daily</td>
                      <td>0.10% daily</td>
                      <td>0.50% daily</td>
                      <td>1.00% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-2-team">
                          Level 2
                        </span>
                      </td>
                      <td>0.02$ daily</td>
                      <td>0.20% daily</td>
                      <td>1.00% daily</td>
                      <td>1.50% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-3-team">
                          Level 3
                        </span>
                      </td>
                      <td>0.03$ daily</td>
                      <td>0.30% daily</td>
                      <td>1.50% daily</td>
                      <td>2.00% daily</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="level-badge-team level-4-team">
                          Level 4
                        </span>
                      </td>
                      <td>0.05$ daily</td>
                      <td>0.50% daily</td>
                      <td>2.00% daily</td>
                      <td>3.00% daily</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Example Earnings Section */}
          <div className="example-earnings-section" ref={testimonialRef}>
            <h2 className="section-title">Potential Earnings Example</h2>
            <div className="earnings-example-container">
              <div className="earnings-scenario">
                <div className="scenario-header">
                  <h3>Level 2 Account with 10 Direct Referrals</h3>
                </div>
                <div className="scenario-details">
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 1 (10 direct referrals):
                    </div>
                    <div className="scenario-value">
                      10 × $0.02 = $0.20 daily
                    </div>
                  </div>
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 2 (50 indirect referrals averaging $100 investment):
                    </div>
                    <div className="scenario-value">
                      50 × $100 × 0.20% = $10 daily
                    </div>
                  </div>
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 3 (200 indirect referrals averaging $100
                      investment):
                    </div>
                    <div className="scenario-value">
                      200 × $100 × 1.00% = $200 daily
                    </div>
                  </div>
                  <div className="scenario-row">
                    <div className="scenario-label">
                      Level 4 (500 indirect referrals averaging $100
                      investment):
                    </div>
                    <div className="scenario-value">
                      500 × $100 × 1.50% = $750 daily
                    </div>
                  </div>
                  <div className="scenario-total">
                    <div className="total-label">Total Daily Earnings:</div>
                    <div className="total-value">$960.20</div>
                  </div>
                  <div className="scenario-total">
                    <div className="total-label">Total Monthly Earnings:</div>
                    <div className="total-value">$28,806.00</div>
                  </div>
                </div>
                <div className="scenario-note">
                  <p>
                    * This is just an example and actual earnings depend on your
                    team's size, activity, and investment levels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section" ref={faqRef}>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-container-team">
              <div className="faq-item">
                <h3 className="faq-question">
                  How do I join the affiliate program?
                </h3>
                <p className="faq-answer">
                  Simply create an account on our platform. Every user
                  automatically gets an affiliate link they can start sharing.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  How are commissions calculated?
                </h3>
                <p className="faq-answer">
                  Commissions are calculated based on your account level and the
                  level of the referral in your network. Level 1 referrals
                  (direct) earn a fixed amount daily, while deeper levels earn a
                  percentage of their investment.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  When do I receive my commission payments?
                </h3>
                <p className="faq-answer">
                  Commissions are calculated and added to your account balance
                  daily at midnight UTC.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  How do I increase my account level?
                </h3>
                <p className="faq-answer">
                  Your account level increases based on your activity on the
                  platform, including completed tasks and investment amounts.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">
                  Is there a limit to how many people I can refer?
                </h3>
                <p className="faq-answer">
                  No, there's no limit. You can refer as many people as you want
                  and build your team as large as possible.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">Do my referrals expire?</h3>
                <p className="faq-answer">
                  No, once someone joins using your affiliate link, they remain
                  in your team permanently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
