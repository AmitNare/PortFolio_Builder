import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import SetHero from "./SetHero";
import SetExperience from "./SetExperience";
import SetEducation from "./SetEducation";
import SetProjects from "./SetProjects";
import SetCertificates from "./SetCertificates";
import { useLocation, useParams, Link } from "react-router-dom";

export default function SetPortfolio({setUserName}) {
  const { userName } = useParams(); // Extract dynamic username
  const location = useLocation(); // Get the current location
  const [userDetails, setUserDetails] = useState(null); // Store user details
  const [error, setError] = useState(null); // Handle errors
  const [loading, setLoading] = useState(true); // Show loading state

  useEffect(() => {
    setUserName(userName)
  
    
  }, [location])
  
  // Fetch user data from Firebase
  useEffect(() => {
    const currentUrl = window.location.href; // Get the full URL
    // setUserName(userName)
    const fetchUserDetails = async () => {
      try {
        const database = getDatabase();

        // Step 1: Fetch portfolioId document
        const portfolioRef = ref(database, "portfolioId");
        const portfolioSnapshot = await get(portfolioRef);

        if (portfolioSnapshot.exists()) {
          const portfolios = portfolioSnapshot.val();
          let foundUserUid = null;

          // Step 2: Find the user whose link matches the current URL
          Object.entries(portfolios).forEach(([key, portfolio]) => {
            if (portfolio.uniqueLink === currentUrl) {
              foundUserUid = portfolio.userId; // Extract the user's UID
            }
          });

          if (!foundUserUid) {
            setError("No user found for this link.");
            setLoading(false);
            return;
          }

          // Step 3: Use the UID to fetch user details from the 'users' document
          const usersRef = ref(database, `Users/${foundUserUid}`);
          const userSnapshot = await get(usersRef);

          if (userSnapshot.exists()) {
            // Merge the user details with the UID
            const userData = userSnapshot.val();
            setUserDetails({
              ...userData,
              uid: foundUserUid, // Include the UID in the userDetails
            });
          } else {
            setError("User details not found in the database.");
          }
        } else {
          setError("No portfolio data found in the database.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch user data. Please try again later.");
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    };

    fetchUserDetails();
  }, [location.pathname]); // Dependency: Run when the URL path changes

  useEffect(() => {
    console.log("Username from URL:", userName); // Debug log
  }, [userName]);
  // Scroll to the section specified in the hash
  useEffect(() => {
    const scrollToSection = () => {
      if (location.hash) {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Scroll to top if no hash is present
        window.scrollTo(0, 0);
      }
    };

    scrollToSection();
  }, [location]);

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mt-20">
      
      {/* Portfolio Sections */}
      <section id="SetHero">
        <SetHero userDetails={userDetails} />
      </section>
      <section id="SetProjects">
        <SetProjects userDetails={userDetails} />
      </section>
      <section id="SetCertificates">
        <SetCertificates userDetails={userDetails} />
      </section>
      <section id="SetEducation">
        <SetEducation userDetails={userDetails} />
      </section>
      <section id="SetExperience">
        <SetExperience userDetails={userDetails} />
      </section>
    </div>
  );
}
