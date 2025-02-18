import React, { useEffect, useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import * as Yup from "yup";
import { storage } from '../../firebase'; // Adjust the import according to your setup
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { set, ref as dbRef, get, getDatabase } from 'firebase/database';

import GetUserDetailsForm, {
  AdditionalInfo,
  EducationAndSkills,
  PersonalInfo,
  ProfessionalInfo,
  SocialLinks,
} from "./GetUserDetailsForm";
import useUserAuth from "./UserAuthentication";
import { generatePortfolioLink, savePortfolioDataToFirebase } from "./PortfolioMethods";
import DataLoader from "./DataLoader";
import { useNavigate } from "react-router-dom";

function MultiStepForm({setHasPortfolio, setProfileData}) {
  const {user, userDetails} = useUserAuth(); 
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Define steps array properly
  const steps = [
    { label: "Personal details", stepName: "Personal Information" },
    { label: "Education & Skills", stepName: "Education & Skills" },
    { label: "Professional details", stepName: "Professional Information" },
    // { label: "Additional details", stepName: "Additional Information" },
    { label: "Social links", stepName: "Social Links" },
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
    countryCode: "+1",
    image: null,
    resume: null,
    address: "",
    bio: "",
    colleges: [],
    // collegeName: "",
    // course: "",
    grade: "",
    gradeType: "CGPA", // or "Percentage"
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
        tweeter: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = async (e, field, index) => {
    const { name, value } = e.target;
  
    if (field) {
      // For array fields (like experience)
      setFormData((prevData) => {
        const updatedField = [...prevData[field]];
        updatedField[index] = { ...updatedField[index], [name]: value };
        return { ...prevData, [field]: updatedField };
      });
    } else {
      // For single fields
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  
    // Validate the specific field and step (if applicable)
    await validateStep(activeStep, name, value);
  };
  
  

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

    grade: Yup.number()
      .typeError("Grade must be a number")
      .required("Grade is required")
      .when("gradeType", {
        is: "CGPA",
        then: Yup.number()
          .max(10, "CGPA cannot exceed 10")
          .min(0, "CGPA cannot be less than 0"),
        otherwise: Yup.number()
          .max(100, "Percentage cannot exceed 100")
          .min(0, "Percentage cannot be less than 0"),
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

    linkedIn: Yup.string(),
    gitHub: Yup.string(),
    instagram: Yup.string(),
    tweeter: Yup.string(),
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
          "tweeter",
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
          companyName ||  jobDescription || jobRole || jobExperience ;

        if (isAnyFieldFilled) {
          // Validate all fields for this entry
          const entrySchema = Yup.object().shape({
            companyName: Yup.string().required("Company name is required."),
            jobDescription: Yup.string().required("Job description is required."),
            jobRole: Yup.string().required("Job role is required."),
            jobExperience: Yup.string().required("Job experience is required."),
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
        await stepValidationSchema.validate(stepFormData, { abortEarly: false });
        setErrors({}); // Clear all errors if validation passes
        return true; // Validation passed
      } catch (stepError) {
        const newErrors = {};
        stepError.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors); // Update errors for all invalid fields in the step
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
      if (error.inner) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNextStep = async () => {
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
      setErrors((prev) => ({ ...prev, resume: file ? null : "Invalid resume" }));
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
      formData.grade
    ) {
      const newCollege = {
        collegeName: formData.collegeName,
        course: formData.course,
        grade: formData.grade,
        gradeType: formData.gradeType,
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
  
      // Check if the last entry is complete
      if (lastIndex >= 0) {
        const lastEntry = updatedExperience[lastIndex];
        const errors = {};
  
        if (!lastEntry.companyName.trim()) errors.companyName = "Company name is required.";
        if (!lastEntry.jobRole.trim()) errors.jobRole = "Job role is required.";
        if (!lastEntry.jobExperience.trim()) errors.jobExperience = "Experience is required.";
        if (!lastEntry.jobDescription.trim()) errors.jobDescription = "Description is required.";
  
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
        companyAddress: "",
        jobRole: "",
        jobExperience: "",
        jobDuration: "",
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
    const formRef = ref(db, 'Users/' + user.uid); // Reference to your user data in the database
    await set(formRef, formData); // Save the form data
  };

  // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log(user.uid);

//     // Validate the form data first
//     // const isValid = await validateForm();
//     // if (!isValid) {
//     //     console.log("Form validation failed:", errors);
//     //     return;
//     // }

//     // Proceed with form submission after validation
//     try {
//         // Save form data to Firebase
//         // await saveFormDataToFirebase();

//         // Reset form state or show success message
//         console.log("Form submitted successfully!",formData);

//     } catch (error) {
//         console.error("Error saving data to Firebase:", error);
//     }
// };

const navigate = useNavigate();


const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent default form submission behavior
  setIsLoading(true);
  console.log(formData.image);
  console.log("User UID:", user.uid);
  
  try {

    const db = getDatabase(); // Initialize Firebase Realtime Database

    // Reference to the user's portfolio node
    const portfolioRef = dbRef(db, `portfolioId/${user.uid}`);

    // Check if the user already has a portfolio
    const snapshot = await get(portfolioRef);
    if (snapshot.exists()) {
      console.log("User already has a portfolio:", snapshot.val());
      alert("You already have a portfolio link. You cannot create another one.");
      return; // Exit if the portfolio already exists
    }

     // Upload the image to Firebase Storage
     let imageUrl = null;
     if (formData.image) {
       const storageRef = ref(storage, `images/${formData.image.name}`);
       const uploadTask = await uploadBytesResumable(storageRef, formData.image);
       imageUrl = await getDownloadURL(uploadTask.ref);

       // Save the image URL to formData
       setFormData((prev) => ({
         ...prev,
         image: imageUrl, // Store the URL of the image in formData
       }));
     }
     
    // Generate a unique portfolio link
    const uniqueLink = generatePortfolioLink(formData.name, formData.surname);

    // Portfolio data to be saved
    const portfolioData = {
      userId: user.uid,
      image: imageUrl, // Store the image URL in portfolio data
      uniqueLink: `${window.location.origin}/${uniqueLink}`, // Full unique link
      createdAt: Date.now(), // Timestamp for when the portfolio was created
    };

    // Save the portfolio data to Firebase under the user's UID
    await set(portfolioRef, portfolioData);

    // Save the User data to Firebase under the user's UID
    await savePortfolioDataToFirebase(formData, user.uid);

    // Reset form state or show a success message
    console.log("Portfolio data saved successfully!", portfolioData);
    alert("Portfolio created successfully!");

    console.log(formData);

    // await new Promise((resolve) => setTimeout(resolve, 5000)); // 2 seconds delay
    setProfileData(formData);
    setHasPortfolio(true);
    navigate(location.pathname, { replace: true }); // Refresh the current route

  } catch (error) {
    console.error("Error saving portfolio data to Firebase:", error);
  }
  finally {
    setIsLoading(false);
    navigate(location.pathname, { replace: true });
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
        return <SocialLinks 
            formData={formData}
            addEntry={addEntry}
            removeEntry={removeEntry}
            handleInputChange={handleInputChange}
            errors={errors}
          />;
          
      default:
        return null;
    }
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <DataLoader /> // Use the DataLoader component
      ) : (
    <div className="stepper-container w-full p-2">
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
        <div className="w-full border-4 mt-4 flex justify-center items-center">
          <div className="flex justify-between w-3/4 border-4 border-red-500">
            <button
              onClick={() => setActiveStep(activeStep - 1)}
              disabled={activeStep === 0}
              className="bg-yellow-600 px-2 w-1/4 h-8"
              // style={styles.button}
            >
              Previous
            </button>

            {activeStep < steps.length - 1 ? (
              <button
                onClick={handleNextStep} // Navigate to the next step
                // style={styles.button}
              className="bg-button text-button-textColor hover:bg-button-hover px-2 w-1/4"

              >
                Next
              </button>
            ) : (
              <button
              onClick={handleSubmit} // Submit the form on the last step
              className="bg-button text-button-textColor hover:bg-button-hover px-2 w-1/4"

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
