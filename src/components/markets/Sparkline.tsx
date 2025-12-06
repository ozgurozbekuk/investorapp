'use client';

type SparklineProps = {
  points?: number[];
};

export default function Sparkline({ points }: SparklineProps) {
  if (!points || points.length < 2) {
    return (
      <div className="h-12 w-24 rounded-md bg-muted/40 text-muted-foreground text-xs flex items-center justify-center">
        —
      </div>
    );
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const normalized = points.map((point) => ((point - min) / range) * 30 + 5);
  const step = 100 / (points.length - 1);
  const path = normalized
    .map((value, index) => `${index * step},${40 - value}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 40" className="h-12 w-24 text-primary/80" role="presentation">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={path}
        className="opacity-80"
      />
    </svg>
  );
}
