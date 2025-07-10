/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import { info_data, LN_projects } from "../constants";
import { fadeIn } from "../utils/motion";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";
import "./ImageHover.css";
import { github } from "../assets";

const GameCard = ({ index, company, url, description, tags, points }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  return (
    <div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <div className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full">
        <div className="relative w-full h-[200px] image-container">
          <img
            src={url}
            alt="project_image"
            className="w-full h-full object-fill rounded-2xl"
          />
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
              key={`${company}-${tag.name}`}
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
        <h6 className={styles.sectionHeadText}>{info_data.LN.id}</h6>
      </div>
      <div className="w-full flex ">
        <p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px] "
        >
          {info_data.LN.text}
        </p>
      </div>
      <div>
        <p className="mt-3 text-secondary text-[19px] max-w-3xl leading-[30px] ">
          What I know:
        </p>
        <ul className="mt-3 text-secondary  list-disc ml-5 space-y-2 leading-[20px] ">
          {info_data.LN.skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-5">
        {LN_projects.map((project, index) => (
          <GameCard key={project.id} index={index} {...project} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Native, "native");
