import { cn } from "@/lib/utils";

/**
 * Architectural line drawing inspired by the arched entrance block of
 * Newton House — central arch, pedimented upper storey and finial,
 * flanked by arcaded wings. Purely decorative (aria-hidden).
 */
export function ArchitecturalLineArt({ className, strokeWidth = 0.9 }: { className?: string; strokeWidth?: number }) {
  const wingWindows = (x0: number, dir: 1 | -1) =>
    Array.from({ length: 4 }, (_, i) => {
      const x = x0 + dir * i * 26;
      return (
        <g key={`${x0}-${i}`}>
          {/* upper window */}
          <path d={`M${x - 7} 132v-16a7 7 0 0 1 14 0v16z`} />
          <path d={`M${x} 109v23`} opacity="0.6" />
          {/* lower arcade */}
          <path d={`M${x - 9} 196v-26a9 9 0 0 1 18 0v26`} />
        </g>
      );
    });

  return (
    <svg
      viewBox="0 0 420 220"
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ground lines */}
      <path d="M4 206h412M16 212h388" />
      <path d="M20 196h380v10H20z" />

      {/* Wings */}
      <path d="M24 196V100h120v96M276 196V100h120v96" />
      <path d="M20 100h128M272 100h128M22 94h124M274 94h124" />
      <path d="M24 146h120M276 146h120" />
      <path d="M24 150h120M276 150h120" opacity="0.6" />
      {wingWindows(44, 1)}
      {wingWindows(376, -1)}

      {/* Central block */}
      <path d="M144 196V76h132v120" />
      <path d="M140 76h140M142 70h136" />
      {/* Pilasters */}
      <path d="M152 196V80M162 196V80M258 196V80M268 196V80" />
      <path d="M148 150h22M250 150h22" />
      {/* Grand arch */}
      <path d="M180 196v-52a30 30 0 0 1 60 0v52" />
      <path d="M186 196v-52a24 24 0 0 1 48 0v52" />
      <path d="M210 114v-6" />
      <path d="M204 108h12" />
      {/* Fanlight */}
      <path d="M190 144h40M210 144v-24M198 125l12 19 12-19" opacity="0.7" />
      {/* Upper windows of central block */}
      <path d="M172 104v-12a5 5 0 0 1 10 0v12zM238 104v-12a5 5 0 0 1 10 0v12z" />

      {/* Pediment storey */}
      <path d="M160 70V50h100v20" />
      <path d="M156 50h108" />
      <path d="M172 70V58a6 6 0 0 1 12 0v12M204 70V56a6 6 0 0 1 12 0v14M236 70V58a6 6 0 0 1 12 0v12" />
      {/* Curved gable */}
      <path d="M168 50c8-14 22-20 42-22 20 2 34 8 42 22" />
      <path d="M204 28v-6h12v6" />
      {/* Finial */}
      <path d="M210 22v-12M206 14h8M210 10l-2.5-4h5z" />
      {/* Urns on parapet */}
      <path d="M150 70v-6h4v6M266 70v-6h4v6M30 94v-5h4v5M386 94v-5h4v5" />
      {/* Balustrade suggestion */}
      <path d="M24 96h120M276 96h120" opacity="0.5" />
    </svg>
  );
}
