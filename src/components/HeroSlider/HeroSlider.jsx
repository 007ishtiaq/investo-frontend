import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./HeroSlider.css";
import "../mobileadj.css";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);
  const history = useHistory();

  // Updated slide data with navigation paths
  const slides = [
    {
      id: 1,
      title: "Minimal Effort, Maximum Returns",
      description:
        "Watch your investments grow every day with our tiered daily returns",
      imageUrl: "/images/benner1.png",
      ctaText: "Explore Plans",
      path: "/plans", // Add path for Plans/Investment page
    },
    {
      id: 2,
      title: "Zero Withdrawal Charges!",
      description:
        "Keep 100% of your profits, with zero withdrawal fees, no cuts, and complete control over your money!",
      imageUrl: "/images/benner3.png",
      ctaText: "Withdrawal Now",
      path: "/dashboard", // Add path for Withdrawal/Wallet page
    },
    {
      id: 3,
      title: "Earn up to 4% Daily ROI!",
      description:
        "Grow your investment with up to 4% daily returns, steady profits, daily payouts, and total earning potential unlocked!",
      imageUrl: "/images/benner2.png",
      ctaText: "Join Now",
      path: "/register", // Add path for Registration page
    },
    {
      id: 4,
      title: "Earn up to 40% from Affiliate & Team Rewards!",
      description:
        "Boost your income with up to 40% in affiliate and team commissions, build your network, and earn big with every connection!",
      imageUrl: "/images/benner4.png",
      ctaText: "Create Team",
      path: "/team", // Add path for Team/Affiliate page
    },
    {
      id: 5,
      title: " Security You Can Trust",
      description:
        "Your investments are safe with top-tier security, ensuring your funds and data stay safe at all times.",
      imageUrl: "/images/benner5.png",
      ctaText: "Join Now",
      path: "/register", // Add path for Registration page
    },
  ];

  // Handle CTA button click
  const handleCtaClick = (path) => {
    if (path) {
      history.push(path);
    }
  };

  // Handle navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Handle touch events for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextSlide();
    } else if (isRightSwipe) {
      goToPrevSlide();
    }

    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Auto-play functionality
  useEffect(() => {
    const autoPlay = () => {
      goToNextSlide();
    };

    autoPlayRef.current = autoPlay;
  }, [currentSlide]);

  useEffect(() => {
    const play = () => {
      autoPlayRef.current();
    };

    const interval = setInterval(play, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="hero-slider-container">
      <div
        className="hero-slider"
        ref={sliderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="slides-container"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="slide">
              <div className="slide-content">
                <div className="slide-text">
                  <h2 className="slide-title">{slide.title}</h2>
                  <p className="slide-description">{slide.description}</p>
                  <button
                    className="slide-cta"
                    onClick={() => handleCtaClick(slide.path)}
                  >
                    {slide.ctaText}
                  </button>
                </div>
              </div>
              <div className="slide-image">
                <img src={slide.imageUrl} alt={slide.title} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="slider-nav prev-button"
        onClick={goToPrevSlide}
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        className="slider-nav next-button"
        onClick={goToNextSlide}
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="slide-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`slide-indicator ${
              index === currentSlide ? "active" : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
