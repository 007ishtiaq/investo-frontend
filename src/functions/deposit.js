// client/src/functions/deposit.js

import axios from "axios";
import { uploadImage } from "./cloudinary";

export const getUserDeposits = async (token) => {
  try {
    const res = await axios.get("/api/user/deposits", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Load deposits error:", error);
    throw new Error("Error loading deposit history");
  }
};

export const submitDeposit = async (depositData, token) => {
  try {
    // Upload screenshot first
    const screenshotUrl = await uploadImage(
      depositData.screenshot,
      "investment_proofs"
    );

    if (!screenshotUrl) {
      throw new Error("Failed to upload screenshot");
    }

    // Create deposit request
    const res = await axios.post(
      "/api/deposit/create",
      {
        amount: parseFloat(depositData.amount),
        paymentMethod: depositData.paymentMethod,
        transactionId: depositData.transactionId,
        screenshotUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Submit deposit error:", error);
    throw new Error("Failed to submit deposit request");
  }
};

export const formatPaymentMethod = (method) => {
  return method.charAt(0).toUpperCase() + method.slice(1).replace("_", " ");
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case "approved":
      return "badge-success";
    case "rejected":
      return "badge-danger";
    default:
      return "badge-warning";
  }
};
