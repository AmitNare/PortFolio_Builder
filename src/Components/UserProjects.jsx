import { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { db } from "./../../firebase"; // Import Firebase config
import AddProjects from "./AddProjects";
import { AspectRatio } from "./ui/aspect-ratio";
import useUserAuth from "./UserAuthentication";
import { Button } from "./ui/button";
import DataLoader from "./DataLoader";

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
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const projectRef = ref(db, `Users/${user.uid}/projects/${projectId}`);
      await remove(projectRef);
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
      alert("Project deleted successfully!");
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
    return <DataLoader/>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="w-full p-2 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">All Projects</h1>

      {/* Pass the fetchProjects function as a prop to AddProjects */}
      {/* <AddProjects fetchProjects={fetchProjects} /> */}

      {/* {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : ( */}
      <ul className="border-4 flex flex-wrap gap-4 p-4 justify-evenly">
        {/* AddProjects as a card */}
        <li className=" border-[var(--border)]  rounded-sm shadow w-full sm:w-1/2 lg:w-1/4 flex flex-col justify-center items-center">
          <AddProjects fetchProjects={fetchProjects} />
        </li>

        {/* show projects */}
        {projects.map((project) => (
          <li
            key={project.id}
            className="border-2 border-[var(--border)] p-4 rounded-sm shadow w-full sm:w-1/2 lg:w-1/4 flex flex-col"
          >
            {project.projectImage && (
              <AspectRatio ratio={16 / 9} className="bg-muted">
                <img
                  src={project.projectImage}
                  alt={project.projectName}
                  fill
                  className="h-full w-full rounded-md object-cover border-4"
                />
              </AspectRatio>
            )}
            <h2 className="text-xl font-semibold">{project.projectName}</h2>
            <p className="mb-2 text-sm">{project.projectDescription}</p>
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
              <Button className=" w-2/5 ">Edit</Button>
              <Button
                className=" w-2/5"
                variant="destructive"
                onClick={() => projectDelete(project.id)}
              >
                Delete
              </Button>
            </span>
          </li>
        ))}
      </ul>
      {/* )} */}
    </div>
  );
}

/**
project:
    name,
    description,
    image,
    url

function:
    edit,
    share,
    delete
*/
