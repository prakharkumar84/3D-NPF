/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import React, { useState } from "react";
import { Tilt } from "react-tilt";
import { native } from "../constants";
import { fadeIn } from "../utils/motion";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";
import "./ImageHover.css";
import { github } from "../assets";

const GameCard = ({ index, str, url, play, description, tags }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  return (
    <div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <div className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full">
        <div className="relative w-full h-[400px] image-container">
          <img
            src={url}
            alt="project_image"
            className="w-full h-full object-fill rounded-2xl image1"
          />

          <div className="absolute inset-0 flex justify-end m-3 card-img_hover">
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
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-white font-bold text-[24px]">{str}</h3>
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
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <p
              key={`${str}-${tag.name}`}
              className={`text-[14px] ${tag.color}`}
            >
              #{tag.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

const Native = () => {
  return (
    <>
      <div variants={textVariant()}>
        <h6 className={styles.sectionHeadText}>React-native Projects</h6>
      </div>
      <div className="w-full flex ">
        <p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px] "
        >
          Here I showcase my expertise as a React Native developer. I'm thrilled
          to have this opportunity to share my skills and experiences with you.
          I am passionate about creating exceptional mobile applications that
          combine the power of React and native capabilities. With React Native,
          I can build robust and high-performance apps that run seamlessly on
          both iOS and Android platforms.
        </p>
      </div>
      <div>
        <p className="mt-3 text-secondary text-[19px] max-w-3xl leading-[30px] ">
          What I know:
        </p>
        <ul className="mt-3 text-secondary  list-disc ml-5 space-y-2 leading-[20px] ">
          <li>React Native</li>
          <li>TypeScript</li>
          <li>Javascript</li>
          <li>Java/Kotlin</li>
          <li>React Native Third Party Libraries</li>
          <li>Redux</li>
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-5">
        {native.map((project, index) => (
          <GameCard key={project.id} index={index} {...project} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Native, "native");
