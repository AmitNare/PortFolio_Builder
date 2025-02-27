import { useState } from "react";
import * as Yup from "yup";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useNavigate } from "react-router-dom";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import CardTemplete from "./CardTemplete";
import { getAuth } from "firebase/auth";
import { useUserAuth } from "./UserAuthentication";
import { getDatabase, ref, get } from "firebase/database"; // Import database functions

export default function SignIn() {
  const navigate = useNavigate();
  const db = getDatabase(); // Initialize the database

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state for better UX

  const { logIn } = useUserAuth();

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

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // Start loading
      await ValidateSchema.validate(formData, { abortEarly: false });
      setErrors({});

      const { email, password } = formData;
      const userCredential = await logIn(email, password);
      const user = userCredential.user;
      console.log("login successful");
      navigate("/user/profile")
      
    } catch (error) {
      if (error.name === "ValidationError") {
        const newErrors = error.inner.reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {});
        setErrors(newErrors);
      } else {
        console.error("Authentication error:", error.message);
        alert("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const loginContent = (
    <form onSubmit={handleLogin} className="w-full">
      <div
        className={`grid w-full items-center ${
          Object.keys(errors).length > 0 ? "gap-4" : "gap-4"
        } mx-auto`}
      >
        <div className="grid relative">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter Email"
            name="email"
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
            placeholder="Enter Password"
            name="password"
            onChange={handleInputChange}
            value={formData.password}
            className="w-full mt-1 mb-1"
          />
          {errors.password && <p className="text-red-500 absolute mt-14 text-sm">{errors.password}</p>}
        </div>
      </div>
      <div className="mt-8 flex flex-col justify-between ">
        <Button
          className="w-full text-lg bg-button hover:bg-button-hover text-white"
          type="submit"
          disabled={loading} // Disable button while loading
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="flex justify-end">
          <Button
            variant="link"
            className="text-md no-underline  text-blue-500 p-0 m-0"
            onClick={() => {
              navigate("/reset/password");
            }}
          >
            Forgot Password?
          </Button>
          {/* {resetEmailSent && (
          <p className="text-green-500 mt-2">Reset email has been sent!</p>
        )} */}
        </div>

        <div className="flex flex-col  text-md text-center text-foreground gap-2">
        <p className="flex justify-center items-center -2">
  Don't have an account ?
  <Button
    variant="link"
    className="no-underline text-md text-blue-500 px-1 py-0 m-0 text-center inline-flex items-center"
    onClick={() => {
      navigate("/signup");
    }}
 >
    Sign Up
  </Button>
</p>

        </div>
      </div>
    </form>
  );

  return (
    <div className="w-full  flex justify-center items-center  py-24 ">
      <div className="lg:w-1/4 lg:min-w-[600px] md:w-3/4  sm-max:w-full flex justify-evenly items-center w-full bg-background text-foreground p-10 sm-max:p-2 gap-8 md:flex-col-reverse ">
        <CardTemplete
          title="Login Here"
          description="Enter your information to login"
          content={loginContent}
        />
      </div>
    </div>
  );
}
