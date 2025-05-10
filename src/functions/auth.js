import axios from "axios";
import firebase from "../firebase";
import { toast } from "react-hot-toast";

export const createOrUpdateUser = async (authtoken, name) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/create-or-update-user`,
    { name },
    {
      headers: {
        authtoken,
      },
    }
  );
};

export const currentUser = async (authtoken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/current-user`,
    {},
    {
      headers: {
        authtoken,
      },
    }
  );
};

export const currentAdmin = async (authtoken) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/current-admin`,
    {},
    {
      headers: {
        authtoken,
      },
    }
  );
};

export const SendOTP = async (email) => {
  return await axios.post(`${process.env.REACT_APP_API}/send-otp`, { email });
};

export const verifyOTP = async (values) => {
  return await axios.post(`${process.env.REACT_APP_API}/verify-otp`, {
    values,
  });
};

export const infoOTP = async (email) => {
  return await axios.post(`${process.env.REACT_APP_API}/otpinfo`, {
    email,
  });
};

// Re-authenticate for sensitive operations
export const requireRecentAuth = async (
  callback,
  message = "Please re-enter your password to continue"
) => {
  const currentUser = firebase.auth().currentUser;

  if (!currentUser) {
    toast.error("You must be logged in");
    return false;
  }

  // For email/password auth
  if (currentUser.providerData[0].providerId === "password") {
    try {
      // Prompt for password
      const password = prompt(message, "");

      if (!password) {
        toast.error("Authentication required to continue");
        return false;
      }

      // Create credential
      const credential = firebase.auth.EmailAuthProvider.credential(
        currentUser.email,
        password
      );

      // Re-authenticate
      await currentUser.reauthenticateWithCredential(credential);

      // If successful, run callback
      return await callback();
    } catch (error) {
      console.error("Re-auth error:", error);
      toast.error("Authentication failed. Please try again.");
      return false;
    }
  }
  // For other auth providers like Google
  else {
    // For OAuth providers, we can't silently reauthenticate
    // So we can either require them to log in again or just proceed
    toast.info("For security reasons, you may need to login again");
    return await callback();
  }
};

// Example usage:
export const withdrawMoney = async (amount) => {
  return requireRecentAuth(async () => {
    // The sensitive operation code goes here
    // This only runs after successful re-authentication
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/withdraw`,
        { amount },
        {
          headers: {
            authtoken: firebase.auth().currentUser.getIdToken(),
          },
        }
      );

      toast.success("Withdrawal submitted successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Withdrawal failed");
      throw error;
    }
  }, "For your security, please enter your password to confirm this withdrawal");
};
