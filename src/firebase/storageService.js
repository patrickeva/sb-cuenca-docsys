// src/firebase/storageService.js
// Using Cloudinary for file storage (free tier)

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

console.log("[Cloudinary] cloud_name:", CLOUD_NAME);
console.log("[Cloudinary] upload_preset:", UPLOAD_PRESET);

export const uploadFile = (file, barangayId, category, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      reject(new Error("Cloudinary config missing — check environment variables"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `sb-cuenca/${barangayId}/${category}`);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        if (onProgress) onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          path: response.public_id,
        });
      } else {
        const errBody = JSON.parse(xhr.responseText);
        console.error("[Cloudinary] Upload error response:", errBody);
        reject(new Error("Upload failed: " + xhr.responseText));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed — network error"));
    });

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`
    );
    xhr.send(formData);
  });
};

export const deleteFile = async (publicId) => {
  console.log("File delete noted:", publicId);
};