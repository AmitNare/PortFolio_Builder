import { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { db } from "./../../firebase"; // Import Firebase config
import AddProjects from "./AddProjects";
import { AspectRatio } from "./ui/aspect-ratio";
import useUserAuth from "./UserAuthentication";
import { Button } from "./ui/button";
import DataLoader from "./DataLoader";
import Swal from "sweetalert2"; // Import SweetAlert2
import { PlusCircleIcon, TrashIcon } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";

export default function UserProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useUserAuth();

  // Function to fetch projects from Firebase
  // const [projects, setProjects] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const projectsRef = ref(db, `Users/${user.uid}/projects`);

    try {
      const snapshot = await get(projectsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const projectsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }

      // await new Promise((resolve) => setTimeout(resolve, 1000)); // 2 seconds delay
    } catch (error) {
      setError(error.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const projectDelete = async (projectId) => {
     const result = await Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this project?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        });
      
        if (!result.isConfirmed) return;

    setDeleting(true);
    try {
      const projectRef = ref(db, `Users/${user.uid}/projects/${projectId}`);
      await remove(projectRef);
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
      // alert("Project deleted successfully!");
      Swal.fire({
              icon: "success",
              title: "Project Deleted",
              text: "The Project has been deleted successfully.",
              confirmButtonText: "Okay",
            });
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete the project. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user.uid]);

  if (loading) {
    return <DataLoader />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Dialog>
      <div data-aos="fade-left" className="w-full h-full md-max:h-svh p-2 bg-background text-foreground rounded-lg">
        <span className="flex justify-between px-5 items-center">
          <h1 className="text-2xl font-bold ">All Projects</h1>
          <DialogTrigger asChild>
            <button
              title="Add project"
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <PlusCircleIcon className="w-6 h-6 text-gray-500" />
            </button>
          </DialogTrigger>
        </span>

        <DialogContent className="border bg-background text-foreground sm:min-w-[600px] sm-max:min-w-full">
          <AddProjects fetchProjects={fetchProjects} />
        </DialogContent>
        {/* </li> */}
        <ul className=" flex flex-wrap gap-5 mt-5 justify-evenly">
          {/* AddProjects as a card */}

          {/* show projects */}
          {projects.map((project) => (
            <li
              key={project.id}
              className="border relative p-2 gap-2 rounded-sm shadow w-full min-w-[300px] sm:w-1/2 lg:w-1/4  flex flex-col"
            >
              {project.projectImage && (
                <span className="mt-1">
                <AspectRatio ratio={16 / 9} className="bg-muted ">
                  <img
                    src={project.projectImage}
                    alt={project.projectName}
                    loading="lazy"
                    className="h-full w-full rounded-md object-cover "
                    />
                </AspectRatio>
                    </span>
              )}
              <h2 className="text-xl font-semibold">{project.projectName}</h2>
              <p className="  text-sm h-48 custom-scrollbar overflow-auto">{project.projectDescription}</p>
              {/* <h2 className="text-xl font-semibold">{project.languages}</h2> */}
              <a
                href={project.projectUrl}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Project URL
              </a>

              <span className="flex justify-between mt-2">
                {/* <Button className=" w-2/5 ">Edit</Button> */}
                <TrashIcon
                      className="absolute bg-background text-red-500 cursor-pointer right-2 -top-4"
                      onClick={() => projectDelete(project.id)}
              />
              </span>
            </li>
          ))}
        </ul>
        {/* )} */}
      </div>
    </Dialog>
  );
}