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
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { TrashIcon } from "lucide-react";

export default function Profile({ userId , userDetails, setUserDetails}) {

  
  // const { userDetails,setUserDetails } = useUserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isCardEditing, setIsCardEditing] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [cardEditingStates, setCardEditingStates] = useState(
    Array(userDetails?.experience?.length || 0).fill(false)
  );
  const [allCardsSaved, setAllCardsSaved] = useState(true); 

// seperate name field into fname, lname
const [firstname, ...rest] = userDetails?.name?.split(" ") || [""]; // Safeguard against undefined
const surname = rest.length > 0 ? rest.join(" ") : ""; // Handle case where rest is empty

// const [formData, setFormData] = useState({
//   name: firstname || "",
//   surname: surname || "",
//   email: userDetails.email || " ",
//   phoneNo: "",
//   gender: "",
//   countryCode: "+1",
//   image: null,
//   address: "",
//   bio: "",
//   colleges: [],
//   // collegeName: "",
//   // course: "",
//   grade: "",
//   gradeType: "CGPA", // or "Percentage"
//   skills: [],
//   hobbies: [],

//   companyAddress: "",
//   experience: [],
//   awards: [],
//   socialLink: [
//     {
//       linkedIn: "",
//       gitHub: "",
//       instagram: "",
//       tweeter: "",
//     },
//   ],
// });

const [errors, setErrors] = useState({});

//  const handleInputChange = async (e, field, index) => {
//   const { name, value } = e.target;
//   console.log(`Changing ${name} in ${field} at index ${index} to ${value}`);

//   if (field) {
//     setUserDetails((prevDetails) => {
//       const updatedField = [...prevDetails[field]]; // Make a copy of the experience array
//       updatedField[index] = { ...updatedField[index], [name]: value }; // Update the specific field

//       console.log("Updated userDetails:", { ...prevDetails, [field]: updatedField });
//       return { ...prevDetails, [field]: updatedField }; // Set the updated state
//     });
//   } else {
//     setUserDetails((prevDetails) => {
//       console.log("Updated userDetails for single field:", { ...prevDetails, [name]: value });
//       return { ...prevDetails, [name]: value };
//     });
//   }

//   // Validation can be added here if required
//   await validateStep(activeStep, name, value);
// };




const handleInputChange = (e, section, index, field) => {
  const { value } = e.target;
  setUserDetails((prevDetails) => {
    const updatedDetails = { ...prevDetails };
    updatedDetails[section][index][field] = value;
    return updatedDetails;
  });
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
          companyName || jobDescription || jobRole || jobExperience;

        if (isAnyFieldFilled) {
          // Validate all fields for this entry
          const entrySchema = Yup.object().shape({
            companyName: Yup.string().required("Company name is required."),
            jobDescription: Yup.string().required(
              "Job description is required."
            ),
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
        await stepValidationSchema.validate(stepFormData, {
          abortEarly: false,
        });
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
    const isValid = await validateStep(activeStep);
    if (isValid) {
      setActiveStep(activeStep + 1);
      console.log("Next step:", activeStep + 1);
      console.log("activeStep : ", activeStep);
    } else {
      console.log("Validation failed:", errors);
      // console.log("form Submitted: ", formData);
    }
  }
};

const [image, setImage] = useState();
const [isDragOver, setIsDragOver] = useState(false);
const [imageName, setImageName] = useState("");

 const handleFileChange = (event) => {
  const file = event.target.files[0];

  // Clear previous errors
  setErrors((prev) => ({ ...prev, image: null }));

  if (file) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPEG/PNG images are allowed.",
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "File size must be under 2MB.",
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: null }));

    // Store the file in formData
    setFormData((prev) => ({ ...prev, image: file }));
    setImage(URL.createObjectURL(file)); // Set preview URL
    setImageName(file.name); // Optional: Set file name
  }
};

// const handleDrop = (event) => {
//   event.preventDefault();
//   setIsDragOver(false);
//   const file = event.dataTransfer.files[0]; // Get the dropped file
//   handleFileChange({ target: { files: [file] } }); // Pass the file to handleFileChange
// };

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

// Add a new college entry
 const addCollege = () => {
  if (formData.collegeName.trim() && formData.course.trim() && formData.grade) {
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
  setFormData((prev) => ({
    ...prev,
    colleges: prev.colleges.filter((_, i) => i !== index),
  }));
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

// Add dynamic entries
const addEntry = () => {
  setUserDetails((prevDetails) => {
    const updatedExperience = [...prevDetails.experience];
    const lastIndex = updatedExperience.length - 1;

    // Validate the last entry if it exists
    if (lastIndex >= 0) {
      const lastEntry = updatedExperience[lastIndex];
      const errors = {};

      // Check required fields
      if (!lastEntry.companyName?.trim()) errors.companyName = "Company name is required.";
      if (!lastEntry.jobRole?.trim()) errors.jobRole = "Job role is required.";
      if (!lastEntry.jobExperience?.trim()) errors.jobExperience = "Experience is required.";
      if (!lastEntry.jobDescription?.trim()) errors.jobDescription = "Description is required.";

      // If validation fails, set errors and prevent new entry
      if (Object.keys(errors).length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          experience: { ...prevErrors.experience, [lastIndex]: errors },
        }));
        return prevDetails;
      }
    }

    // Clear errors for the last entry
    setErrors((prevErrors) => ({
      ...prevErrors,
      experience: { ...prevErrors.experience, [lastIndex]: {} },
    }));

    // Add a new blank entry
    const newEntry = {
      companyName: "",
      companyAddress: "",
      jobRole: "",
      jobExperience: "",
      jobDuration: "",
      jobDescription: "",
      isEditable: true, // Allow editing for the new entry
    };

    return {
      ...prevDetails,
      experience: [...updatedExperience, newEntry],
    };
  });
};

useEffect(() => {
  setAllCardsSaved(cardEditingStates.every((state) => !state));
}, [cardEditingStates]);

const saveChanges = () => {
  if (!allCardsSaved) {
    alert("Please save all individual cards before saving parent changes.");
    return;
  }
  // Save all changes for the parent container
  setUserDetails((prevDetails) => {
    const updatedExperience = prevDetails.experience.map((entry) => ({
      ...entry,
      setIsEditing: false, // Disable editing for all entries
    }));

    console.log("All changes saved");
    return { ...prevDetails, experience: updatedExperience };
  });

  setIsEditing(false);
  setCardEditingStates((prev) => prev.map(() => false)); // Reset all cards to non-editing state
  // setEditingCardIndex(null); // Reset card editing state
};

// Function to handle editing a specific card
const handleCardEdit = (index) => {
  const updatedStates = [...cardEditingStates];
  updatedStates[index] = true; // Enable editing for the specific card
  setCardEditingStates(updatedStates);
};

// Function to handle saving a specific card
const handleCardSave = (index) => {
  const updatedStates = [...cardEditingStates];
  updatedStates[index] = false; // Disable editing for the specific card
  setCardEditingStates(updatedStates);
};

const saveCardChanges = (index) => {
  // Save changes for a specific card
  setUserDetails((prevDetails) => {
    const updatedExperience = prevDetails.experience.map((entry, i) =>
      i === index ? { ...entry, isEditable: false } : entry
    );

    return { ...prevDetails, experience: updatedExperience };
  });

  setEditingCardIndex(null); // Exit card editing mode
};

const startCardEditing = (index) => {
  setEditingCardIndex(index);
};



// Add skill/hobby
const addSelection = (arrayName, value) => {
  const lowercaseValue = value.toLowerCase();

  setUserDetails((prevDetails) => {
    const updatedArray = [...new Set([...prevDetails[arrayName], lowercaseValue])];

    return {
      ...prevDetails,
      [arrayName]: updatedArray,
    };
  });

  // Update skill/hobby options if it's a new value
  if (arrayName === "skills" && !skillOptions.includes(lowercaseValue)) {
    setSkillOptions((prev) => [...prev, lowercaseValue]);
  } else if (arrayName === "hobbies" && !hobbyOptions.includes(lowercaseValue)) {
    setHobbyOptions((prev) => [...prev, lowercaseValue]);
  }

  setSearchTerm((prev) => ({ ...prev, [arrayName]: "" }));
};

// Search term change
const handleSearchChange = (e, arrayName) => {
  setSearchTerm({ ...searchTerm, [arrayName]: e.target.value });
};

// Remove dynamic entries
const removeEntry = (field, index) => {
  const updatedField = userDetails[field].filter((_, i) => i !== index);

  // Update userDetails state
  setUserDetails((prevDetails) => ({
    ...prevDetails,
    [field]: updatedField,
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
  const formRef = ref(db, "userDetailss/" + userDetails.uid); // Reference to your userDetails data in the database
  await set(formRef, formData); // Save the form data
};

// Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log(userDetails.uid);

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
  console.log("userDetails UID:", userDetails.uid);

  try {
    // // Perform validation for the current step
    // const isValid = await validateStep(activeStep);

    // if (!isValid) {
    //   console.log("Validation failed for step:", activeStep);
    //   alert(`Please complete all required fields in step ${activeStep + 1} before submitting.`);
    //   return; // Stop submission if validation fails
    // }

    const db = getDatabase(); // Initialize Firebase Realtime Database

    // Reference to the userDetails's portfolio node
    const portfolioRef = dbRef(db, `portfolioId/${userDetails.uid}`);

    // Check if the userDetails already has a portfolio
    const snapshot = await get(portfolioRef);
    if (snapshot.exists()) {
      console.log("userDetails already has a portfolio:", snapshot.val());
      alert(
        "You already have a portfolio link. You cannot create another one."
      );
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
      userDetailsId: userDetails.uid,
      image: imageUrl, // Store the image URL in portfolio data
      uniqueLink: `${window.location.origin}/${uniqueLink}`, // Full unique link
      createdAt: Date.now(), // Timestamp for when the portfolio was created
    };

    // Save the portfolio data to Firebase under the userDetails's UID
    await set(portfolioRef, portfolioData);

    // Save the userDetails data to Firebase under the userDetails's UID
    await savePortfolioDataToFirebase(formData, userDetails.uid);

    // Reset form state or show a success message
    console.log("Portfolio data saved successfully!", portfolioData);
    alert("Portfolio created successfully!");

    console.log(formData);

    // await new Promise((resolve) => setTimeout(resolve, 5000)); // 2 seconds delay

    setHasPortfolio(true);
    navigate(location.pathname, { replace: true }); // Refresh the current route
  } catch (error) {
    console.error("Error saving portfolio data to Firebase:", error);
  } finally {
    setIsLoading(false);
    navigate(location.pathname, { replace: true });
  }
};



  return (
    <div className="w-full flex flex-col  text-foreground bg-background p-5 gap-10">
      {/* personal info */}
      <div className="w-full border-2 p-5 rounded-md relative">
        <div className="absolute -top-4 left-4 bg-background px-2">
          <h1 className="text-lg font-bold">Personal Info</h1>
        </div>

        <div className=" flex flex-col gap-2">
          <div className="flex justify-between gap-5">
            <div className="w-2/4 relative flex items-center gap-2">
              <Label htmlFor="name" className="min-w-fit">
                Name :
              </Label>
              <Input
                type="text"
                value={userDetails?.name || ""}
                disabled
                className="w-full border-2 text-foreground bg-background "
              />
            </div>

            <div className="w-2/4 relative flex items-center gap-2">
              <Label htmlFor="surname" className="min-w-fit">
                Surname :
              </Label>
              <Input
                type="text"
                value={userDetails?.surname || ""}
                disabled
                className="w-full border-2 text-foreground bg-background"
              />
            </div>
          </div>

          <div className="w-full flex justify-between gap-5">
            <div className="w-2/4  flex items-center gap-2">
              <Label htmlFor="email" className="min-w-fit">
                Email :
              </Label>
              <Input
                type="text"
                value={userDetails?.email || ""}
                disabled
                className="w-full border-2 text-foreground bg-background "
              />
            </div>

            <div className="w-2/4 flex items-center gap-2">
              <Label for="phoneNo" className="min-w-fit">
                Phone No :
              </Label>
              <Input
                type="text"
                value={userDetails?.phoneNo || ""}
                disabled
                className="w-full border-2 text-foreground bg-background"
              />
            </div>
          </div>

          <div className="w-full flex justify-between gap-5">
            <div className="w-2/4 flex items-center gap-2">
              <Label for="gender" className="min-w-fit">
                Gender :
              </Label>
              <Input
                type="text"
                value={userDetails?.gender || ""}
                disabled
                className="w-full border-2 text-foreground bg-background"
              />
            </div>

            <div className="w-2/4 flex items-center gap-2">
              <Label for="address" className="min-w-fit">
                Address :
              </Label>
              <Input
                type="text"
                value={userDetails?.address || ""}
                disabled
                className="w-full border-2 text-foreground bg-background"
              />
            </div>
          </div>
        </div>
      </div>
      {/* <PersonalInfo /> */}
      {/* <SocialLinks/> */}
      {/* social info */}
      <div className="w-full border-2 p-5 rounded-md relative">
        <div className="absolute -top-4 left-4 bg-background px-2">
          <h1 className="text-lg font-bold">Social Info</h1>
        </div>

        <div className="flex flex-col gap-2">
          {userDetails?.socialLink?.[0] && (
            <>
              {/* First block */}
              <div className=" flex gap-5">
                <div className="flex w-2/4 items-center gap-2">
                  <label htmlFor="linkedIn" className="min-w-fit capitalize">
                    LinkedIn:
                  </label>
                  <Input
                    type="text"
                    value={userDetails.socialLink[0]?.linkedIn || ""}
                    disabled
                    className="w-full border-2 text-foreground bg-background"
                  />
                </div>
                <div className="flex w-2/4 items-center gap-2">
                  <label htmlFor="instagram" className="min-w-fit capitalize">
                    Instagram:
                  </label>
                  <Input
                    type="text"
                    value={userDetails.socialLink[0]?.instagram || ""}
                    disabled
                    className="w-full border-2 text-foreground bg-background"
                  />
                </div>
              </div>

              {/* Second block */}
              <div className="flex gap-5">
                <div className="flex w-2/4 items-center gap-2">
                  <label htmlFor="gitHub" className="min-w-fit capitalize">
                    GitHub:
                  </label>
                  <Input
                    type="text"
                    value={userDetails.socialLink[0]?.gitHub || ""}
                    disabled
                    className="w-full border-2 text-foreground bg-background"
                  />
                </div>
                <div className="flex w-2/4 items-center gap-2">
                  <label htmlFor="tweeter" className="min-w-fit capitalize">
                    Twitter:
                  </label>
                  <Input
                    type="text"
                    value={userDetails.socialLink[0]?.tweeter || ""}
                    disabled
                    className="w-full border-2 text-foreground bg-background"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* education info */}
      <div className="w-full border-2 p-5 rounded-md relative">
        <div className="absolute -top-4 left-4 bg-background px-2">
          <h1 className="text-lg font-bold">Educational Info</h1>
        </div>

        <div className="flex  gap-5">
          {userDetails?.colleges?.map((college, index) => (
            <div
              key={index}
              className="flex flex-col w-2/4 gap-5 border-2 border-gray-300 p-3 rounded-md bg-background shadow-md"
            >
              {/* College Name and Course */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-foreground min-w-fit">
                  College Name :
                </label>
                <Input
                  type="text"
                  value={college.collegeName || "N/A"}
                  disabled
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="College Name"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-foreground min-w-fit">
                  Course :
                </label>
                <Input
                  type="text"
                  value={college.course || "N/A"}
                  disabled
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="Course"
                />
              </div>

              {/* Grade and Grade Type */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-foreground min-w-fit">
                  Grade :
                </label>
                <Input
                  type="text"
                  value={`${college.grade || "N/A"} ${
                    college.gradeType || "N/A"
                  }`}
                  disabled
                  className="border-2 text-foreground bg-background p-2 "
                  placeholder="Grade & Grade Type"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* professional info */}
      <div className="w-full border-2 p-5 rounded-md relative">
  {/* Parent Container Edit/Save Buttons */}
  <div className="flex justify-between items-center mb-3 ">
    {isEditing ? (
      <button
        onClick={saveChanges}
        className={`px-4 py-2 rounded-md ${
          allCardsSaved
            ? "bg-green-500 text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        disabled={!allCardsSaved}
      >
        Save All
      </button>
    ) : (
      <button
        onClick={() => setIsEditing(true)}
        className="bg-yellow-500 text-white px-4 py-2 rounded-md"
      >
        Edit All
      </button>
    )}
  </div>

  {/* Add Experience Button */}
  {isEditing && (
    <button
      onClick={() => addEntry("experience")}
      className=" text-white px-4 py-2 rounded-md mb-3 bg-yellow-500"
    >
      Add Experience
    </button>
  )}

  <div className="absolute -top-4 left-4 bg-background px-2">
    <h1 className="text-lg font-bold">Professional Info</h1>
  </div>

  <div className="grid grid-cols-2 gap-5 w-full border-2">
    {userDetails?.experience?.map((exp, index) => (
      <div
        key={index}
        className="grid grid-cols-2 gap-2 border-2 border-gray-50 p-3 rounded-md bg-background shadow-md relative"
      >
        {cardEditingStates[index] && (
          <div className="absolute top-2 right-2 flex gap-2">
            {/* Save Button */}
            <button
              onClick={() => handleCardSave(index)}
              className="bg-green-500 text-white px-2 py-1 rounded-md"
            >
              Save
            </button>
            {/* Delete Button */}
            <button
              onClick={() => removeEntry("experience", index)}
              className="bg-red-500 text-white px-2 py-1 rounded-md"
            >
              Delete
            </button>
          </div>
        )}

        {/* Company Name and Address */}
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm font-medium text-foreground">
            Company Name
          </label>
          <Input
            type="text"
            value={exp.companyName || ""} // Ensuring that value is always a string
            onChange={(e) => handleInputChange(e, "experience", index, "companyName")}
            disabled={!cardEditingStates[index]}
            className="border-2 text-foreground bg-background p-2"
            placeholder="Company Name"
          />
          {errors[index]?.companyName && (
            <span className="text-red-500 text-sm">
              {errors[index].companyName}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm font-medium text-foreground">
            Company Address
          </label>
          <Input
            type="text"
            value={exp.companyAddress || ""}
            onChange={(e) => handleInputChange(e, "experience", index, "companyAddress")}
            disabled={!cardEditingStates[index]}
            className="border-2 text-foreground bg-background p-2"
            placeholder="Company Address"
          />
        </div>

        {/* Job Role and Years of Experience */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Job Role
          </label>
          <Input
            type="text"
            value={exp.jobRole || ""}
            onChange={(e) => handleInputChange(e, "experience", index, "jobRole")}
            disabled={!cardEditingStates[index]}
            className="border-2 text-foreground bg-background p-2"
            placeholder="Job Role"
          />
          {errors[index]?.jobRole && (
            <span className="text-red-500 text-sm">
              {errors[index].jobRole}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Years of Experience
          </label>
          <Input
            type="text"
            value={exp.jobExperience || ""}
            onChange={(e) => handleInputChange(e, "experience", index, "jobExperience")}
            disabled={!cardEditingStates[index]}
            className="border-2 text-foreground bg-background p-2"
            placeholder="Years of Experience"
          />
          {errors[index]?.jobExperience && (
            <span className="text-red-500 text-sm">
              {errors[index].jobExperience}
            </span>
          )}
        </div>

        {/* Job Description */}
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Job Description
          </label>
          <textarea
            value={exp.jobDescription || ""}
            onChange={(e) => handleInputChange(e, "experience", index, "jobDescription")}
            disabled={!cardEditingStates[index]}
            className="border-2 text-foreground bg-background p-2 w-full resize-none"
            placeholder="Job Description"
            rows={4}
          />
          {errors[index]?.jobDescription && (
            <span className="text-red-500 text-sm">
              {errors[index].jobDescription}
            </span>
          )}
        </div>

        {/* Edit Button */}
        {isEditing && !cardEditingStates[index] && (
          <div className="mt-3">
            <button
              onClick={() => handleCardEdit(index)}
              className="bg-yellow-500 text-white px-2 py-1 rounded-md"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
</div>




      {/* skills functionality is update*/}
      <div className="mb-5">
        <label>Skills</label>
        <input
          type="text"
          placeholder="Search or add a skill"
          value={searchTerm.skills || ""}
          onChange={(e) => handleSearchChange(e, "skills")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchTerm.skills.trim()) {
              addSelection("skills", searchTerm.skills.trim().toLowerCase());
              e.preventDefault();
            }
          }}
          className="w-full px-2 border h-10 rounded-md mb-1 "
        />
        <div className="flex flex-wrap gap-2 mb-1 mt-2">
          {searchTerm.skills &&
            skillOptions
              .filter((skill) =>
                skill.toLowerCase().includes(searchTerm.skills.toLowerCase())
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
          {userDetails?.skills?.map((skill, index) => (
            <div
              key={`skill-${index}`}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center gap-2"
            >
              {skill}
              <TrashIcon
                className="w-4 h-4 cursor-pointer "
                onClick={() => removeEntry("skills", index)}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
