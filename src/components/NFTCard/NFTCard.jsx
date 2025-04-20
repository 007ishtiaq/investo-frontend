import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon, EthereumIcon } from "../../utils/icons";
import {
  handleImageError,
  getPlaceholderImage,
} from "../../utils/imageHelpers";

/**
 * NFT Card component for displaying individual NFTs
 */
const NFTCard = ({ nft, creator }) => {
  // Format time remaining for auction
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
    <div className="nft-card">
      <div className="nft-image-container">
        <img
          src={nft.image || getPlaceholderImage(400, 400, "NFT")}
          alt={nft.name}
          className="nft-image"
          onError={(e) => handleImageError(e, nft.name || "NFT")}
        />

        <button className="nft-like-button">
          <HeartIcon size={18} />
        </button>
      </div>

      <div className="nft-details">
        <div className="nft-info">
          <h3 className="nft-name">
            <Link href={`/nft/${nft.id}`}>{nft.name}</Link>
          </h3>

          {creator && (
            <div className="nft-creator">
              <Link
                href={`/profile/${creator.username}`}
                className="creator-link"
              >
                <img
                  src={
                    creator.avatar ||
                    getPlaceholderImage(
                      24,
                      24,
                      creator.username
                        ? creator.username.charAt(0).toUpperCase()
                        : "C"
                    )
                  }
                  alt={creator.username}
                  className="creator-avatar"
                  onError={(e) =>
                    handleImageError(
                      e,
                      creator.username
                        ? creator.username.charAt(0).toUpperCase()
                        : "C"
                    )
                  }
                />
                <span className="creator-name">{creator.username}</span>
                {creator.isVerified && (
                  <span className="verified-badge">✓</span>
                )}
              </Link>
            </div>
          )}
        </div>

        <div className="nft-market-details">
          <div className="nft-price">
            <div className="price-label">Price</div>
            <div className="price-amount">
              <EthereumIcon size={14} />
              <span>{nft.price?.toFixed(2) || "0.00"} ETH</span>
            </div>
          </div>

          {nft.endTime && (
            <div className="nft-time-remaining">
              <div className="time-label">Ends in</div>
              <div className="time-value">
                {formatTimeRemaining(nft.endTime)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCard;

// Add styling for the NFTCard component
document.head.appendChild(document.createElement("style")).textContent = `
.nft-card {
  background-color: var(--color-card-bg);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nft-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.nft-image-container {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.nft-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.nft-card:hover .nft-image {
  transform: scale(1.05);
}

.nft-like-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
  backdrop-filter: blur(4px);
}

.nft-like-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.nft-details {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nft-info {
  margin-bottom: 1.25rem;
  flex: 1;
}

.nft-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nft-creator {
  display: flex;
  align-items: center;
}

.creator-link {
  display: flex;
  align-items: center;
}

.creator-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.5rem;
}

.creator-name {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.creator-link:hover .creator-name {
  color: var(--color-primary);
}

.verified-badge {
  width: 14px;
  height: 14px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  margin-left: 0.25rem;
}

.nft-market-details {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.price-label,
.time-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.price-amount {
  display: flex;
  align-items: center;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

.price-amount svg {
  margin-right: 0.25rem;
}

.time-value {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-warning);
}
`;
