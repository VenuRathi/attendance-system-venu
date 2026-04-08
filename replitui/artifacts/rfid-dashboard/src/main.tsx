import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";
setBaseUrl(API_BASE_URL || null);

createRoot(document.getElementById("root")!).render(<App />);
