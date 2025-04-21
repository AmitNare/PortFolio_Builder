import React, { useState, useEffect } from "react";
// import { getDatabase, ref, get } from "firebase/database";
import whatsApp from "../assets/Images/whatsapp.png";
import instagram from "../assets/Images/instagram.png";
import gmail from "../assets/Images/gmail.png";
import github from "../assets/Images/github.png";
import linkedin from "../assets/Images/linkedin.png";
import Address from "../assets/Images/gps.png";
import wave_hand from "../assets/Images/wave-hand.gif";

import "../App.css";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  onValue,
  getDatabase,
  ref as dbRef,
  get,
  update,
} from "firebase/database";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { Download, DownloadIcon } from "lucide-react";

export default function SetHero({ userDetails }) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [imageUrl, setImageUrl] = useState(""); // State to store the fetched image URL
  const [roles, setRoles] = useState([]); // State to store roles

  // Fetch user roles and image from Firebase
  useEffect(() => {
    if (userDetails?.uid) {
      const db = getDatabase();
      const userRef = dbRef(db, `Users/${userDetails.uid}`);
      const imageRef = dbRef(db, `portfolioId/${userDetails.uid}/image`);

      // Fetch user data for roles
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.image) {
              setImageUrl(userData.image); // Assuming userData.image contains the URL
            }
            const roles = userData.experience?.map((exp) => exp.jobRole) || [];

            // Add current job role if it exists
            if (userData.currentJobRole) {
              roles.push(userData.currentJobRole); // Assuming currentJobRole is a string or object
            }

            setRoles(roles);
          } else {
            console.error("No user data found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userDetails?.uid]);

  // Typing effect logic
  useEffect(() => {
    if (!roles.length) return; // Exit if no roles are available

    const currentRole = roles[currentRoleIndex];

    const handleTyping = () => {
      if (isDeleting) {
        // Remove characters if deleting
        setDisplayedText((prevText) => prevText.slice(0, -1));
        setTypingSpeed(100); // Faster when deleting
      } else {
        // Add characters if typing
        setDisplayedText((prevText) =>
          currentRole.slice(0, prevText.length + 1)
        );
        setTypingSpeed(150); // Normal speed when typing
      }

      // Determine if text is fully typed or fully deleted
      if (!isDeleting && displayedText === currentRole) {
        setTimeout(() => setIsDeleting(true), 2000); // Pause before starting deletion
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length); // Move to next role
      }
    };

    const typingTimeout = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(typingTimeout);
  }, [displayedText, isDeleting, typingSpeed, currentRoleIndex, roles]);

  // download file from firebase url
  const downloadResume = async () => {
    if (!userDetails.resume) {
      console.error("No Resume Found");
      return;
    }

    try {
      const storage = getStorage();

      // Decode and extract path from URL
      const fullUrl = userDetails.resume;
      const decodedUrl = decodeURIComponent(fullUrl);
      const pathStartIndex = decodedUrl.indexOf("/o/") + 3; // Start after "/o/"
      const pathEndIndex = decodedUrl.indexOf("?alt="); // End before query parameters
      const storagePath = decodedUrl.substring(pathStartIndex, pathEndIndex);

      console.log("Extracted Storage Path:", storagePath);

      // Create Firebase storage reference using extracted path
      const resumeRef = ref(storage, storagePath);

      // Get fresh download URL
      const downloadUrl = await getDownloadURL(resumeRef);

      // Trigger file download
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = downloadUrl;
      link.setAttribute("download", getFileNameFromURL(userDetails?.resume));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  function getFileNameFromURL(url) {
    try {
      // Extract the part after "o/" and before "?alt="
      const match = url.match(/o\/(.*?)\?alt=/);

      if (match && match[1]) {
        // Decode the URL-encoded file path to get the actual file name
        const filePath = decodeURIComponent(match[1]);

        // Get the last part after the last "/"
        return filePath.split("/").pop();
      }

      return null; // Return null if no match is found
    } catch (error) {
      console.error("Error extracting file name:", error);
      return null;
    }
  }

  return (
    <div className="w-full flex mx-auto justify-center items-center bg-background md-max:flex-col gap-2 md:gap-16 lg:flex-row md:flex-col px-5">
      {/* Profile Image Section */}
      <div className="w-fit sm-max:p-5">
        <img
          src={imageUrl}
          alt="Profile"
          className="w-96 object-cover rounded-full "
        />
      </div>

      {/* Text Section */}
      <div className=" pb-0 text-foreground flex flex-col items-center justify-center text-2xl my-auto md-max:max-w-96 md:w-[400px] md-max:w-80 ">
        <section className="w-full md-max:flex md-max:flex-col md-max:items-center md-max:justify-center md:text-center lg:text-start">
          <div className="flex md:justify-center lg:justify-normal">
            <span>Hello</span>
            <img
              src={wave_hand}
              className="object-contain w-8 h-8 -rotate-[15deg] mx-1"
              alt="wave hand"
            />
            {userDetails?.features ? "our organization name is" : "my name is"}
          </div>

          <strong className="sm-max:text-center md:text-5xl text-green-500 font-bold md-max:text-5xl lg:text-6xl xl:text-7xl">
            {`${userDetails.name} ${userDetails.surname}`}
          </strong>
          <h2 className="text-2xl">
            {userDetails?.features ? "We provide " : "I am "}
            <span className="text-blue-600">{displayedText}</span>
          </h2>
          <p className="text-sm mt-1 sm-max:text-center">{userDetails.bio}</p>

          <div className="flex items-center mt-1 md:justify-center lg:justify-normal">
            <img
              src={Address}
              alt="address"
              className="w-6 h-6 object-contain -ml-1 "
            />
            <Label>{userDetails.address} </Label>
          </div>

          {/* Social Links Section */}
          <div className="flex gap-1 space-x-4 mt-3 ml-1 md:justify-center lg:justify-normal">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${userDetails.phoneNo.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <img
                src={whatsApp}
                alt="WhatsApp"
                className="w-8 h-8 object-contain "
              />
            </a>

            {/* Gmail */}
            <a
              href={`mailto:${userDetails.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <img src={gmail} alt="Gmail" className="w-8 h-8 object-contain" />
            </a>

            {/* Social Links */}
            {Object.entries(userDetails.socialLink[0]).map(([key, value]) => {
              if (!value) return null;

              const href = `https://${value}`;
              const icon =
                key === "instagram"
                  ? instagram
                  : key === "gitHub"
                  ? github
                  : key === "linkedIn"
                  ? linkedin
                  : null;

              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <img
                    src={icon}
                    alt={key}
                    className="w-8 h-8 object-contain "
                  />
                </a>
              );
            })}
          </div>
          {/* Download Resume Button */}
          <div className="w-fit text-lg mt-2 px-3 py-1 gap-2 rounded-sm bg-button hover:bg-button-hover text-button-textColor tracking-wide flex items-center ">
            {userDetails?.features ? <h1>Brochure</h1> : <h1>Download CV</h1>}
            <DownloadIcon
              size={22}
              onClick={downloadResume}
              title="Download Resume"
            />
            {/* Adjust size here */}
          </div>
        </section>
      </div>
    </div>
  );
}
