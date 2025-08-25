// client/src/contexts/WalletContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { getUserWallet } from "../functions/wallet";
import { useSelector, useDispatch } from "react-redux";
import { getFreshToken } from "../functions/tokenRefresh";
// Remove the import for useNavigate - we'll use window.location instead

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState("Rs.");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    // Clean up Redux state
    dispatch({
      type: "LOGOUT",
      payload: null,
    });

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }

    // Redirect to login using window.location
    window.location.href = "/login";
  };

  const fetchWalletBalance = async (retryWithNewToken = true) => {
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

      // Check if error is due to expired token (401)
      if (error.response && error.response.status === 401) {
        if (retryWithNewToken) {
          try {
            // Use the existing token refresh function
            const newToken = await getFreshToken();

            if (newToken) {
              // Update Redux state
              dispatch({
                type: "LOGGED_IN_USER",
                payload: {
                  ...user,
                  token: newToken,
                },
              });

              // Update in localStorage
              if (typeof window !== "undefined") {
                const localUser = JSON.parse(
                  localStorage.getItem("user") || "{}"
                );
                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    ...localUser,
                    token: newToken,
                  })
                );
              }

              // Retry wallet fetch with new token
              fetchWalletBalance(false); // Prevent infinite retry loop
            } else {
              // If refresh fails, log out
              handleLogout();
            }
          } catch (refreshError) {
            console.error(
              "Failed to refresh token in wallet context:",
              refreshError
            );
            // If refresh throws error, log out
            handleLogout();
          }
        } else {
          // If we've already tried refreshing, log out
          handleLogout();
        }
      }

      // Check for redirect flag from server
      if (error.response?.data?.redirect) {
        handleLogout();
      }
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
