import React from "react";
import { Label } from "./ui/label";

export default function SetCertificates({ userDetails }) {
  //   return (
  // <div>
  // Convert the projects object into an array of values with their unique keys
  const projectArray = Object.entries(userDetails.certificates).map(
    ([key, value]) => ({
      id: key,
      ...value,
    })
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {projectArray.map((project) => (
        <div key={project.id} className="border rounded-lg shadow-lg p-4">
          <img
            src={project.certificateImage}
            alt={project.certificateName}
            loading="lazy"
            className="w-full h-40 object-cover rounded-md mb-3"
          />
          <h3 className="text-xl font-bold mb-2">
            <span>{project.certificateName}</span>
            <span className="ml-3 text-gray-500 text-lg">{`( ${project.certificateType} )`}</span>
          </h3>

          <p className="text-gray-700 mb-3">{project.certificateDescription}</p>
          <div className="flex justify-between items-center">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View certificates
              </a>
            )}
            {project.githubRepoUrl && (
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                GitHub Repo
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
