import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { storage, db } from "./../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push, onValue, update } from "firebase/database";
import useUserAuth from "./UserAuthentication";
import add_Icon from "../assets/add.png";
import { TrashIcon, TvMinimal } from "lucide-react";
import {
  FileInput,
  ImageIcon,
  TypeIcon,
  LinkIcon,
  ClipboardIcon,
  CodeIcon,
  GlobeIcon,
} from "lucide-react";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function AddProjects({ fetchProjects }) {
  const { user } = useUserAuth();

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    projectUrl: "",
    languages: [],
    projectImage: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, projectImage: e.target.files[0] });
  };

  // Predefined languages list
  const predefinedLanguages = [
    "C",
    "C++",
    "Java",
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "MongoDB",
    "HTML",
    "CSS",
    "TailwindCSS",
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLanguages, setFilteredLanguages] = useState([]);

  // Filter languages dynamically as user types
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLanguages([]);
    } else {
      setFilteredLanguages(
        predefinedLanguages.filter((lang) =>
          lang.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm]);

  // Function to add a language
  const addLanguage = (language) => {
    const formattedLang = language.trim();
    if (!formattedLang) return;

    if (!selectedLanguages.includes(formattedLang)) {
      const updatedLanguages = [...selectedLanguages, formattedLang].sort(); // Sort alphabetically
      setSelectedLanguages(updatedLanguages);
      setFormData({ ...formData, languages: updatedLanguages });
    }

    setSearchTerm("");
    setFilteredLanguages([]);
  };

  // Handle Enter key press in input
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      addLanguage(searchTerm.trim());
      e.preventDefault();
    }
  };

  const removeLanguage = (index) => {
    const updatedLanguages = selectedLanguages.filter((_, i) => i !== index);
    setSelectedLanguages(updatedLanguages);
    setFormData({ ...formData, languages: updatedLanguages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectImage) {
      alert("Please select an image to upload.");
      return;
    }

    const imageRef = ref(storage, `projects/${formData.projectImage.name}`);

    try {
      await uploadBytes(imageRef, formData.projectImage);
      const downloadURL = await getDownloadURL(imageRef);

      const projectData = {
        projectName: formData.projectName,
        projectDescription: formData.projectDescription,
        projectUrl: formData.projectUrl,

        languages: selectedLanguages,
        projectImage: downloadURL,
      };

      const userProjectsRef = dbRef(db, `Users/${user.uid}/projects`);
      await push(userProjectsRef, projectData);

      Swal.fire({
              icon: "success",
              title: "New Project Added",
              text: "The Project has been added successfully.",
              confirmButtonText: "Okay",
            });

      setFormData({
        projectName: "",
        projectDescription: "",
        projectUrl: "",

        languages: [],
        projectImage: "",
      });
      setSelectedLanguages([]);

      fetchProjects();
    } catch (error) {
      console.error("Error uploading image or saving project: ", error);
      alert("Failed to upload image or save project.");
    }
  };

  return (
    <Dialog>
      
      <div>
        <DialogHeader>
          <DialogTitle>Project</DialogTitle>
          <DialogDescription>
            Deploy your new project in one-click.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="flex flex-col gap-4">
            {/* Project Name */}
            <div className="flex items-center  bg-background text-foreground">
              <TvMinimal className="w-5 h-5 mr-2 text-gray-500" />
              <Input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                required
                placeholder="Project Name"
                className="w-full bg-background"
              />
            </div>

            {/* Project Description */}
            <div className="flex items-start  bg-background text-foreground">
              <ClipboardIcon className="w-5 h-5 mr-2 text-gray-500 mt-1" />
              <Textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleInputChange}
                required
                placeholder="Project Description"
                className="w-full bg-background"
              />
            </div>

            {/* Programming Languages */}
            <div className="flex items-center  bg-background text-foreground">
              <CodeIcon className="w-5 h-5 mr-2 text-gray-500" />
              <Input
                type="text"
                placeholder="Search or add a language"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-background"
              />
            </div>

            {filteredLanguages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filteredLanguages.map((lang, i) => (
                  <button
                    key={i}
                    onClick={() => addLanguage(lang)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map((lang, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center gap-2"
                >
                  {lang}
                  <TrashIcon
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => removeLanguage(index)}
                  />
                </div>
              ))}
            </div>

            {/* Project Image Upload */}
            <div className="flex items-center  bg-background text-foreground">
              <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
              <Input
                id="projectImage"
                type="file"
                name="projectImage"
                onChange={handleFileChange}
                className="w-full bg-background px-2"
              />
            </div>

            {/* Hosting URL */}
            <div className="flex items-center  bg-background text-foreground">
              <GlobeIcon className="w-5 h-5 mr-2 text-gray-500" />
              <Input
                type="text"
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleInputChange}
                placeholder="Hosting URL"
                className="w-full bg-background"
              />
            </div>

            <Button
              type="submit"
              className="mt-5 bg-button hover:bg-button-hover text-button-textColor"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
