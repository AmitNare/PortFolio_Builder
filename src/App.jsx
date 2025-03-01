import React from "react";
import { Route, Routes } from "react-router-dom";
import SignIn from "./Components/SignIn";
import SignUp from "./Components/SignUp";
import UserProjects from "./Components/UserProjects";
import If_PortfolioGenerate from "./Components/If_PortfolioGenerate";
import UserCertificates from "./Components/UserCertificates";
import SetPortfolio from "./Components/SetPortfolio";
import ForgotPassword from "./Components/ForgotPassword";
import PublicLayout from "./Components/PublicLayout";
import Settings from "./Components/Settings";
import ChatGPT from "./Components/ChatGPT";
import GlobalAuthProtector from "./Components/GlobalAuthProtector/GlobalAuthProtector";
import UserAuthProtector from "./Components/UserAuthProtector/UserAuthProtector";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GlobalAuthProtector />}>
        <Route path="/" element={<PublicLayout />} />

        {/* Auth Pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset/password" element={<ForgotPassword />} />

        {/* User Dashboard */}
        <Route path="/user" element={<UserAuthProtector />}>
          <Route path="user/profile" element={<If_PortfolioGenerate />} />
          <Route path="user/projects" element={<UserProjects />} />
          <Route path="user/certificates" element={<UserCertificates />} />
          <Route path="user/preview" element={<SetPortfolio />} />
          <Route path="user/chatbot" element={<ChatGPT />} />
          <Route path="user/settings" element={<Settings />} />
        </Route>

        {/* Global Portfolio Page */}
        <Route path="/:userName/*" element={<SetPortfolio />} />

        {/* Not Found Page */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Route>
    </Routes>
  );
}
