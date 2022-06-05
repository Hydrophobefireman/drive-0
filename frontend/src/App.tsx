import "@kit/styles";

// javascript is supported
import "./App.css";
import "./init-spinner";

import { render } from "@hydrophobefireman/ui-lib";

import { Router } from "./_router";
import { AppLoader } from "./components/AppLoader";

function App() {
  return (
    <main>
      <Router />
    </main>
  );
}

render(
  <AppLoader>
    <App />
  </AppLoader>,
  document.getElementById("app-mount")
);
