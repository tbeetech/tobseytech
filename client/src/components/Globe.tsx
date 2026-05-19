// Globe WebGL animation removed for performance — replaced with lightweight static SVG.
export default function Globe() {
  return (
    <div className="large-globe flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        width="200"
        height="200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="1" />
        {/* Latitude lines */}
        {[30, 55, 80, 120, 145, 170].map((cy) => {
          const dy = cy - 100;
          const rx = Math.sqrt(Math.max(0, 80 * 80 - dy * dy));
          return (
            <ellipse
              key={cy}
              cx="100"
              cy={cy}
              rx={rx}
              ry={rx * 0.28}
              fill="none"
              stroke="rgba(255,140,0,0.25)"
              strokeWidth="0.7"
            />
          );
        })}
        {/* Longitude lines */}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <ellipse
            key={angle}
            cx="100"
            cy="100"
            rx="80"
            ry="22"
            fill="none"
            stroke="rgba(255,200,0,0.2)"
            strokeWidth="0.7"
            transform={`rotate(${angle} 100 100)`}
          />
        ))}
        {/* Outer ring */}
        <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="0.6" />
      </svg>
    </div>
  );
}
