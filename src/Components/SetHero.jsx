import React, { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import whatsApp from "../assets/Images/whatsApp.png";
import instagram from "../assets/Images/instagram.png";
import gmail from "../assets/Images/gmail.png";
import github from "../assets/Images/github.png";
import linkedin from "../assets/Images/linkedin.png";
import Address from "../assets/Images/gps.png";
import wave_hand from "../assets/Images/wave-hand.gif";

import '../App.css';
import { Label } from "./ui/label";

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
      const userRef = ref(db, `Users/${userDetails.uid}`);
      const imageRef = ref(db, `portfolioId/${userDetails.uid}/image`);

      // Fetch user data for roles
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setRoles(userData.experience?.map((exp) => exp.jobRole) || []);
          } else {
            console.error("No user data found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });

      // Fetch image URL
      get(imageRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setImageUrl(snapshot.val()); // Assuming the imageRef stores the URL
          } else {
            console.error("No image data found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching image data:", error);
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

  return (
    <div className="lg:p-20 border-4 flex md:gap-1 bg-background justify-evenly items-center md-max:flex-col md-max:p-5 border-red-500 md:p-10">
      {/* Profile Image Section */}
      <div className="border-4 border-red-500 lg-max:min-w-2/4 lg-max:min-h-[350px] xl:w-fit">
        <img
          src={imageUrl}
          alt="Profile"
          className="border-4 border-green-400 lg:w-[450px] lg-max:max-w-[350px] lg:h-[400px] lg-max:min-h-[340px] object-cover md-max:w-full md-max:mx-auto rounded-[50%] "
        />
      </div>

      {/* Text Section */}
      <div className="border-2 pb-20 text-foreground border-green-500 flex flex-col items-center text-2xl my-auto md-max:w-full md:w-2/4">
        <section className="w-full">
        <h3 clssName="flex items-center border-2">
  Hello 
  {/* <span 
  className="shake-emoji"
  > */}
    👋 
    <img 
      src={wave_hand} 
      // autoPlay 
      // loop 
      // muted 
      className="object-contain border-2 w-8 h-8 -rotate-[15deg] "
    />
  {/* </span>,  */}
  my name is
</h3>

          <strong className="md:text-5xl text-green-500 font-bold md-max:text-5xl lg:text-6xl xl:text-7xl">
            {`${userDetails.name} ${userDetails.surname}`}
          </strong>
          <h2 className="text-2xl">
            I am a <span className="text-blue-600">{displayedText}</span>
          </h2>

          <div className="flex items-center mt-1">
            <img src={Address} alt="" className="w-6 h-6 object-contain border-2 -ml-1 " />
            <Label>{userDetails.address} </Label>
          </div>

          {/* Social Links Section */}
          <div className="flex space-x-4 mt-10 ml-1">
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
                className="w-8 h-8 object-contain"
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
                    className="w-8 h-8 object-contain border-2"
                  />
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
