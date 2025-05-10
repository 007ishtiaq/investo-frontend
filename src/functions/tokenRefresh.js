import firebase from "../firebase";
import axios from "axios";

// Track interceptors to avoid duplicates
let requestInterceptor = null;
let responseInterceptor = null;

// Get fresh token function
export const getFreshToken = async () => {
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    try {
      // Force refresh the token
      const newToken = await currentUser.getIdToken(true);
      return newToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }
  return null;
};

// Setup axios interceptors for token refreshing
export const setupTokenRefresh = (user, dispatch) => {
  // Remove existing interceptors if they exist
  if (requestInterceptor !== null) {
    axios.interceptors.request.eject(requestInterceptor);
  }

  if (responseInterceptor !== null) {
    axios.interceptors.response.eject(responseInterceptor);
  }

  // Set up axios interceptor for request
  requestInterceptor = axios.interceptors.request.use(
    async (config) => {
      // Make sure we don't add token to calls that don't need it
      if (
        config.url &&
        config.url.includes(process.env.REACT_APP_API) &&
        user
      ) {
        config.headers.authtoken = user.token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Set up axios interceptor for response
  responseInterceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
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

            // Update token in axios header and retry request
            originalRequest.headers.authtoken = newToken;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh error on 401:", refreshError);
          // Handle token refresh failure - log user out
          dispatch({
            type: "LOGOUT",
            payload: null,
          });

          // Force redirect to login
          window.location.href = "/login";
        }
      }

      // Return error for all other cases
      return Promise.reject(error);
    }
  );
};
