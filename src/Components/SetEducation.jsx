import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function SetEducation({ userDetails }) {
  return (
    <div className="w-full  border-green-500 p-5 relative">
      {/* Section Header */}
      <div className="absolute -top-4 left-4 bg-background px-2">
        <h1 className="text-lg font-bold">Educational Info</h1>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
        {userDetails?.colleges?.map((college, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-4 border p-4 rounded-lg bg-background shadow-lg"
          >
            {/* College Name */}
            <Label className="border-2 text-foreground bg-background px-3 py-2 text-lg font-medium text-center w-full">
              {college.collegeName || "N/A"}
            </Label>

            {/* Course */}
            <Label className="border-2 text-foreground bg-background px-3 py-2 text-lg text-center w-full">
              course : {college.course || "N/A"}
            </Label>

            {/* Grade and Grade Type */}
            <Label className="border-2 text-foreground bg-background px-3 py-2 text-center w-full">
              Grade : {`${college.grade || "N/A"} ${college.gradeType || ""}`.trim()}
            </Label>

            <Textarea></Textarea>
          </div>
        ))}
      </div>
    </div>
  );
}
