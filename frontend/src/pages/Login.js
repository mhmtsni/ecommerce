import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      await login(formData.username, formData.password);
      setError(false);
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        console.error(error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      setError(true);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          backgroundColor: "#ffffff",
          padding: "40px",
          boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#333" }}>Login</h2>

        <label style={{ fontWeight: "bold", color: "#555" }}>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Enter your username"
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <label style={{ fontWeight: "bold", color: "#555" }}>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#ffffff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "15px", color: "red", textAlign: "center" }}>
          <h3>{errorMessage}</h3>
        </div>
      )}
    </div>
  );
}
