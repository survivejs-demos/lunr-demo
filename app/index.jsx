import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";

const root = document.createElement("div");
root.setAttribute("id", "app");
document.body.appendChild(root);

ReactDOM.render(<App />, root);
