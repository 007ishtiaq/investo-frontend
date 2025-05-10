import React, { useState } from "react";
import NFTMarketplace from "../components/NFTMarketplace/NFTMarketplace";
import CTASection from "../components/CTASection/CTASection";
import HeroSlider from "../components/HeroSlider/HeroSlider";
import FeaturedNFT from "../components/FeaturedNFT/FeaturedNFT";
import NFTCollectionsGrid from "../components/NFTCollectionsGrid/NFTCollectionsGrid";
import NFTCollectionItems from "../components/NFTCollectionItems/NFTCollectionItems";
import PromoBanner from "../components/PromoBanner/PromoBanner";
import HeroBanner from "../components/HeroBanner/HeroBanner";
import ActiveMembersStats from "../components/ActiveMembersStats/ActiveMembersStats";
import Transactionsbanner from "../components/Transactionsbanner/Transactionsbanner";
import NewMembers from "../components/NewMembers/NewMembers";
import InvestmentPlansShowcase from "../components/InvestmentPlansShowcase/InvestmentPlansShowcase";
import PlatformStats from "../components/PlatformStats/PlatformStats";

// Sample Data
const demoNfts = [
  {
    id: "nft1",
    name: "Abstract Waves",
    image: "/images/herobanner.jpg",
    creatorId: "creator1",
    price: 1.5,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    category: "music",
  },
  {
    id: "nft2",
    name: "Crypto Beats",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    creatorId: "creator2",
    price: 2.75,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    category: "music",
  },
  {
    id: "nft3",
    name: "Pixel Mountain",
    image: "https://images.unsplash.com/photo-1607893378714-007fd47c8719",
    creatorId: "creator1",
    price: 0.99,
    endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    category: "collectibles",
  },
  {
    id: "nft4",
    name: "Futuristic City",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
    creatorId: "creator2",
    price: 3.2,
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (ended)
    category: "art",
  },
  {
    id: "nft5",
    name: "Synthwave Ride",
    image: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a",
    creatorId: "creator1",
    price: 4.5,
    endTime: null, // no deadline
    category: "art",
  },
];

const demoCreators = [
  {
    id: "creator1",
    username: "John Doe",
    avatar: "https://via.placeholder.com/100",
  },
  {
    id: "creator2",
    username: "Jane Smith",
    avatar: "https://via.placeholder.com/100",
  },
];

const demoCollections = [
  {
    id: "collection1",
    title: "Trending Art",
    image: "https://via.placeholder.com/500x300",
    creatorId: "creator1",
  },
  {
    id: "collection2",
    title: "Top Abstracts",
    image: "https://via.placeholder.com/500x300",
    creatorId: "creator2",
  },
];

const sampleNFTs = [
  {
    name: "King Pepe #001",
    tokenId: "001",
    price: 12.45,
    imageUrl:
      "https://prodimage-dan.treasurenft.xyz/Stake/Stake_04988_compre.png",
    collectionId: 1,
    creatorAvatar: "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR",
    description: "The king of all Pepe frogs, ruling with a green fist.",
  },
  {
    name: "Duke Pepe #042",
    tokenId: "042",
    price: 8.32,
    imageUrl: "https://placehold.co/300x300/4CD6B0/FFFFFF.png?text=DUKE",
    collectionId: 1,
    creatorAvatar: "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR",
    description: "A noble duke from the Pepe aristocracy.",
  },
  {
    name: "Baron Pepe #108",
    tokenId: "108",
    price: 5.67,
    imageUrl: "https://placehold.co/300x300/4CD6B0/FFFFFF.png?text=BARON",
    collectionId: 1,
    creatorAvatar: "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR",
    description: "The holder of vast lily pad estates.",
  },
  {
    name: "Knight Pepe #233",
    tokenId: "233",
    price: 3.44,
    imageUrl: "https://placehold.co/300x300/4CD6B0/FFFFFF.png?text=KNIGHT",
    collectionId: 1,
    creatorAvatar: "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR",
    description: "A brave defender of the Pepe realm.",
  },
  {
    name: "Lord Pepe #371",
    tokenId: "371",
    price: 7.89,
    imageUrl: "https://placehold.co/300x300/4CD6B0/FFFFFF.png?text=LORD",
    collectionId: 1,
    creatorAvatar: "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR",
    description: "An influential noble in the Pepe court.",
  },
  {
    name: "Squire Pepe #492",
    tokenId: "492",
    price: 2.34,
    imageUrl: "https://placehold.co/300x300/4CD6B0/FFFFFF.png?text=SQUIRE",
    collectionId: 1,
    creatorAvatar: "https://placehold.co/50x50/4CD6B0/FFFFFF.png?text=CREATOR",
    description: "Training to become a knight of the pond.",
  },
];

const sampleCollections = [
  {
    name: "Pepe Frog Nobility",
    avatarUrl:
      "https://prodimage-dan.treasurenft.xyz/PEPE_Frog_Nobility/PEPE_Frog_Nobility7663_compre.png",
    volume: "243.12",
    change: "+12.45%",
    isVerified: true,
    rank: 1,
  },
  {
    name: "King Pepe",
    avatarUrl:
      "https://prodimage-dan.treasurenft.xyz/PEPE_Frog_Nobility/PEPE_Frog_Nobility7663_compre.png",
    volume: "187.34",
    change: "+8.77%",
    isVerified: true,
    rank: 2,
  },
  {
    name: "Duke Pepe",
    avatarUrl:
      "https://prodimage-dan.treasurenft.xyz/PEPE_Frog_Nobility/PEPE_Frog_Nobility7663_compre.png",
    volume: "142.56",
    change: "+5.23%",
    isVerified: true,
    rank: 3,
  },
  {
    name: "Baron Pepe",
    avatarUrl: "https://placehold.co/100x100/4CD6B0/FFFFFF.png?text=BARON",
    volume: "95.87",
    change: "-2.14%",
    isVerified: false,
    rank: 4,
  },
  {
    name: "Knight Pepe",
    avatarUrl: "https://placehold.co/100x100/4CD6B0/FFFFFF.png?text=KNIGHT",
    volume: "67.23",
    change: "+3.67%",
    isVerified: true,
    rank: 5,
  },
  {
    name: "Lord Pepe",
    avatarUrl: "https://placehold.co/100x100/4CD6B0/FFFFFF.png?text=LORD",
    volume: "45.19",
    change: "-1.54%",
    isVerified: true,
    rank: 6,
  },
];

const sampleActiveStats = {
  active: 843,
  total: 12574,
  growth: 15,
};

const sampleTransactions = [
  { type: "deposit", amount: 500.0, user: "Michael S.", time: "5 min ago" },
  { type: "withdraw", amount: 150.25, user: "Jennifer K.", time: "15 min ago" },
  { type: "deposit", amount: 1000.0, user: "Robert L.", time: "1 hour ago" },
];

const sampleMembers = [
  {
    name: "Emma Davis",
    joinDate: "2 days ago",
    initialInvestment: 250,
    level: 1,
    color: "#7c3aed",
  },
  {
    name: "James Wilson",
    joinDate: "3 days ago",
    initialInvestment: 500,
    level: 2,
    color: "#3b82f6",
  },
  {
    name: "Sarah Johnson",
    joinDate: "4 days ago",
    initialInvestment: 1000,
    level: 3,
    color: "#f59e0b",
  },
];

const samplePlans = [
  {
    name: "Starter Plan",
    level: 1,
    minInvestment: 100,
    dailyReturn: 0.5,
    features: [
      "Daily profit distribution",
      "Basic dashboard access",
      "Email support",
    ],
  },
  {
    name: "Growth Plan",
    level: 2,
    minInvestment: 500,
    dailyReturn: 0.7,
    features: [
      "Higher daily returns",
      "Priority support",
      "Advanced dashboard",
    ],
    popular: true,
  },
  {
    name: "Premium Plan",
    level: 3,
    minInvestment: 1000,
    dailyReturn: 1.0,
    features: ["Maximum daily returns", "VIP support", "Full platform access"],
  },
];

const sampleStats = {
  totalInvested: 1250000,
  investmentGrowth: 8.5,
  totalUsers: 12574,
  userGrowth: 12.7,
  totalRewards: 385000,
  rewardsGrowth: 5.9,
  avgReturn: 21.5,
  returnGrowth: 2.3,
};

function Home() {
  const nfts = demoNfts;
  const creators = demoCreators;
  const collections = demoCollections;
  const allUsers = demoCreators;

  const [cardcollections, setCardcollections] = useState(sampleCollections);
  const [featuredNFT, setFeaturedNFT] = useState(sampleNFTs[0]);
  const [nfts1, setNfts1] = useState(sampleNFTs);
  // const [cardcollections, setCardcollections] = useState([]);
  // const [featuredNFT, setFeaturedNFT] = useState(null);

  // Map creators by ID
  const creatorsById = React.useMemo(() => {
    return allUsers.reduce((acc, creator) => {
      acc[creator.id] = creator;
      return acc;
    }, {});
  }, [allUsers]);

  const featuredNft = nfts.length > 0 ? nfts[0] : null;
  const featuredCreator = featuredNft && creatorsById[featuredNft.creatorId];

  return (
    <div className="home-page">
      <HeroBanner theme="light" />

      <div className="container">
        <ActiveMembersStats stats={sampleActiveStats} />
        <Transactionsbanner transactions={sampleTransactions} />
        <InvestmentPlansShowcase plans={samplePlans} />
        <PlatformStats stats={sampleStats} />
        <NewMembers members={sampleMembers} />
        <HeroSlider />
        <main className="marketplace-content">
          <div className="marketplace-sections">
            <FeaturedNFT nft={featuredNFT} />
            <NFTCollectionsGrid collections={cardcollections} />
          </div>
          <NFTCollectionItems nfts={nfts1} />
          <PromoBanner />
        </main>
        <NFTMarketplace nfts={nfts} creators={creatorsById} />
        <CTASection />
      </div>
    </div>
  );
}

export default Home;

// Optional: basic inline styles for testing
document.head.appendChild(document.createElement("style")).textContent = `
.home-page {
  min-height: 100vh;
}

.loading,
.error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  font-size: 1.25rem;
  color: gray;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem;
  }
}
`;
