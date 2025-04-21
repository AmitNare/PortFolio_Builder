import React, { useState } from "react";

const FileUpload = ({
  label,
  accept,
  onFileChange,
  file,
  fileName,
  error,
  icon,
  maxFileSize = 5 * 1024 * 1024, // Default to 5MB
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file) => {
    // Check file type
    const allowedTypes = accept.split(",");
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${accept}`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds the limit of ${maxFileSize / 1024 / 1024} MB.`;
    }

    return null;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        onFileChange(null, validationError);
      } else {
        onFileChange(selectedFile, null);
      }
    } else {
      onFileChange(null, null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        onFileChange(null, validationError);
      } else {
        onFileChange(droppedFile, null);
      }
    }
    setIsDragOver(false);
  };

  const handleRemoveFile = () => {
    onFileChange(null, null); // Clear the file
  };

  const imagePreviewUrl =
    file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

  return (
    <div className="relative flex flex-col">
      <label className="text-lg">{label}</label>
      {!file ? (
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            width: "100%",
            height: "75px",
            border: "2px dashed #007bff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            backgroundColor: isDragOver ? "#f0f8ff" : "transparent",
            cursor: "pointer",
          }}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            style={{ display: "none" }}
            id={`file-upload-${label}`}
          />
          <label htmlFor={`file-upload-${label}`} style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", color: "#007bff" }}>
                {isDragOver
                  ? "Release to Upload"
                  : "Drag & Drop or Click to Upload"}
              </div>
              <div style={{ fontSize: "30px", color: "#007bff" }}>{icon}</div>
            </div>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between border p-2 rounded-md gap-2">
          {imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt="Preview of the uploaded file"
              loading="lazy"
              className="h-20 w-20 object-cover rounded-lg"
            />
          )}
          <span className="text-md truncate w-full">{fileName}</span>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ❌
          </button>
        </div>
      )}
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};

export default FileUpload;


{/* Add profile picture */}
    //   <div className=" relative flex flex-col ">
    //     <Label className="text-lg">Profile Picture</Label>

    //     Conditionally render the drop zone or the uploaded image details
    //     {!image ? (
    //       <div
    //         onDragEnter={handleDragEnter}
    //         onDragLeave={handleDragLeave}
    //         onDragOver={handleDragOver}
    //         onDrop={handleDrop}
    //         style={{
    //           width: "100%",
    //           height: "75px",
    //           border: "2px dashed #007bff",
    //           display: "flex",
    //           alignItems: "center",
    //           justifyContent: "center",
    //           borderRadius: "10px",
    //           backgroundColor: isDragOver ? "#f0f8ff" : "transparent",
    //           cursor: "pointer",
    //           position: "relative",
    //           overflow: "hidden",
    //         }}
    //       >
    //         <Input
    //           type="file"
    //           accept="image/*"
    //           onChange={handleFileChange}
    //           style={{ display: "none" }}
    //           id="file-upload"
    //         />
    //         <Label htmlFor="file-upload" style={{ width: "100%" }}>
    //           <div style={{ textAlign: "center" }}>
    //             <div
    //               style={{
    //                 fontSize: "18px",
    //                 color: "#007bff",
    //               }}
    //             >
    //               {isDragOver
    //                 ? "Release to Upload"
    //                 : "Drag & Drop or Click to Upload"}
    //             </div>
    //             <div
    //               style={{
    //                 fontSize: "30px",
    //                 color: "#007bff",
    //               }}
    //             >
    //               📷
    //             </div>
    //           </div>
    //         </Label>
    //       </div>
    //     ) : (
    //       <div className="flex border-2 items-center justify-between pr-5">
    //         Uploaded image preview
    //         <img
    //           src={image}
    //           alt="Uploaded"
    //           style={{
    //             height: "75px",
    //             width: "75px",
    //             objectFit: "cover",
    //             borderRadius: "10px",
    //           }}
    //         />

    //         Image name
    //         <span className="text-md bg-background text-foreground">
    //           {imageName}
    //         </span>

    //         Remove button
    //         <button
    //           onClick={handleRemoveImage}
    //           className="text-red-500 hover:text-red-700"
    //           style={{
    //             background: "transparent",
    //             border: "none",
    //             cursor: "pointer",
    //           }}
    //         >
    //           ❌
    //         </button>
    //       </div>
    //     )}
    //     {errors.image && (
    //       <span className="absolute text-red-500 text-sm mt-28">
    //         {errors.image}
    //       </span>
    //     )}
    //   </div>