const AwardsEditor = ({ items, onUpdate, onAdd, onRemove, onImageUpload }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <span className="text-purple-400 font-bold">Award #{item.id || index + 1}</span>
              <button
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                🗑️ Delete
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-xs mb-1">Category</label>
              <input
                type="text"
                value={item.category || ""}
                onChange={(e) => onUpdate(index, "category", e.target.value)}
                placeholder="e.g. Sprinter, Champion"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Image</label>
              {item.image && (
                <img src={item.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && onImageUpload(index, e.target.files[0])}
                className="text-sm text-gray-400 mb-2"
              />
              <input
                type="text"
                value={item.image || ""}
                onChange={(e) => onUpdate(index, "image", e.target.value)}
                placeholder="or paste image URL"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
      >
        + Add Award
      </button>
    </div>
  );
};

export default AwardsEditor;
