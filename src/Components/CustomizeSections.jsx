import { useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical, Eye, EyeOff } from "lucide-react"; // You can use any icon library
import { getDatabase, ref, set } from "firebase/database"; // Firebase imports
import useUserAuth from "./UserAuthentication";
// import { useUserAuth } from "../Auth/UserAuthentication"; 

const type = "SECTION";

// Section item component
const SectionItem = ({ section, index, moveSection, toggleVisibility }) => {
  const [, ref] = useDrag({
    type,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: type,
    hover: (item) => {
      if (item.index !== index) {
        moveSection(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="bg-white dark:bg-gray-800 p-3 border rounded flex justify-between items-center shadow-sm"
    >
      <div className="flex items-center gap-3">
        <GripVertical className="cursor-move text-gray-400" />
        <span>{section.label}</span>
      </div>
      <button
        onClick={() => toggleVisibility(section.key)}
        className="text-gray-500 hover:text-gray-700"
      >
        {section.enabled ? <Eye /> : <EyeOff />}
      </button>
    </div>
  );
};

// Main component
const CustomizeSections =  ({ onSave = () => {} }) => {
  const [sections, setSections] = useState([
    { key: "SetHero", label: "Hero", enabled: true },
    { key: "SetSkills", label: "Skills", enabled: true },
    { key: "SetProjects", label: "Projects", enabled: true },
    { key: "SetFeatures", label: "Features", enabled: true },
    { key: "SetCertificates", label: "Certificates", enabled: true },
    { key: "SetEducation", label: "Education", enabled: true },
    { key: "SetExperience", label: "Experience", enabled: true },
  ]);
  
  const { user } = useUserAuth(); // User authentication context

  const moveSection = useCallback((fromIndex, toIndex) => {
    setSections((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const toggleVisibility = (key) => {
    setSections((prev) =>
      prev.map((section) =>
        section.key === key ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const handleSave = () => {
    // Save the sections layout in Firebase
    if (user?.uid) {
      const db = getDatabase();
      const sectionsRef = ref(db, `Users/${user.uid}/sections`);
      set(sectionsRef, sections);
    }

    // Trigger the callback if needed
    onSave(sections);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">Customize Portfolio Sections</h2>
        {sections.map((section, index) => (
          <SectionItem
            key={section.key}
            index={index}
            section={section}
            moveSection={moveSection}
            toggleVisibility={toggleVisibility}
          />
        ))}
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Save Order
        </button>
      </div>
    </DndProvider>
  );
};

export default CustomizeSections;
