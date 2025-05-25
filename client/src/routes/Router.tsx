import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "../pages/search/search";
import Login from "../pages/login/login";
import Signup from "../pages/signup/signup";
import Verify from "../pages/verify/verify";
import Home from "../pages/home/home";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
