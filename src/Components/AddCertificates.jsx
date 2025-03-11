import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { storage, db } from "./../../firebase"; // Import the initialized storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push } from "firebase/database";
import useUserAuth from "./UserAuthentication";
import {
  FileInput,
  ImageIcon,
  TypeIcon,
  LinkIcon,
  ClipboardIcon,
  Medal,
} from "lucide-react";
import swal from "sweetalert2";

export default function AddCertificates({ fetchCertificates }) {
  const { user } = useUserAuth();

  const [formData, setFormData] = useState({
    certificateName: "",
    certificateDescription: "",
    certificateType: "",
    certificateImage: null, // Changed from "" to null to handle files correctly
    certificateUrl: "",
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file change for image upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, certificateImage: e.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      certificateName,
      certificateDescription,
      certificateImage,
      certificateType,
      certificateUrl,
    } = formData;

    if (!certificateImage) {
      alert("Please select an image to upload.");
      return;
    }

    // Step 1: Create a reference to Firebase Storage for the image
    const imageRef = ref(storage, `certificates/${certificateImage.name}`);

    try {
      // Step 2: Upload the image to Firebase Storage
      await uploadBytes(imageRef, certificateImage);

      // Step 3: Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(imageRef);

      // Step 4: Save certificate data with the image URL to Firebase Realtime Database
      const certificateData = {
        certificateName,
        certificateDescription,
        certificateType,
        certificateImage: downloadURL, // Store the image URL here
        certificateUrl,
      };

      // Push certificate data under the specific user in Firebase Realtime Database
      const certificatesRef = dbRef(db, `Users/${user.uid}/certificates`);
      await push(certificatesRef, certificateData); // Add certificate to the user's list

      swal.fire({
        icon: "success",
        title: "New Certificate Added",
        text: "The Certificate has been added successfully.",
        confirmButtonText: "Okay",
      });
      // Reset form data
      setFormData({
        certificateName: "",
        certificateDescription: "",
        certificateImage: null,
        certificateUrl: "",
      });

      // Call the fetch function to refresh the certificate list
      fetchCertificates();
    } catch (error) {
      console.error("Error uploading certificate: ", error);
      alert("Failed to upload certificate.");
    }
  };

  return (
    <Dialog>
      <div>
        <DialogHeader>
          <DialogTitle>Certificate</DialogTitle>
          <DialogDescription>Add your new certificate here.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="flex flex-col gap-4">
            {/* Certificate Name */}
            <div className="flex items-center bg-background text-foreground">
              <Medal className="w-5 h-5 mr-2 text-gray-500" />
              <Input
                name="certificateName"
                value={formData.certificateName}
                onChange={handleInputChange}
                required
                placeholder="Certificate Name"
                className="w-full bg-background  "
              />
            </div>

            {/* Certificate Type Dropdown */}
            <div className="flex items-center bg-background text-foreground">
              <TypeIcon className="w-5 h-5 mr-2 text-gray-500" />
              <select
                id="certificateType"
                name="certificateType"
                value={formData.certificateType}
                onChange={handleInputChange}
                required
                className="w-full bg-background h-8 border pb-1 px-2"
              >
                <option value="" disabled>
                  Select Certificate Type
                </option>
                <option value="certificate">Certificate</option>
                <option value="award">Award</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Certificate Description */}
            <div className="flex items-start  bg-background text-foreground">
              <ClipboardIcon className="w-5 h-5 mr-2 text-gray-500 mt-1" />
              <Textarea
                name="certificateDescription"
                value={formData.certificateDescription}
                onChange={handleInputChange}
                required
                placeholder="Certificate Description"
                className="w-full bg-background"
              />
            </div>

            {/* Certificate Image Upload */}
            <div className="flex items-center  bg-background text-foreground">
              <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
              <Input
                type="file"
                name="certificateImage"
                onChange={handleFileChange}
                required
                className="w-full bg-background px-2"
              />
            </div>

            {/* Certificate URL */}
            <div className="flex items-center  bg-background text-foreground">
              <LinkIcon className="w-5 h-5 mr-2 text-gray-500" />
              <Input
                name="certificateUrl"
                value={formData.certificateUrl}
                onChange={handleInputChange}
                required
                placeholder="Certificate URL"
                className="w-full bg-background"
              />
            </div>

            <Button
              type="submit"
              className="mt-5 bg-button hover:bg-button-hover text-button-textColor"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
