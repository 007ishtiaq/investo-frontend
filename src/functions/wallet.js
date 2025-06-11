// client/src/functions/wallet.js
import axios from "axios";

export const getUserWallet = async (authtoken) => {
  return await axios.get(`${process.env.REACT_APP_API}/wallet/user-wallet`, {
    headers: {
      authtoken,
    },
  });
};

export const getTransactionHistory = async (
  authtoken,
  page = 1,
  limit = 10,
  filter = "all",
  search = ""
) => {
  return await axios.get(`${process.env.REACT_APP_API}/wallet/transactions`, {
    headers: {
      authtoken,
    },
    params: {
      page,
      limit,
      filter,
      search,
    },
  });
};

// Submit withdrawal request
export const submitWithdrawal = async (withdrawalData, authtoken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/wallet/withdraw`,
    withdrawalData,
    {
      headers: {
        authtoken,
      },
    }
  );
};

// Format wallet balance for display
export const formatBalance = (balance, currency = "USD", decimals = 3) => {
  if (balance === undefined || balance === null) return "0.000";

  if (currency === "USD") {
    return `$${Number(balance).toFixed(decimals)}`;
  } else if (currency === "ETH") {
    return `${Number(balance).toFixed(4)} ETH`;
  } else if (currency === "BTC") {
    return `${Number(balance).toFixed(8)} BTC`;
  }

  return balance.toFixed(3); // Default to 3 decimals
};
