import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import CitizenLayout from "../layouts/CitizenLayout";

import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import RegisterComplaint from "../pages/citizen/RegisterComplaint";
import ComplaintDetails from "../pages/citizen/ComplaintDetails";
import Profile from "../pages/citizen/Profile";

import OfficerDashboard from "../pages/officer/OfficerDashboard";
import ComplaintQueue from "../pages/officer/ComplaintQueue";
import ComplaintReview from "../pages/officer/ComplaintReview";
import Analytics from "../pages/officer/Analytics";

import NotFound from "../pages/error/NotFound";

function RequireCitizen() {
  const { isAuthenticated, isCitizen } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isCitizen) return <Navigate to="/officer/dashboard" replace />;
  return <Outlet />;
}

function RequireOfficer() {
  const { isAuthenticated, isOfficer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOfficer) return <Navigate to="/citizen/dashboard" replace />;
  return <Outlet />;
}

function RequireGuest() {
  const { isAuthenticated, isCitizen } = useAuth();
  if (!isAuthenticated) return <Outlet />;
  return (
    <Navigate
      to={isCitizen ? "/citizen/dashboard" : "/officer/dashboard"}
      replace
    />
  );
}

function AppRouterTree() {
  return (
    <Routes>
      {/* ── Public pages (with main navbar) ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* ── Auth pages (no main navbar) ── */}
      <Route element={<RequireGuest />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Route>

      {/* ── Citizen routes (MainLayout + citizen guard) ── */}
      <Route element={<CitizenLayout />}>
          <Route path="/file-complaint" element={<RegisterComplaint />} />
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
          <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<RequireCitizen />}>
        <Route element={<CitizenLayout />}>
        </Route>
      </Route>

      {/* ── Officer routes (MainLayout + officer guard) ── */}
      <Route element={<MainLayout />}>
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/officer/queue" element={<ComplaintQueue />} />
          <Route path="/officer/review/:id" element={<ComplaintReview />} />
          <Route path="/officer/analytics" element={<Analytics />} />
        </Route>
      <Route element={<RequireOfficer />}>
        
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouterTree />
      </AuthProvider>
    </BrowserRouter>
  );
}
