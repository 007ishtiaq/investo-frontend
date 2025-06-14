// client/src/functions/investment.js

import axios from "axios";

export const getInvestmentPlans = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API}/investment-plans`
    );
    return response.data;
  } catch (error) {
    // Properly handle and log the error
    console.error(
      "Error fetching investment plans:",
      error.response?.data || error.message
    );
    throw error;
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
    throw error;
  }
};
