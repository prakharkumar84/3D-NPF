/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import React, { useState } from "react";
import { Tilt } from "react-tilt";
import { info_data, ION_projects } from "../constants";
import { fadeIn } from "../utils/motion";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";
import "./ImageHover.css";
import { motion } from "framer-motion";
import { github } from "../assets";

const GameCard = ({ index, company, url, description, points, tags }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full"
      >
        <div className="relative w-full h-[200px]">
          <img
            src={url}
            alt="project_image"
            className="w-full h-full object-cover rounded-2xl"
          />

          {/* <div className="absolute inset-0 flex justify-end m-3 card-img_hover">
            <div
              onClick={() => window.open(play, "_blank")}
              className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
            >
              <img
                src={github}
                alt="source code"
                className="w-1/2 h-1/2 object-contain"
              />
            </div>
          </div> */}
        </div>

        <div className="mt-5">
          <h3 className="text-white font-bold text-[24px]">{company}</h3>
          <p
            className={
              expanded
                ? "mt-2 text-secondary text-[14px]"
                : "mt-2 text-secondary text-[14px] description-limit"
            }
          >
            {description}
          </p>
          {description.length > 5 && (
            <button onClick={toggleExpand}>
              {expanded ? "Read Less" : "Read More"}
            </button>
          )}
          {expanded && (
            <ul className="mt-2 text-secondary list-disc ml-5 space-y-2 leading-[20px]">
              {points.map((point, index) => (
                <li key={`point-${index}`} className="text-[14px]">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <p
              key={`${name}-${tag.name}`}
              className={`text-[14px] ${tag.color}`}
            >
              #{tag.name}
            </p>
          ))}
        </div>
      </Tilt>
    </motion.div>
  );
};

const Game = () => {
  return (
    <>
      <div variants={textVariant()}>
        <h6 className={styles.sectionHeadText}>{info_data.OS.id}</h6>
      </div>
      <div className="w-full flex ">
        <p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px] "
        >
          {info_data.OS.text}
        </p>
      </div>
      <div>
        <p className="mt-3 text-secondary text-[19px] max-w-3xl leading-[30px] ">
          What I know:
        </p>
        <ul className="mt-3 text-secondary  list-disc ml-5 space-y-2 leading-[20px] ">
          {/* <li>Unity Engine</li>
          <li>Autodesk Maya</li>
          <li>Blender</li>
          <li>C#</li>
          <li>Material Design</li>
          <li>Unreal engine</li> */}
          {info_data.OS.skills.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-5">
        {ION_projects.map((project, index) => (
          <GameCard key={project.id} index={index} {...project} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Game, "game");
