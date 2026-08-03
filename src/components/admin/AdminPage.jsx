import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [tokenSubmitted, setTokenSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_user");
    const savedToken = localStorage.getItem("gh_token");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("admin_user");
      }
    }
    if (savedToken) {
      setToken(savedToken);
      setTokenSubmitted(true);
    }
  }, []);

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    localStorage.removeItem("gh_token");
    setUser(null);
    setToken("");
    setTokenSubmitted(false);
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem("gh_token", token.trim());
      setTokenSubmitted(true);
    }
  };

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (!tokenSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2">GitHub Token</h2>
          <p className="text-gray-400 text-sm mb-4">
            Enter your GitHub token to enable saving changes to the repo.
          </p>
          <form onSubmit={handleTokenSubmit}>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
          <p className="text-gray-500 text-xs mt-3">
            Token is stored in your browser only. Get one at{" "}
            <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-purple-400 underline">
              GitHub Settings → Tokens
            </a> with &quot;repo&quot; scope.
          </p>
        </div>
      </div>
    );
  }

  return <AdminPanel token={token} user={user} onLogout={handleLogout} />;
};

export default AdminPage;
