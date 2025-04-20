import { FileX } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function SetSkills({ userDetails }) {
  const [skillIcons, setSkillIcons] = useState({});

  useEffect(() => {
    if (!userDetails.skills?.length) return;

    const fetchIcons = async () => {
      const iconsMap = {};

      for (const skill of userDetails.skills) {
        try {
          const res = await fetch(`https://api.iconify.design/search?query=${skill}`);
          const data = await res.json();

          iconsMap[skill] =
            data.icons?.find((icon) => icon.includes("logos:")) ||
            data.icons?.[0] ||
            null;
        } catch (err) {
          console.error(`Error fetching icon for ${skill}:`, err);
          iconsMap[skill] = null;
        }
      }

      setSkillIcons(iconsMap);
    };

    fetchIcons();
  }, [JSON.stringify(userDetails.skills)]); // ensures effect only runs on change

   // Don't render the section if no skills  exist
 if (!userDetails.skills ) {
  return null;
}

  return (
    <div className="w-full md:w-3/5 flex flex-col flex-wrap justify-center items-center text-foreground bg-background p-4 mt-10">
      <h2 className="text-3xl font-semibold mb-6">Tech Stack</h2>
      <div className="flex flex-wrap items-center justify-center gap-5">
        {(userDetails.skills || []).map((skill, index) => {
          const icon = skillIcons[skill];
          const fallbackIcon = "mdi:file-alert-outline";

          return (
            <div
              key={index}
              className="w-fit h-28 bg-white flex flex-col justify-center items-center rounded-md border"
            >
              <div
                className="w-24 h-24 rounded-t-lg flex items-end justify-center text-white font-semibold text-lg overflow-hidden"
                style={{
                  backgroundImage: `url(https://api.iconify.design/${
                    icon || fallbackIcon
                  }.svg)`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "60%",
                }}
              >
                {!icon && (
                  <span className="text-xs text-black/40 p-1">Loading...</span>
                )}
              </div>
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
