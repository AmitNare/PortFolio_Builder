import { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { db } from "./../../firebase"; // Import Firebase config
import AddCertificate from "./AddCertificates"; // AddCertificate component
import { Button } from "./ui/button";
import useUserAuth from "./UserAuthentication";
import DataLoader from "./DataLoader";
import Swal from "sweetalert2"; // Import SweetAlert2
import { ExternalLink, PlusCircleIcon, TrashIcon } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { AspectRatio } from "./ui/aspect-ratio";
import not_found from "../assets/Images/not_found.svg";
import { Helmet } from "react-helmet";

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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this certificate?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

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
      Swal.fire({
        icon: "success",
        title: "Certificate Deleted",
        text: "The Certificate has been deleted successfully.",
        confirmButtonText: "Okay",
      });
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
    return <DataLoader />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <Helmet>
        <meta name="title" content="Achivement | Portify" />
        <meta
          name="description"
          content="Easily add or remove your certificates and achievements in Portify. Showcase your accomplishments to strengthen your professional portfolio."
        />
        <meta
          name="keywords"
          content="Portify, certificates, add achievements, manage certificates, portfolio builder, professional certifications, add certificate to portfolio, online achievements, showcase skills, student achievements, personal website certificates"
        />

        <meta name="site.name" content="Portify" />

        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Achivement | Portify - Highlight Your Achievements & Certifications"
        />
        <meta
          property="og:description"
          content="Manage and display your certificates and achievements with ease. Portify helps you build a strong and verified portfolio."
        />
        <meta
          property="og:image"
          content="https://github.com/AmitNare/PortFolio_Builder/blob/main/public/favicon/website-image.png?raw=true"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content="Certificates | Portify - Highlight Your Achievements & Certifications"
        />
        <meta
          property="twitter:description"
          content="Showcase your certifications and milestones to impress visitors and potential employers. Easily manage them in Portify."
        />
        <meta
          property="twitter:image"
          content="https://github.com/AmitNare/PortFolio_Builder/blob/main/public/favicon/website-image.png?raw=true"
        />

        <title>
          Achivement | Portify - Manage and Showcase Your Certifications &
          Achivement
        </title>
      </Helmet>

      <Dialog>
        <div
          data-aos="fade-left"
          className="w-full h-full md-max:min-h-[calc(100svh-72px)] bg-background p-5 text-foreground rounded-lg"
        >
          <span className="flex justify-between px-5 items-center">
            <h1 className="text-2xl font-bold ">All Certificates</h1>
            <DialogTrigger asChild>
              <button
                title="Add Certificate"
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <PlusCircleIcon className="w-6 h-6 text-gray-500" />
              </button>
            </DialogTrigger>
          </span>

          <DialogContent className="border bg-background text-foreground sm:min-w-[600px] sm-max:min-w-full">
            <AddCertificate fetchCertificates={fetchCertificates} />
          </DialogContent>
          {/* AddCertificate as a card */}
          {certificates.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-center mt-10 text-lg">
              <message>
                {" "}
                No certificates found. Click the{" "}
                <PlusCircleIcon className="inline w-5 h-5 mx-1 " /> icon above
                to add one!{" "}
              </message>
              <img
                src={not_found}
                alt="loading..."
                className="max-w-2xl flex justify-center items-center"
              />
            </div>
          ) : (
            <ul className="flex flex-wrap gap-5 mt-5 justify-evenly">
              {/* Show certificates */}
              {certificates.map((certificate) => {
                return (
                  <li
                    key={certificate.id}
                    className="border relative py-3 px-2 gap-2 rounded-sm shadow w-full min-w-[300px] sm:w-1/2 lg:w-1/4  flex flex-col"
                  >
                    {/* Adjust the field name if necessary */}
                    {certificate.certificateImage && (
                      <span className="mt-1">
                        <AspectRatio ratio={16 / 9} className="bg-muted ">
                          <img
                            src={certificate.certificateImage}
                            alt={certificate.certificateName}
                            loading="lazy"
                            className="h-full w-full rounded-md object-cover "
                          />
                        </AspectRatio>
                      </span>
                    )}
                    <h2 className="text-xl font-semibold">
                      {certificate.certificateName}
                    </h2>{" "}
                    {/* Display the certificate type */}
                    <p className=" text-sm text-foreground">
                      Type:{" "}
                      {certificate.certificateType
                        ? certificate.certificateType
                        : "Not specified"}
                    </p>
                    <p className="text-sm h-32 custom-scrollbar overflow-auto">
                      {certificate.certificateDescription}
                    </p>
                    {certificate.certificateUrl && (
                      <a
                        href={certificate.certificateUrl}
                        className="bg-button text-button-textColor hover:bg-button-hover w-fit px-2 py-1 rounded-md flex items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View <ExternalLink />
                      </a>
                    )}
                    <span className="flex justify-between">
                      {/* <Button className=" w-2/5">Edit</Button> */}
                      <TrashIcon
                        className="absolute bg-background text-red-500 cursor-pointer right-2 -top-4"
                        onClick={() => certificateDelete(certificate.id)}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Dialog>
    </>
  );
}
