import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installFlutterFCMBridge } from "./lib/firebase/flutterBridge";

installFlutterFCMBridge();

createRoot(document.getElementById("root")!).render(<App />);
