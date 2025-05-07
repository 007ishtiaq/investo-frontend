// client/src/functions/user.js

import axios from "axios";

export const getUsers = async (authtoken) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API}/admin/users`, {
      headers: {
        authtoken,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Load users error:", error);
    throw new Error("Error loading users");
  }
};

export const getUserLevel = async (authtoken) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API}/user/level`, {
      headers: {
        authtoken,
      },
    });

    return res.data.level || 1;
  } catch (error) {
    console.error("Get user level error:", error);
    return 1; // Default to level 1 if there's an error
  }
};

export const updateUserLevel = async (userId, level, authtoken) => {
  try {
    const res = await axios.put(
      `${process.env.REACT_APP_API}/admin/user/${userId}/level`,
      { level },
      {
        headers: {
          authtoken,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Update user level error:", error);
    throw new Error("Failed to update user level");
  }
};

// Get current user profile info
export const getCurrentUser = async (authtoken) => {
  return await axios.get(`${process.env.REACT_APP_API}/current-user`, {
    headers: {
      authtoken,
    },
  });
};

// Update user profile (name, contact, etc.)
export const updateUserProfile = async (authtoken, userData) => {
  return await axios.put(
    `${process.env.REACT_APP_API}/user/profile`,
    userData,
    {
      headers: {
        authtoken,
      },
    }
  );
};

// Update notification preferences
export const updateNotificationPreferences = async (authtoken, preferences) => {
  return await axios.put(
    `${process.env.REACT_APP_API}/user/notifications`,
    preferences,
    {
      headers: {
        authtoken,
      },
    }
  );
};

// Get total deposits for a user
export const getTotalDeposits = async (authtoken) => {
  return await axios.get(`${process.env.REACT_APP_API}/wallet/total-deposits`, {
    headers: {
      authtoken,
    },
  });
};
// Get total withdrawals for a user
export const getTotalWithdrawals = async (authtoken) => {
  return await axios.get(
    `${process.env.REACT_APP_API}/wallet/total-withdrawals`,
    {
      headers: {
        authtoken,
      },
    }
  );
};
// Get total team/referral earnings for a user
export const getTeamEarnings = async (authtoken) => {
  return await axios.get(`${process.env.REACT_APP_API}/wallet/team-earnings`, {
    headers: {
      authtoken,
    },
  });
};

// Get total earnings for a user (includes all types of earnings)
export const getTotalEarnings = async (authtoken) => {
  return await axios.get(`${process.env.REACT_APP_API}/wallet/total-earnings`, {
    headers: {
      authtoken,
    },
  });
};
