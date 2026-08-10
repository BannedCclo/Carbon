import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home/home";

const Search = lazy(() => import("../pages/search/search"));
const Login = lazy(() => import("../pages/login/login"));
const Signup = lazy(() => import("../pages/signup/signup"));
const Verify = lazy(() => import("../pages/verify/verify"));
const Profile = lazy(() => import("../pages/profile/profile"));
const Admin = lazy(() => import("../pages/admin/admin"));
const Shop = lazy(() => import("../pages/shop/shop"));
const CarDetails = lazy(() => import("../pages/carDetails/CarDetails"));
const ResetPassword = lazy(() => import("../pages/resetPassword/resetPassword"));
const EmailNaoVerificado = lazy(() => import("../pages/emailNaoVerificado/emailNaoVerificado"));

const RouteFallback = () => (
  <div style={{ minHeight: "100dvh", backgroundColor: "#0e0b25" }} />
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
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
          <Route path="/email-nao-verificado" element={<EmailNaoVerificado />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
