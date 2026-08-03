import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

const AdminPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("admin_user");
      }
    }
  }, []);

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    setUser(null);
  };

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const token = import.meta.env.VITE_GITHUB_TOKEN;

  return <AdminPanel token={token} user={user} onLogout={handleLogout} />;
};

export default AdminPage;
