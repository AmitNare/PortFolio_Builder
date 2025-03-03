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
