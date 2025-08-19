import { memo } from "react";
import type { ViewPreset } from "../types";
import { SelectControl } from "./SelectControl";

type ViewportControlProps = {
  currentPreset?: string;
  onPresetChange: (preset: ViewPreset) => void;
  disabled?: boolean;
};

const VIEW_PRESETS: ViewPreset[] = [
  { label: "Full Set", centerX: -0.5, centerY: 0, zoom: 1 },
  { label: "Classic Zoom", centerX: -0.75, centerY: 0.1, zoom: 0.05 },
  { label: "Spiral Detail", centerX: 0.275, centerY: 0.007, zoom: 0.01 },
  { label: "Seahorse Valley", centerX: -0.75, centerY: 0.1, zoom: 0.02 },
  { label: "Mini Mandelbrot", centerX: -0.088, centerY: 0.654, zoom: 0.15 },
  { label: "Lightning", centerX: -0.5533, centerY: 0.6217, zoom: 0.008 },
  { label: "Dendrite Forest", centerX: 0.37, centerY: 0.1, zoom: 0.05 },
];

export const ViewportControl = memo(function ViewportControl({
  currentPreset = "",
  onPresetChange,
  disabled = false,
}: ViewportControlProps) {
  const options = [
    { value: "", label: "Select a view..." },
    ...VIEW_PRESETS.map((preset) => ({
      value: JSON.stringify(preset),
      label: preset.label,
    })),
  ];

  const handleChange = (value: string | number) => {
    if (typeof value === "string" && value) {
      try {
        const preset = JSON.parse(value) as ViewPreset;
        onPresetChange(preset);
      } catch (error) {
        console.error("Invalid preset data:", error);
      }
    }
  };

  return (
    <SelectControl
      label="Viewport Preset"
      value={currentPreset}
      options={options}
      onChange={handleChange}
      disabled={disabled}
    />
  );
});
