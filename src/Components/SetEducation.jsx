import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function SetEducation({ userDetails }) {
  return (
    <div className="w-full p-6 bg-background text-foreground sm-max:p-2">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold ">Educational Information</h1>
      </div>

      {/* Responsive Grid Layout for Colleges */}
      <div className="flex flex-wrap gap-5 w-full justify-evenly items-center">
        {userDetails?.colleges?.map((college, index) => (
          <div
            key={index}
            className="w-full sm:w-96 flex flex-col items-center justify-center gap-4 border rounded-lg  shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <div class="min-w-56 shadow-[0px_0px_15px_rgba(0,0,0,0.09)] rounded-lg p-5 space-y-3 relative overflow-hidden">
              <div class="w-24 h-24 bg-violet-500 rounded-full absolute -right-5 -top-7">
                <p
                  class={`w-12 absolute bottom-4 tracking-wide left-5 text-center text-wrap text-white text-sm ${
                    college.gradeType === "%" ? "mb-3" : ""
                  }`}
                >
                  {`${college.grade || "N/A"} ${
                    college.gradeType || ""
                  }`.trim()}
                </p>
              </div>
              <div class="fill-violet-500 w-full">
                <div className="w-full flex items-center justify-center">
                  <Label className="text-2xl font-semibold tracking-wide">
                    {college.collegeName || "N/A"}
                  </Label>
                </div>
                {/* Course */}
                <div className="w-full flex items-center justify-center">
                  <Label className="text-lg text-gray-400 tracking-wide">
                    Course: {college.course || "N/A"}
                  </Label>
                </div>
                {/* Description Textarea */}
                <div
                  //  className="w-full flex items-center justify-center"
                  className="resize-none tracking-wide w-full mt-2 flex justify-center h-32 p-2 custom-scrollbar overflow-auto text-sm border border-gray-300 rounded-sm text-gray-500"
                >
                  {college.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
