import React from 'react'

export default function SetAbout({ userDetails }) {
    return (
      <div className="text-foregound bg-background">
        <h1 className="text-foregound bg-background">Welcome to About</h1>
        <p className="text-foregound bg-background">User ID: {userDetails.uid}</p>
      </div>
    );
  }