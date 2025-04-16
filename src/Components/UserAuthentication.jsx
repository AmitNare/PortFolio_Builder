import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "./GlobalLoader";

const userAuthentication = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Sign up function
  async function signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCredential.user);
      alert(
        "Email verification link sent. Please verify your email before logging in."
      );
      console.log("User Created...");
      // navigate("/signin")
      return userCredential;
    } catch (error) {
      console.error("Error during sign up:", error.message);
      throw error;
    }
  }

  // Function to fetch user role and details
  const fetchUserDetails = async (uid) => {
    const db = getDatabase();
    const userRef = ref(db, `Users/${uid}`);
    const adminRef = ref(db, `Admin/${uid}`);

    try {
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const userData = { ...userSnapshot.val(), uid };
        console.log(userData);
        return {
          role: "user",
          details: userData,
          redirectPath: "/user/profile",
        };
      }

      const adminSnapshot = await get(adminRef);
      if (adminSnapshot.exists()) {
        const adminData = adminSnapshot.val();
        return {
          role: "admin",
          details: adminData,
          redirectPath: "/admin-dashboard",
        };
      }

      console.warn("Role not found in database.");
      return { role: null, details: null, redirectPath: null };
    } catch (error) {
      console.error("Error fetching role:", error);
      return { role: null, details: null, redirectPath: null };
    }
  };

  // Log in function with role and details fetching
  async function logIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedInUser = userCredential.user;

      if (!loggedInUser.emailVerified) {
        alert("Please verify your email before logging in.");
        await signOut(auth);
        return;
      }

      const { role, details } = await fetchUserDetails(loggedInUser.uid);
      setUserRole(role);
      setUserDetails(details);

      return userCredential;
    } catch (error) {
      console.error("Error during login:", error.message);
      throw error;
    }
  }

  // Log out function
  function logOut() {
    setUserRole(null);
    setUserDetails(null);
    setUser(null);
    signOut(auth).then(() => {
      window.location.href = window.location.origin;
    });
  }

  // Track authentication state and handle redirection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser && currentUser.emailVerified) {
        const { role, details } = await fetchUserDetails(currentUser.uid);

        setUser(currentUser);
        setUserRole(role);
        setUserDetails(details); // Store user details in state

      } else {
        setUser(null);
        setUserRole(null);
        setUserDetails(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) return <div><GlobalLoader/></div>; // Prevents unwanted redirects during state changes

  return (
    <userAuthentication.Provider
      value={{
        user,
        userRole,
        userDetails,
        setUserDetails,
        signUp,
        logIn,
        logOut,
      }}
    >
      {children}
    </userAuthentication.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthentication);
}

export default useUserAuth;
