import React, { useState } from "react";
import CryptoIcon from "../../assets/icons/CryptoIcon";
import "./FeaturedNFT.css";

const FeaturedNFT = ({ nft }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!nft) {
    return (
      <div className="featured-nft-container empty-state">
        No featured NFT available
      </div>
    );
  }

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Default creator avatar if none provided
  const creatorAvatarUrl =
    nft.creatorAvatar ||
    "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR";

  return (
    <section className="featured-nft-container">
      <div className="featured-card-nft">
        <div className="featured-nft-image-wrapper">
          {isLoading && <div className="image-loader">Loading image...</div>}
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="featured-nft-image"
            onLoad={handleImageLoad}
            style={{ display: isLoading ? "none" : "block" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/300x300/4CD6B0/FFFFFF.png?text=NFT";
              setIsLoading(false);
            }}
          />
        </div>

        <div className="featured-nft-details">
          <div className="nft-info">
            <h2 className="nft-title">{nft.name}</h2>
            <div className="creator-info">
              <div className="creator-avatar">
                <img
                  src={creatorAvatarUrl}
                  alt="Creator"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR";
                  }}
                />
              </div>
              <span className="bid-label">Highest Bid</span>
            </div>
          </div>

          <div className="price-tag">
            <div className="price-content">
              <CryptoIcon type="USDT" />
              <span className="price-amount">{nft.price} USDT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedNFT;
