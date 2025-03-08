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
    Boxes,
  } from "lucide-react";
  import Swal from "sweetalert2"; // Import SweetAlert2

  export default function AddFeatures({ fetchFeatures }) {
    const { user } = useUserAuth();
  
    const [formData, setFormData] = useState({
      featureName: "",
      featureDescription: "",
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
      setFormData({ ...formData, featureImage: e.target.files[0] });
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      const {
        featureName,
        featureDescription,
      } = formData;
  
    //   if (!featureImage) {
    //     alert("Please select an image to upload.");
    //     return;
    //   }
  
      // Step 1: Create a reference to Firebase Storage for the image
    //   const imageRef = ref(storage, `features/${featureImage.name}`);
  
      try {
        // Step 2: Upload the image to Firebase Storage
        // await uploadBytes(imageRef, featureImage);
  
        // // Step 3: Get the download URL of the uploaded image
        // const downloadURL = await getDownloadURL(imageRef);
  
        // Step 4: Save Feature data with the image URL to Firebase Realtime Database
        const featureData = {
          featureName,
          featureDescription,
        };
  
        // Push Feature data under the specific user in Firebase Realtime Database
        const featuresRef = dbRef(db, `Users/${user.uid}/features`);
        await push(featuresRef, featureData); // Add Feature to the user's list
  
        Swal.fire({
          icon: "success",
          title: "New Feature Added",
          text: "The feature has been updated successfully.",
          confirmButtonText: "Okay",
        });
        // Reset form data
        setFormData({
          featureName: "",
          featureDescription: "",
        });
  
        // Call the fetch function to refresh the Feature list
        fetchFeatures();
      } catch (error) {
        console.error("Error uploading Feature: ", error);
        alert("Failed to upload Feature.");
      }
    };
  
    return (
      <Dialog>
        <div>
          <DialogHeader>
            <DialogTitle>Feature</DialogTitle>
            <DialogDescription>Add your new Feature here.</DialogDescription>
          </DialogHeader>
  
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="flex flex-col gap-4">
              {/* Feature Name */}
              <div className="flex items-center bg-background text-foreground">
                <Boxes className="w-5 h-5 mr-2 text-gray-500" />
                <Input
                  name="featureName"
                  value={formData.featureName}
                  onChange={handleInputChange}
                  required
                  placeholder="Feature Name"
                  className="w-full bg-background  "
                />
              </div>
  
              {/* Feature Description */}
              <div className="flex items-start  bg-background text-foreground">
                <ClipboardIcon className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                <Textarea
                  name="featureDescription"
                  value={formData.featureDescription}
                  onChange={handleInputChange}
                  required
                  placeholder="Feature Description"
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
  