"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/audio";

/*
 * Ouverture du coffre — séquence cyberpunk en 3 actes :
 *  1. scan biométrique (empreinte)        ~0.7s
 *  2. coffre : barres qui se rétractent, engrenages, porte qui pivote en 3D
 *  3. lueur cyan + flash → onDone (le contenu apparaît en cascade côté page)
 * Rendu via portail (échappe au filtre des transitions de page).
 */
export function VaultDoor({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"bio" | "door">("bio");
  const [bioOk, setBioOk] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    sfx("open");
    const t1 = setTimeout(() => setBioOk(true), 450);
    const t2 = setTimeout(() => setPhase("door"), 750);
    const t3 = setTimeout(onDone, 2050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[95] overflow-hidden bg-base grid place-items-center">
      <AnimatePresence mode="wait">
        {phase === "bio" ? (
          <motion.div
            key="bio"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.15 }}
          >
            <Fingerprint ok={bioOk} />
            <p className={`label mt-5 ${bioOk ? "text-success" : "text-secondary"}`}>
              {bioOk ? "// [BIO] MATCH CONFIRMED" : "// [BIO] SCANNING…"}
            </p>
          </motion.div>
        ) : (
          <Safe key="safe" />
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

/* ─── Acte 1 : empreinte biométrique ─── */
function Fingerprint({ ok }: { ok: boolean }) {
  const c = ok ? "#00c9a7" : "#00f5d4";
  return (
    <div className="relative h-40 w-40">
      {/* anneau scanner */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed"
        style={{ borderColor: `${c}80` }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-3">
        {[34, 26, 18, 10].map((r, i) => (
          <path
            key={r}
            d={`M ${50 - r} 50 A ${r} ${r} 0 1 1 ${50 + r} 50`}
            fill="none"
            stroke={c}
            strokeWidth="2"
            opacity={0.4 + i * 0.12}
          />
        ))}
        <circle cx="50" cy="50" r="3" fill={c} />
      </svg>
      {/* ligne de scan */}
      {!ok && (
        <motion.div
          className="absolute left-2 right-2 h-0.5"
          style={{ background: c, boxShadow: `0 0 8px ${c}` }}
          initial={{ top: "8%" }}
          animate={{ top: "92%" }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

/* ─── Acte 2 : coffre-fort ─── */
function Safe() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative"
      style={{ perspective: 900 }}
    >
      <div className="relative h-[min(70vw,360px)] w-[min(70vw,360px)]">
        {/* intérieur (révélé quand la porte pivote) */}
        <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-sm border border-secondary/40 bg-base">
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,245,212,0.5), rgba(0,245,212,0.08) 45%, transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{ duration: 1.4, times: [0, 0.5, 1] }}
          />
          <span className="label text-success relative z-10">// COFFRE OUVERT</span>
        </div>

        {/* porte qui pivote (charnière à gauche) */}
        <motion.div
          className="absolute inset-0 rounded-sm border-2 border-line-strong overflow-hidden"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            background: "linear-gradient(135deg,#16161f,#0d0d18 60%,#0a0a12)",
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -88 }}
          transition={{ delay: 0.55, duration: 0.85, ease: [0.6, 0, 0.3, 1] }}
        >
          {/* texture rivets */}
          {[
            "top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3",
          ].map((p) => (
            <span key={p} className={`absolute ${p} h-3 w-3 rounded-full border border-line-strong bg-base`} />
          ))}
          {/* liseré néon */}
          <span className="absolute inset-2 rounded-sm border border-primary/20" />

          {/* engrenages */}
          <div className="absolute inset-0 grid place-items-center">
            <Gear size={120} dur={3} reverse={false} />
          </div>
          <Gear size={48} dur={2} reverse className="absolute left-6 top-6" />
          <Gear size={48} dur={2.4} reverse={false} className="absolute right-6 bottom-6" />

          {/* barres de verrouillage qui se rétractent vers la droite */}
          {[0.28, 0.5, 0.72].map((ty, i) => (
            <motion.div
              key={i}
              className="absolute h-2.5 bg-gradient-to-r from-primary/60 to-secondary/60 rounded-sm"
              style={{ top: `${ty * 100}%`, left: "10%", right: "10%" }}
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: "60%", opacity: 0.2 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
            />
          ))}

          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 label !text-muted">// VAULT</span>
        </motion.div>

        {/* flash à l'ouverture */}
        <motion.div
          className="absolute inset-0 rounded-sm bg-secondary pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.6, 0] }}
          transition={{ duration: 1.4, times: [0, 0.6, 0.72, 0.85] }}
        />
      </div>
    </motion.div>
  );
}

function Gear({
  size,
  dur,
  reverse,
  className,
}: {
  size: number;
  dur: number;
  reverse: boolean;
  className?: string;
}) {
  const teeth = 10;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity: 0.5 }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ repeat: Infinity, duration: dur, ease: "linear" }}
    >
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <rect
            key={i}
            x="46"
            y="2"
            width="8"
            height="14"
            fill="#7b5cf0"
            transform={`rotate(${(a * 180) / Math.PI} 50 50)`}
          />
        );
      })}
      <circle cx="50" cy="50" r="34" fill="none" stroke="#7b5cf0" strokeWidth="6" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#00f5d4" strokeWidth="4" />
    </motion.svg>
  );
}
