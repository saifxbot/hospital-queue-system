import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import AppointmentForm from "./components/Appointments/AppointmentForm";
import AppointmentList from "./components/Appointments/AppointmentList";
import DoctorsList from "./components/Doctors/DoctorsList";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments/new" element={<AppointmentForm />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;