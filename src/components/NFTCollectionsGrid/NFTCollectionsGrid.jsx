import React, { useState } from "react";
import CryptoIcon from "../../assets/icons/CryptoIcon";
import VerifiedIcon from "../../assets/icons/VerifiedIcon";
import "./NFTCollectionsGrid.css";
import { useHistory } from "react-router-dom";

const NFTCollectionsGrid = ({ collections }) => {
  const [isShowingMore, setIsShowingMore] = useState(true);

  const history = useHistory();

  const handleRedirect = () => {
    history.push("/plans");
  };

  // Check if collections is undefined, null, or not an array
  if (!collections) {
    return (
      <div className="collections-grid-container empty-state">
        Loading collections...
      </div>
    );
  }

  // Make sure collections is an array
  const collectionsArray = Array.isArray(collections) ? collections : [];

  if (collectionsArray.length === 0) {
    return (
      <div className="collections-grid-container empty-state">
        No collections available
      </div>
    );
  }

  // Show 5 collections by default, show all when "more" is clicked
  const displayedCollections = isShowingMore
    ? collectionsArray
    : collectionsArray.slice(0, 5);

  return (
    <section className="collections-grid-container">
      <div className="collections-header">
        <h2 className="collections-title">TOP RECENT COLLECTIONS</h2>
        <button onClick={handleRedirect} className="more-button">
          Invest
        </button>
      </div>

      <div className="collections-list">
        {displayedCollections.map((collection, index) => (
          <div key={collection.id} className="collection-item">
            <div className="collection-rank">
              {collection.rank || index + 1}
            </div>
            <div className="collection-avatar-container">
              <img
                src={collection.avatarUrl}
                alt={collection.name}
                className="collection-avatar"
              />
              {collection.isVerified !== false && (
                <div className="verification-badge">
                  <VerifiedIcon />
                </div>
              )}
            </div>
            <div className="collection-details">
              <div className="collection-name">{collection.name}</div>
              <div className="collection-volume">
                <CryptoIcon type="USD" />
                <span>{collection.volume}</span>
              </div>
            </div>
            <div
              className={`collection-change ${
                parseFloat(collection.change) > 0 ? "positive" : "negative"
              }`}
            >
              {collection.change}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NFTCollectionsGrid;
