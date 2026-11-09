import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/600.css";
import "./styles/global.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
