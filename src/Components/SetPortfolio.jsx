import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useLocation, useParams } from "react-router-dom";

import SetHero from "./SetHero";
import SetExperience from "./SetExperience";
import SetEducation from "./SetEducation";
import SetProjects from "./SetProjects";
import SetCertificates from "./SetCertificates";
import SetFeatures from "./SetFeatures";
import SetSkills from "./SetSkills";

import useUserAuth from "./UserAuthentication";
import DataLoader from "./DataLoader";

export default function SetPortfolio() {
  const { userName } = useParams();
  const location = useLocation();
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, userDetails: userBaseDetails } = useUserAuth();

  // Component map
  const sectionComponents = {
    SetHero: SetHero,
    SetSkills: SetSkills,
    SetProjects: SetProjects,
    SetFeatures: SetFeatures,
    SetCertificates: SetCertificates,
    SetEducation: SetEducation,
    SetExperience: SetExperience,
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserDetails = async (usernameFromMethod = "") => {
      const currentUrl = usernameFromMethod || userName;
      try {
        const db = getDatabase();

        const portfolioRef = ref(db, "portfolioId");
        const portfolioSnapshot = await get(portfolioRef);

        if (portfolioSnapshot.exists()) {
          const portfolios = portfolioSnapshot.val();
          let foundUserUid = null;

          Object.entries(portfolios).forEach(([key, portfolio]) => {
            if (portfolio.uniqueLink === currentUrl) {
              foundUserUid = key;
            }
          });

          if (!foundUserUid) {
            setError("No user found for this link.");
            setLoading(false);
            return;
          }

          const usersRef = ref(db, `Users/${foundUserUid}`);
          const userSnapshot = await get(usersRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            setUserDetails({ ...userData, uid: foundUserUid });
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
        setLoading(false);
      }
    };

    const fetchData = async () => {
      if (userBaseDetails?.uid) {
        const db = getDatabase();
        const portfolioRef = ref(db, `portfolioId/${user.uid}`);
        const snapshot = await get(portfolioRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          fetchUserDetails(data.uniqueLink);
        } else {
          console.log("No user data available");
        }
      }
    };

    if (user && location?.pathname?.includes("/user")) {
      fetchData();
    } else {
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Scroll to section
  useEffect(() => {
    const scrollToSection = () => {
      setTimeout(() => {
        if (window.location.hash) {
          const element = document.querySelector(window.location.hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 500);
    };

    scrollToSection();
  }, [location]);

  // Loading & error
  if (loading) {
      return <DataLoader />;
    }
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mt-10 flex flex-col justify-center items-center w-full gap-5">
      {userDetails?.sections?.filter(s => s.enabled)?.map((section) => {
        const Component = sectionComponents[section.key];
        if (!Component) return null;
        return (
          <section
            key={section.key}
            id={section.key}
            className="w-full flex flex-col justify-center items-center"
          >
            <Component userDetails={userDetails} />
          </section>
        );
      })}
    </div>
  );
}
