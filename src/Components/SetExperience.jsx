import React from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function SetExperience({ userDetails }) {
  return (
    <div className="text-foregound bg-background ">
      <div className="w-full p-5 relative sm-max:p-2">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold ">Professional Information</h1>
        </div>

        <div className="flex flex-wrap gap-5 w-full justify-evenly items-center ">
          {userDetails?.experience?.map((exp, index) => (
            <div
              key={index}
              className="w-96 flex border flex-col gap-2 rounded-md bg-background shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-shadow duration-300"
            >
              <div class=" min-w-full group relative cursor-pointer overflow-hidden rounded-md shadow-xl ring-1 ring-gray-900/5 transition-all duration-300  hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg ">
                <span class="absolute top-[14px] z-0 h-10 w-40 rounded-r-md bg-violet-500 transition-all duration-300 group-hover:scale-[20]"></span>
                <div class=" relative z-10 mx-auto max-w-md ">
                  <span className=" grid mt-3 h-10 w-40 place-items-center justify-center rounded-r-md bg-violet-500 text-button-textColor transition-all duration-300 group-hover:bg-violet-400">
                    <h1 className=" text-balance tracking-wide ">
                      {exp.jobRole || "N/A"}
                    </h1>
                  </span>
                  {/* <div className="flex justify-between"> */}
                  <div className="absolute top-[8px] right-0">
                    <Label className="text-sm px-2 text-gray-500 group-hover:text-white dark:text-white dark:group-hover:text-foreground tracking-wide">
                      {exp.companyAddress || "N/A"}
                    </Label>
                  </div>
                </div>
                <div className="text-forground group relative cursor-pointer overflow-hidden transition-all duration-300 ">
                  <div className="flex flex-col gap-1">
                    <Label className="mt-1 p-2 text-md text-gray-500 group-hover:text-white dark:text-white dark:group-hover:text-foreground tracking-wide">
                      {exp.companyName || "N/A"}
                    </Label>
                  </div>
                  <div className="flex flex-col gap-1 w-fit">
                    <Label className="px-2 text-gray-500 group-hover:text-white dark:text-white dark:group-hover:text-foreground tracking-wide">
                      <span>Duration:</span>
                      <span className="ml-1">{`${
                        exp.jobExperience || "0"
                      } years`}</span>{" "}
                    </Label>
                  </div>
                  <div class="space-y-6 mt-1 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90">
                    <div className="col-span-2 flex flex-col gap-1 p-1 pb-2">
                      <Textarea className="bg-transparent w-full h-32 resize-none group-hover:border-violet-600 custom-scrollbar overflow-auto text-gray-500 group-hover:text-white dark:text-white dark:group-hover:text-foreground tracking-wide">
                        {exp.jobDescription || "N/A"}
                      </Textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
