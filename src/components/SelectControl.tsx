import { memo } from "react";

type SelectOption = {
  value: string | number;
  label: string;
};

type SelectControlProps = {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
};

export const SelectControl = memo(function SelectControl({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: SelectControlProps) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "5px",
          fontWeight: "bold",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          // Convert to number if the original value was a number
          onChange(typeof value === "number" ? Number(newValue) : newValue);
        }}
        disabled={disabled}
        style={{
          padding: "5px 10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});
