import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { storage, db } from "./../../firebase"; // Import the initialized storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push, onValue } from "firebase/database";
import useUserAuth from "./UserAuthentication";
import add_Icon from "../assets/add.png";

export default function AddProjects({ fetchProjects }) {
  const { user } = useUserAuth();

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [projects, setProjects] = useState([]); // State to store projects
  const [formData, setFormData] = useState({
    // uid: user.uid,
    projectName: "",
    projectDescription: "",
    projectUrl: "",
    githubRepoUrl: "",
    languages: [],
    projectImage: "",
  });

  // Fetch projects from Firebase in real-time
  useEffect(() => {
    const projectsRef = dbRef(db, `Users/${user.uid}/projects`);

    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      const projectsArray = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      setProjects(projectsArray);
    });

    // Cleanup function to detach the real-time listener
    return () => unsubscribe();
  }, [user.uid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, projectImage: e.target.files[0] });
  };

  const languages = [
    "C",
    "Java",
    "Python",
    "JavaScript",
    "ReactJs",
    "NodeJs",
    "Sql",
    "MongoDB",
    "HTML",
    "CSS",
    "TailwindCSS",
  ];

  const handleButtonClick = (language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(
        selectedLanguages.filter((lang) => lang !== language)
      );
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
    setFormData({ ...formData, languages: selectedLanguages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if an image has been selected
    if (!formData.projectImage) {
      alert("Please select an image to upload.");
      return;
    }

    // Step 1: Create a reference to Firebase Storage
    const imageRef = ref(storage, `projects/${formData.projectImage.name}`);

    try {
      // Step 2: Upload the image to Firebase Storage
      await uploadBytes(imageRef, formData.projectImage);

      // Step 3: Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(imageRef);

      // Step 4: Now save the project data with the image URL
      const projectData = {
        projectName: formData.projectName,
        projectDescription: formData.projectDescription,
        projectUrl: formData.projectUrl,
        githubRepoUrl: formData.githubRepoUrl,
        languages: selectedLanguages,
        projectImage: downloadURL, // Store the image URL here
      };

      // Step 5: Push the project under the specific user in Firebase Realtime Database
      const userProjectsRef = dbRef(db, `Users/${user.uid}/projects`);
      await push(userProjectsRef, projectData); // Add project to the user's projects array

      alert("Project successfully added!");
      setFormData({
        projectName: "",
        projectDescription: "",
        projectUrl: "",
        githubRepoUrl: "",
        languages: [],
        projectImage: "",
      });
      setSelectedLanguages([]);

      // Refresh the list of projects
      fetchProjects();
    } catch (error) {
      console.error("Error uploading image or saving project: ", error);
      alert("Failed to upload image or save project.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={add_Icon}
          alt=""
          className=" text-foreground w-auto h-auto cursor-pointer"
        />
        {/* <Button variant="outline" className="text-foreground w-full h-full">Add Project</Button> */}
      </DialogTrigger>

      <DialogContent className="sm:max-w-fit bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground text-3xl font-medium">
            Create Project
          </DialogTitle>
          <DialogDescription>
            Deploy your new project in one-click.
          </DialogDescription>
        </DialogHeader>

        {/* <Projects fetchProjects={fetchProjects} /> */}
        <div>
          <form
            onSubmit={handleSubmit}
            method="POST"
            className="bg-background w-auto"
          >
            <div className="text-foreground bg-background border-2 rounded-md flex flex-col justify-center m-auto max-w-lg p-4 gap-2">
              <div className="grid w-full max-w-lg items-center gap-1.5">
                <label htmlFor="projectName">Name</label>
                <Input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <label htmlFor="projectDescription">Description</label>
                <Textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  required
                  className="max-h-16 min-h-16"
                />
              </div>

              <div className="grid w-full max-w-lg items-center gap-1.5">
                <label htmlFor="projectUrl">Hosting URL</label>
                <Input
                  type="text"
                  name="projectUrl"
                  value={formData.projectUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* <div className="grid w-full max-w-lg items-center gap-1.5">
                <label htmlFor="githubRepoUrl">GitHub Repo URL</label>
                <Input
                  type="text"
                  name="githubRepoUrl"
                  value={formData.githubRepoUrl}
                  onChange={handleInputChange}
                  required
                />
              </div> */}

              <div className="grid w-full max-w-lg items-center gap-1.5">
                <label htmlFor="languages">Programming Languages</label>
                <span className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleButtonClick(language)}
                      className={`px-4 py-2 rounded w-fit ${
                        selectedLanguages.includes(language)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </span>
              </div>

              <div className="grid w-full max-w-lg items-center gap-1.5">
                <label htmlFor="projectImage">Website Image</label>
                <Input
                  id="projectImage"
                  type="file"
                  name="projectImage"
                  onChange={handleFileChange}
                />
              </div>

              <Button type="submit" className="mt-5">
                Submit
              </Button>
            </div>
          </form>
        </div>

        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
