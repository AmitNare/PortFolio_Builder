import React, { useState } from "react";
import CardTemplete from "./CardTemplete"; // Ensure CardTemplete is correctly imported
import { Button } from "./ui/button";

import { PlusCircleIcon, TrashIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import LocationSearch from "./LocationSearch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import FileUpload from "./FileUpload";
import { BsGenderFemale,BsGenderMale, BsGenderAmbiguous  } from "react-icons/bs";

export const PersonalInfo = ({
  image,
  isDragOver,
  handleDrop,
  handleDragLeave,
  handleDragEnter,
  handleFileChange,
  handleDragOver,
  handleRemoveImage,
  imageName,
  handleInputChange,
  formData,
  errors,
  handlePdfChange,
  handleUpload,
  isLoading,
  setFormData,
  setErrors,
}) => (
  <div className="flex flex-col items-center p-0 w-full bg-background text-foreground">
    {/* <h3>Personal Information</h3> */}
    <div className="w-full px-4 py-4 bg-background text-foreground flex flex-col justify-between items rounded-md border border-green-500 gap-4 lg-max:w-full">
      <div className="flex justify-between sm-max:flex-col md:flex-col gap-1 lg:flex-row md:gap-2 lg:gap-10 relative">
        <span className="flex flex-col md:w-full lg:w-2/4">
          <Label className="text-lg">Name</Label>
          <Input
            type="text"
            placeholder="eg. John"
            className="text-lg p-2 border h-10 rounded-md"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => handleInputChange(e)}
          />
          {errors.name && (
            <span
              className="absolute text-red-500 text-xs "
              style={{ "margin-top": "68px" }}
            >
              {errors.name}
            </span>
          )}
        </span>
        <span className="flex flex-col relative md:w-full lg:w-2/4">
          <Label className="text-lg">Surname</Label>
          <Input
            type="text"
            placeholder="eg. Doe"
            className="text-lg p-2 border h-10 rounded-md"
            name="surname"
            autoComplete="surname"
            value={formData.surname}
            onChange={(e) => handleInputChange(e)}
          />
          {errors.surname && (
            <span
              className="absolute text-red-500 text-xs"
              style={{ "margin-top": "68px" }}
            >
              {errors.surname}
            </span>
          )}
        </span>
      </div>

      <div className="flex justify-between relative gap-1 sm-max:flex-col md:flex-col lg:flex-row md:gap-2 lg:gap-10">
        <span className="flex flex-col relative md:w-full lg:w-2/4">
          <Label className="text-lg">Email</Label>
          <Input
            type="text"
            placeholder="eg. username@gmail.com"
            className="text-lg p-2 border h-10 rounded-md"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleInputChange(e)}
          />
          {errors.email && (
            <span
              className="absolute text-red-500 text-xs "
              style={{ "margin-top": "68px" }}
            >
              {errors.email}
            </span>
          )}
        </span>
        <span className="flex flex-col relative md:w-full lg:w-2/4 ">
          <Label className="text-lg">PhoneNo</Label>
          <Input
            type="text"
            placeholder="eg. +91 1234567890"
            className="text-lg p-2 border h-10 rounded-md bg-background text-foreground"
            name="phoneNo"
            autoComplete="phoneNo"
            value={formData.phoneNo}
            onChange={(e) => handleInputChange(e)}
            onBlur={(e) => validateField("phoneNo", e.target.value)} // Validate on blur
          />
          {errors.phoneNo && (
            <span
              className="absolute text-red-500 text-xs "
              style={{ "margin-top": "68px" }}
            >
              {errors.phoneNo}
            </span>
          )}
        </span>
      </div>

      <div className="flex justify-between w-full gap-1 sm-max:flex-col md:flex-col lg:flex-row md:gap-2 lg:gap-10">
        <span className="flex flex-col relative w-2/4 sm-max:w-full md:w-full lg:w-2/4 ">
          <Label className="text-lg">Gender</Label>
          <div className="flex gap-4 lg:flex ">
            <div className="w-full ">
              <Input
                className="peer sr-only w-full"
                value="male"
                name="gender"
                id="male"
                type="radio"
                checked={formData.gender === "male"}
                onChange={(e) => handleInputChange(e)}
              />
              <div className="relative bg-background text-foreground border flex h-10 cursor-pointer flex-col items-center justify-end rounded-xl  border-gray-300 bg-gray-50 md:p-0 lg:p-1 transition-transform duration-150 hover:border-blue-400 active:scale-95 peer-checked:border-blue-500 peer-checked:shadow-md peer-checked:shadow-blue-400">
                <Label
                  className=" flex flex-col text-balance cursor-pointer items-center justify-center text-xs uppercase text-gray-500 peer-checked:text-blue-500"
                  htmlFor="male"
                >
                  <BsGenderMale  size={15} />
                  male
                </Label>
              </div>
            </div>

            <div className="w-full">
              <Input
                className="peer sr-only"
                value="female"
                name="gender"
                id="female"
                type="radio"
                checked={formData.gender === "female"}
                onChange={(e) => handleInputChange(e)}
              />
              <div className="relative flex border h-10 cursor-pointer flex-col items-center justify-end rounded-xl  border-gray-300 bg-gray-50 md:p-0 lg:p-1 transition-transform duration-150 hover:border-blue-400 active:scale-95 peer-checked:border-blue-500 peer-checked:shadow-md peer-checked:shadow-blue-400">
                <Label
                  className="flex flex-col  whitespace-nowrap cursor-pointer items-center justify-center text-xs uppercase text-gray-500 peer-checked:text-blue-500"
                  htmlFor="female"
                >
                  <BsGenderFemale  size={15} />
                  female
                </Label>
              </div>
            </div>

            <div className="w-full">
              <Input
                className="peer sr-only w-full "
                value="other"
                name="gender"
                id="other"
                type="radio"
                checked={formData.gender === "other"}
                onChange={(e) => handleInputChange(e)}
              />
              <div className="relative flex border h-10 cursor-pointer flex-col items-center justify-end rounded-xl  border-gray-300 bg-gray-50 md:p-0 lg:p-1 transition-transform duration-150 hover:border-blue-400 active:scale-95 peer-checked:border-blue-500 peer-checked:shadow-md peer-checked:shadow-blue-400">
                <Label
                  className="flex flex-col text-balance cursor-pointer items-center justify-center text-xs uppercase text-gray-500 peer-checked:text-blue-500"
                  htmlFor="other"
                >
                  <BsGenderAmbiguous size={15} />
                  Other
                </Label>
              </div>
            </div>
          </div>
          {errors.gender && (
            <span
              className="absolute text-red-500 text-xs "
              style={{ "margin-top": "65px" }}
            >
              {errors.gender}
            </span>
          )}
        </span>

        <span className="flex flex-col relative  md:w-full lg:w-2/4 ">
          <Label className="text-lg">Job Role</Label>
          <Input
            type="text"
            placeholder="eg. Manager, HR"
            className="text-lg p-2 border h-10 rounded-md"
            name="currentJobRole"
            autoComplete="currentJobRole"
            value={formData.currentJobRole}
            onChange={(e) => handleInputChange(e)}
          />
          {errors.currentJobRole && (
            <span
              className="absolute text-red-500 text-xs "
              style={{ "margin-top": "68px" }}
            >
              {errors.currentJobRole}
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-col relative">
        <Label className="text-lg" htmlFor="address">
          Address
        </Label>
        <LocationSearch
          handleInputChange={handleInputChange}
          errors={errors}
          fieldsToShow={["suburb", "city", "state", "country"]}
          fieldPass="address"
        />
        {/* {errors.address && (
          <span className="absolute text-red-500 text-xs mt-16 py-1">
            {errors.address}
          </span>
        )} */}
      </div>

      <div className="flex w-full flex-col relative">
        <Label className="text-lg" htmlFor="bio">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Type your Bio data"
          className="max-w-full rounded-md"
          value={formData?.bio || ""} // Ensure controlled Input with default value
          onChange={(e) => handleInputChange(e)} // Pass the event to your handler
        />
        {errors.bio && (
          <span
            className="absolute text-red-500 text-xs "
            style={{ "margin-top": "108px" }}
          >
            {errors.bio}
          </span>
        )}
      </div>

      {/* Add profile picture */}
      <FileUpload
        label="Profile Picture"
        accept="image/jpeg,image/png,image/jpg"
        icon="📷"
        onFileChange={(file, error) => handleFileChange(file, "image", error)}
        file={formData.image}
        fileName={formData.image?.name}
        error={errors.image}
      />

      <FileUpload
        label="Resume/Brochure"
        accept="application/pdf"
        icon="📂"
        onFileChange={(file, error) => handleFileChange(file, "pdf", error)}
        file={formData.resume}
        fileName={formData.resume?.name}
        error={errors.resume}
      />
    </div>
  </div>
);

export const EducationAndSkills = ({
  formData,
  addEntry,
  handleInputChange,
  handleSearchChange,
  addSelection,
  removeEntry,
  searchTerm,
  skillOptions,
  hobbyOptions,
  setFormData,
  errors,
  setErrors,
  gradeInput,
  addCollege,
  removeCollege,
}) => {
  return (
    <>
      <div className="w-full flex justify-center border border-green-500 rounded-md">
        <div className="w-3/4">
          <div className="mb-5">
            <Label>Skills</Label>
            <Input
              type="text"
              placeholder="Search or add a skill"
              value={searchTerm.skills || ""}
              onChange={(e) => handleSearchChange(e, "skills")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.skills.trim()) {
                  addSelection(
                    "skills",
                    searchTerm.skills.trim().toLowerCase()
                  );
                  e.preventDefault();
                }
              }}
              className="w-full px-2 border h-10 rounded-md mb-1"
            />
            <div className="flex flex-wrap gap-2 mb-1 mt-2">
              {searchTerm.skills &&
                skillOptions
                  .filter((skill) =>
                    skill
                      .toLowerCase()
                      .includes(searchTerm.skills.toLowerCase())
                  )
                  .map((skill, i) => (
                    <button
                      key={`skill-option-${i}`}
                      onClick={() => addSelection("skills", skill)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
                    >
                      {skill}
                    </button>
                  ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div
                  key={`skill-${index}`}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center gap-2"
                >
                  {skill}
                  <TrashIcon
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => removeEntry("skills", index)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* College Details */}
          <div className="border-t-2 border-t-red-500">
            <div className="flex flex-col mt-5 gap-2">
              <Label htmlFor="collegeName">College Name:</Label>
              <Input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                className="px-2  h-10 rounded-md"
              />
              {errors.collegeName && (
                <span className="absolute text-red-500 text-xs mt-[58px] py-1">
                  {errors.collegeName}
                </span>
              )}
            </div>

            <div className="flex flex-col mt-4 gap-2">
              <Label htmlFor="course">Course:</Label>
              <Input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="px-2  h-10 rounded-md"
              />
              {errors.course && (
                <span className="absolute text-red-500 text-xs mt-[58px] py-1">
                  {errors.course}
                </span>
              )}
            </div>

            <div className="flex items-center mt-5">
              <Label htmlFor="grade">Grade:</Label>
              <div className="flex px-2 gap-4 items-center">
                <Input
                  type="number"
                  name="grade"
                  value={formData.grade}
                  onChange={gradeInput}
                  className="px-2  w-30 h-10 rounded-md"
                />
                {errors.grade && (
                  <span className="absolute text-red-500 text-xs mt-[58px] ">
                    {errors.grade}
                  </span>
                )}
                <select
                  name="gradeType"
                  value={formData.gradeType}
                  onChange={handleInputChange}
                  className="bg-background text-foreground  h-10 px-2 text-center text-sm appearance-auto rounded-md"
                >
                  <option>select</option>
                  <option value="CGPA">CGPA</option>
                  <option value="Percentage">%</option>
                </select>
                {errors.gradeType && (
                  <span className="text-red-500">{errors.gradeType}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col mt-4 gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="px-2 h-16 rounded-md resize-none custom-scrollbar overflow-auto"
              />
              {errors.description && (
                <span className="absolute text-red-500 text-xs mt-[98px] py-1">
                  {errors.description}
                </span>
              )}
            </div>
            {errors.colleges && (
              <span className="absolute text-red-500 text-xs mt-16">
                {errors.colleges}
              </span>
            )}

            <button
              onClick={addCollege}
              className="mt-5 bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Add College
            </button>
          </div>

          {/* Added Colleges */}
          <div className="mt-5">
            {formData.colleges.map((college, index) => (
              <div key={index} className="p-4  border-gray-300 rounded-md mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {college.collegeName}
                    </h3>
                    <p className="text-sm">Course: {college.course}</p>
                    <p className="text-sm">
                      Grade: {college.grade} {college.gradeType}
                    </p>
                  </div>
                  <TrashIcon
                    className="w-6 h-6 text-red-500 cursor-pointer"
                    onClick={() => removeCollege(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// export default ProfessionalInfo;
export const ProfessionalInfo = ({
  formData,
  setFormData,
  errors,
  experienceErrors,
  addEntry,
  removeEntry,
  handleInputChange,
}) => {
  return (
    <div className="flex justify-center w-full p-4 border border-green-500 rounded-md">
      <div className="w-full sm-max:w-full lg:w-full">
        <h3 className="text-xl font-semibold mb-4 px-4">Professional Info</h3>

        {/* Render Experiences (Newest First) */}
        {formData.experience.map((exp, index) => (
          <div key={index} className="flex flex-col mb-4 p-4 gap-5">
            <div className="w-full flex justify-between md:gap-2 lg:gap-6">
              <span className="w-2/4 relative">
                <Label htmlFor="CompanyName">Company Name</Label>
                <Input
                  type="text"
                  name="companyName"
                  placeholder="Comapany Name"
                  value={exp.companyName}
                  onChange={(e) => handleInputChange(e, "experience", index)}
                  className="w-full h-10 p-2 border rounded"
                />
                {errors.experience?.[index]?.companyName && (
                  <span className="text-red-500 text-sm absolute -mt-0">
                    {errors.experience[index].companyName}
                  </span>
                )}
              </span>

              <span className="w-2/4 relative">
                <Label htmlFor="companyAddress">Address</Label>
                <LocationSearch
                  handleInputChange={(e) =>
                    handleInputChange(e, "experience", index)
                  }
                  errors={errors}
                  // experienceErrors={experienceErrors}
                  fieldsToShow={["city"]}
                  fieldPass="companyAddress"
                  index={index} // Pass index properly
                />
                {errors.experience?.[index]?.companyAddress && (
                  <span className="text-red-500 text-sm absolute mt-0">
                    {errors.experience[index].companyAddress}
                  </span>
                )}
              </span>
            </div>

            <div className="w-full flex justify-between gap-4 items-center ">
              <span className="w-2/4 flex flex-col pr-2 gap-1 relative">
                <Label htmlFor="jobRole">Job Role</Label>

                <Input
                  type="text"
                  name="jobRole"
                  placeholder="Job Role"
                  value={exp.jobRole}
                  onChange={(e) => handleInputChange(e, "experience", index)}
                  className="w-full h-10 p-2 border rounded"
                />
                {errors.experience?.[index]?.jobRole && (
                  <span className="text-red-500 text-sm absolute mt-14">
                    {errors.experience[index].jobRole}
                  </span>
                )}
              </span>

              <span className="w-2/4 flex flex-col relative">
                <span>
                  <Label htmlFor="jobExperience">Year of Experience</Label>
                </span>
                <span className="w-full flex items-center justify-between gap-5">
                  <Input
                    type="number"
                    name="jobExperience"
                    placeholder="Years"
                    value={exp.jobExperience}
                    onChange={(e) => handleInputChange(e, "experience", index)}
                    className="w-2/4 h-10 p-2 border rounded"
                  />
                  {errors.experience?.[index]?.jobExperience && (
                    <span className="text-red-500 text-sm absolute mt-14">
                      {errors.experience[index].jobExperience}
                    </span>
                  )}
                  <select
                    className="bg-background border text-foreground w-2/4 h-10 text-center appearance-auto rounded-md"
                    value={exp.jobDuration} // Bind value to formData
                    onChange={(e) => handleInputChange(e, "experience", index)} // Update state
                    name="jobDuration" // Ensure name matches the formData key
                  >
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>

                  <TrashIcon
                    className="w-10 text-red-500 cursor-pointer"
                    onClick={() => removeEntry("experience", index)}
                  />
                </span>
              </span>
            </div>
            <div className="relative">
              <span>
                <Label htmlFor="jobDescription">Description</Label>
              </span>
              <Textarea
                type="text"
                name="jobDescription"
                placeholder="Type job description"
                value={exp.jobDescription || ""}
                onChange={(e) =>
                  handleInputChange(
                    {
                      target: { name: "jobDescription", value: e.target.value },
                    },
                    "experience",
                    index
                  )
                }
              />
              {errors.experience?.[index]?.jobDescription && (
                <span className="text-red-500 text-sm absolute">
                  {errors.experience[index].jobDescription}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Add Experience Button and Template (Fixed at the end) */}
        <div className="flex justify-between mb-4">
          <Button
            onClick={() => addEntry("experience")}
            className="flex items-center gap-2 w-full"
          >
            <PlusCircleIcon className="w-5 h-5" /> Add Experience
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AdditionalInfo = ({
  // addEntry,
  formData,
  // handleInputChange,
  removeEntry,
  handleSearchChange,
  addSelection,
  searchTerm,
  hobbyOptions,
  skillOptions,
}) => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-2/4">
        <h3 className="text-xl font-semibold mb-4">Additional Info</h3>

        {/* Skills Section */}
        <div className="mb-4">
          <Label>Skills</Label>
          <Input
            type="text"
            placeholder="Search or add a skill"
            value={searchTerm.skills || ""} // Default to an empty string if undefined
            onChange={(e) => handleSearchChange(e, "skills")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm.skills.trim()) {
                addSelection("skills", searchTerm.skills.trim().toLowerCase());
                e.preventDefault(); // Prevent form submission on Enter
              }
            }}
            className="w-full p-2 border h-10 rounded-md mb-2"
          />
          {/* Matching skill options */}
          <div className="flex flex-wrap gap-2 mb-2">
            {searchTerm.skills &&
              skillOptions
                .filter((skill) =>
                  skill.toLowerCase().includes(searchTerm.skills.toLowerCase())
                )
                .map((skill, i) => (
                  <button
                    key={`skill-option-${i}`} // Ensure unique keys
                    onClick={() => addSelection("skills", skill)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
                  >
                    {skill}
                  </button>
                ))}
          </div>
          {/* Selected skills */}
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <div
                key={`skill-${index}`} // Ensure unique keys
                className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center gap-2"
              >
                {skill}
                <TrashIcon
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => removeEntry("skills", index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hobbies Section */}
        <div className="mb-4">
          <Label>Hobbies</Label>
          <Input
            type="text"
            placeholder="Search or add a hobby"
            value={searchTerm.hobbies || ""} // Default to an empty string if undefined
            onChange={(e) => handleSearchChange(e, "hobbies")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm.hobbies.trim()) {
                addSelection(
                  "hobbies",
                  searchTerm.hobbies.trim().toLowerCase()
                );
                e.preventDefault(); // Prevent form submission on Enter
              }
            }}
            className="w-full p-2 border h-10 rounded-md mb-2"
          />
          {/* Matching hobby options */}
          <div className="flex flex-wrap gap-2 mb-2">
            {searchTerm.hobbies &&
              hobbyOptions
                .filter((hobby) =>
                  hobby.toLowerCase().includes(searchTerm.hobbies.toLowerCase())
                )
                .map((hobby, i) => (
                  <button
                    key={`hobby-option-${i}`} // Ensure unique keys
                    onClick={() => addSelection("hobbies", hobby)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg"
                  >
                    {hobby}
                  </button>
                ))}
          </div>
          {/* Selected hobbies */}
          <div className="flex flex-wrap gap-2">
            {formData.hobbies.map((hobby, index) => (
              <div
                key={`hobby-${index}`} // Ensure unique keys
                className="px-3 py-1 bg-green-500 text-white rounded-lg flex items-center gap-2"
              >
                {hobby}
                <TrashIcon
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => removeEntry("hobbies", index)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-4 w-2/4 items-center justify-center">
          <h3 className="text-xl">Social Links</h3>
          <div className="border-4 w-full flex flex-col gap-2">
            <span>
              <Label>LinkedIn:</Label>
              <Input
                type="url"
                placeholder="Enter your LinkedIn URL"
                className="h-10 rounded-md"
              />
            </span>
            <span>
              <Label>GitHub:</Label>
              <Input
                type="url"
                placeholder="Enter your GitHub URL"
                className="h-10 rounded-md"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SocialLinks = ({
  formData,
  addEntry,
  removeEntry,
  handleInputChange,
  errors,
}) => {
  return (
    <div className="flex justify-center border border-green-500 rounded-md p-2 py-4 w-full text-foreground bg-background">
      <div className="sm-max:w-full w-4/5 px-2 text-foreground bg-background">
        {formData.socialLink.map((link, index) => (
          <div key={index} className="flex flex-col gap-5 text-foreground">
            <div className="flex gap-1 items-center relative">
              <label htmlFor={`linkedIn-${index}`} className="font-medium">
                LinkedIn:
              </label>
              <input
                type="url"
                name="linkedIn"
                value={link?.linkedIn || ""}
                onChange={(e) => handleInputChange(e, "socialLink", index)}
                placeholder="Enter your LinkedIn URL"
                className="w-full h-10 p-2 border rounded text-foreground bg-background"
              />
              {errors.linkedIn && (
                <p className="text-red-500 text-xs absolute mt-14 right-0">
                  {errors.linkedIn}
                </p>
              )}
            </div>

            <div className="flex gap-1 items-center relative">
              <label htmlFor={`instagram-${index}`} className="font-medium">
                Instagram:
              </label>
              <input
                type="url"
                name="instagram"
                value={link?.instagram || ""}
                onChange={(e) => handleInputChange(e, "socialLink", index)}
                placeholder="Enter your instagram URL"
                className="w-full h-10 p-2 border rounded text-foreground bg-background"
              />
              {errors.instagram && (
                <p className="text-red-500 text-xs absolute mt-14 right-0">
                  {errors.instagram}
                </p>
              )}
            </div>

            <div className="flex gap-1 items-center relative">
              <label htmlFor={`gitHub-${index}`} className="font-medium">
                GitHub:
              </label>
              <input
                type="url"
                name="gitHub"
                value={link?.gitHub || ""}
                onChange={(e) => handleInputChange(e, "socialLink", index)}
                placeholder="Enter your gitHub URL"
                className="w-full h-10 p-2 border rounded text-foreground bg-background"
              />
              {errors.gitHub && (
                <p className="text-red-500 text-xs absolute mt-14 right-0">
                  {errors.gitHub}
                </p>
              )}
            </div>

            <div className="flex gap-1 items-center relative">
              <label htmlFor={`twitter-${index}`} className="font-medium">
                Twitter:
              </label>
              <input
                type="url"
                name="twitter"
                value={link?.twitter || ""}
                onChange={(e) => handleInputChange(e, "socialLink", index)}
                placeholder="Enter your twitter URL"
                className="w-full h-10 p-2 border rounded text-foreground bg-background"
              />
              {errors.twitter && (
                <p className="text-red-500 text-xs absolute mt-14 right-0">
                  {errors.twitter}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function UserDetails({
  activeStep,
  stepName,
  formData,
  setFormData,
  errors,
  setErrors,
  handleInputChange,
}) {
  // Render step content
  let content;
  switch (activeStep) {
    case 0:
      content = (
        <PersonalInfo
          image={image}
          isDragOver={isDragOver}
          imageName={imageName}
          handleDrop={handleDrop}
          handleDragLeave={handleDragLeave}
          handleDragEnter={handleDragEnter}
          handleFileChange={handleFileChange}
          handleDragOver={handleDragOver}
          handleRemoveImage={handleRemoveImage}
          errors={errors}
          setErrors={setErrors}
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
        />
      );
      break;
    case 1:
      content = (
        <EducationAndSkills
          errors={errors}
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
      break;
    case 2:
      content = (
        <ProfessionalInfo
          formData={formData}
          addEntry={addEntry}
          removeEntry={removeEntry}
          handleInputChange={handleInputChange}
        />
      );
      break;
    case 3:
      content = (
        <AdditionalInfo
          formData={formData}
          addEntry={addEntry}
          removeEntry={removeEntry}
          handleInputChange={handleInputChange}
          searchTerm={searchTerm}
          addSelection={addSelection}
          handleSearchChange={handleSearchChange}
          skillOptions={skillOptions}
          hobbyOptions={hobbyOptions}
        />
      );
      break;
    case 4:
      content = <SocialLinks />;
      break;
    default:
      content = <div>Step not found</div>;
  }

  return (
    <div className="flex justify-evenly items-center w-full p-10 gap-8 md:flex-col-reverse lg:flex-row ">
      <CardTemplete content={content} title={stepName} />
    </div>
  );
}
