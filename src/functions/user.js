// client/src/functions/user.js

import axios from "axios";
import { uploadImage } from "./cloudinary";

export const getUsers = async (authtoken, page = 1, limit = 10, email = "") => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API}/admin/users?page=${page}&limit=${limit}&email=${email}`,
      {
        headers: {
          authtoken,
        },
      }
    );

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

    return res.data.level;
  } catch (error) {
    console.error("Get user level error:", error);
    return 1; // Default to level 1 if there's an error
  }
};

// Get user investments
export const getUserInvestments = async (authtoken) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API}/user/investments`,
      {
        headers: {
          authtoken,
        },
      }
    );
    return response.data.investments;
  } catch (error) {
    console.error("Error fetching user investments:", error);
    throw error;
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

// Update user profile with optional image upload
export const updateUserProfile = async (authtoken, userData) => {
  // Check if there's an image file to upload first
  if (userData.profileImage && userData.profileImage instanceof File) {
    try {
      // Upload the image to Cloudinary
      const imageUrl = await uploadImage(
        userData.profileImage,
        "contact_attachments"
      );

      // Replace the File object with the URL string
      if (imageUrl) {
        userData.profileImage = imageUrl;
      } else {
        // If upload failed, remove the field
        delete userData.profileImage;
      }
    } catch (err) {
      console.error("Profile image upload error:", err);
      // Remove the field if upload failed
      delete userData.profileImage;
    }
  } else if (!userData.profileImage) {
    // If profileImage is null or empty string, don't send it
    delete userData.profileImage;
  }
  // Now send the update request with the image URL if available
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

// Function specifically for contact attachments
export const uploadContactAttachment = async (file) => {
  return await uploadImage(file, "contact_attachments");
};

export const sendContactMessage = async (formData, authtoken) => {
  try {
    console.log("formData", formData);

    // Upload attachment first if exists
    let attachmentUrl = null;
    if (formData.attachment) {
      attachmentUrl = await uploadContactAttachment(formData.attachment);

      if (!attachmentUrl) {
        throw new Error("Failed to upload attachment");
      }
    }

    // Create contact request with attachment URL
    const res = await axios.post(
      `${process.env.REACT_APP_API}/contact`,
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        attachmentUrl: attachmentUrl,
        attachmentName: formData.fileName || null,
      },
      {
        headers: {
          authtoken,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Submit contact error:", error);
    throw error;
  }
};
