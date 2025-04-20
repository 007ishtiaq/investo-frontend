import React, { useState, useEffect, useRef } from "react";
import "./HeroSlider.css";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Sample slide data
  const slides = [
    {
      id: 1,
      title: "Discover Rare NFT Collections",
      description:
        "Explore unique digital assets from top creators around the world",
      imageUrl:
        "https://placehold.co/1200x400/4B0082/FFFFFF.png?text=RARE+NFT+COLLECTIONS",
      ctaText: "Explore Collections",
    },
    {
      id: 2,
      title: "New Pepe Frog Drops",
      description:
        "Limited edition Pepe Frog NFTs now available for early access",
      imageUrl:
        "https://placehold.co/1200x400/006400/FFFFFF.png?text=PEPE+FROG+DROPS",
      ctaText: "Get Early Access",
    },
    {
      id: 3,
      title: "NFT Trading Competition",
      description:
        "Join our weekly trading competition and win exclusive rewards",
      imageUrl:
        "https://placehold.co/1200x400/800000/FFFFFF.png?text=TRADING+COMPETITION",
      ctaText: "Join Now",
    },
    {
      id: 4,
      title: "Create Your Own NFT",
      description: "Use our platform to mint and sell your digital artwork",
      imageUrl:
        "https://placehold.co/1200x400/000080/FFFFFF.png?text=CREATE+YOUR+NFT",
      ctaText: "Start Creating",
    },
    {
      id: 5,
      title: "Trending Collections",
      description: "See what's hot in the NFT marketplace this week",
      imageUrl:
        "https://placehold.co/1200x400/2F4F4F/FFFFFF.png?text=TRENDING+COLLECTIONS",
      ctaText: "View Trending",
    },
  ];

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
                  <button className="slide-cta">{slide.ctaText}</button>
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
