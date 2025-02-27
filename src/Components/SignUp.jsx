import { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import * as Yup from "yup";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import CardTemplete from "./CardTemplete";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "./UserAuthentication";

const USERID = import.meta.env.VITE_EMAILJS_USERID;
const SERVICEID = import.meta.env.VITE_EMAILJS_SERVICEID;
const TEMPLATEID = import.meta.env.VITE_EMAILJS_TEMPLATEID;

export default function SignUp() {
  const db = getDatabase();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errors, setErrors] = useState({});

  const nameValidation = Yup.string()
    .min(3, "Must be at least 3 characters")
    .matches(/^[A-Za-z\s]+$/, "Must contain only letters and spaces")
    .required("Name is required");

  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const ValidateSchema = Yup.object({
    Name: nameValidation,
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear the error when typing in a field with an error
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const { signUp } = useUserAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      await ValidateSchema.validate(formData, { abortEarly: false });
      setErrors({}); // Clear errors on successful validation

      const { Name, email, password } = formData;
      const userCredential = await signUp(email, password);

      // Store user details
      const user = userCredential.user;
      console.log('handleSignUp function');

      if (user) {
        await set(ref(db, "Users/" + user.uid), {
          name: Name,
          email: user.email,
          password: password,
          createdAt: Date.now(),
          role: "User",
        });

        console.log("User registered successfully");
        navigate("/signin");
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        console.error("Error during registration:", error.message);
      }
    }
  };

  const errorCount = Object.keys(errors).length;

  const content = (
    <form onSubmit={handleSignUp} className="w-full">
      <div className={`grid ${errorCount > 0 ? "gap-4" : "gap-4"} w-full`}>
        <div className="grid relative">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="eg. John"
            name="Name"
            onChange={handleInputChange}
            value={formData.Name}
            className="w-full mt-1 mb-1"
          />
          {errors.Name && <p className="text-red-500 absolute mt-14 text-sm">{errors.Name}</p>}
        </div>

        <div className="grid relative">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="user@example.com"
            onChange={handleInputChange}
            value={formData.email}
            className="w-full mt-1 mb-1"
          />
          {errors.email && <p className="text-red-500 absolute mt-14 text-sm">{errors.email}</p>}
        </div>

        <div className="grid relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleInputChange}
            value={formData.password}
            className="w-full mt-1 mb-1"
          />
          {errors.password && <p className="text-red-500 absolute mt-14 text-sm">{errors.password}</p>}
        </div>

        <div className="grid relative">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleInputChange}
            value={formData.confirmPassword}
            className="w-full mt-1 mb-1"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 absolute mt-14 text-sm">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col mt-2 text-md text-center text-foreground gap-2">
        <Button
          type="submit"
          className="w-full text-lg font-semibold mt-5  bg-button hover:bg-button-hover text-white"
        >
          Submit
        </Button>
        <p className="flex justify-center text-md items-center -2">
          Already have an account ?
          <Button
            variant="link"
            className="no-underline text-md text-blue-500 px-1 py-0 m-0 text-center inline-flex items-center"
            onClick={() => {
              navigate("/signin");
            }}
          >
            Sign In
          </Button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="w-full flex justify-center items-center py-16 ">
      <div className="lg:w-1/4 lg:min-w-[600px] md:w-3/4  sm-max:w-full flex justify-evenly items-center w-full bg-background text-foreground px-10 sm-max:p-2 gap-8 md:flex-col-reverse ">
        <CardTemplete
          title="Contact Form"
          description="Enter your information to connect with me"
          content={content}
        />
      </div>
    </div>
  );
}
