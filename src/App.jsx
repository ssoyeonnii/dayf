import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Calendar from "./components/Calendar.jsx";

function App() {
  const [count, setCount] = useState(0);

  return <Calendar />;
}

export default App;
