import { FileX } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function SetSkills({ userDetails }) {
  const [skillIcons, setSkillIcons] = useState({});

  useEffect(() => {
    const fetchIcons = async () => {
      const iconsMap = {};

      for (const skill of userDetails.skills || []) {
        try {
          const res = await fetch(
            `https://api.iconify.design/search?query=${skill}`
          );
          const data = await res.json();

          if (data.icons && data.icons.length > 0) {
            iconsMap[skill] =
              data.icons.find((icon) => icon.includes("logos:")) ||
              data.icons[0];
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
    <div className="w-full md:w-3/5 flex flex-col flex-wrap justify-center items-center text-foreground bg-background p-4 mt-10">
      <h2 className="text-3xl font-semibold mb-6">Tech Stack</h2>
      <div className="flex flex-wrap items-center justify-center gap-5 ">
        {(userDetails.skills || []).map((skill, index) => {
          const icon = skillIcons[skill] || "mdi-file-restore";
          return (
            <div className="w-fit h-28 bg-white flex flex-col justify-center items-center rounded-md border">
              <div
                key={index}
                className=" w-24 h-24 rounded-t-lg  flex items-end justify-center text-white font-semibold text-lg overflow-hidden"
                style={{
                  // backgroundColor: "white",
                  backgroundImage: `url(https://api.iconify.design/${icon}.svg)`,

                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "60%",
                }}
              ></div>
              <span className="bg-black/40 text-white text-center px-2 py-1 rounded-b-md w-full">
                {skill}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
