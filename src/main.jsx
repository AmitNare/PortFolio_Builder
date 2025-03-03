import "./index.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserAuthContextProvider } from "./Components/UserAuthentication";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserAuthContextProvider>
      <App />
    </UserAuthContextProvider>
  </BrowserRouter>
);

//   <div className={`${isDarkTheme ? 'dark' : 'light'} relative min-h-screen bg-background`}>
//   {!user && <Navbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />}
//   {user && <UserNavbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />}
//   <Routes>
//     <Route path="/" element={user ? <Navigate to="/profile" /> : <SignIn />} />
//     <Route path="/hero" element={<Hero />} />
//     <Route path="/signin" element={<SignIn />} />
//     <Route path="/signup" element={<SignUp />} />
//     <Route path="/profile" element={<Profile toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />} />
//     {user && (
//       <>
//         <Route path="/dashboard" element={<div>Dashboard</div>} />
//         <Route path="/projects" element={<div>Projects</div>} />
//         <Route path="/certificate" element={<div>Certificate</div>} />
//         <Route
//           path="/signout"
//           element={() => {
//             auth.signOut().then(() => navigate("/signin"));
//             return null;
//           }}
//         />
//       </>
//     )}
//   </Routes>
// </div>
