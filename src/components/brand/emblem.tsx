import { cn } from "@/lib/utils";

/**
 * Newton House emblem — a crowned shield inside a laurel wreath.
 * Quarters carry the house initials; the base carries Newton's apple.
 * Drawn in currentColor so it adapts to dark and light surfaces.
 */
export function Emblem({ className, title = "Newton House emblem" }: { className?: string; title?: string }) {
  // Laurel leaves positioned along two arcs
  const leaves = Array.from({ length: 7 }, (_, i) => {
    const t = (i / 6) * 1.25 + 0.95; // radians along arc
    return { t, i };
  });
  const cx = 32;
  const cy = 34;
  const r = 24;

  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={title} className={cn("shrink-0", className)}>
      <title>{title}</title>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Laurel stems */}
        <path d="M14.5 50.5C9 44 7.6 34.5 11 26" strokeWidth="1.1" />
        <path d="M49.5 50.5C55 44 56.4 34.5 53 26" strokeWidth="1.1" />
        {/* Leaves */}
        {leaves.map(({ t, i }) => {
          // Rounded so server and client render identical attribute strings.
          const round = (n: number) => Math.round(n * 100) / 100;
          const lx = round(cx - r * Math.sin(t) * 0.92);
          const ly = round(cy + r * Math.cos(t) * -0.92 + 6);
          const rx = round(cx + r * Math.sin(t) * 0.92);
          const angle = round((t * 180) / Math.PI);
          return (
            <g key={i}>
              <ellipse cx={lx} cy={ly} rx="1.35" ry="3.1" transform={`rotate(${-angle + 180} ${lx} ${ly})`} fill="currentColor" stroke="none" opacity="0.92" />
              <ellipse cx={rx} cy={ly} rx="1.35" ry="3.1" transform={`rotate(${angle - 180} ${rx} ${ly})`} fill="currentColor" stroke="none" opacity="0.92" />
            </g>
          );
        })}
        {/* Ribbon */}
        <path d="M22 54.5c3.2 1.6 6.6 2.4 10 2.4s6.8-.8 10-2.4" strokeWidth="1.2" />
        {/* Crown */}
        <path d="M23.5 16.2l.9-6.6 4 3.8L32 7.6l3.6 5.8 4-3.8.9 6.6z" strokeWidth="1.15" fill="currentColor" fillOpacity="0.18" />
        <circle cx="32" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
        <path d="M23.8 16.2h16.4" strokeWidth="1.15" />
        {/* Shield */}
        <path d="M21 18.6h22v14.6c0 8.4-5.4 13.4-11 16.4-5.6-3-11-8-11-16.4z" strokeWidth="1.35" fill="currentColor" fillOpacity="0.06" />
        <path d="M21 30h22M32 18.6V30" strokeWidth="0.9" />
        {/* Apple */}
        <path
          d="M32 37.2c-1.1-.9-3.6-1-4.4 1.2-.9 2.4.6 5.6 2.4 6.2.8.3 1.4-.2 2-.2s1.2.5 2 .2c1.8-.6 3.3-3.8 2.4-6.2-.8-2.2-3.3-2.1-4.4-1.2z"
          strokeWidth="0.95"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path d="M32 37.2c.1-1 .5-1.8 1.2-2.4" strokeWidth="0.9" />
        <path d="M32.6 35.6c.9-.7 2-.7 2.6-.4-.5.8-1.6 1.2-2.6.4z" strokeWidth="0.7" fill="currentColor" />
      </g>
      {/* Initials */}
      <g fill="currentColor" fontFamily="var(--font-serif)" fontWeight="600" fontSize="8.4" textAnchor="middle">
        <text x="26.5" y="27.6">N</text>
        <text x="37.5" y="27.6">H</text>
      </g>
    </svg>
  );
}
