import { getDatabase, ref, get, update } from "firebase/database"; // Firebase imports
// import useUserAuth from "./UserAuthentication";

export const savePortfolioDataToFirebase = async (portfolioData, userId) => {
  try {
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const portfolioRef = ref(db, `Users/${userId}`); // Reference the "Users" node directly using the userId

    // Save the portfolio data directly under the user's ID
    await update(portfolioRef, portfolioData);

    console.log("Portfolio data saved directly under the user ID in Firebase!");
  } catch (error) {
    console.error("Error saving portfolio data to Firebase:", error);
  }
};

// Function to generate a unique portfolio link
export const generatePortfolioLink = (name, surname) => {
  console.log("generatePortfolioLink called");
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${name}-${surname}-${code}`;
};

/**
 * Function to check if a portfolio ID is generated for a user.
 * @param {string} userId - The unique ID of the user.
 * @returns {boolean} - Returns true if a portfolio ID exists, otherwise false.
 */
export const checkPortfolioIdExists = async (userId) => {
  try {
    const db = getDatabase(); // Initialize Firebase Realtime Database
    const portfolioRef = ref(db, `portfolioId/${userId}`); // Reference the portfolio node

    // Fetch data from Firebase
    const snapshot = await get(portfolioRef);

    // Check if the snapshot has data
    if (snapshot.exists()) {
      console.log("Portfolio ID exists:", snapshot.val());
      return true; // Portfolio ID is generated
    } else {
      console.log("Portfolio ID does not exist.");
      return false; // Portfolio ID is not generated
    }
  } catch (error) {
    console.error("Error checking portfolio ID:", error);
    return false; // Handle errors gracefully
  }
};
