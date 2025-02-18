import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function SetExperience({ userDetails }) {
  return (
    <div className="text-foregound bg-background">
      <div className="w-full border-2 border-green-500 p-5 relative">
        <div className="absolute -top-4 left-4 bg-background px-2">
          <h1 className="text-lg font-bold">Professional Info</h1>
        </div>

        <div className="flex flex-wrap gap-5 w-full border-2">
          {userDetails?.experience?.map((exp, index) => (
            <div
              key={index}
              className="w-2/5 flex flex-col gap-2 border-2 border-gray-300 p-3 rounded-md bg-background shadow-md"
            >
              {/* Company Name and Address */}
                <div className="flex justify-between">
                  
              <div className="flex flex-col gap-1">
                <Label className="border-2 text-foreground bg-background p-2">
                  {exp.companyName || "N/A"}
                </Label>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {/* <Label className="text-sm font-medium text-foreground">
                  Company Address
                  </Label> */}
                <Label className="border-2 text-foreground bg-background p-2">
                  {exp.companyAddress || "N/A"}
                </Label>
                  </div>
              </div>

              {/* Job Role and Years of Experience */}
              <div className="flex flex-col gap-1 w-fit">
                {/* <Label className="text-sm font-medium text-foreground">
                  Job Role
                </Label> */}
                <Label className="border-2 text-foreground bg-background p-2 ">
                <span>{exp.jobRole || "N/A"}</span>
                <span className="ml-5">{`${exp.jobExperience || "0"} years`}</span> </Label>
              </div>
              {/* <div className="flex flex-col gap-1 ">
                <Label className="text-sm font-medium text-foreground">
                  Years of Experience
                </Label>
                <Label className="border-2 text-foreground bg-background p-2">
                  {`${exp.jobExperience || "0"} years`}
                </Label>
              </div> */}

              {/* Job Description */}
              <div className="col-span-2 flex flex-col gap-1">
                {/* <Label className="text-sm font-medium text-foreground">
                  Job Description
                </Label> */}
                <Textarea className="border-2 text-foreground bg-background p-2 w-full resize-none">
                  {exp.jobDescription || "N/A"}
                </Textarea>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
