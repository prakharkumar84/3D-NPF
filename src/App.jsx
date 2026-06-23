/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import {
  About,
  Hero,
  Navbar,
  Tech,
  Works,
  Types,
  AIEngineering,
} from "./components";

// Lazy-load heavy sections
const Experience = lazy(() => import("./components/Experience"));
const Feedbacks = lazy(() => import("./components/Feedbacks"));
const Awards = lazy(() => import("./components/Awards"));
const Contact = lazy(() => import("./components/Contact"));
const StarsCanvas = lazy(() =>
  import("./components/canvas").then((m) => ({ default: m.StarsCanvas }))
);
const Animation = lazy(() => import("./components/Animation"));
const Web = lazy(() => import("./components/Web"));
const Native = lazy(() => import("./components/Native"));
const Game = lazy(() => import("./components/Game"));
const MCPShowcase = lazy(() => import("./components/MCPShowcase"));

const SectionFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#915EFF] border-t-transparent rounded-full animate-spin" />
  </div>
);

function Portfolio() {
  const [isAnimation, setIsAnimation] = useState(false);
  const [isWeb, setIsWeb] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [isGame, setIsGame] = useState(false);

  return (
    <div className="relative z-0 bg-primary">
      <div className=" bg-hero-pattern bg-cover bg-no-repeat bg-center">
        <Navbar />
        <Hero />
      </div>
      <About />
      <Tech />
      <AIEngineering />
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
      <Suspense fallback={<SectionFallback />}>
        {isWeb && <Web />}
        {isNative && <Native />}
        {isAnimation && <Animation />}
        {isGame && <Game />}
        <Experience />
        <Feedbacks />
        <Awards />
        <div className=" relative z-0">
          <Contact />
          <StarsCanvas />
        </div>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route
          path="/mcp-showcase"
          element={
            <Suspense fallback={<SectionFallback />}>
              <MCPShowcase />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
