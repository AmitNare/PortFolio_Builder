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
import add_Icon from "../assets/add.png";

export default function AddCertificates({ fetchCertificates }) {
  const { user } = useUserAuth();

  const [formData, setFormData] = useState({
    certificateName: "",
    certificateDescription: "",
    certificateType: "",
    certificateImage: null, // Changed from "" to null to handle files correctly
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
      };

      // Push certificate data under the specific user in Firebase Realtime Database
      const certificatesRef = dbRef(db, `Users/${user.uid}/certificates`);
      await push(certificatesRef, certificateData); // Add certificate to the user's list

      alert("Certificate successfully added!");

      // Reset form data
      setFormData({
        certificateName: "",
        certificateDescription: "",
        certificateImage: null,
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
      <DialogTrigger asChild>
        <img src={add_Icon} alt="Add Certificate" className="cursor-pointer" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>Create Certificate</DialogTitle>
          <DialogDescription>Add your new certificate here.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Input
              name="certificateName"
              value={formData.certificateName}
              onChange={handleInputChange}
              required
              placeholder="Certificate Name"
            />

            {/* Certificate Type Dropdown */}
            <div>
              {/* <label htmlFor="certificateType" className="block mb-1">Certificate Type</label> */}
              <select
                id="certificateType"
                name="certificateType"
                value={formData.certificateType}
                onChange={handleInputChange}
                required
                className="p-2 border rounded bg-background text-foreground w-full"
              >
                <option value="" disabled>
                  Select Certificate Type
                </option>
                <option value="certificate">Certificate</option>
                <option value="award">Award</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <Textarea
              name="certificateDescription"
              value={formData.certificateDescription}
              onChange={handleInputChange}
              required
              placeholder="Certificate Description"
            />

            {/* Image upload */}
            <Input
              type="file"
              name="certificateImage"
              onChange={handleFileChange}
              required
            />

            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
