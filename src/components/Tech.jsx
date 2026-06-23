import { SectionWrapper } from "../hoc";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { textVariant, fadeIn } from "../utils/motion";

import anthropic from "../assets/tech/anthropic.svg";
import docker from "../assets/tech/docker.svg";
import eclipse from "../assets/tech/eclipse.svg";
import git from "../assets/tech/git.svg";
import javascript from "../assets/tech/javascript.svg";
import langchain from "../assets/tech/langchain.svg";
import neo4j from "../assets/tech/neo4j.svg";
import nodejs from "../assets/tech/nodejs.svg";
import openapi from "../assets/tech/openapi.svg";
import python from "../assets/tech/python.svg";
import sql from "../assets/tech/sql.svg";
import xml from "../assets/tech/xml.svg";
import infor from "../assets/infor.svg";

const skills = [
  { name: "4GL / BaanC", icon: infor },
  { name: "REST APIs", icon: openapi },
  { name: "Node.js", icon: nodejs },
  { name: "JavaScript", icon: javascript },
  { name: "Python", icon: python },
  { name: "SQL", icon: sql },
  { name: "MCP Servers", icon: anthropic },
  { name: "AI Agents", icon: anthropic },
  { name: "RAG / LLMs", icon: langchain },
  { name: "Infor ION", icon: infor },
  { name: "API Gateway", icon: openapi },
  { name: "Docker", icon: docker },
  { name: "Git", icon: git },
  { name: "SOAP / XML", icon: xml },
  { name: "BOD / BDE", icon: infor },
  { name: "IDM / IDP", icon: infor },
  { name: "LN Studio", icon: eclipse },
  { name: "Knowledge Graphs", icon: neo4j },
  { name: "Prompt Engineering", icon: anthropic },
  { name: "Infor RPA", icon: infor },
];

const Tech = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>What I work with</p>
        <h2 className={styles.sectionHeadText}>Skills.</h2>
      </motion.div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.name}
            variants={fadeIn("up", "spring", index * 0.04, 0.6)}
            className="group"
          >
            <div className="bg-tertiary rounded-[14px] px-5 py-3 flex items-center gap-3 border border-white/5 hover:border-[#915EFF]/50 transition-all duration-300">
              <img
                src={skill.icon}
                alt={skill.name}
                className="w-6 h-6 object-contain shrink-0"
              />
              <span className="text-white text-[14px] font-medium">
                {skill.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Tech, "");
