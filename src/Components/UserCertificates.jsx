import { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { db } from "./../../firebase"; // Import Firebase config
import AddCertificate from "./AddCertificates"; // AddCertificate component
import { Button } from "./ui/button";
import useUserAuth from "./UserAuthentication";
import DataLoader from "./DataLoader";

export default function UserCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useUserAuth();

  // Fetch certificates from Firebase
  const fetchCertificates = async () => {
    setLoading(true);
    const certificatesRef = ref(db, `Users/${user.uid}/certificates`);

    try {
      const snapshot = await get(certificatesRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const certificatesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCertificates(certificatesArray);

    // await new Promise((resolve) => setTimeout(resolve, 1000)); // 2 seconds delay

      } else {
        setCertificates([]);
      }
    } catch (error) {
      setError(error.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a certificate
  const certificateDelete = async (certificateId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certificate?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const certificateRef = ref(
        db,
        `Users/${user.uid}/certificates/${certificateId}`
      );
      await remove(certificateRef);
      setCertificates((prevCertificates) =>
        prevCertificates.filter(
          (certificate) => certificate.id !== certificateId
        )
      );
      alert("Certificate deleted successfully!");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Failed to delete the certificate. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user.uid]);

  if (loading) {
    return <DataLoader/>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="w-full p-2 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">All Certificates</h1>

      {/* AddCertificate as a card */}
      <ul className="border-4 flex flex-wrap gap-4 p-4 justify-evenly">
        <li className="border-[var(--border)] rounded-sm shadow w-full sm:w-1/2 lg:w-1/4 flex flex-col justify-center items-center">
          <AddCertificate fetchCertificates={fetchCertificates} />
        </li>

        {/* Show certificates */}
        {certificates.map((certificate) => {
          console.log(certificate); // Debug: log each certificate to check its structure
          return (
            <li
              key={certificate.id}
              className="border-2 border-[var(--border)] p-4 rounded-sm shadow w-full sm:w-1/2 lg:w-1/4 flex flex-col"
            >
              {/* Adjust the field name if necessary */}
              {certificate.certificateImage && (
                <img
                  src={certificate.certificateImage}
                  alt={certificate.certificateName}
                  className="h-full w-full rounded-md object-cover border-4"
                />
              )}
              <h2 className="text-xl font-semibold">
                {certificate.certificateName}
              </h2>{" "}
              {/* Adjust the field name if necessary */}
              {/* Display the certificate type */}
              <p className="mb-2 text-sm text-foreground">
                Type:{" "}
                {certificate.certificateType
                  ? certificate.certificateType
                  : "Not specified"}
              </p>
              <p className="mb-2 text-sm">{certificate.certificateDescription}</p>{" "}
              
              <span className="flex justify-between">
                <Button className=" w-2/5">Edit</Button>
                <Button
                  className=" w-2/5"
                  variant="destructive"
                  onClick={() => certificateDelete(certificate.id)}
                >
                  Delete
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
