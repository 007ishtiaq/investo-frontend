// hooks/useTokenRefresh.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFreshToken } from "../functions/tokenRefresh";

// This hook will refresh the Firebase token every 30 minutes
export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    if (!user) return;

    // Refresh token every 30 minutes
    const refreshInterval = setInterval(async () => {
      try {
        const newToken = await getFreshToken();
        if (newToken) {
          dispatch({
            type: "LOGGED_IN_USER",
            payload: {
              ...user,
              token: newToken,
            },
          });
        }
      } catch (error) {
        console.error("Background token refresh failed:", error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, [user, dispatch]);
};
