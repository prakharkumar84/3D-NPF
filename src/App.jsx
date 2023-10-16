/* eslint-disable no-unused-vars */
import { BrowserRouter } from "react-router-dom";
import {
  About,
  Contact,
  Experience,
  Feedbacks,
  Hero,
  Navbar,
  Tech,
  Works,
  StarsCanvas,
  Animation,
  Types,
  Web,
  Native,
  Game,
} from "./components";
import { useState } from "react";

function App() {
  const [isAnimation, setIsAnimation] = useState(false);
  const [isWeb, setIsWeb] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [isGame, setIsGame] = useState(false);
  // console.log(isAnimation, isWeb, isNative, isGame);

  return (
    <BrowserRouter>
      <div className="relative z-0 bg-primary">
        <div className=" bg-hero-pattern bg-cover bg-no-repeat bg-center">
          <Navbar />
          <Hero />
        </div>
        <About />
        <Tech />
        <Works />
        <Types
          isAnimation={isAnimation}
          isWeb={isWeb}
          isNative={isNative}
          isGame={isGame}
          setIsAnimation={setIsAnimation}
          setIsWeb={setIsWeb}
          setIsNative={setIsNative}
          setIsGame={setIsGame}
        />
        {isWeb && <Web />}
        {isNative && <Native />}
        {isAnimation && <Animation />}
        {isGame && <Game />}
        <Experience />

        {/* <Feedbacks /> */}
        <div className=" relative z-0">
          <Contact />
          <StarsCanvas />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
