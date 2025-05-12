import React, { useState, useEffect } from "react";
import useUserAuth from "./UserAuthentication";
import DataLoader from "./DataLoader";

export default function UserDashboard({ userDetails }) {
  // const { userDetails } = useUserAuth();

  // Add a loading state
  const [loading, setLoading] = useState(true);

  // Simulate a delay before rendering the dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200); // Adjust the time (in milliseconds) as needed

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  // Display the loader while loading
  if (loading || !userDetails) {
    return (
      <div className="flex items-center justify-center h-full text-2xl">
        <DataLoader />
      </div>
    );
  }

  // Format the createdAt timestamp
  const createdAtDate = new Date(userDetails.createdAt).toLocaleString();

  return (
    <div className="flex flex-col gap-5 p-10 text-foreground bg-background">
      <div className="text-5xl">
        <h1 className="text-foreground">{userDetails.name}</h1>
      </div>

      <div className="text-5xl">
        <h1>Dashboard</h1>
      </div>

      <div className="flex gap-5 border-4 justify-between">
        <div className="w-80 border-4 border-red-500">
          <h3>Total Viewers</h3>
          <h2>123</h2>
        </div>

        <div className="w-80 border-4 border-red-500">
          <h3>Total Mails</h3>
          <h2>123</h2>
        </div>

        <div className="w-80 border-4 border-red-500">
          <h3>Total Updates</h3>
          <h2>123</h2>
        </div>

        <div className="w-80 border-4 border-red-500">
          <h3>Last Login</h3>
          <h2>12-1-2001</h2>
        </div>
      </div>

      <div className="flex border-4 justify-between">
        <div className="w-2/4 border-4 border-red-500">
          <h3>Overview</h3>
          <div>Graph</div>
        </div>

        <div className="w-2/5 border-4 border-red-500">
          <h3>Recent Mails</h3>
          <div>Mails</div>
        </div>
      </div>

      {/* Display the formatted createdAt date */}
      <div className="text-3xl">
        <h1>Account Created At: {createdAtDate}</h1>
      </div>
    </div>
  );
}
