import { useState } from "react";

const AdminLogin = ({ onLogin }) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Verify token by checking repo access
      const res = await fetch(
        "https://api.github.com/repos/prakharkumar84/3D-NPF",
        { headers: { Authorization: `token ${token}` } }
      );
      if (!res.ok) throw new Error("Invalid token or no repo access");

      const data = await res.json();
      if (!data.permissions?.push) {
        throw new Error("Token does not have push access to this repo");
      }

      localStorage.setItem("gh_admin_token", token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Enter your GitHub Personal Access Token with repo push access.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-300 text-sm mb-2">
            GitHub Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none mb-4"
            required
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        <p className="text-gray-500 text-xs mt-4">
          Create a token at{" "}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 underline"
          >
            GitHub Settings → Tokens
          </a>{" "}
          with &quot;repo&quot; scope.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
