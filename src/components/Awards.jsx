import { useState } from "react";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { awards } from "../constants";

const Award = ({ index, category, image }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <motion.div
      variants={fadeIn("", "spring", index * 0.5, 0.75)}
      className="bg-slate-800 p-10 rounded-3xl xs:w-[320px] w-full"
    >
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setShowModal(false)}
        >
          <img
            src={image}
            alt={name}
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setShowModal(false)}
          >
            &times;
          </button>
        </div>
      )}
      <p className="text-white font-black text-[48px]"></p>

      <div className="mt-1">
        {/* <p className="text-white tracking-wider text-[18px]">{testimonial}</p> */}

        <div className="mt-7 flex justify-between items-center gap-1">
          <div className="flex-1 flex flex-col">
            <p>
              <img
                src={image}
                className="mb-3 w-50 h-50 rounded-lg hover:scale-x-105 transition-transform duration-300 cursor-zoom-in"
                alt="image"
              />
            </p>
            <p className="text-white font-medium text-[16px]">
              <span className="blue-text-gradient">@</span> {category}
            </p>
            {/* <p>
            <img src={image} className="w-50 h-50" />
          </p> */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Awards = () => {
  return (
    <div className={`mt-12 bg-black-100 rounded-[20px]`}>
      <div
        className={`bg-tertiary rounded-2xl ${styles.padding} min-h-[300px]`}
      >
        <motion.div variants={textVariant()}>
          <p className={styles.sectionSubText}>What I received</p>
          <h2 className={styles.sectionHeadText}>Awards</h2>
        </motion.div>
      </div>
      <div className={`-mt-20 pb-14 ${styles.paddingX} flex flex-wrap gap-7`}>
        {awards.map((award, index) => (
          <Award key={award.id} index={index} {...award} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Awards, "Awards");
