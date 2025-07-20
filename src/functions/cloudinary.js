// client/src/functions/cloudinary.js

import axios from "axios";

export const uploadImage = async (file, uploadPreset) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// Simple image compression function
const compressImage = (file, maxSize = 200, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      // Set canvas size to desired profile image size
      canvas.width = maxSize;
      canvas.height = maxSize;
      // Draw image to fill the square canvas (this will crop if needed)
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      ctx.drawImage(img, x, y, size, size, 0, 0, maxSize, maxSize);

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
};

export const uploadProfileImage = async (file) => {
  if (!file) return null;
  try {
    // Compress the image before uploading
    const compressedFile = await compressImage(file);

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", "profile_images");
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Profile image upload error:", error);
    throw new Error("Failed to upload profile image");
  }
};
