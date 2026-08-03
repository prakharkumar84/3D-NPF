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

  // GitHub token comes from Vite env variable (set in Netlify dashboard)
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Configuration Error</h2>
          <p className="text-gray-300">
            VITE_GITHUB_TOKEN environment variable is not set.
            Add it in your Netlify dashboard under Site Settings → Environment Variables.
          </p>
        </div>
      </div>
    );
  }

  return <AdminPanel token={token} user={user} onLogout={handleLogout} />;
};

export default AdminPage;
