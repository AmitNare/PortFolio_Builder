import React, { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Send } from "lucide-react";
import { useUserAuth } from "./UserAuthentication";
import { BsGithub } from "react-icons/bs";
import { Twitter, Instagram, Linkedin } from "lucide-react";
import { getAuth, updateEmail, sendEmailVerification } from "firebase/auth";
import { db, storage, storage as storageRef } from "../../firebase"; // Adjust the import according to your setup
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { set, ref as dbRef, get, getDatabase, update } from "firebase/database";
import save_changes from "../assets/Images/save_changes.png";
import Swal from 'sweetalert2';

import * as yup from "yup";
import { useFormik } from "formik";
import LocationSearch from "./LocationSearch";
import { savePortfolioDataToFirebase } from "./PortfolioMethods";

export default function Settings() {
  const { user, userDetails, setUserDetails } = useUserAuth();
  const socialLinks = userDetails?.socialLink || [];
  const [profileImage, setProfileImage] = useState(userDetails?.image || null);
  const [resumeName, setResumeName] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // const [profileImage, setProfileImage] = useState(userDetails?.image || null);

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    surname: yup.string().required("Surname is required"),
    phoneNo: yup
      .string()
      .matches(/^\+[1-9]{1}[0-9]{1,3}\s?[1-9]{1}[0-9]{9}$/, "Phone number must include a valid country code and 10-digit number")
      .required("Phone number is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    image: yup.string().url("Invalid image URL").required("Image URL is required"),
    resume: yup.string().url("Invalid resume URL").required("Resume URL is required"),
    socialLink: yup
      .array()
      .of(
        yup.object({
          gitHub: yup.string().url("Invalid GitHub URL").required("GitHub URL is required"),
          twitter: yup.string().url("Invalid Twitter URL"),
          instagram: yup.string().url("Invalid Instagram URL"),
          linkedIn: yup.string().url("Invalid LinkedIn URL"),
        })
      )
      .required("At least one social link is required"),
    address: yup.string().required("Address is required"),
    currentJobRole: yup.string().required("Current job role is required"),
  });

  const handleSave = async () => {
    if (!emailConfirmed) {
      await Swal.fire({
        title: 'Please wait',
        text: 'Waiting for email confirmation...',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      // Simulate saving data
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Swal.fire({
        title: 'Success',
        text: 'Data saved successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'Failed to save data.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      name: userDetails?.name || "",
      surname: userDetails?.surname || "",
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
        console.error("User ID is missing");
        return;
      }

      try {
        let imageUrl = values.image;

        if (values.email !== userDetails?.email) {
          await updateUserEmail(values.email);
        }

        const updatedFormData = { ...values, image: imageUrl };
        const userRef = dbRef(db, `Users/${userDetails?.uid}`);

        await savePortfolioDataToFirebase(updatedFormData, userDetails.uid);
        setUserDetails(prevDetails => ({
          ...prevDetails,
          ...updatedFormData
      }));
        console.log("Form submitted successfully:", updatedFormData);
        // await handleSave();
      } catch (error) {
        console.error("Form submission failed:", error);
      }
    },
  });

  useEffect(() => {
    console.log("userDetails: ",userDetails);
    console.log("User: ",user);

    if (userDetails) {
      formik.setValues({
        name: userDetails.name || "",
        surname: userDetails.surname || "",
        phoneNo: userDetails.phoneNo || "",
        email: userDetails.email || "",
        image: userDetails.image || "",
        resume: userDetails.resume || "",
        socialLink: socialLinks,
        address: userDetails.address || "",
        currentJobRole: userDetails.currentJobRole || "",
      });
    }
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

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
      const storageRef = ref(storage, `resumes/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);
      formik.setFieldValue("resume", fileURL);
      setResumeName(file.name.length > 20 ? `${file.name.slice(0, 17)}...` : file.name);
    } else {
      alert("Please upload a PDF file under 5MB.");
    }
  };


const updateUserEmail = async (newEmail) => {
    const auth = getAuth();
    const user = auth.currentUser ;

    if (user) {
        try {
            // Update the user's email
            await updateEmail(user, newEmail);
            console.log("Email updated successfully");

            // Send a verification email to the new email address
            await sendEmailVerification(user);
            console.log("Verification email sent. Please verify your new email address.");
        } catch (error) {
            // Handle specific error cases
            if (error.code === 'auth/email-already-in-use') {
                console.error("This email address is already in use.");
            } else if (error.code === 'auth/invalid-email') {
                console.error("The email address is not valid.");
            } else if (error.code === 'auth/operation-not-allowed') {
                console.error("Email/password accounts are not enabled.");
            } else {
                console.error("Error updating email: ", error.message);
            }
        }
    } else {
        console.log("No user is signed in.");
    }
};

 const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...formik.values.socialLink];
    updatedLinks[index][field] = value;
    formik.setFieldValue("socialLink", updatedLinks);
  };

  // Render logic
  if (!userDetails) {
    return <div>Loading...</div>; // or any loading indicator
  }

  return (
    <form
      data-aos="fade-left"
      className="space-y-8 max-w-2xl mx-auto p-5"
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
        <div className="absolute text-red-500 text-sm mt-14">{formik.errors.name}</div>
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
        <div className="absolute text-red-500 text-sm mt-14">{formik.errors.surname}</div>
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
        <div className="absolute text-red-500 text-sm mt-14">{formik.errors.phoneNo}</div>
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
        <div className="absolute text-red-500 text-sm mt-14">{formik.errors.address}</div>
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
        <div className="absolute text-red-500 text-sm mt-14">{formik.errors.currentJobRole}</div>
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
        <div className="absolute text-red-500 text-sm mt-14">{formik.errors.email}</div>
      )}
    </div>
  </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Social Links</h2>
        {formik.values.socialLink.map((link, index) => (
          <div key={index} className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="flex items-center space-x-2">
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
                <div className="text-red-500 text-sm">
                  {formik.errors.socialLink[index].gitHub}
                </div>
              ) : null}
            </div>
            <div className="flex items-center space-x-2">
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
                <div className="text-red-500 text-sm">
                  {formik.errors.socialLink[index].twitter}
                </div>
              ) : null}
            </div>
            <div className="flex items-center space-x-2">
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
                <div className="text-red-500 text-sm">
                  {formik.errors.socialLink[index].instagram}
                </div>
              ) : null}
            </div>
            <div className="flex items-center space-x-2">
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
                <div className="text-red-500 text-sm">
                  {formik.errors.socialLink[index].linkedIn}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* <div className="space-y-4">
        <h2 className="text-xl font-semibold">Resume</h2>
        {resumeName && (
          <div className="flex items-center space-x-4">
            <span>{resumeName}</span>
            <Button type="button" onClick={removeResume} className="bg-red-500 text-white">
              Remove Resume
            </Button>
          </div>
        )}
        <Label htmlFor="resume" className="bg-primary text-primary-foreground rounded-full p-2 cursor-pointer">
          Upload Resume
          <Input
            id="resume"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleResumeChange}
          />
        </Label>
      </div>> */}
      <div className="flex justify-center">

 <Button
      size='lg'
      type="submit"
      className="w-2/4 md-max:w-full bg-button text-button-textColor hover:bg-button-hover relative overflow-hidden flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">Save</span>
      <Send
        className={` w-8 h-8 transition-transform duration-300 ${
          isHovered ? 'translate-x-0 rotate-45 ' : 'translate-x-full '
        } `}
      />
    </Button>
    </div>

    </form>
  );
}
