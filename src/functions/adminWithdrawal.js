// client/src/functions/adminWithdrawal.js
import axios from "axios";

// Get all withdrawals or filtered by status
export const getWithdrawals = async (
  authtoken,
  status = "all",
  page = 1,
  limit = 10
) => {
  try {
    let url = `${process.env.REACT_APP_API}/admin/withdrawals?status=${status}`;

    // Add pagination parameters for 'all' status
    if (status === "all") {
      url += `&page=${page}&limit=${limit}`;
    }

    const response = await axios.get(url, {
      headers: {
        authtoken,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to fetch withdrawals");
  }
};

// Approve or reject a withdrawal
export const reviewWithdrawal = async (withdrawalId, data, authtoken) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API}/admin/withdrawal/${withdrawalId}/review`,
      data,
      {
        headers: {
          authtoken,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to process withdrawal");
  }
};
