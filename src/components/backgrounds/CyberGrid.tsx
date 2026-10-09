/*
 * Fond « Synthwave » — soleil néon + grille en perspective qui défile.
 * 100 % CSS. Le défilement anime un transform (et non plus
 * background-position, qui repeignait tout le sol à chaque frame).
 */

export function CyberGrid() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 80%, rgba(123,92,240,0.2), transparent 60%), linear-gradient(180deg,#07050e 0%,#100920 55%,#1a0b22 72%,#06040c 100%)",
        }}
      />
      {/* soleil néon (dégradé radial, sans filtre) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: "30%",
          width: 340,
          height: 340,
          background:
            "radial-gradient(circle, rgba(0,245,212,0.42), rgba(255,61,96,0.16) 52%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-x-0"
        style={{
          bottom: "40%",
          height: 2,
          background: "linear-gradient(90deg,transparent,rgba(0,245,212,0.75),rgba(123,92,240,0.6),transparent)",
        }}
      />
      {/* sol en perspective : plan incliné, la texture glisse dedans */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: "40%", perspective: "320px" }}>
        <div
          className="absolute overflow-hidden"
          style={{ inset: "0 -50% 0 -50%", transform: "rotateX(74deg)", transformOrigin: "bottom center" }}
        >
          <div
            className="cybergrid-floor absolute inset-x-0"
            style={{
              top: "-44px",
              bottom: 0,
              backgroundImage:
                "linear-gradient(rgba(0,245,212,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(123,92,240,0.28) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #06040c, transparent 45%)" }} />
      </div>
    </div>
  );
}
