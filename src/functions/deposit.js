// client/src/functions/deposit.js

import axios from "axios";
import { uploadImage } from "./cloudinary";

export const getUserDeposits = async (authtoken) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API}/user/deposits`, {
      headers: {
        authtoken,
      },
    });

    // Return the data directly - we'll handle the structure in the component
    return res.data;
  } catch (error) {
    console.error("Load deposits error:", error);
    throw new Error("Error loading deposit history");
  }
};

export const submitDeposit = async (depositData, authtoken) => {
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
      `${process.env.REACT_APP_API}/deposit/create`,
      {
        amount: parseFloat(depositData.amount),
        paymentMethod: depositData.paymentMethod,
        transactionId: depositData.transactionId,
        screenshotUrl,
      },
      {
        headers: {
          authtoken,
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
