import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarImage } from "./ui/avatar";
import {
  Camera,
  Download,
  FilePenLine,
  // NotepadText,
  Send,
  Upload,
} from "lucide-react";
import { useUserAuth } from "./UserAuthentication";
import { BsGithub } from "react-icons/bs";
import { Twitter, Instagram, Linkedin, Copy } from "lucide-react";
import {
  getAuth,
  sendEmailVerification,
  updateEmail,
  EmailAuthProvider,
} from "firebase/auth";
import { storage /* storage as storageRef */ } from "../../firebase"; // Adjust the import according to your setup
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { ref as dbRef, get, update, getDatabase } from "firebase/database";
// import save_changes from "../assets/Images/save_changes.png";
import Swal from "sweetalert2";

import * as yup from "yup";
import { useFormik } from "formik";
import LocationSearch from "./LocationSearch";
import { savePortfolioDataToFirebase } from "./PortfolioMethods";

export default function Settings() {
  const { user, userDetails, setUserDetails } = useUserAuth();
  const socialLinks = userDetails?.socialLink || [];
  const [profileImage, setProfileImage] = useState(userDetails?.image || null);
  const [, setResumeName] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState();

  // const [profileImage, setProfileImage] = useState(userDetails?.image || null); gsutil cors set cors.json gs://portfolio-builder-3e3a8.appspot.com

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    gender: yup.string().required("Gender is required"),
    surname: yup.string().required("Surname is required"),
    phoneNo: yup
      .string()
      .matches(
        /^\+[1-9]{1}[0-9]{1,3}\s?[1-9]{1}[0-9]{9}$/,
        "Phone number must include a valid country code and 10-digit number"
      )
      .required("Phone number is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    image: yup
      .string()
      .url("Invalid image URL")
      .required("Image URL is required"),
    resume: yup
      .string()
      .url("Invalid resume URL")
      .required("Resume URL is required"),
    socialLink: yup
      .array()
      .of(
        yup.object({
          gitHub: yup
            .string()
            .url("Invalid GitHub URL"),
          twitter: yup.string().url("Invalid Twitter URL"),
          instagram: yup.string().url("Invalid Instagram URL"),
          linkedIn: yup.string().url("Invalid LinkedIn URL"),
        })
      )
      .required("At least one social link is required"),
    address: yup.string().required("Address is required"),
    currentJobRole: yup.string().required("Current job role is required"),
  });

  // eslint-disable-next-line no-unused-vars
  const handleSave = async () => {
    // if (!emailConfirmed) {
    //   await Swal.fire({
    //     title: "Please wait",
    //     text: "Waiting for email confirmation...",
    //     icon: "info",
    //     confirmButtonText: "OK",
    //   });
    //   return;
    // }

    try {
      // Simulate saving data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await Swal.fire({
        title: "Success",
        text: "Data saved successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.log("Error: ", error);
      await Swal.fire({
        title: "Error",
        text: "Failed to save data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (userDetails) {
        console.log("User fetchData object:", user); // Log the user object
        if (userDetails?.uid) {
          const db = getDatabase();
          const portfolioRef = dbRef(db, `portfolioId/${user.uid}`);

          // Check if the user already has a portfolio
          const snapshot = await get(portfolioRef);
          if (snapshot.exists()) {
            const data = snapshot.val(); // Get the data object
            setPortfolioLink(data.uniqueLink); // Access the uniqueLink property
          } else {
            console.log("No user data available");
          }
        }
      } else {
        console.error("User  object is undefined");
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails]); // Add user as a dependency if it can change

  const formik = useFormik({
    initialValues: {
      name: userDetails?.name || "",
      surname: userDetails?.surname || "",
      gender: userDetails?.gender || "",
      email: userDetails?.email || "",
      phoneNo: userDetails?.phoneNo || "",
      image: userDetails?.image || "",
      resume: userDetails?.resume || "",
      socialLink: socialLinks,
      address: userDetails?.address || "",
      currentJobRole: userDetails?.currentJobRole || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!user || !user?.uid) {
        console.error("User  ID is missing");
        return;
      }

      try {
        let imageUrl = values.image;

        // Check if the email has changed
        // if (values.email !== userDetails?.email) {
        //   const userPassword = prompt("Please enter your password to confirm the email change:");
        //   await updateUserEmail(values.email, userPassword);
        //   console.log("Verification email sent to new email");
        //   return; // Stop form submission until email is verified
        // }

        // if (!emailConfirmed) {
        //   console.error("Email not verified yet.");
        //   return;
        // }

        const updatedFormData = { ...values, image: imageUrl };

        await savePortfolioDataToFirebase(updatedFormData, userDetails.uid);
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          ...updatedFormData,
        }));
        console.log("Form submitted successfully:", updatedFormData);
        await handleSave();
      } catch (error) {
        console.error("Form submission failed:", error);
      }
    },
  });

  const reauthenticateUser = async (password) => {
    const user = getAuth().currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    return await user.reauthenticateWithCredential(credential);
  };

  const updateUserEmail = async (newEmail, userPassword) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        // Reauthenticate the user
        await reauthenticateUser(userPassword);

        // Update the user's email first
        await updateEmail(user, newEmail);
        console.log("Email updated to the new email address.");

        // Now send a verification email to the new email address
        await sendEmailVerification(user);
        console.log(
          "Verification email sent to the new email address. Please verify your new email address."
        );

        // Wait for the user to verify the email
        const interval = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            clearInterval(interval);
            setEmailConfirmed(true); // Set emailConfirmed to true
            console.log("Email successfully verified.");
          }
        }, 3000);
      } catch (error) {
        handleEmailUpdateError(error);
      }
    } else {
      console.log("No user is signed in.");
    }
  };

  const handleEmailUpdateError = (error) => {
    if (error.code === "auth/email-already-in-use") {
      console.error("This email address is already in use.");
    } else if (error.code === "auth/invalid-email") {
      console.error("The email address is not valid.");
    } else if (error.code === "auth/operation-not-allowed") {
      console.error("Email/password accounts are not enabled.");
    } else {
      console.error("Error updating email: ", error.message);
    }
  };

  useEffect(() => {
    console.log("userDetails: ", userDetails);
    console.log("User: ", user);

    if (userDetails) {
      formik.setValues({
        name: userDetails.name || "",
        surname: userDetails.surname || "",
        gender: userDetails.gender || "",
        phoneNo: userDetails.phoneNo || "",
        email: userDetails.email || "",
        image: userDetails.image || "",
        resume: userDetails.resume || "",
        socialLink: socialLinks,
        address: userDetails.address || "",
        currentJobRole: userDetails.currentJobRole || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        formik.setFieldValue("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // upload or change the resume
  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type & size
    if (file.type !== "application/pdf") {
      console.error("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      console.error("File must be under 5MB.");
      return;
    }

    try {
      // Show waiting alert
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while your resume is being uploaded.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Show upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          Swal.fire("Error", "Resume upload failed.", "error");
          console.error("Resume upload failed:", error);
        },
        async () => {
          const fileURL = await getDownloadURL(uploadTask.snapshot.ref);

          // ✅ Save resume URL in Firebase Realtime Database under "Users" node
          const db = getDatabase();
          const userRef = dbRef(db, `Users/${user.uid}`);
          await update(userRef, { resume: fileURL });

          // ✅ Update Formik and UI
          formik.setFieldValue("resume", fileURL);
          setResumeName(file.name);
          setUserDetails((prevDetails) => ({
            ...prevDetails,
            resume: fileURL,
          }));
          // Show success alert
          Swal.fire("Success", "Resume uploaded successfully!", "success");
          console.log("Resume uploaded and saved successfully!");
        }
      );
    } catch (error) {
      Swal.fire("Error", "Error uploading resume.", "error");
      console.error("Error uploading resume:", error);
    }
  };

  // download file from firebase url
  const downloadResume = async () => {
    if (!formik.values.resume) {
      console.error("No Resume Found");
      return;
    }

    try {
      const storage = getStorage();

      // Extract the relative path from the full URL
      const fullUrl = formik.values.resume;
      const decodedUrl = decodeURIComponent(fullUrl); // Decode special characters
      const pathStartIndex = decodedUrl.indexOf("/o/") + 3; // Find "/o/" and move forward
      const pathEndIndex = decodedUrl.indexOf("?alt="); // Cut before query params
      const storagePath = decodedUrl.substring(pathStartIndex, pathEndIndex);

      console.log("Extracted Storage Path:", storagePath);

      // Create Firebase storage reference using extracted path
      const resumeRef = ref(storage, storagePath);

      // Get fresh download URL (optional, but useful if token expires)
      const downloadUrl = await getDownloadURL(resumeRef);

      // Trigger download
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = downloadUrl;
      link.setAttribute("download", getFileNameFromURL(formik?.values?.resume));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  function getFileNameFromURL(url) {
    try {
      // Extract the part after "o/" and before "?alt="
      const match = url.match(/o\/(.*?)\?alt=/);

      if (match && match[1]) {
        // Decode the URL-encoded file path to get the actual file name
        const filePath = decodeURIComponent(match[1]);

        // Get the last part after the last "/"
        return filePath.split("/").pop();
      }

      return null; // Return null if no match is found
    } catch (error) {
      console.error("Error extracting file name:", error);
      return null;
    }
  }

  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...formik.values.socialLink];
    updatedLinks[index][field] = value;
    formik.setFieldValue("socialLink", updatedLinks);
  };

  // Render logic
  if (!userDetails) {
    return <div>Loading...</div>; // or any loading indicator
  }

  const handleCopy = async () => {
    if (portfolioLink) {
      try {
        const domain = window.location;
        await navigator.clipboard.writeText(
          `${domain?.origin}/${portfolioLink}`
        );
        alert("Link copied to clipboard!"); // You can replace this with a toast notification
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  };

  return (
    <>
      {portfolioLink && (
        <strong className="flex w-fit m-auto px-5 py-1 border-2 rounded-lg border-green-500 justify-center items-center gap-2">
          {portfolioLink}
          <button onClick={handleCopy}>
            <Copy /> {/* Replace with your copy icon */}
          </button>
        </strong>
      )}

      <form
        data-aos="fade-left"
        className="space-y-5 max-w-2xl mx-auto p-5 rounded-md"
        onSubmit={formik.handleSubmit}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {profileImage ? (
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src={profileImage}
                  alt="User's profile picture"
                  loading="lazy"
                  className="object-cover"
                />
              </Avatar>
            ) : (
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src="/placeholder.svg?height=100&width=100"
                  alt="User's profile picture"
                  loading="lazy"
                  className="object-cover"
                />
              </Avatar>
            )}
            <Label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </Label>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col relative gap-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              placeholder="John"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="absolute text-red-500 text-sm mt-16">
                {formik.errors.name}
              </div>
            )}
          </div>

          <div className="flex flex-col relative gap-1">
            <Label htmlFor="surname">Surname</Label>
            <Input
              id="surname"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.surname}
              placeholder="Doe"
            />
            {formik.touched.surname && formik.errors.surname && (
              <div className="absolute text-red-500 text-sm mt-16">
                {formik.errors.surname}
              </div>
            )}
          </div>

          {/* <div className="grid gap-6 sm:grid-cols-2"> */}
          <div className="flex flex-col relative gap-1">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.gender}
              placeholder="John"
              required
            />
            {formik.touched.gender && formik.errors.gender && (
              <div className="absolute text-red-500 text-sm mt-16">
                {formik.errors.gender}
              </div>
            )}
          </div>

          <div className="flex flex-col relative gap-1">
            <Label htmlFor="phoneNo">Phone No</Label>
            <Input
              id="phoneNo"
              type="tel"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNo}
              placeholder="+1 (555) 000-0000"
            />
            {formik.touched.phoneNo && formik.errors.phoneNo && (
              <div className="absolute text-red-500 text-sm mt-16">
                {formik.errors.phoneNo}
              </div>
            )}
          </div>

          <div className="flex flex-col relative gap-1">
            <Label htmlFor="address">Address</Label>
            <LocationSearch
              handleInputChange={formik.handleChange}
              errors={formik.errors}
              value={formik.values.address}
              fieldsToShow={["suburb", "city", "state", "country"]}
              fieldPass="address"
            />
            {formik.touched.address && formik.errors.address && (
              <div className="absolute text-red-500 text-sm mt-16">
                {formik.errors.address}
              </div>
            )}
          </div>

          <div className="flex flex-col relative gap-1">
            <Label htmlFor="currentJobRole">Current Job Role</Label>
            <Input
              id="currentJobRole"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.currentJobRole}
              placeholder="Manager, HR"
            />
            {formik.touched.currentJobRole && formik.errors.currentJobRole && (
              <div className="absolute text-red-500 text-sm mt-16">
                {formik.errors.currentJobRole}
              </div>
            )}
          </div>

          <div className="flex flex-col relative gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              placeholder="johndoe@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="absolute text-red-500 text-sm mt-16">
                {formik.errors.email}
              </div>
            )}
          </div>

          {/* <Button onClick={}>Verify</Button> */}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Social Links</h2>
          {formik.values.socialLink.map((link, index) => (
            <div key={index} className="grid gap-6 sm:grid-cols-2 mb-4">
              <div className="relative flex items-center space-x-2">
                <BsGithub className="w-5 h-5 text-blue-600" />
                <Input
                  value={link.gitHub}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "gitHub", e.target.value)
                  }
                  placeholder="GitHub URL"
                />
                {formik.errors.socialLink &&
                formik.errors.socialLink[index]?.gitHub ? (
                  <div className="absolute mt-16 left-5 text-red-500 text-sm">
                    {formik.errors.socialLink[index].gitHub}
                  </div>
                ) : null}
              </div>
              <div className=" relative flex items-center space-x-2">
                <Twitter className="w-5 h-5 text-sky-500" />
                <Input
                  value={link.twitter}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "twitter", e.target.value)
                  }
                  placeholder="Twitter URL"
                />
                {formik.errors.socialLink &&
                formik.errors.socialLink[index]?.twitter ? (
                  <div className="absolute mt-16 left-5 text-red-500 text-sm">
                    {formik.errors.socialLink[index].twitter}
                  </div>
                ) : null}
              </div>
              <div className="relative flex items-center space-x-2">
                <Instagram className="w-5 h-5 text-pink-600" />
                <Input
                  value={link.instagram}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "instagram", e.target.value)
                  }
                  placeholder="Instagram URL"
                />
                {formik.errors.socialLink &&
                formik.errors.socialLink[index]?.instagram ? (
                  <div className="absolute mt-16 left-5 text-red-500 text-sm">
                    {formik.errors.socialLink[index].instagram}
                  </div>
                ) : null}
              </div>
              <div className="relative flex items-center space-x-2">
                <Linkedin className="w-5 h-5 text-blue-700" />
                <Input
                  value={link.linkedIn}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "linkedIn", e.target.value)
                  }
                  placeholder="LinkedIn URL"
                />
                {formik.errors.socialLink &&
                formik.errors.socialLink[index]?.linkedIn ? (
                  <div className="absolute mt-16 left-5 text-red-500 text-sm">
                    {formik.errors.socialLink[index].linkedIn}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resume</h2>

          <div className="w-full border-2 border-dashed bg-[#374151]/20 border-gray-400 rounded-xl flex flex-col items-center justify-center gap-3 p-6 transition">
            {!formik?.values?.resume ? (
              <>
                <p className="flex items-center gap-2 text-base font-medium text-white">
                  Upload your Resume / CV (PDF)
                </p>
                <Label
                  htmlFor="resume"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition"
                >
                  <Upload size={18} /> Upload
                  <Input
                    id="resume"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleResumeChange}
                  />
                </Label>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-white text-base font-medium">
                  {getFileNameFromURL(formik?.values?.resume) || "NA"}
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={downloadResume}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition"
                  >
                    <Download size={18} /> Download
                  </Button>
                  <Label
                    htmlFor="resume"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-600 transition"
                  >
                    <FilePenLine size={18} /> Update
                    <Input
                      id="resume"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleResumeChange}
                    />
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            type="submit"
            className="w-2/4 md-max:w-full bg-button text-button-textColor hover:bg-button-hover relative overflow-hidden flex items-center justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            // onClick={handleSave}
          >
            <span className="relative z-10">Save</span>
            <Send
              className={` w-8 h-8 transition-transform duration-300 ${
                isHovered ? "translate-x-0 rotate-45 " : "translate-x-full "
              } `}
            />
          </Button>
        </div>
      </form>
    </>
  );
}
