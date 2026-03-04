import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "../pages/search/search";
import Login from "../pages/login/login";
import Signup from "../pages/signup/signup";
import Verify from "../pages/verify/verify";
import Home from "../pages/home/home";
import Profile from "../pages/profile/profile";
import Admin from "../pages/admin/admin";
import Shop from "../pages/shop/shop";
import CarDetails from "../pages/carDetails/CarDetails";
import ResetPassword from "../pages/resetPassword/resetPassword";
import Ball from "../pages/ball/ball";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/search" element={<Search />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ball" element={<Ball />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
