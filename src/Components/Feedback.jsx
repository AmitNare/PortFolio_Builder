import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ReactStars from "react-stars";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import feedback_img from "../assets/Images/feedback.png";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  message: yup.string().required("Message is required"),
  rating: yup.number().min(1, "Please rate us").required("Rating is required"),
});

export default function Feedback() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({ resolver: yupResolver(schema) });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const sendFeedback = async (data) => {
    setIsSubmitting(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICEID,
        import.meta.env.VITE_EMAILJS_TEMPLATEID,
        {
          user_name: data.name,
          user_email: data.email,
          message: data.message,
          rating_star: data.rating,
        },
        import.meta.env.VITE_EMAILJS_USERID
      );
      setMessage("Thank you for sharing your feedback!");
      reset();
      setValue("rating", 0);
    } catch {
      setMessage("Failed to send feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-evenly gap-6 px-4 mb-20">
      <div className="max-w-sm rounded-xl overflow-hidden shadow-lg">
        <img src={feedback_img} alt="feedback" className="w-full object-cover" />
      </div>
      <section className="border p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md w-full max-w-xl space-y-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Share Your Experience</h2>
        <p className="text-center text-gray-600 dark:text-gray-400">We value your feedback to improve our services.</p>
        <form onSubmit={handleSubmit(sendFeedback)} className="space-y-4">
          <Input {...register("name")} placeholder="Name" className="dark:text-white" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

          <Input {...register("email")} placeholder="Email" type="email" className="dark:text-white" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <Textarea {...register("message")} placeholder="Your Feedback" className="dark:text-white" />
          {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}

          <div className="flex flex-col items-center">
            <span className="text-md text-gray-900 dark:text-gray-300">Rate Us:</span>
            <ReactStars count={5} size={30} color2={"#ffd700"} onChange={(value) => setValue("rating", value)} />
            {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
        {message && <p className="text-center text-green-600 dark:text-green-400 mt-4">{message}</p>}
      </section>
    </div>
  );
}
