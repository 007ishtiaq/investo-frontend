// client/src/functions/adminDeposit.js

import axios from "axios";

export const getDeposits = async (authtoken, filter = "pending") => {
  try {
    const endpoint =
      filter === "pending"
        ? `${process.env.REACT_APP_API}/admin/deposits/pending`
        : `${process.env.REACT_APP_API}/admin/deposits`;

    const res = await axios.get(endpoint, {
      headers: {
        authtoken,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Load deposits error:", error);
    throw new Error("Error loading deposits");
  }
};

export const getInvestmentPlans = async (authtoken) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API}/investment-plans`,
      {
        headers: {
          authtoken,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Load investment plans error:", error);
    throw new Error("Error loading investment plans");
  }
};

export const reviewDeposit = async (depositId, reviewData, authtoken) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API}/admin/deposit/${depositId}/review`,
      reviewData,
      {
        headers: {
          authtoken,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Review deposit error:", error);
    throw new Error(`Failed to ${reviewData.status} deposit`);
  }
};
