import { useState, useCallback } from 'react';
import { MandelbrotCanvas } from './components/MandelbrotCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ProgressIndicator } from './components/ProgressIndicator';
import { InfoSection } from './components/InfoSection';
import { colorSchemes } from './utils/colorSchemes';
import './styles/App.css';

const INITIAL_SIZE = 500; // Minimum required: 500x500
const INITIAL_SCHEME_INDEX = 0;

function App() {
  const [size, setSize] = useState(INITIAL_SIZE);
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(INITIAL_SCHEME_INDEX);
  const [progress, setProgress] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [key, setKey] = useState(0); // Force re-render on setting changes

  const handleSizeChange = useCallback((newSize: number) => {
    if (!isCalculating) {
      setSize(newSize);
      setProgress(0);
      setKey(prev => prev + 1);
    }
  }, [isCalculating]);

  const handleSchemeChange = useCallback((index: number) => {
    if (!isCalculating) {
      setSelectedSchemeIndex(index);
      setProgress(0);
      setKey(prev => prev + 1);
    }
  }, [isCalculating]);

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
          Exploring the equation: z<sub>n+1</sub> = z<sub>n</sub><sup>2</sup> + c
        </p>
      </header>

      <main className="app-main">
        <ControlPanel
          size={size}
          onSizeChange={handleSizeChange}
          colorSchemes={colorSchemes}
          selectedSchemeIndex={selectedSchemeIndex}
          onSchemeChange={handleSchemeChange}
          isCalculating={isCalculating}
        />

        <MandelbrotCanvas
          key={key}
          size={size}
          colorScheme={colorSchemes[selectedSchemeIndex]}
          onProgress={handleProgress}
          onComplete={handleComplete}
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
