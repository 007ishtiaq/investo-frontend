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
