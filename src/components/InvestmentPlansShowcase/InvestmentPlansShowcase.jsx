import React, { useState } from "react";
import "./InvestmentPlansShowcase.css";
import { TrendingUp, ChevronLeft, ChevronRight, Check } from "lucide-react";

const InvestmentPlansShowcase = ({ plans = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? plans.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((current) =>
      current === plans.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="investment-showcase-wrapper">
      <div className="showcase-header-section">
        <h2 className="showcase-main-title">Investment Plans</h2>
        <div className="showcase-statistics">
          <div className="showcase-single-stat">
            <TrendingUp size={14} />
            <span>
              Up to {Math.max(...plans.map((plan) => plan.dailyReturn))}% daily
              returns
            </span>
          </div>
        </div>
      </div>

      <div className="investment-plans-carousel">
        <button className="carousel-navigation prev" onClick={goToPrevious}>
          <ChevronLeft size={20} />
        </button>
        <div className="investment-carousel-track">
          {plans.length > 0 ? (
            plans.map((plan, index) => (
              <div
                className={`investment-plan-card ${
                  activeIndex === index ? "active" : ""
                }`}
                key={index}
                style={{
                  transform: `translateX(${(index - activeIndex) * 110}%)`,
                  opacity: activeIndex === index ? 1 : 0.3,
                  zIndex: activeIndex === index ? 5 : 1,
                }}
              >
                <div className="plan-card-header">
                  <h3 className="plan-title-name">{plan.name}</h3>
                  <div className="plan-level-badge">Level {plan.level}</div>
                </div>
                <div className="plan-pricing-section">
                  <span className="plan-minimum-value">
                    ${plan.minInvestment}
                  </span>
                  <span className="plan-minimum-label">Minimum</span>
                </div>
                <div className="plan-returns-section">
                  <div className="single-return-item">
                    <span className="return-percentage-value">
                      {plan.dailyReturn}%
                    </span>
                    <span className="return-period-label">Daily ROI</span>
                  </div>
                  <div className="single-return-item">
                    <span className="return-percentage-value">
                      {plan.dailyReturn * 30}%
                    </span>
                    <span className="return-period-label">Monthly</span>
                  </div>
                </div>
                <div className="plan-features-list">
                  {plan.features.map((feature, i) => (
                    <div className="individual-plan-feature" key={i}>
                      <Check size={16} className="feature-checkmark-icon" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="plan-selection-button">Select Plan</button>

                {plan.popular && (
                  <div className="popular-plan-tag">Most Popular</div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-plans-state">
              <div className="empty-state-icon">
                <TrendingUp size={24} />
              </div>
              <p>No investment plans available</p>
            </div>
          )}
        </div>
        <button className="carousel-navigation next" onClick={goToNext}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="carousel-dots-indicators">
        {plans.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot-indicator ${
              activeIndex === index ? "active" : ""
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default InvestmentPlansShowcase;
