import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/check-session",
          {
            withCredentials: "true",
          }
        );
        if (data.loggedIn) {
          setIsLoggedIn(true);
        } else {
          console.log("bok");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkSession();
  }, []);
  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/register",
        {
          username,
          email,
          password,
        },
        {
          withCredentials: "true",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };
  const login = async (username, password) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/login",
        {
          username,
          password,
        },
        {
          withCredentials: "true",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };
  const logout = () => {
    fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then(() => setIsLoggedIn(false))
      .catch((error) => console.error("Error:", error));
  };
  const value = {
    isLoggedIn,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};