// client/src/functions/user.js

import axios from "axios";

export const getUsers = async (token) => {
  try {
    const res = await axios.get("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Load users error:", error);
    throw new Error("Error loading users");
  }
};

export const getUserLevel = async (token) => {
  try {
    const res = await axios.get("/api/user/level", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.level || 1;
  } catch (error) {
    console.error("Get user level error:", error);
    return 1; // Default to level 1 if there's an error
  }
};

export const updateUserLevel = async (userId, level, token) => {
  try {
    const res = await axios.put(
      `/api/admin/user/${userId}/level`,
      { level },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Update user level error:", error);
    throw new Error("Failed to update user level");
  }
};

export const getLevelBadgeClass = (level) => {
  switch (level) {
    case 4:
      return "level-4";
    case 3:
      return "level-3";
    case 2:
      return "level-2";
    default:
      return "level-1";
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
