import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

const AdminPage = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("gh_admin_token");
    if (saved) setToken(saved);
  }, []);

  const handleLogin = (t) => setToken(t);

  const handleLogout = () => {
    localStorage.removeItem("gh_admin_token");
    setToken(null);
  };

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminPanel token={token} onLogout={handleLogout} />;
};

export default AdminPage;
