import "./App.css";
import Calendar from "./components/Calendar.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserJoin from "./components/UserJoin"; // 회원가입 페이지
import UserLogin from "./components/UserLogin"; // 로그인 페이지
import UserUpdate from "./components/UserUpdate"; // 회원정보수정 페이지
import DeleteAccount from "./components/DeleteAccount"; // 회원탈퇴 페이지
import Index from "./components/index";
import PrivacyPolicy from "./pages/PrivacyPolicy"; // 개인정보처리방침 페이지
import TermsOfService from "./pages/TermsOfService"; // 이용약관 페이지

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/" element={<Index />} />
        <Route path="/UserJoin" element={<UserJoin />} />
        <Route path="/UserLogin" element={<UserLogin />} />
        <Route path="/UserUpdate" element={<UserUpdate />} />
        <Route path="/DeleteAccount/:userId" element={<DeleteAccount />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </Router>
  );
  //return <Test />;
}

export default App;
