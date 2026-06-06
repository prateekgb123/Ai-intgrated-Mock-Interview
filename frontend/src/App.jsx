import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./components/Login";

import Signup from "./components/Signup";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";

import DashboardPage from "./pages/DashboardPage";

import InterviewPage from "./pages/InterviewPage";

import CodingRound from "./components/CodingRound";

import CompanyPrep from "./components/CompanyPrep";

import ResumeAnalysis from "./components/ResumeAnalysis";

import "./App.css";

import "./styles/auth.css";

import "./styles/dashboard.css";

import "./styles/interview.css";

function App() {

  const token =
    localStorage.getItem("token");

  return (
    <BrowserRouter>

      {/* Show navbar only after login */}

      {token && <Navbar />}

      <Routes>

        {/* Default Route */}

        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/home" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* HOME */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

  
        {/* INTERVIEW */}

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          }
        />

        {/* CODING */}

        <Route
          path="/coding"
          element={
            <ProtectedRoute>
              <CodingRound />
            </ProtectedRoute>
          }
        />

        {/* COMPANY PREP */}

        <Route
          path="/company-prep"
          element={
            <ProtectedRoute>
              <CompanyPrep />
            </ProtectedRoute>
          }
        />

        {/* RESUME */}

        <Route
          path="/resume-analysis"
          element={
            <ProtectedRoute>
              <ResumeAnalysis />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;