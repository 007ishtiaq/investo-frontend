// client/src/functions/cloudinary.js

import axios from "axios";

export const uploadImage = async (file, uploadPreset) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", // Replace with your Cloudinary cloud name
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image");
  }
};
