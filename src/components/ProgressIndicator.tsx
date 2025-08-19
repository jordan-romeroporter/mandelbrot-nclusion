type ProgressIndicatorProps = {
  progress: number;
  isCalculating: boolean;
  totalPoints: number;
};

function formatPoints(points: number): string {
  return points.toLocaleString();
}

function CalculatingView({
  progress,
  totalPoints,
}: {
  progress: number;
  totalPoints: number;
}) {
  return (
    <div>
      Processing {formatPoints(totalPoints)} points: {progress.toFixed(1)}%
    </div>
  );
}

function CompleteView({ totalPoints }: { totalPoints: number }) {
  return (
    <div style={{ color: "#4CAF50", fontWeight: "bold" }}>
      ✓ Rendered {formatPoints(totalPoints)} points successfully
    </div>
  );
}

export function ProgressIndicator({
  progress,
  isCalculating,
  totalPoints,
}: ProgressIndicatorProps) {
  // Don't show anything if we haven't started
  if (!isCalculating && progress === 0) {
    return null;
  }

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        minHeight: "80px",
      }}
    >
      {isCalculating ? (
        <CalculatingView progress={progress} totalPoints={totalPoints} />
      ) : (
        <CompleteView totalPoints={totalPoints} />
      )}
    </div>
  );
}
