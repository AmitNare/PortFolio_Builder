import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import SetHero from "./SetHero";
import SetExperience from "./SetExperience";
import SetEducation from "./SetEducation";
import SetProjects from "./SetProjects";
import SetCertificates from "./SetCertificates";
import { useLocation, useParams } from "react-router-dom";
import useUserAuth from "./UserAuthentication";
import SetFeatures from "./SetFeatures";

export default function SetPortfolio() {
  const { userName } = useParams(); // Extract dynamic username
  const location = useLocation(); // Get the current location
  const [userDetails, setUserDetails] = useState(null); // Store user details
  const [error, setError] = useState(null); // Handle errors
  const [loading, setLoading] = useState(true); // Show loading state

  const { user, userDetails: userBaseDetails } = useUserAuth();

  // Fetch user data from Firebase
  useEffect(() => {
    // for direct visitors from base url
    const fetchUserDetails = async (usernameFromMethod = "") => {
      const currentUrl = usernameFromMethod ? usernameFromMethod : userName;

      try {
        const database = getDatabase();

        // Step 1: Fetch portfolioId document
        const portfolioRef = ref(database, "portfolioId");
        const portfolioSnapshot = await get(portfolioRef);

        if (portfolioSnapshot.exists()) {
          const portfolios = portfolioSnapshot.val();
          let foundUserUid = null;

          console.log("PP Data: ", portfolios);

          // Step 2: Find the user whose link matches the current URL
          Object.entries(portfolios).forEach(([key, portfolio]) => {
            console.log("Checking portfolio:", key);
            if (portfolio.uniqueLink === currentUrl) {
              foundUserUid = key; // Extract the user's UID
              console.log("foundUserUid : ", foundUserUid);
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
            console.log(userDetails);
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

    // for users who are logged in, from /user/preview route
    const fetchData = async () => {
      if (userBaseDetails) {
        console.log("User fetchData object:", user); // Log the user object

        if (userBaseDetails?.uid) {
          const db = getDatabase();
          const portfolioRef = ref(db, `portfolioId/${user.uid}`);

          // Check if the user already has a portfolio
          const snapshot = await get(portfolioRef);
          if (snapshot.exists()) {
            const data = snapshot.val(); // Get the data object
            fetchUserDetails(data.uniqueLink);
          } else {
            console.log("No user data available");
          }
        }
      }
    };

    // check if user is logged in
    if (user && location?.pathname?.includes("/user")) {
      fetchData();
    } else {
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
    <div className="mt-5 w-full">
      {/* Portfolio Sections */}
      <section id="SetHero">
        <SetHero userDetails={userDetails} />
      </section>
      {userDetails.projects && (
        <section id="SetProjects">
          <SetProjects userDetails={userDetails} />
        </section>
      )}
      {userDetails.features && (
        <section id="SetFeatures">
          <SetFeatures userDetails={userDetails} />
        </section>
      )}
      {userDetails.certificates && (
        <section id="SetCertificates">
          <SetCertificates userDetails={userDetails} />
        </section>
      )}
      {userDetails.colleges && (
        <section id="SetEducation">
          <SetEducation userDetails={userDetails} />
        </section>
      )}
      {userDetails.experience && (
        <section id="SetExperience">
          <SetExperience userDetails={userDetails} />
        </section>
      )}
    </div>
  );
}
