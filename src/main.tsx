import { hydrateRoot } from "react-dom/client";
import { App, detectRoute } from "./App";
import "./style.css";
const route = detectRoute(window.location.pathname);
hydrateRoot(document.getElementById("root")!, <App {...route} />);
