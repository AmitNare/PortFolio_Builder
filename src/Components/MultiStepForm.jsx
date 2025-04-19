import React, { useEffect, useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import * as Yup from "yup";
import { storage } from "../../firebase"; // Adjust the import according to your setup
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { set, ref as dbRef, get, getDatabase } from "firebase/database";

import GetUserDetailsForm, {
  AdditionalInfo,
  EducationAndSkills,
  PersonalInfo,
  ProfessionalInfo,
  SocialLinks,
} from "./GetUserDetailsForm";
import useUserAuth from "./UserAuthentication";
import {
  generatePortfolioLink,
  savePortfolioDataToFirebase,
} from "./PortfolioMethods";
import DataLoader from "./DataLoader";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

function MultiStepForm({ setHasPortfolio, setProfileData }) {
  const { user, userDetails, setUserDetails } = useUserAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Define steps array properly
  const steps = [
    { label: "Personal details", stepName: "Personal Information" },
    { label: "Education & Skills", stepName: "Education & Skills" },
    { label: "Professional details", stepName: "Professional Information" },
    { label: "Social links", stepName: "Social Links" },
    // { label: "Additional details", stepName: "Additional Information" },
  ];

  // seperate name field into fname, lname
  const [firstname, ...rest] = userDetails?.name?.split(" ") || [""]; // Safeguard against undefined
  const surname = rest.length > 0 ? rest.join(" ") : ""; // Handle case where rest is empty

  const [formData, setFormData] = useState({
    name: firstname || "",
    surname: surname || "",
    email: user.email || " ",
    phoneNo: "",
    gender: "",
    currentJobRole: "",
    countryCode: "+1",
    image: null,
    resume: null,
    address: "",
    bio: "",
    colleges: [],
    collegeName: "",
    course: "",
    grade: "",
    gradeType: "CGPA", // or "Percentage"
    description: "",
    skills: [],
    hobbies: [],

    companyAddress: "",
    experience: [],
    awards: [],
    socialLink: [
      {
        linkedIn: "",
        gitHub: "",
        instagram: "",
        twitter: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = async (e, field, index) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      if (field) {
        // Update array fields like experience
        const updatedField = [...prevData[field]];
        updatedField[index] = { ...updatedField[index], [name]: value };
        return { ...prevData, [field]: updatedField };
      } else {
        // Update single fields
        return { ...prevData, [name]: value };
      }
    });

    // Wait for state update before validating
    // setTimeout(async () => {
      await validateStep(activeStep, name, value);
    // }, 100);
  };

  const SUPPORTED_FORMATS = ["application/pdf"]; // ✅ Allowed file types
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const nameValidation = Yup.string()
    .min(2, "Must be at least 3 characters")
    .matches(/^[A-Za-z\s]+$/, "Must contain only letters and spaces")
    .required("This field is required");

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    name: nameValidation,
    surname: nameValidation,
    collegeName: nameValidation,
    course: nameValidation,
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phoneNo: Yup.string()
      .matches(
        /^\+[1-9]{1}[0-9]{1,3}\s?[1-9]{1}[0-9]{9}$/,
        "Phone number must include a valid country code and 10-digit number"
      )
      .required("Phone number is required"),
    address: Yup.string().required("Address is required"),
    gender: Yup.string().required("Gender is required"),
    bio: Yup.string()
      .max(300, "Bio must not exceed 250 characters")
      .required("Bio is required"),
    image: Yup.mixed()
      .required("Image is required")
      .test("fileType", "Only JPEG/PNG images are allowed", (value) => {
        return value ? ["image/jpeg", "image/png"].includes(value.type) : false;
      })
      .test("fileSize", "File size must be under 2MB", (value) => {
        return value ? value.size <= 2 * 1024 * 1024 : false;
      }),

    resume: Yup.mixed()
      .required("Resume is required.")
      .test(
        "fileFormat",
        "Only PDF files are allowed.",
        (value) => value && SUPPORTED_FORMATS.includes(value.type)
      )
      .test(
        "fileSize",
        "File size must be less than 2MB.",
        (value) => value && value.size <= MAX_FILE_SIZE
      ),

      grade: Yup.number()
      .typeError("Grade must be a number")
      .required("Grade is required")
      .when("gradeType", (gradeType, schema) => {
        return gradeType === "CGPA"
          ? schema.max(10, "CGPA cannot exceed 10").min(0, "CGPA cannot be less than 0")
          : schema.max(100, "Percentage cannot exceed 100").min(0, "Percentage cannot be less than 0");
      }),
    
    gradeType: Yup.string().required("Grade type is required"),

    jobExperience: Yup.number()
      .required("Experience is required")
      .positive("Experience must be a positive number")
      .integer("Experience must be an integer")
      .min(1, "Experience must be at least 1 year"),

    companyName: Yup.string(),
    companyAddress: Yup.string(),

    jobDescription: Yup.string().max(150, "Bio must not exceed 150 characters"),

    gitHub: Yup.string().url("Invalid GitHub URL"),
    twitter: Yup.string().url("Invalid Twitter URL"),
    instagram: Yup.string().url("Invalid Instagram URL"),
    linkedIn: Yup.string().url("Invalid LinkedIn URL"),
  });

  const validateStep = async (step, name, value) => {
    try {
      let stepValidationSchema;

      switch (step) {
        case 0:
          stepValidationSchema = validationSchema.pick([
            "name",
            "email",
            "phoneNo",
            "surname",
            "gender",
            "address",
            "bio",
            "image",
            "resume",
          ]);
          break;
        case 1:
          // stepValidationSchema = validationSchema.pick(["collegeName", "course"]);
          break;
        case 2:
          // No predefined schema for this step; we handle it dynamically
          break;
        case 3:
          stepValidationSchema = validationSchema.pick([
            "linkedIn",
            "gitHub",
            "instagram",
            "twitter",
          ]);
          break;
        default:
          stepValidationSchema = validationSchema; // Full schema as fallback
          break;
      }

      // Step 1: Validate a single field if name and value are provided
      if (name && value !== undefined && stepValidationSchema) {
        try {
          await stepValidationSchema.validateAt(name, {
            ...formData,
            [name]: value,
          });
          setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined })); // Clear specific field error
        } catch (fieldError) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: fieldError.message, // Update specific field error
          }));
          return false; // Return failure for field validation
        }
      }

      // Step 2: Handle custom validation for the "experience" step
      if (step === 2) {
        const experienceErrors = [];
        const experienceEntries = formData.experience || [];

        experienceEntries.forEach((entry, index) => {
          const { companyName, jobDescription, jobRole, jobExperience } = entry;

          // Check if any field is filled
          const isAnyFieldFilled =
            companyName || jobDescription || jobRole || jobExperience;

          if (isAnyFieldFilled) {
            // Validate all fields for this entry
            const entrySchema = Yup.object().shape({
              companyName: Yup.string().required("Company name is required."),
              jobDescription: Yup.string().required(
                "Job description is required."
              ),
              jobRole: Yup.string().required("Job role is required."),
              jobExperience: Yup.string().required(
                "Job experience is required."
              ),
              // companyAddress: Yup.string().required("Company address is required."),
            });

            try {
              entrySchema.validateSync(entry, { abortEarly: false });
            } catch (err) {
              // Collect errors for the current entry
              err.inner.forEach((error) => {
                experienceErrors.push({
                  index,
                  field: error.path,
                  message: error.message,
                });
              });
            }
          }
        });

        if (experienceErrors.length > 0) {
          const newErrors = { ...errors };
          experienceErrors.forEach(({ index, field, message }) => {
            if (!newErrors.experience) newErrors.experience = [];
            if (!newErrors.experience[index]) newErrors.experience[index] = {};
            newErrors.experience[index][field] = message;
          });
          setErrors(newErrors);
          return false; // Validation failed
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, experience: undefined })); // Clear experience errors
          return true; // Validation passed
        }
      }

      // Step 3: Validate the entire step (for other steps)
      if (stepValidationSchema) {
        const stepFormData = Object.keys(stepValidationSchema.fields).reduce(
          (acc, field) => ({ ...acc, [field]: formData[field] }),
          {}
        );

        try {
          const stepErrors = await stepValidationSchema.validate(stepFormData, {
            abortEarly: false,
          });

          setErrors({}); // Clear all errors
          return true;
        } catch (stepError) {
          if (stepError.inner && Array.isArray(stepError.inner)) {
            // ✅ Ensure stepError.inner exists and is an array
            const newErrors = {};
            stepError.inner.forEach((err) => {
              newErrors[err.path] = err.message;
            });
            console.log("Validation Error:", stepError.message, name, value);
            setErrors(newErrors); // Update errors for all invalid fields
          } else {
            console.error("Unexpected validation error:", stepError); // Debugging info
          }

          return false; // Validation failed
        }
      }

      return true; // Default to true if no validation is required for this step
    } catch (error) {
      console.error("Unexpected validation error:", error);
      return false; // Return failure for unexpected errors
    }
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      console.log("Validation Failed - Raw Error Details:", error); // 🔍 Debug
  
      if (error.inner) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
  
        console.log("Parsed Validation Errors:", newErrors); // 🔍 Debug before state update
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  

  const handleFormSubmit = async () => {
    const isValidStep3 = await validateStep(3);

    // 🚀 Debug validation result before proceeding
    console.log("Step 3 validation status:", isValidStep3);
    console.log("Current Errors State:", errors);

    if (!isValidStep3) {
        console.log("Form validation failed. Please fix the errors.");
        return; // 🚨 STOP form submission if Step 3 has errors
    }

    console.log("Form is valid, submitting...");
    // 📝 Proceed with form submission logic here
};

  
  
  

  const handleNextStep = async () => {
    let newErrors = { ...errors }; // Keep previous errors

    if (!formData.image) {
      newErrors.image = "Profile picture is required.";
    }
    if (!formData.resume) {
      newErrors.resume = "Resume is required.";
    }

    setErrors(newErrors); // Set all errors together

    if (activeStep < steps.length - 1) {
      // Step 1: Ensure at least one college is added before proceeding
      if (activeStep === 1 && formData.colleges.length === 0) {
        setErrors((prev) => ({
          ...prev,
          colleges: "At least one college must be added before proceeding.",
        }));
        return; // ❌ Stop execution (user must add at least one college)
      }

      // Check if fields are filled properly before proceeding
      if (!validateCollegeFields()) return; // ❌ Stop if validation fails

      const isValid = await validateStep(activeStep);

      if (isValid) {
        setActiveStep((prev) => {
          const nextStep = prev + 1;

          // ✅ Clear errors when moving to Step 2 or beyond
          if (nextStep >= 2) {
            setErrors({});
          }

          return nextStep;
        });

        console.log("Next step:", activeStep + 1);
      } else {
        console.log("Validation failed:", errors);
      }
    }
  };

  const [pdf, setPdf] = useState(null);
  // const [error, setError] = useState("");
  // const [uploading, setUploading] = useState(false);

  const handlePdfChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.type !== "application/pdf") {
        setErrors("Please upload a valid PDF file.");
        setPdf(null);
      } else if (file.size > 5 * 1024 * 1024) {
        setErrors("File size must be less than 5MB.");
        setPdf(null);
      } else {
        setErrors("");
        setPdf(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!pdf) {
      setErrors("Please select a PDF file first.");
      return;
    }

    setIsLoading(true);

    try {
      const storagePath = `pdfs/${Date.now()}_${pdf.name}`;
      const storageReference = storageRef(storage, storagePath);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageReference, pdf);

      // Get the file's download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save the URL and name directly in the "pdfs" node
      const dbReference = dbRef(database, "pdfs");
      await set(dbReference, { name: pdf.name, url: downloadURL });

      setErrors("");
      alert("File uploaded successfully!");
    } catch (error) {
      setErrors("Failed to upload file. Please try again.");
    }

    setIsLoading(false);
    setPdf(null);
  };

  const [image, setImage] = useState();
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageName, setImageName] = useState("");

  // const handleDrop = (event) => {
  //   event.preventDefault();
  //   setIsDragOver(false);
  //   const file = event.dataTransfer.files[0]; // Get the dropped file
  //   handleFileChange({ target: { files: [file] } }); // Pass the file to handleFileChange
  // };

  const handleFileChange = (file, type) => {
    if (type === "image") {
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: file ? null : "Invalid image" }));
    } else if (type === "pdf") {
      setFormData((prev) => ({ ...prev, resume: file }));
      setErrors((prev) => ({
        ...prev,
        resume: file ? null : "Invalid resume",
      }));
    }
  };

  // Handle drag events
  const handleDragEnter = (event) => {
    event.preventDefault();
    if (!image) setIsDragOver(true); // Only show drag-over effect if no image is selected
  };

  const handleDragLeave = () => {
    if (!image) setIsDragOver(false); // Hide drag-over effect if no image is selected
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent the default behavior to allow drop
  };

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0]; // Get the file from the drop event

    if (file) {
      handleFileChange(file); // Call the image upload function
    }
  };

  // Handle removing the image
  const handleRemoveImage = () => {
    setImage(null); // Clear the image URL
    setImageName(""); // Clear the image name
    // Optionally remove the image from Firebase or mark it as deleted in your database
  };

  const validateCollegeFields = () => {
    const { collegeName, course, grade } = formData;

    // Check if at least one field is filled
    const isAnyFieldFilled = collegeName.trim() || course.trim() || grade;
    const isAllFieldsFilled = collegeName.trim() && course.trim() && grade;

    if (isAnyFieldFilled && !isAllFieldsFilled) {
      setErrors({
        collegeName: collegeName ? "" : "College name is required.",
        course: course ? "" : "Course is required.",
        grade: grade ? "" : "Grade is required.",
      });
      return false; // ❌ Stop execution, fields are not fully filled
    }

    // ✅ Clear errors when all fields are correctly filled
    setErrors({});
    return true; // ✅ Validation passed
  };

  // Add a new college entry
  const addCollege = () => {
    if (
      formData.collegeName.trim() &&
      formData.course.trim() &&
      formData.description.trim() &&
      formData.grade
    ) {
      const newCollege = {
        collegeName: formData.collegeName,
        course: formData.course,
        grade: formData.grade,
        gradeType: formData.gradeType,
        description: formData.description,
      };

      const isDuplicate = formData.colleges?.some(
        (college) =>
          college.collegeName === newCollege.collegeName &&
          college.course === newCollege.course
      );

      if (!isDuplicate) {
        // Add new college
        setFormData((prev) => ({
          ...prev,
          colleges: [...(prev.colleges || []), newCollege],
          collegeName: "",
          course: "",
          grade: "",
          gradeType: "CGPA",
          description: "",
        }));

        // Clear all errors
        setErrors({});
      } else {
        setErrors((prev) => ({
          ...prev,
          duplicate: "This college entry already exists.",
        }));
      }
    } else {
      // Set errors for empty fields
      setErrors((prev) => ({
        ...prev,
        collegeName: !formData.collegeName ? "College name is required." : "",
        course: !formData.course ? "Course is required." : "",
        grade: !formData.grade ? "Grade is required." : "",
        description: !formData.description ? "description is required." : "",
      }));
    }
  };

  // Remove a college entry
  const removeCollege = (index) => {
    setFormData((prev) => {
      const updatedColleges = [...prev.colleges];
      updatedColleges.splice(index, 1); // Remove the selected college

      return {
        ...prev,
        colleges: updatedColleges,
      };
    });

    // Clear errors when the last college is removed
    if (formData.colleges.length === 1) {
      setErrors((prev) => ({
        ...prev,
        colleges: "At least one college must be added before proceeding.",
      }));
    }
  };

  const validateCollegeStep = () => {
    if (formData.colleges.length === 0) {
      setErrors((prev) => ({
        ...prev,
        colleges: "At least one college must be added before proceeding.",
      }));
      return false;
    }
    return true;
  };

  const [skillOptions, setSkillOptions] = useState([
    "JavaScript",
    "React",
    "CSS",
    "Python",
    "Project Management",
  ]);
  const [hobbyOptions, setHobbyOptions] = useState([
    "Reading",
    "Traveling",
    "Cooking",
  ]);
  const [searchTerm, setSearchTerm] = useState({ skills: "", hobbies: "" });

  // Add skill/hobby
  const addSelection = (arrayName, value) => {
    const lowercaseValue = value.toLowerCase();
    setFormData((prevData) => {
      const updatedArray = [
        ...new Set([...prevData[arrayName], lowercaseValue]),
      ];
      return { ...prevData, [arrayName]: updatedArray };
    });

    if (arrayName === "skills" && !skillOptions.includes(lowercaseValue)) {
      setSkillOptions((prev) => [...prev, lowercaseValue]);
    } else if (
      arrayName === "hobbies" &&
      !hobbyOptions.includes(lowercaseValue)
    ) {
      setHobbyOptions((prev) => [...prev, lowercaseValue]);
    }

    setSearchTerm((prev) => ({ ...prev, [arrayName]: "" }));
  };

  // Search term change
  const handleSearchChange = (e, arrayName) => {
    setSearchTerm({ ...searchTerm, [arrayName]: e.target.value });
  };

  // Add dynamic entries
  const addEntry = () => {
    setFormData((prevData) => {
      const updatedExperience = [...prevData.experience];
      const lastIndex = updatedExperience.length - 1;

      // Validate the last entry before adding a new one
      if (lastIndex >= 0) {
        const lastEntry = updatedExperience[lastIndex];
        const errors = {};

        if (!lastEntry.companyName.trim())
          errors.companyName = "Company name is required.";
        if (!lastEntry.jobRole.trim()) errors.jobRole = "Job role is required.";
        if (!lastEntry.jobExperience.trim())
          errors.jobExperience = "Experience is required.";
        if (!lastEntry.jobDescription.trim())
          errors.jobDescription = "Description is required.";
        if (!lastEntry.companyAddress.trim())
          errors.companyAddress = "Company address is required.";

        // If there are errors, update the error state and return
        if (Object.keys(errors).length > 0) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            experience: { ...prevErrors.experience, [lastIndex]: errors },
          }));
          return prevData;
        }
      }

      // If no errors, clear errors for the last entry and add a new blank entry
      setErrors((prevErrors) => ({
        ...prevErrors,
        experience: { ...prevErrors.experience, [lastIndex]: {} },
      }));

      const newEntry = {
        companyName: "",
        companyAddress: "", // Ensure companyAddress is included
        jobRole: "",
        jobExperience: "",
        jobDuration: "Month",
        jobDescription: "",
      };

      return {
        ...prevData,
        experience: [...updatedExperience, newEntry],
      };
    });
  };

  // Remove dynamic entries
  const removeEntry = (field, index) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].filter((_, i) => i !== index),
    }));
  };

  // Education grade input handler
  const gradeInput = (e) => {
    const { name, value } = e.target;

    // Validate CGPA and percentage
    if (name === "grade") {
      if (formData.gradeType === "CGPA" && value > 10) {
        alert("CGPA must be less than or equal to 10");
        return;
      }
      if (formData.gradeType === "Percentage" && value > 100) {
        alert("Percentage must be less than or equal to 100");
        return;
      }
    }

    handleInputChange(e); // Call the parent's input handler
  };

  // Save data into Firebase
  const saveFormDataToFirebase = async () => {
    const db = getDatabase();
    const formRef = ref(db, "Users/" + user.uid); // Reference to your user data in the database
    await set(formRef, formData); // Save the form data
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // handleFormSubmit();
    try {
      const db = getDatabase();
      const portfolioRef = dbRef(db, `portfolioId/${user.uid}`);

      // Check if the user already has a portfolio
      const snapshot = await get(portfolioRef);
      if (snapshot.exists()) {
        alert(
          "You already have a portfolio link. You cannot create another one."
        );
        return;
      }

      // **Step 1: Upload Image and Resume**
      const uploadPromises = [];

      let imageUrl = null;
      if (formData.image) {
        const storageRef = ref(storage, `images/${formData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, formData.image);
        uploadPromises.push(uploadTask.then(() => getDownloadURL(storageRef)));
      }

      let resumeUrl = null;
      if (formData.resume) {
        const storageRef = ref(storage, `resume/${formData.resume.name}`);
        const uploadTask = uploadBytesResumable(storageRef, formData.resume);
        uploadPromises.push(uploadTask.then(() => getDownloadURL(storageRef)));
      }

      // Wait for all uploads to complete
      const urls = await Promise.all(uploadPromises);
      imageUrl = urls[0] || null; // First URL is for the image
      resumeUrl = urls[1] || null; // Second URL is for the resume

      console.log("Uploaded Image URL:", imageUrl);
      console.log("Uploaded Resume URL:", resumeUrl);

      // **Step 4: Generate Portfolio Link**
      const uniqueLink = generatePortfolioLink(formData.name, formData.surname);

      // **Step 5: Prepare Portfolio Data**
      const portfolioData = {
        uniqueLink: uniqueLink,
        createdAt: Date.now(),
      };

      // **Step 3: Update formData with the correct URLs**
      const updatedFormData = {
        ...formData,
        image: imageUrl,
        resume: resumeUrl,
        portfolioLink: uniqueLink,
      };

      // Update the formData state with the new URLs
      setFormData(updatedFormData);


      // **Step 6: Save to Firebase**
      await set(portfolioRef, portfolioData); // use to store unique link
      await savePortfolioDataToFirebase(updatedFormData, user.uid); // Use updatedFormData here

      console.log("Portfolio data saved successfully:", portfolioData);
      alert("Portfolio created successfully!");

      // **Step 7: Update State and Navigate**
      setProfileData(updatedFormData); // Use updatedFormData here
      setUserDetails(updatedFormData);
      setHasPortfolio(true);
      navigate(location.pathname, { replace: true });
    } catch (error) {
      console.error("Error saving portfolio data to Firebase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function getSectionComponent() {
    switch (activeStep) {
      case 0:
        return (
          <PersonalInfo
            image={image}
            isDragOver={isDragOver}
            imageName={imageName}
            handleDrop={handleDrop}
            handlePdfChange={handlePdfChange}
            handleUpload={handleUpload}
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
            isLoading={isLoading}
          />
        );
      case 1:
        return (
          <EducationAndSkills
            errors={errors}
            formData={formData}
            handleInputChange={handleInputChange}
            gradeInput={gradeInput}
            removeEntry={removeEntry}
            searchTerm={searchTerm}
            addSelection={addSelection}
            handleSearchChange={handleSearchChange}
            skillOptions={skillOptions}
            setErrors={setErrors}
            setFormData={setFormData}
            addCollege={addCollege}
            removeCollege={removeCollege}
          />
        );
      case 2:
        return (
          <ProfessionalInfo
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            addEntry={addEntry}
            removeEntry={removeEntry}
            handleInputChange={handleInputChange}
          />
        );
      // case 3:
      //   return (
      //     <AdditionalInfo
      //       formData={formData}
      //       // addEntry={addEntry}
      //       // handleInputChange={handleInputChange}
      //       removeEntry={removeEntry}
      //       searchTerm={searchTerm}
      //       addSelection={addSelection}
      //       handleSearchChange={handleSearchChange}
      //       skillOptions={skillOptions}
      //       hobbyOptions={hobbyOptions}
      //     />
      //   );
      case 3:
        return (
          <SocialLinks
            formData={formData}
            addEntry={addEntry}
            removeEntry={removeEntry}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="w-full flex justify-center ">
      {isLoading ? (
        <DataLoader /> // Use the DataLoader component
      ) : (
        <div className="stepper-container w-3/4 p-2 sm-max:w-full ">
          <Stepper
            activeStep={activeStep}
            styleConfig={{
              activeBgColor: "#4caf50",
              completedBgColor: "#4caf50",
              inactiveBgColor: "#e0e0e0",
              activeTextColor: "#ffffff",
              completedTextColor: "#ffffff",
              inactiveTextColor: "#9e9e9e",
            }}
            connectorStyleConfig={{
              activeColor: "#4caf50",
              completedColor: "#4caf50",
              disabledColor: "#e0e0e0",
            }}
          >
            {steps.map((step, index) => (
              <Step key={index} label={step.label} />
            ))}
          </Stepper>

          <div className="mt-1">
            {getSectionComponent()}
            {/* <UserDetails
          activeStep={activeStep}
          stepName={steps[activeStep].stepName}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          handleInputChange={handleInputChange}
        /> */}
            <div className="w-full mt-8 flex justify-center items-center">
              <div className="flex justify-between w-3/4 sm-max:w-full gap-5">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(activeStep - 1)}
                  disabled={activeStep === 0}
                  className="border-button text-foreground hover:border-button-hover rounded-md px-2 py-2 w-1/4 sm-max:w-2/4"
                  // style={styles.button}
                >
                  Previous
                </Button>

                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={handleNextStep} // Navigate to the next step
                    // style={styles.button}
                    className="bg-button text-button-textColor hover:bg-button-hover rounded-md px-2 py-2 w-1/4 sm-max:w-2/4"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleFormSubmit} // Submit the form on the last step
                    className="bg-button text-button-textColor hover:bg-button-hover rounded-md px-2 py-2 w-1/4 sm-max:w-2/4"

                    // style={styles.button}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiStepForm;
