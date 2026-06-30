"use client";

/*
 * Fond "Synthwave" — soleil néon + grille en perspective qui défile. 100% CSS
 * (léger). Le défilement est coupé en mode lite / reduced-motion.
 */

export function CyberGrid() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* ciel + halo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 80%, rgba(123,92,240,0.18), transparent 60%), linear-gradient(180deg,#0a0612 0%,#120a22 55%,#1a0b22 72%,#070510 100%)",
        }}
      />
      {/* soleil néon */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "32%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,245,212,0.45), rgba(255,61,96,0.18) 55%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
      {/* horizon glow */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: "40%",
          height: 2,
          background:
            "linear-gradient(90deg,transparent,rgba(0,245,212,0.8),rgba(123,92,240,0.6),transparent)",
          filter: "blur(1px)",
        }}
      />
      {/* sol en perspective */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: "40%", perspective: "320px" }}>
        <div
          className="cybergrid-floor absolute"
          style={{
            inset: "-2px -50% 0 -50%",
            transform: "rotateX(74deg)",
            transformOrigin: "bottom center",
            backgroundImage:
              "linear-gradient(rgba(0,245,212,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(123,92,240,0.28) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>
    </div>
  );
}
