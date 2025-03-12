import React, { useEffect, useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import * as Yup from "yup";
import { storage } from "../../firebase"; // Adjust the import according to your setup
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { set, ref as dbRef, get, getDatabase } from "firebase/database";
import {
  Check,
  CheckSquare,
  Pencil,
  X,
  TrashIcon,
} from "lucide-react";

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
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export default function Profile({ userId, userDetails, setUserDetails }) {
  // const { userDetails,setUserDetails } = useUserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isCardEditing, setIsCardEditing] = useState(false); // used to edit education cards
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [isSkillEditing, setIsSkillEditing] = useState(false);
  const [isSkillEdit, setIsSkillEdit] = useState(false);

  const [cardEditingStates, setCardEditingStates] = useState(
    Array(userDetails?.experience?.length || 0).fill(false)
  );

  const [collegeEditingStates, setCollegeEditingStates] = useState(
    Array(userDetails?.colleges?.length || 0).fill(false)
  );
  const [allCardsSaved, setAllCardsSaved] = useState(true);
  const [allCollegeCardsSaved, setAllCollegeCardsSaved] = useState(true);


  // seperate name field into fname, lname
  const [firstname, ...rest] = userDetails?.name?.split(" ") || [""]; // Safeguard against undefined
  const surname = rest.length > 0 ? rest.join(" ") : ""; // Handle case where rest is empty

 const [errors, setErrors] = useState({});

 
  useEffect(() => {
    console.log("Profile Data: ",userDetails);
  }, [])
 
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
    twitter: Yup.string(),
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
  
  /** Social link methods starts */
  const [socialData, setSocialData] = useState(userDetails?.socialLink?.[0] || {});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocialData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Save updated data
  
  const toggleEdit = () => {
    setIsSkillEdit(!isSkillEdit);
  };

  const saveSkillChanges = () => {
    // Implement your save logic here
    // For example, you might want to send the updated skills to a server
    console.log("skillOptions: ", userDetails.skills)
    
    toggleEdit(); // Switch back to view mode after saving
  }

  /** Social link methods end */

  // Add a new college entry
  const addCollege = () => {
    setUserDetails((prevDetails) => {
      const updatedColleges = [...prevDetails.colleges];
      const lastIndex = updatedColleges.length - 1;
  
      // Validate the last entry before adding a new one
      if (lastIndex >= 0) {
        const lastEntry = updatedColleges[lastIndex];
        const errors = {};
  
        if (!lastEntry.collegeName?.trim())
          errors.collegeName = "College name is required.";
        if (!lastEntry.course?.trim()) errors.course = "Course is required.";
        if (!lastEntry.grade?.trim()) errors.grade = "Grade is required.";
        if (!lastEntry.description?.trim())
          errors.description = "College Description is required.";
  
        if (Object.keys(errors).length > 0) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [lastIndex]: errors,
          }));
          return prevDetails;
        }
      }
  
      // Add a new blank entry
      const newEntry = {
        collegeName: "",
        course: "",
        grade: "",
        gradeType: "",
        description: "",
        isEditable: true,
      };
  
      return {
        ...prevDetails,
        colleges: [...updatedColleges, newEntry],
      };
    });
  
    // Enable editing for the new entry
    setCollegeEditingStates((prev) => [...prev, true]);
  };
  

  // Remove a college entry
  const removeCollege = (field, index) => {
    setUserDetails((prevDetails) => {
      const updatedColleges = prevDetails.colleges.filter((_, i) => i !== index);
      return { ...prevDetails, colleges: updatedColleges };
    });
  
    // Update collegeEditingStates correctly
    setCollegeEditingStates((prev) => prev.filter((_, i) => i !== index));
  
    // Ensure no orphaned errors remain
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (updatedErrors.colleges) {
        delete updatedErrors.colleges[index];
      }
      return updatedErrors;
    });
  };
  

  const handleEducationSave = (index) => {
    const updatedStates = [...collegeEditingStates];
    updatedStates[index] = false; // Disable editing for this card
    setCollegeEditingStates(updatedStates);
  };

  const saveAllEducation = (index) => {
    // const handleCardSave = (index) => {
      setUserDetails((prevDetails) => {
        const updatedColleges = [...prevDetails.colleges];
        const currentEntry = updatedColleges[index];
  
        // Initialize an object to store errors
        const errors = {};
  
        // Validate required fields
        if (!currentEntry.collegeName?.trim())
          errors.collegeName = "College name is required.";
        if (!currentEntry.course?.trim())
          errors.course = "Address is required.";
        if (!currentEntry.grade?.trim())
          errors.grade = "Grade is required.";
        if (!currentEntry.description?.trim())
          errors.description = "College Description is required.";

        // If validation fails, set errors and prevent saving
        if (Object.keys(errors).length > 0) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            colleges: { ...prevErrors.colleges, [index]: errors },
          }));
          return prevDetails; // Stop the update
        }
  
        // Clear errors for the saved entry
        setErrors((prevErrors) => ({
          ...prevErrors,
          colleges: { ...prevErrors.colleges, [index]: {} },
        }));
  
        // Disable editing for the specific card after successful validation
        const updatedStates = [...cardEditingStates];
        updatedStates[index] = false;
        setCollegeEditingStates(updatedStates);
  
        return prevDetails; // Ensure state is updated correctly
      });
    // };
  };

  const [skillOptions, setSkillOptions] = useState([
    "JavaScript",
    "React",
    "CSS",
    "Python",
    "Project Management",
  ]);
  const [searchTerm, setSearchTerm] = useState({ skills: "", hobbies: "" });

  const [hobbyOptions, setHobbyOptions] = useState([
    "Reading",
    "Traveling",
    "Cooking",
  ]);

  // Add dynamic entries
  const addEntry = () => {
    setUserDetails((prevDetails) => {
      const updatedExperience = [...prevDetails.experience];
      const lastIndex = updatedExperience.length - 1;

      // Initialize an object to store errors
      const errors = {};

      // Validate the last entry if it exists
      if (lastIndex >= 0) {
        const lastEntry = updatedExperience[lastIndex];

        if (!lastEntry.companyName?.trim())
          errors.companyName = "Company name is required.";
        // if (!lastEntry.companyAddress?.trim()) errors.companyAddress = "Address is required.";
        if (!lastEntry.jobRole?.trim())
          errors.jobRole = "Job role is required.";
        if (!lastEntry.jobExperience?.trim())
          errors.jobExperience = "Experience is required.";
        if (!lastEntry.jobDescription?.trim())
          errors.jobDescription = "Description is required.";

        // If validation fails, set errors and prevent a new entry
        if (Object.keys(errors).length > 0) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            experience: { ...prevErrors.experience, [lastIndex]: errors },
          }));
          return prevDetails; // Stop the update
        }

        // Clear errors for the last entry if all fields are valid
        setErrors((prevErrors) => ({
          ...prevErrors,
          experience: { ...prevErrors.experience, [lastIndex]: {} },
        }));
      }

      // Add a new blank experience entry
      const newEntry = {
        companyName: "",
        companyAddress: "",
        jobRole: "",
        jobExperience: "",
        jobDuration: "",
        jobDescription: "",
        isEditable: true,
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

  useEffect(() => {
    setAllCollegeCardsSaved(collegeEditingStates.every((state) => !state));
  }, [collegeEditingStates]);
  

  const saveCollegeChanges = () => {
    let hasErrors = false;
    const newErrors = {};

    // Validate each experience entry
    userDetails.colleges.forEach((entry, index) => {
      const errors = {};

      if (!entry.collegeName?.trim())
        errors.collegeName = "Name is required.";
      if (!entry.course?.trim()) 
        errors.course = "course is required.";
      if (!entry.grade?.trim())
        errors.grade = "Grade is required.";
      // if (!entry.gradeType?.trim())
      //   errors.gradeType = "Grade Type is required.";

      if (Object.keys(errors).length > 0) {
        newErrors[index] = errors; // Store errors for the specific card
        hasErrors = true;
      }
    });

    // If there are validation errors, prevent saving and show errors
    if (hasErrors) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        colleges: newErrors, // Store errors at the correct experience index
      }));
      alert("Please fill in all required fields before saving.");
      return;
    }

    // Ensure all cards are saved
    const allSaved = userDetails.colleges.every(
      (_, index) => !collegeEditingStates[index]
    );

    if (!allSaved) {
      alert("Please save all individual cards before saving parent changes.");
      return;
    }

    // If validation passes, save all changes
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      colleges: prevDetails.colleges.map((entry) => ({
        ...entry,
        isEditable: false, // Disable editing for all entries
      })),
    }));

    console.log("All changes saved");

    setIsCardEditing(false);
    setCollegeEditingStates((prev) => prev.map(() => false)); // Reset all cards to non-editing state
    setErrors({}); // Clear errors after successful save
  };

  // save and check experience changes
  const saveChanges = () => {
    let hasErrors = false;
    const newErrors = {};

    // Validate each experience entry
    userDetails.experience.forEach((entry, index) => {
      const errors = {};

      if (!entry.companyName?.trim())
        errors.companyName = "Company name is required.";
      if (!entry.jobRole?.trim()) errors.jobRole = "Job role is required.";
      if (!entry.jobExperience?.trim())
        errors.jobExperience = "Experience is required.";
      if (!entry.jobDescription?.trim())
        errors.jobDescription = "Description is required.";

      if (Object.keys(errors).length > 0) {
        newErrors[index] = errors; // Store errors for the specific card
        hasErrors = true;
      }
    });

    // If there are validation errors, prevent saving and show errors
    if (hasErrors) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        experience: newErrors, // Store errors at the correct experience index
      }));
      alert("Please fill in all required fields before saving.");
      return;
    }

    // Ensure all cards are saved
    const allSaved = userDetails.experience.every(
      (_, index) => !cardEditingStates[index]
    );

    if (!allSaved) {
      alert("Please save all individual cards before saving parent changes.");
      return;
    }

    // If validation passes, save all changes
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      experience: prevDetails.experience.map((entry) => ({
        ...entry,
        isEditable: false, // Disable editing for all entries
      })),
    }));

    console.log("All changes saved");

    setIsEditing(false);
    setCardEditingStates((prev) => prev.map(() => false)); // Reset all cards to non-editing state
    setErrors({}); // Clear errors after successful save
  };


  // Function to handle editing a specific card
  const handleCardEdit = (index) => {
    const updatedStates = [...cardEditingStates ];
    updatedStates[index] = true; // Enable editing for the specific card
    setCardEditingStates(updatedStates);
  };

  const handleCollegeCardEdit = (index) => {
    const updatedStates = [...collegeEditingStates ];
    updatedStates[index] = true; // Enable editing for the specific card
    setCollegeEditingStates(updatedStates);
  };

  // Function to handle saving a specific card
  const handleCardSave = (index) => {
    setUserDetails((prevDetails) => {
      const updatedExperience = [...prevDetails.experience];
      const currentEntry = updatedExperience[index];

      // Initialize an object to store errors
      const errors = {};

      // Validate required fields
      if (!currentEntry.companyName?.trim())
        errors.companyName = "Company name is required.";
      if (!currentEntry.companyAddress?.trim())
        errors.companyAddress = "Address is required.";
      if (!currentEntry.jobRole?.trim())
        errors.jobRole = "Job role is required.";
      if (!currentEntry.jobExperience?.trim())
        errors.jobExperience = "Experience is required.";
      if (!currentEntry.jobDescription?.trim())
        errors.jobDescription = "Description is required.";

      // If validation fails, set errors and prevent saving
      if (Object.keys(errors).length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          experience: { ...prevErrors.experience, [index]: errors },
        }));
        return prevDetails; // Stop the update
      }

      // Clear errors for the saved entry
      setErrors((prevErrors) => ({
        ...prevErrors,
        experience: { ...prevErrors.experience, [index]: {} },
      }));

      // Disable editing for the specific card after successful validation
      const updatedStates = [...cardEditingStates];
      updatedStates[index] = false;
      setCardEditingStates(updatedStates);

      return prevDetails; // Ensure state is updated correctly
    });
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
      const updatedArray = [
        ...new Set([...prevDetails[arrayName], lowercaseValue]),
      ];

      return {
        ...prevDetails,
        [arrayName]: updatedArray,
      };
    });

    // Update skill/hobby options if it's a new value
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

  // Remove dynamic entries
  const removeEntry = (field, index) => {
    setUserDetails((prevDetails) => {
      const updatedExperience = prevDetails.experience.filter(
        (_, i) => i !== index
      );
      return { ...prevDetails, experience: updatedExperience };
    });

    // Update cardEditingStates correctly
    setCardEditingStates((prev) => prev.filter((_, i) => i !== index));

    // Ensure no orphaned errors remain
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (updatedErrors.experience) {
        delete updatedErrors.experience[index];
      }
      return updatedErrors;
    });
  };

  // remove skills
 // Function to remove a skill entry
const removeSkillEntry = (index) => {
  setUserDetails((prevDetails) => {
    const updatedSkills = prevDetails.skills.filter((_, i) => i !== index);
    return { ...prevDetails, skills: updatedSkills };
  });

  // No need to update isSkillEditing since it's a boolean
  // If you need to track editing states, consider using an array or object

  // Update errors correctly
  setErrors((prevErrors) => {
    const updatedErrors = { ...prevErrors };
    if (updatedErrors.skills) {
      delete updatedErrors.skills[index];
    }
    return updatedErrors;
  });
};




  // Save data into Firebase
  const saveFormDataToFirebase = async () => {
    const db = getDatabase();
    const formRef = ref(db, "userDetailss/" + userDetails.uid); // Reference to your userDetails data in the database
    await set(formRef, formData); // Save the form data
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true);
    console.log(formData.image);
    console.log("userDetails UID:", userDetails.uid);

    try {

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
        const uploadTask = await uploadBytesResumable(
          storageRef,
          formData.image
        );
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
    <div data-aos="fade-left" className="w-full flex flex-col  text-foreground bg-background p-5 gap-10 rounded-md ">
     
      {/* education info */}
      <div className="w-full border-2 p-3 rounded-md relative">
        <div className="flex justify-between items-center mb-3 ">
          {isCardEditing ? (
            <button
              onClick={saveCollegeChanges}
              className={`p-1 rounded-sm absolute -top-4 right-3 ${
                allCollegeCardsSaved
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={!allCollegeCardsSaved}
              title={"Save"}
            >
              <CheckSquare size={15} />
            </button>
          ) : (
            <button
              onClick={() => setIsCardEditing(true)}
              className="bg-slate-500 text-white p-1 rounded-sm absolute -top-3 right-3"
              title={"Edit"}
            >
              <Pencil size={15} />
            </button>
          )}
        </div>
        {isCardEditing && (
          <button
            onClick={() => addCollege("college")}
            className="bg-button text-button-textColor hover:bg-button-hover px-4 py-2 rounded-md mb-3 "
          >
            Add College
          </button>
        )}

        <div className="absolute -top-4 left-4 bg-background px-2">
          <h1 className="text-lg font-bold">Educational Info</h1>
        </div>
        
        <div className="flex gap-5 justify-around items-center flex-wrap">
          {userDetails?.colleges?.map((college, index) => (
            <div
              key={index}
              className="min-w-[400px] w-[400px] max-w-[500px] flex flex-col flex-wrap gap-5 border-2 border-gray-300 p-3 rounded-md bg-background shadow-md relative"
            >
              {collegeEditingStates[index] && (
                <div className=" absolute -top-3 right-2 bg-background px-2 flex gap-2">
                  <button
                    onClick={() => removeCollege("colleges", index)}
                    className="bg-red-500 text-white p-1 rounded-sm "
                    title="delete"
                  >
                    <X size={15} />
                  </button>

                  <button
                    onClick={() => saveAllEducation(index)}
                    className="bg-green-500 text-white p-1 rounded-sm "
                    title="save"
                  >
                    <Check size={15} />
                  </button>
                </div>
              )}

              <div className="flex gap-2 flex-col ">
                <label className="text-sm font-medium text-foreground min-w-fit">
                  College Name:
                </label>
                <Input
                  type="text"
                  value={college.collegeName}
                  onChange={(e) =>
                    handleInputChange(e, "colleges", index, "collegeName")
                  }
                  disabled={!collegeEditingStates[index]}
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="College Name"
                />
                {errors.colleges?.[index]?.collegeName && (
                  <span className="text-red-500 text-sm">
                    {errors.colleges[index].collegeName}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-2 ">
                  <label className="text-sm font-medium text-foreground min-w-fit">
                    Course:
                  </label>
                  <Input
                    type="text"
                    value={college.course}
                    onChange={(e) => handleInputChange(e, "colleges", index, "course")}
                    disabled={!collegeEditingStates[index]}
                    className="border-2 text-foreground bg-background p-2"
                    placeholder="Course"
                  />
                  {errors.colleges?.[index]?.course && (
                    <span className="text-red-500 text-sm">
                      {errors.colleges[index].course}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 ">
                  <label className="text-sm font-medium text-foreground min-w-fit">
                    Grade:
                  </label>
                  <div className="flex flex-col" >
                  <div className="flex gap-2 ">
                    {collegeEditingStates[index] ? (
                      <>
                        <Input
                          type="text"
                          value={college.grade}
                          onChange={(e) => {
                            const { value } = e.target;
                            if (college.gradeType === "CGPA" && value > 10) {
                              alert("CGPA must be less than or equal to 10");
                              return;
                            }
                            if (college.gradeType === "Percentage" && value > 100) {
                              alert("Percentage must be less than or equal to 100");
                              return;
                            }
                            handleInputChange(e, "colleges", index, "grade");
                          }}className="border-2 text-foreground bg-background p-2 w-32"
                          placeholder="Grade"
                        />
                        <select
                          value={college.gradeType}
                          onChange={(e) => handleInputChange(e, "colleges", index, "gradeType")}
                          className="border-2 text-foreground bg-background p-2 w-32"
                        >
                          <option value="%">%</option>
                          <option value="CGPA">CGPA</option>
                        </select>
                      </>
                    ) : (
                      <Input
                        type="text"
                        value={`${college.grade} ${college.gradeType}`}
                        disabled={!collegeEditingStates[index]}
                        className="border-2 text-foreground bg-background p-2 w-32"
                        placeholder="Grade"
                      />
                    )}
                    </div>
                    {errors.colleges?.[index]?.grade && (
                      <span className="text-red-500 text-sm">
                        {errors.colleges[index].grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-col ">
                <label className="text-sm font-medium text-foreground min-w-fit">
                  College Description:
                </label>
                <Input
                  type="text"
                  value={college.description}
                  onChange={(e) =>
                    handleInputChange(e, "colleges", index, "description")
                  }
                  disabled={!collegeEditingStates[index]}
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="College Name"
                />
                {errors.colleges?.[index]?.description && (
                  <span className="text-red-500 text-sm">
                    {errors.colleges[index].description}
                  </span>
                )}
              </div>

              {isCardEditing && !collegeEditingStates[index] && (
                <div className="mt-3">
                  <button
                    onClick={() => handleCollegeCardEdit(index)}
                    className="bg-slate-500 text-white p-1 rounded-sm absolute -top-3 right-3"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
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
              className={`p-1 rounded-sm absolute -top-4 right-3 ${
                allCardsSaved
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={!allCardsSaved}
              title={"Save"}
            >
              <CheckSquare size={15} />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-500 text-white p-1 rounded-sm absolute -top-3 right-3"
              title={"Edit"}
            >
              <Pencil size={15} />
              {/* Edit All */}
            </button>
          )}
        </div>

        {/* Add Experience Button */}
        {isEditing && (
          <button
            onClick={() => addEntry("experience")}
            className=" bg-button text-button-textColor hover:bg-button-hover px-4 py-2 rounded-md mb-3 "
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
              className="  grid grid-cols-2 gap-2 border-2 border-gray-50 p-3 rounded-md bg-background shadow-md relative"
            >
              {cardEditingStates[index] && (
                <div className=" absolute -top-3 right-2 bg-background px-2 flex gap-2">
                  {/* Delete Button */}
                  <button
                    onClick={() => removeEntry("experience", index)}
                    className="bg-red-500 text-white p-1 rounded-sm "
                    title="delete"
                  >
                    <X size={15} />
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={() => handleCardSave(index)}
                    className="bg-green-500 text-white p-1 rounded-sm "
                    title="save"
                  >
                    <Check size={15} />
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
                  onChange={(e) =>
                    handleInputChange(e, "experience", index, "companyName")
                  }
                  disabled={!cardEditingStates[index]}
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="Company Name"
                />
                {errors.experience?.[index]?.companyName && (
                  <span className="text-red-500 text-xs">
                    {errors.experience[index].companyName}
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
                  onChange={(e) =>
                    handleInputChange(e, "experience", index, "companyAddress")
                  }
                  disabled={!cardEditingStates[index]}
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="Company Address"
                />
                {errors.experience?.[index]?.companyAddress && (
                  <span className="text-red-500 text-xs">
                    {errors.experience[index].companyAddress}
                  </span>
                )}
              </div>

              {/* Job Role and Years of Experience */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">
                  Job Role
                </label>
                <Input
                  type="text"
                  value={exp.jobRole || ""}
                  onChange={(e) =>
                    handleInputChange(e, "experience", index, "jobRole")
                  }
                  disabled={!cardEditingStates[index]}
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="Job Role"
                />
                {errors.experience?.[index]?.jobRole && (
                  <span className="text-red-500 text-xs">
                    {errors.experience[index].jobRole}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">
                  Years of Experience
                </label>
                {cardEditingStates[index] ? (
                      <span className={`flex gap-2 flex-wrap`}>
                        <Input
                          type="text"
                          value={exp.jobExperience}
                          onChange={(e) => {
                            const { value } = e.target;
                            // if (college.gradeType === "CGPA" && value > 10) {
                            //   alert("CGPA must be less than or equal to 10");
                            //   return;
                            // }
                            // if (college.gradeType === "Percentage" && value > 100) {
                            //   alert("Percentage must be less than or equal to 100");
                            //   return;
                            // }
                            handleInputChange(e, "experience", index, "jobExperience");
                          }} 
                          className="border-2 text-foreground bg-background p-2 w-32"
                          placeholder="Grade"
                        />
                        <select
                          value={exp.jobDuration}
                          onChange={(e) => handleInputChange(e, "experience", index, "jobDuration") }
                          className="border-2 text-foreground bg-background p-2 w-32"
                        >
                          <option value="Year">Year</option>
                          <option value="Month">Month</option>
                        </select>
                      </span>
                    ) : (
                      <Input
                        type="text"
                        value={`${exp.jobExperience} ${exp.jobDuration}`}
                        disabled={!cardEditingStates[index]}
                        className="border-2 text-foreground bg-background p-2 w-32"
                        placeholder="Grade"
                      />
                    )}

                {/* <Input
                  type="text"
                  value={exp.jobExperience || ""}
                  onChange={(e) =>
                    handleInputChange(e, "experience", index, "jobExperience")
                  }
                  disabled={!cardEditingStates[index]}
                  className="border-2 text-foreground bg-background p-2"
                  placeholder="Years of Experience"
                /> */}
                {errors.experience?.[index]?.jobExperience && (
                  <span className="text-red-500 text-xs">
                    {errors.experience[index].jobExperience}
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
                  onChange={(e) =>
                    handleInputChange(e, "experience", index, "jobDescription")
                  }
                  disabled={!cardEditingStates[index]}
                  className="border-2 text-foreground bg-background p-2 w-full resize-none"
                  placeholder="Job Description"
                  rows={4}
                />
                {errors.experience?.[index]?.jobDescription && (
                  <span className="text-red-500 text-xs">
                    {errors.experience[index].jobDescription}
                  </span>
                )}
              </div>

              {/* Edit Button */}
              {isEditing && !cardEditingStates[index] && (
                <div className="mt-3">
                  <button
                    onClick={() => handleCardEdit(index)}
                    className="bg-slate-500 text-white p-1 rounded-sm absolute -top-3 right-3"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* skills functionality is update*/}
      <div className="mb-5 border rounded-md relative">
      <div className="absolute -top-4 left-4 bg-background px-2">
          <h1 className="text-lg font-bold">Skills</h1>
        </div>
      <div className="flex justify-between mb-2 ">
        {isSkillEdit ? (
          <button onClick={saveSkillChanges} className="bg-green-500 text-white p-1 rounded-sm absolute -top-3 right-3" title="save">
           <CheckSquare size={15} />
          </button>
        ) : (
          <button onClick={toggleEdit} className="bg-slate-500 text-white p-1 rounded-sm absolute -top-3 right-3" title={"Edit"}>
            <Pencil size={15} />
          </button>
        )}
      </div>
      {isSkillEdit ? (
        <>
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
            className="w-full px-2 border h-10 rounded-md mb-1 mt-4 bg-transparent"
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
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => removeSkillEntry( index)}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          {userDetails?.skills?.map((skill, index) => (
            <div
              key={`skill-${index}`}
              className="px-3 py-1 mt-4 bg-blue-500 text-white rounded-lg flex items-center gap-2"
            >
              {skill}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
