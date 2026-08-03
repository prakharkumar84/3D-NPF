const UsersEditor = ({ items, onUpdate, onAdd, onRemove }) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm mb-4">
        Manage admin panel users. Changes take effect after save & deploy (next build).
      </p>

      {items.map((item, index) => (
        <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <span className="text-purple-400 font-bold">User #{index + 1}</span>
            {items.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                🗑️ Delete
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Username</label>
              <input
                type="text"
                value={item.username || ""}
                onChange={(e) => onUpdate(index, "username", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Password</label>
              <input
                type="text"
                value={item.password || ""}
                onChange={(e) => onUpdate(index, "password", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Role</label>
              <select
                value={item.role || "editor"}
                onChange={(e) => onUpdate(index, "role", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
      >
        + Add User
      </button>
    </div>
  );
};

export default UsersEditor;
