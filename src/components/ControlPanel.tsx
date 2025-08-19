import { ColorScheme } from '../types';
import { RangeControl } from './RangeControl';
import { SelectControl } from './SelectControl';

type ControlPanelProps = {
  size: number;
  onSizeChange: (size: number) => void;
  colorSchemes: ColorScheme[];
  selectedSchemeIndex: number;
  onSchemeChange: (index: number) => void;
  isCalculating: boolean;
};

const panelStyles = {
  display: 'flex',
  gap: '30px',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  margin: '20px auto',
  maxWidth: '600px',
  flexWrap: 'wrap' as const
};

function formatPointCount(size: number): string {
  const total = size * size;
  return `${size}×${size} = ${total.toLocaleString()} points`;
}

export function ControlPanel({
  size,
  onSizeChange,
  colorSchemes,
  selectedSchemeIndex,
  onSchemeChange,
  isCalculating
}: ControlPanelProps) {
  const colorSchemeOptions = colorSchemes.map((scheme, index) => ({
    value: index,
    label: scheme.name
  }));

  return (
    <div style={panelStyles}>
      <RangeControl
        label="Grid Resolution"
        value={size}
        min={500}
        max={800}
        step={50}
        onChange={onSizeChange}
        disabled={isCalculating}
        displayValue={formatPointCount(size)}
      />
      
      <SelectControl
        label="Color Scheme"
        value={selectedSchemeIndex}
        options={colorSchemeOptions}
        onChange={(value) => onSchemeChange(value as number)}
        disabled={isCalculating}
      />
    </div>
  );
}
