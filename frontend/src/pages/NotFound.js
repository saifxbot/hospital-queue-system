import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="fade-in text-center">
      <div className="card">
        <div className="medical-icon" style={{ fontSize: "4rem" }}>🏥</div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for seems to have taken a sick day!</p>
        <div className="mt-2">
          <Link to="/" className="dashboard-card a" style={{ display: "inline-block", textDecoration: "none" }}>
            🏠 Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;