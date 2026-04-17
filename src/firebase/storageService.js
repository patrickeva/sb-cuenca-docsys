// src/firebase/storageService.js
// Using Supabase Storage for file storage (free tier)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl    = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET = "documents";

export const uploadFile = (file, barangayId, category, onProgress) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const fileName  = `${timestamp}_${file.name}`;
    const filePath  = `${barangayId}/${category}/${fileName}`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${filePath}`;

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        if (onProgress) onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        // Public URL — bubukas ng direkta sa browser
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${filePath}`;
        resolve({
          url:  publicUrl,
          path: filePath,
        });
      } else {
        console.error("[Supabase] Upload error:", xhr.responseText);
        reject(new Error("Upload failed: " + xhr.responseText));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed — network error"));
    });

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Authorization", `Bearer ${supabaseAnonKey}`);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.send(file);
  });
};

export const deleteFile = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath]);
  if (error) console.error("[Supabase] Delete error:", error);
};