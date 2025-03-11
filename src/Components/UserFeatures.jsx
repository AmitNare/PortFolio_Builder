import { useEffect, useState } from "react";
import { ref, get, set, remove } from "firebase/database";
import { db } from "./../../firebase"; // Import Firebase config
import AddFeatures from "./AddFeatures"; // AddFeatures component
import { Button } from "./ui/button";
import useUserAuth from "./UserAuthentication";
import DataLoader from "./DataLoader";
import { PlusCircleIcon, TrashIcon } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import swal from "sweetalert2"; // Import SweetAlert2

export default function UserFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useUserAuth();

  // Fetch Features from Firebase
  const fetchFeatures = async () => {
    setLoading(true);
    const featuresRef = ref(db, `Users/${user.uid}/features`);

    try {
      const snapshot = await get(featuresRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const featuresArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          editMode: false, // Initially set editMode to false
        }));
        setFeatures(featuresArray);
      } else {
        setFeatures([]);
      }
    } catch (error) {
      setError(error.message || "Failed to load Features.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Edit Mode
  const toggleEditMode = (featureId) => {
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === featureId
          ? { ...feature, editMode: !feature.editMode }
          : feature
      )
    );
  };

  // Save the updated feature
  const saveFeature = async (featureId, updatedFeature) => {
    const featureRef = ref(db, `Users/${user.uid}/features/${featureId}`);
    try {
      await set(featureRef, updatedFeature);
      swal.fire({
        icon: "success",
        title: "Feature Updated",
        text: "The feature has been updated successfully.",
        confirmButtonText: "Okay",
      });
      fetchFeatures(); // Refresh the features list
    } catch (error) {
      console.error("Error saving feature:", error);
      alert("Failed to save the feature. Please try again.");
    }
  };

  // Delete a feature
  const featureDelete = async (featureId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feature?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const featureRef = ref(db, `Users/${user.uid}/features/${featureId}`);
      await remove(featureRef);
      setFeatures((prevFeatures) =>
        prevFeatures.filter((feature) => feature.id !== featureId)
      );

      // SweetAlert2 success message
      swal.fire({
        icon: "success",
        title: "Feature Deleted",
        text: "The feature has been deleted successfully.",
        confirmButtonText: "Okay",
      });
    } catch (error) {
      console.error("Error deleting feature:", error);
      alert("Failed to delete the feature. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [user.uid]);

  if (loading) {
    return <DataLoader />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Dialog>
      <div
        data-aos="fade-left"
        className="w-full bg-background p-2 text-foreground"
      >
        <div className="flex justify-center">
          <note className="w-fit bg-yellow-100 text-yellow-700 border-2 border-yellow-500 rounded-lg p-3 shadow-md">
            Note: Features are available only for organizations
          </note>
        </div>

        <span className="flex justify-between px-5 items-center">
          <h1 className="text-2xl font-bold ">All Features</h1>
          <DialogTrigger asChild>
            <button
              title="Add feature"
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <PlusCircleIcon className="w-6 h-6 text-gray-500" />
            </button>
          </DialogTrigger>
        </span>

        <DialogContent className="border bg-background text-foreground sm:min-w-[600px] sm-max:min-w-full">
          <AddFeatures fetchFeatures={fetchFeatures} />
        </DialogContent>

        {/* AddFeatures as a card */}
        <ul className="flex flex-wrap gap-4 mt-5 justify-evenly">
          {/* Show Features */}
          {features.map((feature) => {
            return (
              <li
                key={feature.id}
                className="border relative p-2 rounded-sm shadow w-full min-w-[300px] sm:w-1/2 lg:w-1/4 flex flex-col"
              >
                <>
                  <h2 className="text-xl font-semibold">
                    {feature.featureName}
                  </h2>
                  <p className="mb-2 text-sm">{feature.featureDescription}</p>
                  <span className="flex justify-between">
                    <TrashIcon
                      className="absolute bg-background text-red-500 cursor-pointer right-2 -top-3"
                      onClick={() => featureDelete(feature.id)}
                    />
                  </span>
                </>
              </li>
            );
          })}
        </ul>
      </div>
    </Dialog>
  );
}
