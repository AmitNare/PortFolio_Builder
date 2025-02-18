import { useState } from "react";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import CardTemplete from "./CardTemplete";

export default function SignIn() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validation schema
  const ValidateSchema = Yup.object({
    email: Yup.string()
      .required("Email is required")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // Go back to login
  const GoBackToLogin = () => {
    navigate("/");
  };

  // Handle password reset
  const handleForgotPassword = async () => {
    if (resetEmailSent) return; // Prevent sending another link while message is displayed
    try {
      if (!formData.email) {
        alert("Please enter your email to reset your password.");
        return;
      }
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 3000); // Hide the message after 3 seconds
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      alert("Failed to send reset email. Please try again.");
    }
    console.log("Password Rest Link Sent")

  };
  
  const loginContent = (
    <form className="w-full flex flex-col gap-4">
      <div className="relative">
        <p className="text-foreground text-lg">
          Please provide your email address to receive a password reset link. Follow the instructions in the email to securely reset your password.
        </p>
      </div>
      <div className="flex gap-2 w-full sm-max:flex-col sm-max:gap-4">
        <div className="relative w-3/5 sm-max:w-full">
          <input
            type="email"
            name="email"
            className="bg-background text-foreground border border-neutral-500 text-md rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5"
            placeholder="Enter your email"
            onChange={handleInputChange}
            value={formData.email}
          />
        </div>
        <button
          type="button"
          className="w-2/5 sm-max:w-full  bg-button text-neutral-50 p-2 rounded-lg hover:bg-button-hover transition duration-200"
          onClick={handleForgotPassword}
          disabled={resetEmailSent} // Disable button if reset email is sent
        >
          Send Reset Link
        </button>
      </div>
      {resetEmailSent && (
        <p className="text-green-500 mt-2">Reset email has been sent!</p>
      )}
      <button
        type="button"
        className="bg-button text-neutral-50 p-2 rounded-lg hover:bg-button-hover transition duration-200"
        onClick={GoBackToLogin}
      >
        Go Back
      </button>
    </form>
  );

  return (
    <div className="w-full  flex justify-center items-center  py-24 ">

    <div className="lg:w-2/5 lg:min-w-[800px] flex flex-col md:flex-row justify-center items-center  lg:justify-center bg-background text-foreground p-5 gap-8 border-2 ">
      <CardTemplete title="Reset Your Password" content={loginContent} />
    </div>
    </div>
  );
}
