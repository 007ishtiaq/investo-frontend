import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EthereumIcon } from "../../utils/icons";
import {
  handleImageError,
  getPlaceholderImage,
} from "../../utils/imageHelpers";

/**
 * Hero section component for the homepage
 */
const HeroSection = ({ featuredNft, creator }) => {
  // Format time remaining for the auction
  const formatTimeRemaining = (endTime) => {
    if (!endTime) return "No deadline";

    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Save, invest, and earn effortlessly{" "}
            <span className="gradient-text">Profits</span>
          </h1>

          <p className="hero-description">
            ProfitVault is the world’s first and leading investment app where
            anyone can earn daily rewards — even without investing.
          </p>

          <div className="hero-buttons">
            <Link href="/explore" className="primary-button">
              Explore
            </Link>
            <Link href="/create" className="secondary-button">
              Create
            </Link>
          </div>
        </div>

        {featuredNft && (
          <div className="hero-featured">
            <div className="featured-nft-card">
              <div className="featured-image">
                <img
                  src={
                    featuredNft.image ||
                    getPlaceholderImage(600, 400, "NFT Image")
                  }
                  alt={featuredNft.name}
                  onError={(e) => handleImageError(e, featuredNft.name)}
                />
              </div>

              <div className="featured-details">
                <div className="featured-info">
                  <h3 className="featured-name">{featuredNft.name}</h3>

                  {creator && (
                    <div className="featured-creator">
                      <div className="creator-avatar">
                        <img
                          src={
                            creator.avatar ||
                            getPlaceholderImage(40, 40, "Creator")
                          }
                          alt={creator.username}
                          onError={(e) =>
                            handleImageError(
                              e,
                              creator.username
                                ? creator.username.charAt(0).toUpperCase()
                                : "C"
                            )
                          }
                        />
                        {creator.isVerified && (
                          <span className="verified-badge">✓</span>
                        )}
                      </div>
                      <Link
                        href={`/profile/${creator.username}`}
                        className="creator-name"
                      >
                        {creator.username}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="featured-bid">
                  <div className="bid-label">Current bid</div>
                  <div className="bid-price">
                    <EthereumIcon size={16} />
                    <span>{featuredNft.price?.toFixed(2) || "0.00"} USD</span>
                  </div>

                  {featuredNft.endTime && (
                    <div className="bid-time">
                      <div className="time-label">Ending in</div>
                      <div className="time-value">
                        {formatTimeRemaining(featuredNft.endTime)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

// Add styling for the HeroSection component
document.head.appendChild(document.createElement("style")).textContent = `
.hero-section {
  padding: 3rem 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(108, 93, 211, 0.1), transparent 70%),
              radial-gradient(circle at bottom left, rgba(63, 140, 255, 0.1), transparent 70%);
  z-index: -1;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
  line-height: 1.2;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
}

.hero-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.primary-button {
  background: var(--gradient-button);
  color: white;
  font-weight: 500;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.primary-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.secondary-button {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-weight: 500;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.secondary-button:hover {
  background-color: var(--color-background-hover);
  color: var(--color-primary);
}

.hero-featured {
  display: flex;
  justify-content: center;
}

.featured-nft-card {
  width: 100%;
  max-width: 400px;
  border-radius: 1rem;
  overflow: hidden;
  background-color: var(--color-card-bg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  transition: transform var(--transition-normal);
}

.featured-nft-card:hover {
  transform: translateY(-5px);
}

.featured-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.featured-nft-card:hover .featured-image img {
  transform: scale(1.05);
}

.featured-details {
  padding: 1.5rem;
}

.featured-info {
  margin-bottom: 1rem;
}

.featured-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.featured-creator {
  display: flex;
  align-items: center;
}

.creator-avatar {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.75rem;
}

.creator-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

.creator-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.creator-name:hover {
  color: var(--color-primary);
}

.featured-bid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.bid-label,
.time-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.bid-price {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--color-primary);
}

.bid-price svg {
  margin-right: 0.25rem;
}

.time-value {
  font-weight: 600;
  color: var(--color-warning);
}
`;
