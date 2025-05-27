import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon, FilterIcon, SortIcon } from "../../utils/icons";
import NFTCard from "../NFTCard/NFTCard";
// import { Nft, User } from "../shared/schema";

/**
 * NFT Marketplace section for the homepage
 */
const NFTMarketplace = ({ nfts = [], creators = {} }) => {
  const [category, setCategory] = useState("all");

  // Define categories
  const categories = [
    { id: "all", name: "All Items" },
    { id: "art", name: "Art" },
    { id: "photography", name: "Photography" },
    { id: "collectibles", name: "Collectibles" },
    { id: "virtual-worlds", name: "Virtual Worlds" },
    { id: "music", name: "Music" },
  ];

  // Filter NFTs by category
  const filteredNfts =
    category === "all"
      ? nfts
      : nfts.filter((nft) => nft.category?.toLowerCase() === category);

  return (
    <section className="nft-marketplace">
      <div className="section-header-NFT">
        <h2 className="section-title">NFT Marketplace</h2>
        <Link href="/explore" className="view-all-link">
          View All <ChevronRightIcon size={16} />
        </Link>
      </div>

      <div className="marketplace-controls">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${category === cat.id ? "active" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="marketplace-buttons">
          <button className="control-button">
            <FilterIcon size={16} />
            <span>Filter</span>
          </button>

          <button className="control-button">
            <SortIcon size={16} />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="nft-grid">
        {filteredNfts.length > 0 ? (
          filteredNfts.map((nft) => (
            <div key={nft.id} className="nft-grid-item">
              <NFTCard nft={nft} creator={creators[nft.creatorId]} />
            </div>
          ))
        ) : (
          <div className="no-nfts-found">
            <p>No NFTs found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NFTMarketplace;

// Add styling for the NFTMarketplace component
document.head.appendChild(document.createElement("style")).textContent = `
.nft-marketplace {
  padding: 3rem 0;
}

.section-header-NFT {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.view-all-link {
  display: flex;
  align-items: center;
  color: var(--color-primary);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.view-all-link:hover {
  color: var(--color-primary-dark);
}

.view-all-link svg {
  margin-left: 0.25rem;
}

.marketplace-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .marketplace-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tab {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.category-tab:hover {
  color: var(--color-primary);
  background-color: var(--color-background);
}

.category-tab.active {
  color: var(--color-primary);
  background-color: rgba(108, 93, 211, 0.1);
}

.marketplace-buttons {
  display: flex;
  gap: 0.75rem;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.control-button:hover {
  background-color: var(--color-background-hover);
  border-color: var(--color-primary);
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .nft-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .nft-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .nft-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.no-nfts-found {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background-color: var(--color-background);
  border-radius: 0.75rem;
  color: var(--color-text-secondary);
  font-size: 1.125rem;
}
`;
