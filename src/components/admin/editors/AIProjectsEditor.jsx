import { useState } from "react";

const PointsEditor = ({ points, onChange }) => {
  const [input, setInput] = useState("");

  const addPoint = () => {
    if (!input.trim()) return;
    onChange([...points, input.trim()]);
    setInput("");
  };

  const removePoint = (index) => {
    onChange(points.filter((_, i) => i !== index));
  };

  const updatePoint = (index, value) => {
    const updated = [...points];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {points.map((point, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-gray-500 text-xs mt-2">•</span>
          <input
            type="text"
            value={point}
            onChange={(e) => updatePoint(i, e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-xs"
          />
          <button onClick={() => removePoint(i)} className="text-red-400 text-xs mt-1">×</button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPoint())}
          placeholder="Add point..."
          className="flex-1 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-xs"
        />
        <button onClick={addPoint} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">+</button>
      </div>
    </div>
  );
};

const TagsEditor = ({ tags, onChange }) => {
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

const AIProjectsEditor = ({ items, onUpdate, onAdd, onRemove }) => {
  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <span className="text-purple-400 font-bold">AI Project #{index + 1}</span>
            <button
              onClick={() => onRemove(index)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              🗑️ Delete
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">Title</label>
            <input
              type="text"
              value={item.title || ""}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">Description</label>
            <textarea
              value={item.description || ""}
              onChange={(e) => onUpdate(index, "description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">Key Points</label>
            <PointsEditor
              points={item.points || []}
              onChange={(points) => onUpdate(index, "points", points)}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Tags</label>
            <TagsEditor
              tags={item.tags || []}
              onChange={(tags) => onUpdate(index, "tags", tags)}
            />
          </div>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
      >
        + Add AI Project
      </button>
    </div>
  );
};

export default AIProjectsEditor;
