/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { services } from "../constants";
import { Tilt } from "react-tilt";
import { fadeIn } from "../utils/motion";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";
import { arrow } from "../assets";

const Types = ({
  isAnimation,
  isWeb,
  isNative,
  isGame,
  setIsAnimation,
  setIsWeb,
  setIsNative,
  setIsGame,
}) => {
  const handleWebPress = () => {
    if (isAnimation) {
      setIsAnimation(!isAnimation);
    }
    setIsWeb(!isWeb);
    if (isNative) {
      setIsNative(!isNative);
    }
    if (isGame) {
      setIsGame(!isGame);
    }
  };
  const handleNativePress = () => {
    if (isAnimation) {
      setIsAnimation(!isAnimation);
    }
    if (isWeb) {
      setIsWeb(!isWeb);
    }
    setIsNative(!isNative);
    if (isGame) {
      setIsGame(!isGame);
    }
  };
  const handleGamePress = () => {
    if (isAnimation) {
      setIsAnimation(!isAnimation);
    }
    if (isWeb) {
      setIsWeb(!isWeb);
    }
    if (isNative) {
      setIsNative(!isNative);
    }
    setIsGame(!isGame);
  };
  const handleAnimationPress = () => {
    setIsAnimation(!isAnimation);
    if (isWeb) {
      setIsWeb(!isWeb);
    }
    if (isNative) {
      setIsNative(!isNative);
    }
    if (isGame) {
      setIsGame(!isGame);
    }
  };
  return (
    <motion.section
      variants={staggerContainer()}
      className={`${styles.paddingNew} max-w-7xl mx-auto relative z-0  `}
    >
      <div className=" p-3.5 mt-5 flex flex-wrap gap-6 ">
        <Tilt className="xs:w-[250px] w-full">
          <div
            variants={fadeIn("right", "spring", 0 * 0.5, 0.75)}
            className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
          >
            <div
              // eslint-disable-next-line react/no-unknown-property
              options={{
                max: 45,
                scale: 1,
                speed: 450,
              }}
              className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col"
            >
              <img
                src={services[0].icon}
                alt="web-development"
                className="w-16 h-16 object-contain"
              />

              <h3 className="text-white text-[20px] font-bold text-center">
                React JS
              </h3>
              <button
                className="w-[100px] green-pink-gradient p-[1px] rounded-[10px] shadow-card bg-tertiary border "
                onClick={handleWebPress}
              >
                Check
              </button>
              <p>
                {isWeb && (
                  <div className=" flex flex-row justify-center items-center">
                    <div className=" flex flex-row justify-center items-center">
                      <p>Scroll Down</p>
                    </div>
                    <div className=" h-[40px] w-[20px] rounded-2xl ml-5 mt-3">
                      <img
                        className="h-[30px] w-[20px] rounded-2xl"
                        src={arrow}
                      ></img>
                    </div>
                  </div>
                )}
              </p>
            </div>
          </div>
        </Tilt>

        <Tilt className="xs:w-[250px] w-full">
          <div
            variants={fadeIn("right", "spring", 1 * 0.5, 0.75)}
            className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
          >
            <div
              // eslint-disable-next-line react/no-unknown-property
              options={{
                max: 45,
                scale: 1,
                speed: 450,
              }}
              className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col"
            >
              <img
                src={services[1].icon}
                alt="web-development"
                className="w-16 h-16 object-contain"
              />

              <h3 className="text-white text-[20px] font-bold text-center">
                React Native
              </h3>
              <button
                className="w-[100px] green-pink-gradient p-[1px] rounded-[10px] shadow-card bg-tertiary border "
                onClick={handleNativePress}
              >
                Check
              </button>
              <p>
                {isNative && (
                  <div className=" flex flex-row justify-center items-center">
                    <div className=" flex flex-row justify-center items-center">
                      <p>Scroll Down</p>
                    </div>
                    <div className=" h-[40px] w-[20px] rounded-2xl ml-5 mt-3">
                      <img
                        className="h-[30px] w-[20px] rounded-2xl"
                        src={arrow}
                      ></img>
                    </div>
                  </div>
                )}
              </p>
            </div>
          </div>
        </Tilt>

        <Tilt className="xs:w-[250px] w-full">
          <div
            variants={fadeIn("right", "spring", 2 * 0.5, 0.75)}
            className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
          >
            <div
              // eslint-disable-next-line react/no-unknown-property
              options={{
                max: 45,
                scale: 1,
                speed: 450,
              }}
              className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col"
            >
              <img
                src={services[2].icon}
                alt="web-development"
                className="w-16 h-16 object-contain"
              />

              <h3 className="text-white text-[20px] font-bold text-center">
                Games
              </h3>
              <button
                className="w-[100px] green-pink-gradient p-[1px] rounded-[10px] shadow-card bg-tertiary border "
                onClick={handleGamePress}
              >
                Check
              </button>
              <p>
                {isGame && (
                  <div className=" flex flex-row justify-center items-center">
                    <div className=" flex flex-row justify-center items-center">
                      <p>Scroll Down</p>
                    </div>
                    <div className=" h-[40px] w-[20px] rounded-2xl ml-5 mt-3">
                      <img
                        className="h-[30px] w-[20px] rounded-2xl"
                        src={arrow}
                      ></img>
                    </div>
                  </div>
                )}
              </p>
            </div>
          </div>
        </Tilt>

        <Tilt className="xs:w-[250px] w-full">
          <div
            variants={fadeIn("right", "spring", 3 * 0.5, 0.75)}
            className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
          >
            <div
              // eslint-disable-next-line react/no-unknown-property
              options={{
                max: 45,
                scale: 1,
                speed: 450,
              }}
              className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col "
            >
              <img
                src={services[0].icon}
                alt="web-development"
                className="w-16 h-16 object-contain"
              />

              <h3 className="text-white text-[20px] font-bold text-center">
                Animation / Graphics
              </h3>
              <button
                className="w-[100px] green-pink-gradient p-[1px] rounded-[10px] shadow-card bg-tertiary border "
                onClick={handleAnimationPress}
              >
                Check
              </button>
              <p>
                {isAnimation && (
                  <div className=" flex flex-row justify-center items-center">
                    <div className=" flex flex-row justify-center items-center">
                      <p>Scroll Down</p>
                    </div>
                    <div className=" h-[40px] w-[20px] rounded-2xl ml-5 mt-3">
                      <img
                        className="h-[30px] w-[20px] rounded-2xl"
                        src={arrow}
                      ></img>
                    </div>
                  </div>
                )}
              </p>
            </div>
          </div>
        </Tilt>
      </div>
    </motion.section>
  );
};

export default Types;
