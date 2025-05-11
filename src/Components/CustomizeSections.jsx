import { useState, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { getDatabase, ref, set, get, child } from "firebase/database";
import useUserAuth from "./UserAuthentication";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet";

const type = "SECTION";

const SectionItem = ({ section, index, moveSection, toggleVisibility }) => {
  const [, dragRef] = useDrag({
    type,
    item: { index },
    canDrag: !section.fixed,
  });

  const [, dropRef] = useDrop({
    accept: type,
    hover: (item) => {
      if (item.index !== index && !section.fixed) {
        moveSection(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      className={`bg-white dark:bg-gray-800 p-3 border rounded flex justify-between items-center shadow-sm ${
        section.fixed ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {!section.fixed ? (
          <GripVertical className="cursor-move text-gray-400" />
        ) : (
          <span className="w-4" />
        )}
        <span>{section.label}</span>
      </div>
      {!section.alwaysVisible && (
        <button
          onClick={() => toggleVisibility(section.key)}
          className="text-gray-500 hover:text-gray-700"
        >
          {section.enabled ? <Eye /> : <EyeOff />}
        </button>
      )}
    </div>
  );
};

const CustomizeSections = ({ onSave = () => {} }) => {
  const [sections, setSections] = useState([
    { key: "SetHero", label: "Hero", enabled: true, fixed: true, alwaysVisible: true },
    { key: "SetSkills", label: "Skills", enabled: true },
    { key: "SetProjects", label: "Projects", enabled: true },
    { key: "SetFeatures", label: "Features", enabled: true },
    { key: "SetCertificates", label: "Certificates", enabled: true },
    { key: "SetEducation", label: "Education", enabled: true },
    { key: "SetExperience", label: "Experience", enabled: true },
  ]);

  const { user } = useUserAuth();

  // Load previously saved sections from Firebase
  useEffect(() => {
    if (user?.uid) {
      const db = getDatabase();
      const sectionsRef = ref(db);
      get(child(sectionsRef, `Users/${user.uid}/sections`)).then((snapshot) => {
        if (snapshot.exists()) {
          const savedSections = snapshot.val();

          // Ensure Hero is always on top and fixed
          const hero = { key: "SetHero", label: "Hero", enabled: true, fixed: true, alwaysVisible: true };
          const filtered = savedSections.filter((s) => s.key !== "SetHero");
          setSections([hero, ...filtered]);
        }
      });
    }
  }, [user]);

  const moveSection = useCallback((fromIndex, toIndex) => {
    setSections((prev) => {
      const hero = prev.find((s) => s.fixed);
      const movable = prev.filter((s) => !s.fixed);

      const moved = [...movable];
      const [dragged] = moved.splice(fromIndex - 1, 1); // -1 because Hero is always at index 0
      moved.splice(toIndex - 1, 0, dragged);

      return [hero, ...moved];
    });
  }, []);

  const toggleVisibility = (key) => {
    setSections((prev) =>
      prev.map((section) =>
        section.key === key && !section.alwaysVisible
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  };

  const handleSave = () => {
    if (user?.uid) {
      const db = getDatabase();
      const sectionsRef = ref(db, `Users/${user.uid}/sections`);
      set(sectionsRef, sections).then(() => {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Customization saved successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      });
    }

    onSave(sections);
  };

  return (
    <>
    <Helmet>
  <meta name="title" content="Customization | Portify" />
  <meta
    name="description"
    content="Customize your portfolio layout and components with Portify. Reorder sections, change colors, and personalize your design to match your style and preferences."
  />
  <meta
    name="keywords"
    content="Portify, portfolio customization, reorder sections, personal portfolio design, no-code customization, drag and drop portfolio builder, component customization, change layout, personalize portfolio, custom design"
  />

  <meta name="site.name" content="Portify" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="Customization | Portify - Personalize Your Portfolio Layout" />
  <meta
    property="og:description"
    content="Easily modify and arrange your portfolio sections the way you like. Customize visuals and structure to build a portfolio that truly represents you."
  />
  <meta
    property="og:image"
    content="https://yourdomain.com/assets/portify-customization-preview.png"
  />

  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="Customization | Portify - Personalize Your Portfolio Layout" />
  <meta
    property="twitter:description"
    content="Use Portify’s customization features to rearrange sections and tailor your portfolio’s look and feel to your personal or professional brand."
  />
  <meta
    property="twitter:image"
    content="https://yourdomain.com/assets/portify-customization-preview.png"
  />

  <title>Customization | Portify - Modify Layout, Reorder Components & Personalize Design</title>
</Helmet>

    <DndProvider backend={HTML5Backend}>
      <div data-aos="fade-left" className="lg:w-3/5 mx-auto flex flex-col p-5 space-y-4 text-center md-max:min-h-[calc(100svh-72px)]">
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
    </>

  );
};

export default CustomizeSections;
