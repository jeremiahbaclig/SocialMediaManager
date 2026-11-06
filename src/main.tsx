import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { MediaProvider } from "./media/MediaProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <MediaProvider>
        <App />
      </MediaProvider>
    </HashRouter>
  </React.StrictMode>,
);
