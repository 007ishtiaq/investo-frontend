import React, { useState } from "react";
import CryptoIcon from "../../assets/icons/CryptoIcon";
import "./NFTCollectionItems.css";

const NFTCollectionItems = ({ nfts }) => {
  const [selectedNFT, setSelectedNFT] = useState(null);

  // Check if nfts is undefined, null, or not an array
  if (!nfts) {
    return (
      <div className="collection-items-section empty-state">
        Loading NFT items...
      </div>
    );
  }

  // Make sure nfts is an array
  const nftsArray = Array.isArray(nfts) ? nfts : [];

  if (nftsArray.length === 0) {
    return (
      <div className="collection-items-section empty-state">
        No NFT items available
      </div>
    );
  }

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    // In a real application, this could navigate to a detail page or open a modal
    console.log("NFT clicked:", nft.name);
  };

  return (
    <section className="collection-items-section">
      <div className="collection-items-header">
        <h2 className="section-title">PEPE Frog Nobility Collection</h2>
      </div>

      <div className="nft-items-grid">
        {nftsArray.map((nft) => (
          <div
            key={nft.id}
            className="nft-item-card"
            onClick={() => handleNFTClick(nft)}
          >
            <div className="nft-item-content">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="nft-item-image"
              />
              <div className="nft-item-details">
                <div className="nft-item-header">
                  <h3 className="nft-item-name">{nft.name}</h3>
                  <div className="nft-item-id">#{nft.tokenId}</div>
                </div>
                <div className="nft-item-footer">
                  <div className="nft-item-price">
                    <CryptoIcon type="USDT" />
                    <span className="price-text">{nft.price} USDT</span>
                  </div>
                  <button className="view-button">View</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NFTCollectionItems;
