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
  limit = 10
) => {
  return await axios.get(
    `${process.env.REACT_APP_API}/wallet/transactions?page=${page}&limit=${limit}`,
    {
      headers: {
        authtoken,
      },
    }
  );
};
