import { useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import axios from "axios";

export default function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function getUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        setUser(res.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Failed to fetch user:", error);
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    getUser();
    return () => controller.abort();
  }, [token]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ token, setToken, user, setUser, logout, login }}>
      {children}
    </AppContext.Provider>
  );
}
