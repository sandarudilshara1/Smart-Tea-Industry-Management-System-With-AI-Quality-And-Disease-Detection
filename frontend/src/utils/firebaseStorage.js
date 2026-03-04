// Firebase Storage has been disabled - using MongoDB backend only
// This file is kept for reference but should not be used

/*
// firebaseStorage.js
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import app  from "../firebase.js"; // your firebase initialization

const storage = getStorage(app);

export const getNicImageUrl = async (objectName) => {
  if (!objectName) return null;
  try {
    const imageRef = ref(storage, objectName);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error("Error fetching NIC image:", error);
    return null;
  }
};
*/

// Placeholder function to prevent import errors
export const getNicImageUrl = async (objectName) => {
  console.warn('Firebase Storage is disabled. Please use MongoDB/backend for file storage.');
  return null;
};
