import { memo } from "react";

type InfoItemProps = {
  label: string;
  value: string | React.ReactNode;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="info-item">
      <strong>{label}:</strong>
      <span>{value}</span>
    </div>
  );
}

type InfoSectionProps = {
  size: number;
};

export const InfoSection = memo(function InfoSection({
  size,
}: InfoSectionProps) {
  return (
    <section className="info-section">
      <h2>Visualization Details</h2>
      <div className="info-grid">
        <InfoItem label="Complex Plane Range" value="(-2, -2) to (2, 2)" />
        <InfoItem
          label="Light Colors"
          value="Points that remain bounded (in the Mandelbrot set)"
        />
        <InfoItem
          label="Dark Colors"
          value="Points that grow unbounded (escape to infinity)"
        />
        <InfoItem
          label="Current Resolution"
          value={`${size}×${size} grid segments`}
        />
      </div>
    </section>
  );
});
