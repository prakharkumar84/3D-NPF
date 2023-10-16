/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import React from "react";
import { Tilt } from "react-tilt";
import { animation, AnimationVideos } from "../constants";
import { fadeIn } from "../utils/motion";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";
import "./ImageHover.css";

const ProjectCard = ({ index, id, url }) => {
  return (
    <div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className="bg-tertiary p-1.5 rounded-2xl sm:w-[360px] w-full relative z-0"
      >
        <div className="relative w-full h-[230px] image-container">
          <img
            src={url}
            alt="animation_image"
            className="relative w-full h-full object-cover rounded-2xl image"
          />
        </div>
      </Tilt>
    </div>
  );
};
const VideoCard = ({ index, url }) => {
  return (
    <div
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className=" bg-tertiary p-1.5 mt-10 relative w-full h-full rounded-2xl "
    >
      <div className="relative w-full h-full  ">
        <video
          className="relative w-full h-full rounded-2xl  "
          src={url}
          type="video/mp4"
          autoPlay
          height={1280}
          width={1980}
          controls
        />
      </div>
    </div>
  );
};

const Animation = () => {
  return (
    <section id="my-section">
      <div variants={textVariant()}>
        <h6 className={styles.sectionHeadText}>Animation</h6>
      </div>
      <div className="w-full flex ">
        <p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px] "
        >
          Feel free to check my work in animation . I have been following 3d
          animation from last 2 years while pursuing my Btech. I am fairly
          experienced in 3D modelling , texturing , rigging and animating
          models. I use blender as my main software for modelling as its free
          and I also know my way around autodesk maya which is a industry
          standard . I use photoshop and gimp for textures and colors for my
          projects.
        </p>
      </div>
      <div>
        <p className="mt-3 text-secondary text-[19px] max-w-3xl leading-[30px] ">
          What I know:
        </p>
        <ul className="mt-3 text-secondary  list-disc ml-5 space-y-2 leading-[20px] ">
          <li>3d modelling</li>
          <li>Rigging</li>
          <li>Texturing</li>
          <li>Animation</li>
          <li>Environment design</li>
          <li>Compositing</li>
        </ul>
      </div>
      <div className="mt-20 flex flex-wrap gap-5">
        {animation.map((project, index) => (
          <ProjectCard key={project.key} index={index} {...project} />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-7">
        {AnimationVideos.map((project, index) => (
          <VideoCard key={project.id} index={index} {...project} />
        ))}
      </div>
    </section>
  );
};

export default SectionWrapper(Animation, "animation");
