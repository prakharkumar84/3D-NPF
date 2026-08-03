import { useState } from "react";

const SkillsEditor = ({ data, onChange }) => {
  const [newTech, setNewTech] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const addTechnology = () => {
    if (!newTech.trim()) return;
    const updated = {
      ...data,
      technologies: [...data.technologies, { name: newTech.trim() }],
    };
    onChange(updated);
    setNewTech("");
  };

  const removeTechnology = (index) => {
    const updated = {
      ...data,
      technologies: data.technologies.filter((_, i) => i !== index),
    };
    onChange(updated);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = {
      ...data,
      additionalSkills: [...data.additionalSkills, newSkill.trim()],
    };
    onChange(updated);
    setNewSkill("");
  };

  const removeSkill = (index) => {
    const updated = {
      ...data,
      additionalSkills: data.additionalSkills.filter((_, i) => i !== index),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Main Technologies (shown as 3D balls) */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-4">Main Technologies (3D Balls)</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.technologies.map((tech, index) => (
            <span
              key={index}
              className="bg-purple-600/20 border border-purple-500/40 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
            >
              {tech.name}
              <button
                onClick={() => removeTechnology(index)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTechnology()}
            placeholder="Add technology..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
          />
          <button
            onClick={addTechnology}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Additional Skills */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-4">Additional Skills (Tags)</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.additionalSkills.map((skill, index) => (
            <span
              key={index}
              className="bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              <button
                onClick={() => removeSkill(index)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Add skill..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
          />
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsEditor;
