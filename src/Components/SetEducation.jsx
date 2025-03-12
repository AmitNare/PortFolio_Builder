import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function SetEducation({ userDetails }) {
  return (
    <div className="w-full p-6  bg-background text-foreground">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold ">
          Educational Information
        </h1>
      </div>

      {/* Responsive Grid Layout for Colleges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-8">
        {userDetails?.colleges?.map((college, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center gap-4 border border-gray-200 rounded-lg p-5  shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            {/* College Name */}
            <div className="w-full flex items-center justify-center">
              <Label className="text-2xl font-semibold ">
                {college.collegeName || "N/A"}
              </Label>
            </div>

            {/* Course */}
            <div  className="w-full flex items-center justify-center">
              <Label className="text-lg text-gray-400">
                Course: {college.course || "N/A"}
              </Label>
            </div>

            {/* Grade */}
            <div  className="w-full flex items-center justify-center">
              <Label className="text-lg text-gray-400">
                Grade:{" "}
                {`${college.grade || "N/A"} ${college.gradeType || ""}`.trim()}
              </Label>
            </div>

            {/* Description Textarea */}
            <div
              //  className="w-full flex items-center justify-center"
              className="resize-none w-full flex justify-center h-20 overflow-auto border border-gray-300 rounded-lg text-gray-500"
            >
              {college.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
