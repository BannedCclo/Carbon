import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login/login";
import Signup from "../pages/signup/signup";
import Verify from "../pages/verify/verify";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
