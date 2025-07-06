import React, { useState } from "react";
import "./HeroBanner.css";
import {
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

const HeroBanner = ({ theme = "light" }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`hero-banner-container ${
        theme === "light" ? "light-theme" : "dark-theme"
      }`}
    >
      <div className="hero-banner-background">
        <div className="hero-gradient-1"></div>
        <div className="hero-gradient-2"></div>
        <div className="hero-gradient-3"></div>

        {/* Added animated particles */}
        <div className="particle-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${(i % 5) + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="hero-content-container">
        <div className="hero-content">
          <div className="hero-text-section">
            <div className="hero-badge animate-slide-down">
              <span className="hero-badge-icon">✦</span>
              <span className="hero-badge-text">
                Smart investing for everyone
              </span>
            </div>

            <h1 className="hero-title animate-slide-up">
              Grow Your Wealth With{" "}
              <span className="hero-highlight">Smart Investments</span>
            </h1>

            <p className="hero-description animate-slide-up-delay">
              Start earning passive income through our multi-tiered investment
              plans and affiliate rewards. No expertise needed - we handle the
              complex parts for you.
            </p>

            <div className="hero-cta-container animate-fade-in">
              <Link to="/plans" className="hero-cta-primary pulse-effect">
                Start Investing <ArrowRight size={18} />
              </Link>
              <Link to="/team" className="hero-cta-secondary hover-lift">
                Join Affiliate Program
              </Link>
            </div>

            <div className="hero-stats animate-slide-up-delay-2">
              <div className="hero-stat-item count-up">
                <div className="hero-stat-value">$2.5M+</div>
                <div className="hero-stat-label">Investments</div>
              </div>
              <div className="hero-stat-item count-up">
                <div className="hero-stat-value">12k+</div>
                <div className="hero-stat-label">Investors</div>
              </div>
              <div className="hero-stat-item count-up">
                <div className="hero-stat-value">$350k+</div>
                <div className="hero-stat-label">Rewards Paid</div>
              </div>
            </div>

            <button
              className="learn-more-button animate-bounce"
              onClick={() => setShowDetails(!showDetails)}
            >
              Learn More{" "}
              <ChevronDown
                size={16}
                className={`chevron ${showDetails ? "rotate" : ""}`}
              />
            </button>

            {showDetails && (
              <div className="extra-details animate-expand">
                <div className="detail-item">
                  <div className="detail-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div className="detail-content">
                    <h4>Daily Growth</h4>
                    <p>
                      Watch your investments grow every day with our tiered
                      daily returns
                    </p>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-icon">
                    <Users size={18} />
                  </div>
                  <div className="detail-content">
                    <h4>Team Rewards</h4>
                    <p>
                      Earn affiliate commissions when you refer others to our
                      platform
                    </p>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-icon">
                    <Shield size={18} />
                  </div>
                  <div className="detail-content">
                    <h4>Secure Platform</h4>
                    <p>
                      Your investments are protected with industry-leading
                      security
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hero-visual-section animate-fade-in-up">
            <div className="hero-glass-card">
              <div className="card-header">
                <div className="card-title">Investment Performance</div>
                <div className="card-badge pulse-subtle">Live Data</div>
              </div>

              <div className="performance-chart">
                <div className="chart-line animated-chart">
                  <div className="chart-dot"></div>
                  <div className="chart-dot"></div>
                  <div className="chart-dot"></div>
                  <div className="chart-dot active"></div>
                </div>
                <div className="chart-stats">
                  <div className="chart-value count-animation">+27.8%</div>
                  <div className="chart-period">Past 30 days</div>
                </div>
              </div>

              <div className="card-features">
                <div className="feature-item hover-highlight">
                  <TrendingUp size={18} className="feature-icon" />
                  <span>Daily returns</span>
                </div>
                <div className="feature-item hover-highlight">
                  <Users size={18} className="feature-icon" />
                  <span>Affiliate rewards</span>
                </div>
                <div className="feature-item hover-highlight">
                  <DollarSign size={18} className="feature-icon" />
                  <span>Multiple tiers</span>
                </div>
                <div className="feature-item hover-highlight">
                  <Shield size={18} className="feature-icon" />
                  <span>Secure platform</span>
                </div>
              </div>
            </div>

            <div className="floating-elements">
              <div className="floating-element element-1 animate-float-1">
                <div className="coin-icon gold">$</div>
                <div className="coin-value count-animation">+$12.50</div>
              </div>
              <div className="floating-element element-2 animate-float-2">
                <div className="coin-icon silver">$</div>
                <div className="coin-value count-animation">+$8.75</div>
              </div>
              <div className="floating-element element-3 animate-float-3">
                <div className="coin-icon bronze">$</div>
                <div className="coin-value count-animation">+$5.25</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
