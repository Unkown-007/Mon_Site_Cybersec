"use client";

/*
 * Fond "Aurora" — halos néon flous qui dérivent lentement. 100% CSS.
 * La dérive est coupée en mode lite / reduced-motion (via globals.css).
 */

export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "#07070c" }}>
      <div
        className="aurora-blob"
        style={{
          position: "absolute",
          top: "-12%",
          left: "-10%",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(123,92,240,0.35), transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="aurora-blob aurora-blob--2"
        style={{
          position: "absolute",
          bottom: "-16%",
          right: "-6%",
          width: "55vw",
          height: "55vw",
          background: "radial-gradient(circle, rgba(0,245,212,0.26), transparent 60%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="aurora-blob aurora-blob--3"
        style={{
          position: "absolute",
          top: "28%",
          left: "38%",
          width: "42vw",
          height: "42vw",
          background: "radial-gradient(circle, rgba(255,61,96,0.16), transparent 60%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
