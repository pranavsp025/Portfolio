const CHAR_W = 18;
const CHAR_H = 22;

interface PixelCharProps {
  squashing: boolean;
}

export function PixelChar({ squashing }: PixelCharProps) {
  return (
    <svg
      width={CHAR_W}
      height={CHAR_H}
      viewBox="0 0 8 9"
      shapeRendering="crispEdges"
      style={{
        filter: "drop-shadow(0 0 6px var(--primary))",
        transform: squashing ? "scaleY(1.05) scaleX(0.95)" : "none",
        transition: "transform 120ms ease-out",
      }}
    >
      <rect x="2" y="0" width="4" height="1" fill="var(--primary)" />
      <rect x="1" y="1" width="6" height="3" fill="var(--primary)" />
      <rect x="2" y="2" width="1" height="1" fill="var(--background)" />
      <rect x="5" y="2" width="1" height="1" fill="var(--background)" />
      <rect x="2" y="4" width="4" height="3" fill="var(--accent)" />
      <rect x="2" y="7" width="1" height="2" fill="var(--primary)" />
      <rect x="5" y="7" width="1" height="2" fill="var(--primary)" />
      <rect x="6" y="4" width="1" height="2" fill="var(--primary)" />
      <rect x="1" y="4" width="1" height="2" fill="var(--primary)" />
    </svg>
  );
}
