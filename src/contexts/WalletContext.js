// client/src/contexts/WalletContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { getUserWallet } from "../functions/wallet";
import { useSelector } from "react-redux";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);

  const fetchWalletBalance = async () => {
    if (!user || !user.token) return;

    setLoading(true);
    try {
      const res = await getUserWallet(user.token);
      if (res && res.data && res.data.balance !== undefined) {
        setWalletBalance(res.data.balance);
        if (res.data.currency) {
          setWalletCurrency(res.data.currency);
        }
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet when user changes
  useEffect(() => {
    if (user && user.token) {
      fetchWalletBalance();
    } else {
      setWalletBalance(0);
    }
  }, [user]);

  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        walletCurrency,
        loading,
        refreshWalletBalance: fetchWalletBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
