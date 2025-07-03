// client/src/pages/Team.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getTeamMembers, getAffiliateCode } from "../functions/team";
import { formatBalance } from "../functions/wallet";
import { getUserLevel } from "../functions/user";
import NoNetModal from "../components/NoNetModal/NoNetModal";
import LoadingSpinner from "../hooks/LoadingSpinner";
import "./Team.css";
import { Info } from "lucide-react";

const Team = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    affiliateEarnings: 0,
  });

  const [showTooltip, setShowTooltip] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [noNetModal, setNoNetModal] = useState(false);
  const [networkError, setNetworkError] = useState(false);

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
    }
  }, [user]);

  const loadTeamData = async () => {
    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      setLoading(false);
      setNetworkError(true);
      return;
    }

    setLoading(true);
    setNetworkError(false); // Reset network error on new attempt
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

      // Check if it's a network error
      if (
        (error.message && error.message.includes("network")) ||
        error.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
        setNetworkError(true);
      } else {
        toast.error("Failed to load team data");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserLevel = async () => {
    // Check network status before making API call
    if (!navigator.onLine) {
      setNoNetModal(true);
      return;
    }

    try {
      const level = await getUserLevel(user.token);
      setUserLevel(level);
    } catch (error) {
      console.error("Error loading user level:", error);

      // Check if it's a network error
      if (
        (error.message && error.message.includes("network")) ||
        error.code === "NETWORK_ERROR" ||
        !navigator.onLine
      ) {
        setNoNetModal(true);
      }
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

  const handleRetry = () => {
    if (navigator.onLine) {
      setNoNetModal(false);
      // Reload team data
      if (user && user.token) {
        loadTeamData();
        loadUserLevel();
      }
    } else {
      toast.error("Still no internet connection. Please check your network.");
    }
  };

  if (!user || !user.token) {
    return (
      <>
        <div className="team-page">
          {/* Hero Section for non-logged in users */}
          <div className="team-hero">
            <div className="container">
              <div className="team-header" ref={headerRef}>
                <div className="header-content-team">
                  <h1 className="page-title">Affiliate Program</h1>
                  <p className="page-description">
                    Join our powerful multi-level affiliate system and earn
                    passive income by referring friends and building your
                    network. The more your team grows, the more you earn!
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
                      Share your affiliate link with friends, on social media,
                      or your website.
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

            {/* Rewards Information Section */}
            <div
              className="rewards-info-section level-benefits-section"
              ref={commissionRatesRef}
            >
              <div className="rewards-info-container">
                <div className="rewards-info-content">
                  <div className="rewards-info-header">
                    <div className="rewards-info-icon">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div className="rewards-info-text team-commission-section">
                      <h2>Affiliate Commission Rates</h2>
                      <div className="section-description-container">
                        <p className="section-description">
                          Start earning immediately when your referrals take
                          action! <br />
                          Here's how our system works:
                          <span
                            className="info-icon-container"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            <Info size={16} className="info-icon" />
                            {showTooltip && (
                              <div className="tooltip">
                                <div className="tooltip-content">
                                  <strong>Important:</strong> You must purchase
                                  a plan to be eligible for affiliate
                                  commissions.
                                </div>
                                <div className="tooltip-arrow"></div>
                              </div>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="commission-table-container">
                    <table className="commission-table">
                      <thead>
                        <tr>
                          <th>Your Account Level</th>
                          <th>Referral's Level 1</th>
                          <th>Referral's Level 2</th>
                          <th>Referral's Level 3</th>
                          <th>Referral's Level 4</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <span className="level-badge-team level-1-team">
                              Level 1
                            </span>
                          </td>
                          <td>10% of Investment</td>
                          <td>15% of Investment</td>
                          <td>20% of Investment</td>
                          <td>25% of Investment</td>
                        </tr>
                        <tr>
                          <td>
                            <span className="level-badge-team level-2-team">
                              Level 2
                            </span>
                          </td>
                          <td>15% of Investment</td>
                          <td>20% of Investment</td>
                          <td>25% of Investment</td>
                          <td>30% of Investment</td>
                        </tr>
                        <tr>
                          <td>
                            <span className="level-badge-team level-3-team">
                              Level 3
                            </span>
                          </td>
                          <td>20% of Investment</td>
                          <td>25% of Investment</td>
                          <td>30% of Investment</td>
                          <td>35% of Investment</td>
                        </tr>
                        <tr>
                          <td>
                            <span className="level-badge-team level-4-team">
                              Level 4
                            </span>
                          </td>
                          <td>25% of Investment</td>
                          <td>30% of Investment</td>
                          <td>35% of Investment</td>
                          <td>40% of Investment</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="rewards-info-features">
                    <div className="rewards-feature-item">
                      <div className="feature-icon purchase-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15V6" />
                          <path d="M3 15V6" />
                          <path d="M21 21H3" />
                          <path d="M21 3H3" />
                          <path d="M12 8v8" />
                          <path d="M8 12h8" />
                        </svg>
                      </div>
                      <div className="feature-content">
                        <h4>Investment Plan Purchase/Upgrade</h4>
                        <p>
                          When a team member purchases or upgrades their
                          investment plan,
                          <strong> rewards are posted immediately</strong> to
                          your account based on your commission level.
                        </p>
                      </div>
                    </div>

                    <div className="rewards-feature-item">
                      <div className="feature-icon team-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="8" r="5" />
                          <path d="M20 21a8 8 0 0 0-16 0" />
                          <path d="M12 13v8" />
                          <path d="M8 17l4-4 4 4" />
                        </svg>
                      </div>
                      <div className="feature-content">
                        <h4>Instant Team Addition</h4>
                        <p>
                          Team members are added to your affiliate network
                          <strong> immediately upon registration</strong> using
                          your referral link - no waiting period required.
                        </p>
                      </div>
                    </div>

                    <div className="rewards-feature-item">
                      <div className="feature-icon automatic-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 1v6m0 6v6" />
                          <path d="M21 12h-6m-6 0H3" />
                          <path d="M18.364 5.636L15.536 8.464" />
                          <path d="M8.464 15.536L5.636 18.364" />
                          <path d="M18.364 18.364L15.536 15.536" />
                          <path d="M8.464 8.464L5.636 5.636" />
                        </svg>
                      </div>
                      <div className="feature-content">
                        <h4>Automated Commission System</h4>
                        <p>
                          Our automated system calculates and distributes
                          commissions
                          <strong> in real-time</strong> across all levels of
                          your affiliate network.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Earnings Section */}
            <div className="example-earnings-section" ref={testimonialRef}>
              <h2 className="section-title">Potential Earnings Example</h2>
              <div className="earnings-example-container">
                <div className="earnings-scenario">
                  <div className="scenario-header">
                    <h3>
                      Example: Level 3 Account with Purchase-Based Commissions
                    </h3>
                  </div>
                  <div className="scenario-details">
                    <div className="scenario-row">
                      <div className="scenario-label">
                        25 Direct Referrals buy Level 1 Plans ($9 each):
                      </div>
                      <div className="scenario-value">25 × $9 × 20% = $45</div>
                    </div>
                    <div className="scenario-row">
                      <div className="scenario-label">
                        20 Direct Referrals buy Level 2 Plans ($100 each):
                      </div>
                      <div className="scenario-value">
                        20 × $100 × 25% = $500
                      </div>
                    </div>
                    <div className="scenario-row">
                      <div className="scenario-label">
                        8 Direct Referrals buy Level 3 Plans ($400 each):
                      </div>
                      <div className="scenario-value">
                        8 × $400 × 30% = $960
                      </div>
                    </div>
                    <div className="scenario-row">
                      <div className="scenario-label">
                        3 Direct Referrals buy Level 4 Plans ($900 each):
                      </div>
                      <div className="scenario-value">
                        3 × $900 × 35% = $945
                      </div>
                    </div>

                    <div className="scenario-total">
                      <div className="total-label">
                        Total Purchases Commission Potential:
                      </div>
                      <div className="total-value">$2,450</div>
                    </div>
                  </div>
                  <div className="scenario-note">
                    <p>
                      * This example shows instant commissions earned when
                      referrals purchase plans. Your actual earnings depend on
                      the number of referrals and which plans they choose.
                    </p>

                    <p>
                      * Higher account levels earn bigger commissions. Focus on
                      helping referrals choose plans that match their investment
                      goals for maximum mutual benefit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="benefits-section" ref={benefitsRef}>
              <h2 className="section-title">
                Benefits of Our Affiliate Program
              </h2>
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
                  <p>
                    Higher account levels unlock increased commission rates.
                  </p>
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
                    Commissions are calculated based on your account level and
                    the level of the referral in your network. Level 1 referrals
                    (direct) earn a fixed amount daily, while deeper levels earn
                    a percentage of their investment.
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
                    No, there's no limit. You can refer as many people as you
                    want and build your team as large as possible.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">Do my referrals expire?</h3>
                  <p className="faq-answer">
                    No, once someone joins using your affiliate link, they
                    remain in your team permanently.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section" ref={ctaRef}>
              <div className="cta-content">
                <h2>Ready to Start Earning?</h2>
                <p>
                  Join thousands of successful affiliates who are building
                  passive income streams with our program.
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

        <NoNetModal
          classDisplay={noNetModal ? "show" : ""}
          setNoNetModal={setNoNetModal}
          handleRetry={handleRetry}
        />
      </>
    );
  }

  return (
    <>
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
                Invite friends and earn rewards when they join and complete
                tasks.
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
                  Share this code with friends or use the copy button to get
                  your full referral link.
                </p>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="team-members-section">
              <h2>Your Team Members</h2>

              {teamMembers.length > 0 ? (
                <div className="team-table-container">
                  <div className="team-table-wrapper">
                    <table className="team-table">
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Email</th>
                          <th>Your Account</th>
                          <th>Member First Level</th>
                          <th>First Investment</th>
                          <th>Your Commission</th>
                          <th>Joined Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((member, index) => (
                          <tr key={index}>
                            <td>
                              <div className="member-info">
                                <div className="member-avatar">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="member-name">
                                  {member.name}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="member-email">
                                {member.email}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`level-badge main-user-level-${member.mainUserLevelAtPurchase}`}
                              >
                                Level {member.mainUserLevelAtPurchase}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`level-badge-team level-${member.level}-team`}
                              >
                                Level {member.level}
                              </span>
                            </td>

                            <td>
                              <span className="investment-amount">
                                {member.firstInvestmentAmount !== null ? (
                                  <span className="investment-value">
                                    {formatBalance(
                                      member.firstInvestmentAmount
                                    )}
                                  </span>
                                ) : (
                                  <span className="no-investment">
                                    No investment yet
                                  </span>
                                )}
                              </span>
                            </td>
                            <td>
                              <span className="commission-amount">
                                {member.commissionEarned > 0 ? (
                                  <span className="earned-commission">
                                    {formatBalance(member.commissionEarned)}
                                  </span>
                                ) : (
                                  <span className="no-commission">$0.00</span>
                                )}
                              </span>
                            </td>
                            <td>
                              <span className="join-date">
                                {new Date(member.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Section */}
                  <div className="team-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Team Members:</span>
                      <span className="summary-value">
                        {stats.totalMembers}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Active Members:</span>
                      <span className="summary-value">
                        {stats.activeMembers}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Commissions:</span>
                      <span className="summary-value earned-commission">
                        {formatBalance(stats.affiliateEarnings)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-members">
                  <p>
                    You don't have any team members yet. Share your affiliate
                    link to start building your team!
                  </p>
                </div>
              )}
            </div>

            {/* Level Benefits */}
            <div
              className="rewards-info-section level-benefits-section"
              ref={benefitsRef}
            >
              <div className="rewards-info-container">
                <div className="rewards-info-content">
                  <div className="rewards-info-header">
                    <div className="rewards-info-icon">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div className="rewards-info-text team-commission-section">
                      <h2>Affiliate Commission Rates</h2>
                      <div className="section-description-container">
                        <p className="section-description">
                          Start earning immediately when your referrals take
                          action! <br />
                          Here's how our system works:
                          <span
                            className="info-icon-container"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            <Info size={16} className="info-icon" />
                            {showTooltip && (
                              <div className="tooltip">
                                <div className="tooltip-content">
                                  <strong>Important:</strong> You must purchase
                                  a plan to be eligible for affiliate
                                  commissions.
                                </div>
                                <div className="tooltip-arrow"></div>
                              </div>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="commission-table-container">
                    <table className="commission-table">
                      <thead>
                        <tr>
                          <th>Your Account Level</th>
                          <th>Referral's Level 1</th>
                          <th>Referral's Level 2</th>
                          <th>Referral's Level 3</th>
                          <th>Referral's Level 4</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <span className="level-badge-team level-1-team">
                              Level 1
                            </span>
                          </td>
                          <td>10% of Investment</td>
                          <td>15% of Investment</td>
                          <td>20% of Investment</td>
                          <td>25% of Investment</td>
                        </tr>
                        <tr>
                          <td>
                            <span className="level-badge-team level-2-team">
                              Level 2
                            </span>
                          </td>
                          <td>15% of Investment</td>
                          <td>20% of Investment</td>
                          <td>25% of Investment</td>
                          <td>30% of Investment</td>
                        </tr>
                        <tr>
                          <td>
                            <span className="level-badge-team level-3-team">
                              Level 3
                            </span>
                          </td>
                          <td>20% of Investment</td>
                          <td>25% of Investment</td>
                          <td>30% of Investment</td>
                          <td>35% of Investment</td>
                        </tr>
                        <tr>
                          <td>
                            <span className="level-badge-team level-4-team">
                              Level 4
                            </span>
                          </td>
                          <td>25% of Investment</td>
                          <td>30% of Investment</td>
                          <td>35% of Investment</td>
                          <td>40% of Investment</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="rewards-info-features">
                    <div className="rewards-feature-item">
                      <div className="feature-icon purchase-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15V6" />
                          <path d="M3 15V6" />
                          <path d="M21 21H3" />
                          <path d="M21 3H3" />
                          <path d="M12 8v8" />
                          <path d="M8 12h8" />
                        </svg>
                      </div>
                      <div className="feature-content">
                        <h4>Investment Plan Purchase/Upgrade</h4>
                        <p>
                          When a team member purchases or upgrades their
                          investment plan,
                          <strong> rewards are posted immediately</strong> to
                          your account based on your commission level.
                        </p>
                      </div>
                    </div>

                    <div className="rewards-feature-item">
                      <div className="feature-icon team-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="8" r="5" />
                          <path d="M20 21a8 8 0 0 0-16 0" />
                          <path d="M12 13v8" />
                          <path d="M8 17l4-4 4 4" />
                        </svg>
                      </div>
                      <div className="feature-content">
                        <h4>Instant Team Addition</h4>
                        <p>
                          Team members are added to your affiliate network
                          <strong> immediately upon registration</strong> using
                          your referral link - no waiting period required.
                        </p>
                      </div>
                    </div>

                    <div className="rewards-feature-item">
                      <div className="feature-icon automatic-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 1v6m0 6v6" />
                          <path d="M21 12h-6m-6 0H3" />
                          <path d="M18.364 5.636L15.536 8.464" />
                          <path d="M8.464 15.536L5.636 18.364" />
                          <path d="M18.364 18.364L15.536 15.536" />
                          <path d="M8.464 8.464L5.636 5.636" />
                        </svg>
                      </div>
                      <div className="feature-content">
                        <h4>Automated Commission System</h4>
                        <p>
                          Our automated system calculates and distributes
                          commissions
                          <strong> in real-time</strong> across all levels of
                          your affiliate network.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Earnings Section */}
            <div className="example-earnings-section" ref={testimonialRef}>
              <h2 className="section-title">Potential Earnings Example</h2>
              <div className="earnings-example-container">
                <div className="earnings-scenario">
                  <div className="scenario-header">
                    <h3>
                      Example: Level 3 Account with Purchase-Based Commissions
                    </h3>
                  </div>
                  <div className="scenario-details">
                    <div className="scenario-row">
                      <div className="scenario-label">
                        25 Direct Referrals buy Level 1 Plans ($9 each):
                      </div>
                      <div className="scenario-value">25 × $9 × 20% = $45</div>
                    </div>
                    <div className="scenario-row">
                      <div className="scenario-label">
                        20 Direct Referrals buy Level 2 Plans ($100 each):
                      </div>
                      <div className="scenario-value">
                        20 × $100 × 25% = $500
                      </div>
                    </div>
                    <div className="scenario-row">
                      <div className="scenario-label">
                        8 Direct Referrals buy Level 3 Plans ($400 each):
                      </div>
                      <div className="scenario-value">
                        8 × $400 × 30% = $960
                      </div>
                    </div>
                    <div className="scenario-row">
                      <div className="scenario-label">
                        3 Direct Referrals buy Level 4 Plans ($900 each):
                      </div>
                      <div className="scenario-value">
                        3 × $900 × 35% = $945
                      </div>
                    </div>

                    <div className="scenario-total">
                      <div className="total-label">
                        Total Purchases Commission Potential:
                      </div>
                      <div className="total-value">$2,450</div>
                    </div>
                  </div>
                  <div className="scenario-note">
                    <p>
                      * This example shows instant commissions earned when
                      referrals purchase plans. Your actual earnings depend on
                      the number of referrals and which plans they choose.
                    </p>

                    <p>
                      * Higher account levels earn bigger commissions. Focus on
                      helping referrals choose plans that match their investment
                      goals for maximum mutual benefit.
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
                    Commissions are calculated based on your account level and
                    the level of the referral in your network. Level 1 referrals
                    (direct) earn a fixed amount daily, while deeper levels earn
                    a percentage of their investment.
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
                    No, there's no limit. You can refer as many people as you
                    want and build your team as large as possible.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">Do my referrals expire?</h3>
                  <p className="faq-answer">
                    No, once someone joins using your affiliate link, they
                    remain in your team permanently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NoNetModal
        classDisplay={noNetModal ? "show" : ""}
        setNoNetModal={setNoNetModal}
        handleRetry={handleRetry}
      />
    </>
  );
};

export default Team;
