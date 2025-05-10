// client/src/functions/team.js
import axios from "axios";

// Get team members
export const getTeamMembers = async (authToken) => {
  return await axios.get(`${process.env.REACT_APP_API}/team/members`, {
    headers: {
      authToken,
    },
  });
};

// Get affiliate code
export const getAffiliateCode = async (authToken) => {
  return await axios.get(`${process.env.REACT_APP_API}/team/affiliate-code`, {
    headers: {
      authToken,
    },
  });
};

// Register with affiliate code
export const registerWithAffiliateCode = async (affiliateCode, userId) => {
  return await axios.post(
    `${process.env.REACT_APP_API}/team/register-affiliate`,
    { affiliateCode, userId }
  );
};

// New function for team earnings
export const getTeamEarnings = async (authtoken) => {
  return await axios.get(`${process.env.REACT_APP_API}/team/earnings`, {
    headers: {
      authtoken,
    },
  });
};
