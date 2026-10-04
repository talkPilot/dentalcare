import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/assistant";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
);
