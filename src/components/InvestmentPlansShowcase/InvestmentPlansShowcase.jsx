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
    <div className="plans-showcase-container">
      <div className="showcase-header">
        <h2 className="showcase-title">Investment Plans</h2>
        <div className="showcase-stats">
          <div className="showcase-stat">
            <TrendingUp size={14} />
            <span>
              Up to {Math.max(...plans.map((plan) => plan.dailyReturn))}% daily
              returns
            </span>
          </div>
        </div>
      </div>

      <div className="plans-carousel">
        <button className="carousel-nav prev" onClick={goToPrevious}>
          <ChevronLeft size={20} />
        </button>
        <div className="plans-carousel-track">
          {plans.length > 0 ? (
            plans.map((plan, index) => (
              <div
                className={`plan-card ${activeIndex === index ? "active" : ""}`}
                key={index}
                style={{
                  transform: `translateX(${(index - activeIndex) * 110}%)`,
                  opacity: activeIndex === index ? 1 : 0.3,
                  zIndex: activeIndex === index ? 5 : 1,
                }}
              >
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-badge">Level {plan.level}</div>
                </div>
                <div className="plan-price">
                  <span className="plan-price-value">
                    ${plan.minInvestment}
                  </span>
                  <span className="plan-price-label">Minimum</span>
                </div>
                <div className="plan-returns">
                  <div className="return-item">
                    <span className="return-value">{plan.dailyReturn}%</span>
                    <span className="return-label">Daily ROI</span>
                  </div>
                  <div className="return-item">
                    <span className="return-value">
                      {plan.dailyReturn * 30}%
                    </span>
                    <span className="return-label">Monthly</span>
                  </div>
                </div>
                <div className="plan-features">
                  {plan.features.map((feature, i) => (
                    <div className="plan-feature" key={i}>
                      <Check size={16} className="feature-check" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="plan-cta">Select Plan</button>

                {plan.popular && (
                  <div className="popular-tag">Most Popular</div>
                )}
              </div>
            ))
          ) : (
            <div className="no-plans">
              <div className="no-data-icon">
                <TrendingUp size={24} />
              </div>
              <p>No investment plans available</p>
            </div>
          )}
        </div>
        <button className="carousel-nav next" onClick={goToNext}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="carousel-indicators">
        {plans.map((_, index) => (
          <button
            key={index}
            className={`indicator ${activeIndex === index ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default InvestmentPlansShowcase;
