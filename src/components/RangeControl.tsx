type RangeControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  displayValue?: string;
  helpText?: string;
};

export function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  displayValue,
  helpText
}: RangeControlProps) {
  return (
    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: 'bold' 
      }}>
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{ width: '200px' }}
      />
      {(displayValue || helpText) && (
        <div style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '5px' 
        }}>
          {displayValue || helpText}
        </div>
      )}
    </div>
  );
}
