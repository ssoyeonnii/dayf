import "./App.css";
import Calendar from "./components/Calendar.jsx";
import Test from "./components/Test.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserJoin from "./components/UserJoin"; // 회원가입 페이지
import UserLogin from "./components/UserLogin"; // 로그인 페이지
import DeleteAccount from "./components/DeleteAccount"; // 회원탈퇴 페이지
import Index from "./components/index";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/" element={<Index />} />
        <Route path="/UserJoin" element={<UserJoin />} />
        <Route path="/UserLogin" element={<UserLogin />} />
       <Route path="/DeleteAccount/:userId" element={<DeleteAccount />} />

      </Routes>
    </Router>
  );
  //return <Test />;
}

export default App;
