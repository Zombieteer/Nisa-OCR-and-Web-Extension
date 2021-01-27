import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import "./global.css";
import "./Loader.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
