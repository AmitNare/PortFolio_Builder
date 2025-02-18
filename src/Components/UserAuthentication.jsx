import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const userAuthentication = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  // Sign up function
  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
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
        return { role: "user", details: userData, redirectPath: "/user/dashboard" };
      }

      const adminSnapshot = await get(adminRef);
      if (adminSnapshot.exists()) {
        const adminData = adminSnapshot.val();
        return { role: "admin", details: adminData, redirectPath: "/admin-dashboard" };
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

      const { role, details, redirectPath } = await fetchUserDetails(loggedInUser.uid);
      setUserRole(role);
      setUserDetails(details); // Store user details in state

      if (redirectPath) {
        navigate(redirectPath);
      }

      return userCredential;
    } catch (error) {
      console.error("Error during login:", error);
    }
  }

  // Log out function
  function logOut() {
    setUserRole(null);
    setUserDetails(null); // Clear user details

    const domain = window.location.origin;
    window.location.href = domain;
    return signOut(auth);
  }

  // Track authentication state and handle redirection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const { role, details, redirectPath } = await fetchUserDetails(currentUser.uid);
        setUserRole(role);
        setUserDetails(details); // Store user details in state

        // Only navigate if the role or details have changed
        if (role !== userRole) {
          if (redirectPath) {
            navigate(redirectPath); // Redirect to the correct page based on role
          }
        }
      } else {
        setUserRole(null);
        setUserDetails(null); // Clear user details when logged out
      }
    });

    return () => unsubscribe();
  }, [ userRole]); // Ensure that userRole and userDetails are updated

  return (
    <userAuthentication.Provider
      value={{ user, userRole, userDetails, setUserDetails, signUp, logIn, logOut }}
    >
      {children}
    </userAuthentication.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthentication);
}
export default useUserAuth; 