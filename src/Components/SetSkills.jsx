import React, { useEffect, useState } from "react";

export default function SetSkills({ userDetails }) {
  const [skillIcons, setSkillIcons] = useState({});

  useEffect(() => {
    const fetchIcons = async () => {
      const iconsMap = {};

      for (const skill of userDetails.skills || []) {
        try {
          const res = await fetch(`https://api.iconify.design/search?query=${skill}`);
          const data = await res.json();

          if (data.icons && data.icons.length > 0) {
            iconsMap[skill] = data.icons.find((icon) => icon.includes("logos:")) || data.icons[0];
          } else {
            iconsMap[skill] = null;
          }
        } catch (err) {
          console.error(`Error fetching icon for ${skill}:`, err);
          iconsMap[skill] = null;
        }
      }

      setSkillIcons(iconsMap);
    };

    fetchIcons();
  }, [userDetails.skills]);

  return (
    <div className="w-full md:w-3/4 flex flex-wrap justify-center items-center text-foreground bg-background p-4 mt-10">

      {/* <h2 className="text-xl font-semibold mb-2">Skills:</h2> */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {(userDetails.skills || []).map((skill, index) => {
          const icon = skillIcons[skill];
          return (
            <div
              key={index}
              className=" w-28 h-24 rounded-lg shadow-md flex items-end justify-center text-white font-semibold text-lg overflow-hidden"
              style={{
                backgroundColor: "#1f2937",
                backgroundImage: icon
                  ? `url(https://api.iconify.design/${icon}.svg)`
                  : "none",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "60%",
              }}
            >
              <span className="bg-black/40 text-white px-2 py-1 rounded">{skill}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
