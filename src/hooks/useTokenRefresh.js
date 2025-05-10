import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFreshToken, setupTokenRefresh } from "../functions/tokenRefresh";

// This hook will refresh the Firebase token every 30 minutes and setup interceptors
export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    if (!user) return;

    // Setup axios interceptors once
    setupTokenRefresh(user, dispatch);

    // Refresh token every 30 minutes
    const refreshInterval = setInterval(async () => {
      try {
        const newToken = await getFreshToken();
        if (newToken && newToken !== user.token) {
          dispatch({
            type: "LOGGED_IN_USER",
            payload: {
              ...user,
              token: newToken,
            },
          });

          // Update in localStorage too
          if (window !== undefined) {
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...localUser,
                token: newToken,
              })
            );
          }
        }
      } catch (error) {
        console.error("Background token refresh failed:", error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, [user, dispatch]);
};
