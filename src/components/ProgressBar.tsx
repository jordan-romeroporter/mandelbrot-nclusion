type ProgressBarProps = {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
};

export function ProgressBar({ 
  progress, 
  height = 20,
  color = '#4CAF50',
  backgroundColor = '#f0f0f0'
}: ProgressBarProps) {
  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '400px',
        height: `${height}px`,
        backgroundColor,
        borderRadius: '10px',
        overflow: 'hidden',
        margin: '0 auto 10px'
      }}
    >
      <div 
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease',
          borderRadius: '10px'
        }} 
      />
    </div>
  );
}
