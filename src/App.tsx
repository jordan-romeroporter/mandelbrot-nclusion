import { useState, useCallback } from "react";
import { MandelbrotCanvas } from "./components/MandelbrotCanvas";
import { ControlPanel } from "./components/ControlPanel";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { InfoSection } from "./components/InfoSection";
import { ViewportControl } from "./components/ViewportControl";
import { colorSchemes } from "./utils/colorSchemes";
import type { Viewport, ViewPreset } from "./types";
import "./styles/App.css";

const INITIAL_SIZE = 500;
const INITIAL_SCHEME_INDEX = 0;

// Interesting starting views
const STARTING_VIEWS: ViewPreset[] = [
  { label: "Full Set", centerX: -0.5, centerY: 0, zoom: 1 },
  { label: "Spiral", centerX: 0.275, centerY: 0.007, zoom: 0.01 },
  { label: "Valley", centerX: -0.75, centerY: 0.1, zoom: 0.05 },
  { label: "Lightning", centerX: -0.5533, centerY: 0.6217, zoom: 0.008 },
];

function getRandomStartingView(): Viewport {
  const view =
    STARTING_VIEWS[Math.floor(Math.random() * STARTING_VIEWS.length)];
  return {
    centerX: view.centerX,
    centerY: view.centerY,
    zoom: view.zoom,
    width: INITIAL_SIZE,
    height: INITIAL_SIZE,
  };
}

function App() {
  const [size, setSize] = useState(INITIAL_SIZE);
  const [selectedSchemeIndex, setSelectedSchemeIndex] =
    useState(INITIAL_SCHEME_INDEX);
  const [progress, setProgress] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewport, setViewport] = useState<Viewport>(getRandomStartingView);
  const [key, setKey] = useState(0);

  const handleSizeChange = useCallback(
    (newSize: number) => {
      if (!isCalculating) {
        setSize(newSize);
        setViewport((prev) => ({ ...prev, width: newSize, height: newSize }));
        setProgress(0);
        setKey((prev) => prev + 1);
      }
    },
    [isCalculating]
  );

  const handleSchemeChange = useCallback(
    (index: number) => {
      if (!isCalculating) {
        setSelectedSchemeIndex(index);
        setProgress(0);
        setKey((prev) => prev + 1);
      }
    },
    [isCalculating]
  );

  const handleViewportChange = useCallback(
    (preset: ViewPreset) => {
      if (!isCalculating) {
        setViewport({
          centerX: preset.centerX,
          centerY: preset.centerY,
          zoom: preset.zoom,
          width: size,
          height: size,
        });
        setProgress(0);
        setKey((prev) => prev + 1);
      }
    },
    [isCalculating, size]
  );

  const handleProgress = useCallback((newProgress: number) => {
    setProgress(newProgress);
    setIsCalculating(newProgress < 100);
  }, []);

  const handleComplete = useCallback(() => {
    setIsCalculating(false);
    setProgress(100);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mandelbrot Set Visualizer</h1>
        <p className="subtitle">
          Exploring the equation: z<sub>n+1</sub> = z<sub>n</sub>
          <sup>2</sup> + c
        </p>
      </header>

      <main className="app-main">
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <ControlPanel
            size={size}
            onSizeChange={handleSizeChange}
            colorSchemes={colorSchemes}
            selectedSchemeIndex={selectedSchemeIndex}
            onSchemeChange={handleSchemeChange}
            isCalculating={isCalculating}
          />

          <ViewportControl
            onPresetChange={handleViewportChange}
            disabled={isCalculating}
          />
        </div>

        <MandelbrotCanvas
          key={key}
          size={size}
          colorScheme={colorSchemes[selectedSchemeIndex]}
          viewport={viewport}
          onProgress={handleProgress}
          onComplete={handleComplete}
          useWorkers={true}
        />

        <ProgressIndicator
          progress={progress}
          isCalculating={isCalculating}
          totalPoints={size * size}
        />

        <InfoSection size={size} />
      </main>

      <footer className="app-footer">
        <p>Frontend Visualization Challenge • React + TypeScript + Vite</p>
      </footer>
    </div>
  );
}

export default App;
