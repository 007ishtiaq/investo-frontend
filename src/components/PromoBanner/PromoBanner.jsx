import React from "react";
import "./PromoBanner.css";

const PromoBanner = () => {
  return (
    <section className="promo-banner">
      <div className="promo-banner-container">
        <div className="promo-banner-images">
          <div className="promo-image-main">
            <img
              src="https://prodimage-dan.treasurenft.xyz/Stake/Stake_09095_compre.png"
              alt="Pepe NFT"
              className="main-image"
            />
          </div>
          <div className="promo-image-small top-left">
            <img
              src="https://prodimage-dan.treasurenft.xyz/Stake/Stake_01630_compre.png"
              alt="Small Pepe NFT"
              className="small-image"
            />
          </div>
          <div className="promo-image-small bottom-right">
            <img
              src="https://prodimage-dan.treasurenft.xyz/Stake/Stake_05224_compre.png"
              alt="Small Pepe NFT"
              className="small-image"
            />
          </div>
        </div>

        <div className="promo-banner-content">
          <h2 className="promo-title">NO LIMITS, JUST DAILY EARNINGS</h2>

          <p className="promo-description">
            Join the future of finance — earn daily, with or without investment.
          </p>

          <div className="promo-buttons">
            <button className="btn-get-started">SIGN UP</button>
            <button className="btn-auction">EARNINGS</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
