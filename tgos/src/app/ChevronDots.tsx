export default function ChevronDots({
  color = "white",
  direction = "right",
  className = "",
}: {
  color?: string;
  direction?: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="none"
      className={className}
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <circle cx="2" cy="2" r="2" fill={color} />
      <circle cx="5" cy="5" r="2" fill={color} />
      <circle cx="8" cy="8" r="2" fill={color} />
      <circle cx="5" cy="11" r="2" fill={color} />
      <circle cx="2" cy="14" r="2" fill={color} />
    </svg>
  );
}
