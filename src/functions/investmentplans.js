// client/src/functions/investment.js

import axios from "axios";

export const getInvestmentPlans = async (authtoken) => {
  try {
    const headers = authtoken ? { authtoken } : {};

    const res = await axios.get(
      `${process.env.REACT_APP_API}/investment-plans`,
      { headers }
    );
    return res.data;
  } catch (error) {
    console.error("Load investment plans error:", error);
    throw new Error("Error loading investment plans");
  }
};

export const getUserLevelPlans = async (token) => {
  try {
    const res = await axios.get("/api/user/investment-plans", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Load user plans error:", error);
    throw new Error("Error loading available investment plans");
  }
};

// Function to upgrade user's plan
export const upgradePlan = async (authtoken, { planId, investmentAmount }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API}/user/upgrade-plan`,
      { planId, investmentAmount },
      {
        headers: {
          authtoken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Plan upgrade error:", error);
    throw error;
  }
};
