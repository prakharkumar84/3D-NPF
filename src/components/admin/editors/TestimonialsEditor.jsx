const TestimonialsEditor = ({ items, onUpdate, onAdd, onRemove, onImageUpload }) => {
  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <span className="text-purple-400 font-bold">#{index + 1}</span>
            <button
              onClick={() => onRemove(index)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              🗑️ Delete
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Name</label>
              <input
                type="text"
                value={item.name || ""}
                onChange={(e) => onUpdate(index, "name", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Designation</label>
              <input
                type="text"
                value={item.designation || ""}
                onChange={(e) => onUpdate(index, "designation", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Company</label>
              <input
                type="text"
                value={item.company || ""}
                onChange={(e) => onUpdate(index, "company", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Email</label>
              <input
                type="text"
                value={item.email || ""}
                onChange={(e) => onUpdate(index, "email", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-xs mb-1">Testimonial</label>
            <textarea
              value={item.testimonial || ""}
              onChange={(e) => onUpdate(index, "testimonial", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-xs mb-1">Image</label>
            <div className="flex items-center gap-3">
              {item.image && (
                <img src={item.image} alt="" className="w-12 h-12 rounded-full object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && onImageUpload(index, e.target.files[0])}
                className="text-sm text-gray-400"
              />
              <input
                type="text"
                value={item.image || ""}
                onChange={(e) => onUpdate(index, "image", e.target.value)}
                placeholder="or paste image URL"
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
      >
        + Add Testimonial
      </button>
    </div>
  );
};

export default TestimonialsEditor;
