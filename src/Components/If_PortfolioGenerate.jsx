import React, { useState, useEffect } from "react";
// import { checkPortfolioIdExists } from "./FirebaseUtils"; // Import the function
import useUserAuth from "./UserAuthentication";
import Profile from "./Profile";
import UserDashboard from "./UserDashboard";
import { checkPortfolioIdExists } from "./PortfolioMethods";
import DataLoader from "./DataLoader";
import MultiStepForm from "./MultiStepForm";
import { generatePortfolioLink, savePortfolioDataToFirebase } from "./PortfolioMethods";
import { getDatabase, ref, set } from "firebase/database";
import { query, orderByChild, child, equalTo, get, push } from "firebase/database";


export default function If_PortfolioGenerate() {
  const { userDetails, user, setUserDetails } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader for form submission
  const [profileData, setProfileData] = useState(null); // Store fetched profile data

  useEffect(() => {
    const checkPortfolioStatus = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const portfolioExists = await checkPortfolioIdExists(user.uid);

        // Simulate additional loader time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        
        setHasPortfolio(portfolioExists);
      } catch (error) {
        console.error("Error checking portfolio status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPortfolioStatus();
  }, [user?.uid]);

  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     if (user?.uid) {
  //       const db = getDatabase();
  //       const userRef = ref(db, `Users/${user.uid}`);
  //       const snapshot = await get(userRef);
  //       if (snapshot.exists()) {
  //         setUserDetails(snapshot.val());
  //       } else {
  //         console.log("No user data available");
  //       }
  //     }
  //   };
  
  //   fetchUserDetails();
  // }, [user?.uid]);

  // const handleSubmit = async (portfolioData) => {
  //   setIsSubmitting(true); // Show loader during submission

  //   try {
  //     // Save portfolio data to Firebase
  //     await fetchPortfolioData(user.uid, portfolioData);

  //     // Fetch the latest profile data
  //     const fetchedProfileData = await fetchPortfolioData(user.uid);
  //     setProfileData(fetchedProfileData);

  //     setHasPortfolio(true);
  //   } catch (error) {
  //     console.error("Error during submission:", error);
  //   } finally {
  //     setIsSubmitting(false); // Hide loader
  //   }
  // };

  if (loading || isSubmitting) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <DataLoader />
      </div>
    );
  }

  return (
    <div  className=" w-full ">
      {hasPortfolio ? (
        <Profile userId={user?.uid} userDetails={profileData || userDetails} setUserDetails={setUserDetails} />
      ) : (
        <MultiStepForm 
        setHasPortfolio={setHasPortfolio} setProfileData={setProfileData}
        />
      )}
    </div>
  );
}


