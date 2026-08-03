import { useState, useEffect, useCallback } from "react";
import GitHubService from "./GitHubService";
import TestimonialsEditor from "./editors/TestimonialsEditor";
import AwardsEditor from "./editors/AwardsEditor";
import SkillsEditor from "./editors/SkillsEditor";
import ProjectsEditor from "./editors/ProjectsEditor";
import AIProjectsEditor from "./editors/AIProjectsEditor";

const SECTIONS = [
  { key: "testimonials", label: "Testimonials", file: "public/data/testimonials.json" },
  { key: "awards", label: "Awards", file: "public/data/awards.json" },
  { key: "skills", label: "Skills & Technologies", file: "public/data/skills.json" },
  { key: "projects", label: "Projects", file: "public/data/projects.json" },
  { key: "aiProjects", label: "AI Engineering", file: "public/data/aiProjects.json" },
];

const AdminPanel = ({ token, onLogout }) => {
  const [github] = useState(() => new GitHubService(token));
  const [activeSection, setActiveSection] = useState("testimonials");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = {};
      for (const section of SECTIONS) {
        const file = await github.getFile(section.file);
        if (file) {
          loaded[section.key] = JSON.parse(file.content);
        }
      }
      setData(loaded);
    } catch (err) {
      setStatus(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [github]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveSection = async (key) => {
    setSaving(true);
    setStatus("");
    try {
      const section = SECTIONS.find((s) => s.key === key);
      const content = JSON.stringify(data[key], null, 2);
      await github.updateFile(
        section.file,
        content,
        `Admin: Update ${section.label}`
      );
      setStatus(`✅ ${section.label} saved & deployed!`);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (key, index, field, value) => {
    setData((prev) => {
      const updated = { ...prev };
      const arr = [...(Array.isArray(updated[key]) ? updated[key] : [])];
      arr[index] = { ...arr[index], [field]: value };
      updated[key] = arr;
      return updated;
    });
  };

  const addItem = (key, template) => {
    setData((prev) => {
      const updated = { ...prev };
      const arr = Array.isArray(updated[key]) ? [...updated[key]] : [];
      arr.push(template);
      updated[key] = arr;
      return updated;
    });
  };

  const removeItem = (key, index) => {
    if (!confirm("Delete this item?")) return;
    setData((prev) => {
      const updated = { ...prev };
      const arr = [...updated[key]];
      arr.splice(index, 1);
      updated[key] = arr;
      return updated;
    });
  };

  const handleImageUpload = async (key, index, field, file) => {
    try {
      setStatus("Uploading image...");
      const url = await github.uploadImage(file);
      updateItem(key, index, field, url);
      setStatus("✅ Image uploaded!");
    } catch (err) {
      setStatus(`❌ Image upload failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading data from GitHub...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6">📝 Admin</h2>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeSection === s.key
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="w-full text-red-400 hover:text-red-300 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {SECTIONS.find((s) => s.key === activeSection)?.label}
          </h1>
          <button
            onClick={() => saveSection(activeSection)}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "💾 Save & Deploy"}
          </button>
        </div>

        {status && (
          <div className="mb-4 px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-200">
            {status}
          </div>
        )}

        {activeSection === "testimonials" && (
          <TestimonialsEditor
            items={data.testimonials || []}
            onUpdate={(i, f, v) => updateItem("testimonials", i, f, v)}
            onAdd={() =>
              addItem("testimonials", {
                testimonial: "",
                name: "",
                designation: "",
                company: "",
                email: "",
                image: "",
              })
            }
            onRemove={(i) => removeItem("testimonials", i)}
            onImageUpload={(i, file) =>
              handleImageUpload("testimonials", i, "image", file)
            }
          />
        )}

        {activeSection === "awards" && (
          <AwardsEditor
            items={data.awards || []}
            onUpdate={(i, f, v) => updateItem("awards", i, f, v)}
            onAdd={() =>
              addItem("awards", {
                id: Date.now(),
                category: "",
                image: "",
              })
            }
            onRemove={(i) => removeItem("awards", i)}
            onImageUpload={(i, file) =>
              handleImageUpload("awards", i, "image", file)
            }
          />
        )}

        {activeSection === "skills" && (
          <SkillsEditor
            data={data.skills || { technologies: [], additionalSkills: [] }}
            onChange={(newSkills) =>
              setData((prev) => ({ ...prev, skills: newSkills }))
            }
          />
        )}

        {activeSection === "projects" && (
          <ProjectsEditor
            items={data.projects || []}
            onUpdate={(i, f, v) => updateItem("projects", i, f, v)}
            onAdd={() =>
              addItem("projects", {
                name: "",
                description: "",
                tags: [],
                image: "",
                source_code_link: "",
              })
            }
            onRemove={(i) => removeItem("projects", i)}
            onImageUpload={(i, file) =>
              handleImageUpload("projects", i, "image", file)
            }
          />
        )}

        {activeSection === "aiProjects" && (
          <AIProjectsEditor
            items={data.aiProjects || []}
            onUpdate={(i, f, v) => updateItem("aiProjects", i, f, v)}
            onAdd={() =>
              addItem("aiProjects", {
                id: Date.now(),
                title: "",
                description: "",
                points: [],
                tags: [],
              })
            }
            onRemove={(i) => removeItem("aiProjects", i)}
          />
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
