import { useState } from "react";

const TagsInput = ({ tags, onChange }) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (!input.trim()) return;
    const colors = ["blue-text-gradient", "green-text-gradient", "pink-text-gradient", "orange-text-gradient"];
    onChange([...tags, { name: input.trim(), color: colors[tags.length % colors.length] }]);
    setInput("");
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className={`text-xs ${tag.color} bg-gray-700 px-2 py-1 rounded-md flex items-center gap-1`}>
            #{tag.name}
            <button onClick={() => removeTag(i)} className="text-red-400">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder="Add tag..."
          className="flex-1 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-xs"
        />
        <button onClick={addTag} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">+</button>
      </div>
    </div>
  );
};

const ProjectsEditor = ({ items, onUpdate, onAdd, onRemove, onImageUpload }) => {
  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <span className="text-purple-400 font-bold">Project #{index + 1}</span>
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
              <label className="block text-gray-400 text-xs mb-1">Link</label>
              <input
                type="text"
                value={item.source_code_link || ""}
                onChange={(e) => onUpdate(index, "source_code_link", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-xs mb-1">Description</label>
            <textarea
              value={item.description || ""}
              onChange={(e) => onUpdate(index, "description", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-xs mb-1">Tags</label>
            <TagsInput
              tags={item.tags || []}
              onChange={(tags) => onUpdate(index, "tags", tags)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-xs mb-1">Image</label>
            <div className="flex items-center gap-3">
              {item.image && (
                <img src={item.image} alt="" className="w-16 h-12 object-cover rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && onImageUpload(index, e.target.files[0])}
                className="text-sm text-gray-400"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
      >
        + Add Project
      </button>
    </div>
  );
};

export default ProjectsEditor;
