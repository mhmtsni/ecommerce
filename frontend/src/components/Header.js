import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#2c3e50",
        padding: "15px 50px",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        boxSizing: "border-box",
      }}
    >
      <h1>
        <Link
          to="/"
          style={{
            color: "#e74c3c",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "28px",
          }}
        >
          E-Commerce Store
        </Link>
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {!isLoggedIn ? (
          <>
            <h1>
              <Link
                to="/login"
                style={{
                  color: "#3498db",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                Login
              </Link>
            </h1>
            <h1>
              <Link
                to="/register"
                style={{
                  color: "#3498db",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                Register
              </Link>
            </h1>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
            }}
          >
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <h1
                style={{
                  color: "#3498db",
                  fontWeight: "bold",
                  fontSize: "20px",
                  marginTop: "20px",
                }}
              >
                Logout
              </h1>
            </button>

            <h1>
              <Link
                to="/cart"
                style={{
                  color: "#3498db",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                Cart
              </Link>
            </h1>

            <h1>
              <Link
                to="/profile"
                style={{
                  color: "#3498db",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                Profile
              </Link>
            </h1>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
