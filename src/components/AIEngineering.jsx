/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { info_data, aiProjects as fallbackAiProjects } from "../constants";
import { loadSectionData } from "../utils/dataLoader";

const AIProjectCard = ({ index, title, description, points, tags }) => (
  <motion.div
    variants={fadeIn("up", "spring", index * 0.3, 0.75)}
    className="w-full"
  >
    <div className="bg-tertiary rounded-[20px] p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#915EFF] flex items-center justify-center">
          <span className="text-white font-bold text-[16px]">
            {index + 1}
          </span>
        </div>
        <h3 className="text-white text-[22px] font-bold">{title}</h3>
      </div>

      <p className="text-secondary text-[15px] leading-[26px] mb-4">
        {description}
      </p>

      <ul className="list-disc ml-5 space-y-2 mb-4">
        {points.map((point, i) => (
          <li
            key={`ai-point-${index}-${i}`}
            className="text-white-100 text-[13px] pl-1 tracking-wider"
          >
            {point}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.name}
            className={`text-[13px] ${tag.color} bg-black-200 px-2 py-1 rounded-md`}
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

const AIEngineering = () => {
  const [aiProjects, setAiProjects] = useState(fallbackAiProjects);

  useEffect(() => {
    loadSectionData("aiProjects").then((data) => {
      if (data) setAiProjects(data);
    });
  }, []);

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Building the future</p>
        <h2 className={styles.sectionHeadText}>AI Engineering.</h2>
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-4 text-secondary text-[17px] max-w-4xl leading-[30px]"
      >
        {info_data.AI.text}
      </motion.p>

      {/* Skills */}
      <div className="mt-8 flex flex-wrap gap-3">
        {info_data.AI.skills.map((skill, index) => (
          <motion.span
            key={skill}
            variants={fadeIn("up", "spring", index * 0.05, 0.5)}
            className="bg-[#915EFF]/20 border border-[#915EFF]/40 text-white text-[13px] px-3 py-1.5 rounded-full"
          >
            {skill}
          </motion.span>
        ))}
      </div>

      {/* Highlight Stats */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "MCP Tools Built", value: "40+" },
          { label: "Knowledge Nodes", value: "610" },
          { label: "Doc Files Indexed", value: "600+" },
          { label: "Templates Automated", value: "5" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={fadeIn("up", "spring", index * 0.1, 0.5)}
            className="bg-black-200 rounded-xl p-4 text-center border border-[#915EFF]/20"
          >
            <p className="text-[#915EFF] text-[28px] font-bold">
              {stat.value}
            </p>
            <p className="text-secondary text-[12px] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Project Cards */}
      <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {aiProjects.map((project, index) => (
          <AIProjectCard key={project.id} index={index} {...project} />
        ))}
      </div>

      {/* See More - MCP Showcase */}
      <div className="mt-12 text-center">
        <a
          href="/mcp-showcase"
          className="inline-block bg-[#915EFF] hover:bg-[#7a4de0] text-white font-bold py-4 px-10 rounded-full text-[16px] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#915EFF]/25"
        >
          See MCP Tools in Action
        </a>
        <p className="text-secondary text-[13px] mt-3">
          Interactive demos with live code generation
        </p>
      </div>
    </>
  );
};

export default SectionWrapper(AIEngineering, "ai-engineering");
