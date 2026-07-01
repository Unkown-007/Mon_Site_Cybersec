"use client";

/*
 * Fond animé — Neo-Tokyo cinématique (cyberpunk / Akira).
 * Scène pré-rendue sur un canvas hors-écran (ciel, lune rouge, skyline en
 * perspective atmosphérique, base des enseignes) puis composée chaque frame
 * avec les couches dynamiques : brume mouvante, autoroute de lumières (bloom),
 * enseignes néon qui scintillent, pluie diagonale et reflets sur l'asphalte.
 * Respecte prefers-reduced-motion (image fixe) et se met en pause hors écran.
 */

import { useEffect, useRef } from "react";
import { usePerf } from "@/lib/perf";

interface Building {
  x: number;
  w: number;
  top: number;
  depth: number; // 0 lointain → 1 proche
  lights: { x: number; y: number; warm: boolean; flicker: number }[];
  roofType: 'flat' | 'antenna' | 'tank' | 'ac' | 'dish' | 'spire';
  hasPipes: boolean;
  hasBalconies: boolean;
}
interface Sign {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  phase: number;
  vertical: boolean;
}
interface Car {
  y: number;
  x: number;
  sp: number;
  dir: 1 | -1;
  scale: number;
  color: string;
}
interface Drop {
  x: number;
  y: number;
  len: number;
  sp: number;
  a: number;
}
interface Star {
  x: number;
  y: number;
  a: number;
  tw: number;
}
interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  warm: boolean;
}
interface Aircraft {
  x: number;
  y: number;
  sp: number;
  dir: 1 | -1;
  scale: number;
  blink: number;
}
interface Searchlight {
  x: number;
  y: number;
  base: number; // angle central
  sweep: number; // amplitude
  speed: number;
  hue: string;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function CyberCityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { lite } = usePerf();

  useEffect(() => {
    if (lite) return; // mode léger : aucune animation, canvas masqué
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const off = document.createElement("canvas");
    const octx = off.getContext("2d");
    if (!octx) return;

    let w = 0, h = 0, dpr = 1, raf = 0, frame = 0;
    let horizon = 0;
    let buildings: Building[] = [];
    let signs: Sign[] = [];
    let cars: Car[] = [];
    let rain: Drop[] = [];
    let stars: Star[] = [];
    let embers: Ember[] = [];
    let aircraft: Aircraft[] = [];
    let searchlights: Searchlight[] = [];
    let antennas: { x: number; y: number; base: number }[] = [];
    let boards: { x: number; y: number; w: number; h: number; phase: number }[] = [];
    const BOARD_HUES = ["123,92,240", "0,245,212", "255,61,96", "254,188,46"];
    let megaBillboards: {
      x: number; y: number; w: number; h: number;
      kind: "face" | "sign"; hue: string; label: string;
    }[] = [];
    let moon = { x: 0, y: 0, r: 0 };
    let tower = {
      x: 0, w: 0, top: 0, base: 0, splitY: 0,
      spireW: 0, leftX: 0, rightX: 0, spireTopL: 0, spireTopR: 0,
      emX: 0, emY: 0, emR: 0,
      beaconLX: 0, beaconRX: 0, beaconLY: 0, beaconRY: 0,
    };

    /* ───────── génération ───────── */
    const generate = () => {
      horizon = h * 0.66;
      moon = { x: w * 0.74, y: h * 0.26, r: Math.min(w, h) * 0.13 };

      // Arasaka Tower — mégastructure au design jumeau scindé : la tour se
      // sépare en deux spires à ~1/4 de hauteur, reliées par des passerelles
      // (cf. Cyberpunk 2077). Noire, logo blanc rétroéclairé, balises rouges.
      const tw = Math.max(44, Math.min(w, h) * 0.085);
      const tx = w * 0.4 - tw / 2;
      const ttop = h * 0.075;
      const height = horizon - ttop;
      const spireW = tw * 0.42;
      const splitY = horizon - height * 0.74; // base unique = bas ~26 %
      tower = {
        x: tx, w: tw, top: ttop, base: horizon, splitY,
        spireW,
        leftX: tx,
        rightX: tx + tw - spireW,
        spireTopL: ttop + height * 0.05, // spire gauche un peu plus courte
        spireTopR: ttop,
        emX: tx + tw / 2,
        emY: splitY + (horizon - splitY) * 0.28,
        emR: tw * 0.16,
        beaconLX: tx + spireW / 2,
        beaconRX: tx + tw - spireW / 2,
        beaconLY: ttop, // mât au-dessus de la spire gauche
        beaconRY: ttop - height * 0.05, // mât au-dessus de la spire droite
      };

      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * w,
        y: Math.random() * horizon * 0.7,
        a: rand(0.1, 0.6),
        tw: rand(0.005, 0.02),
      }));

      buildings = [];
      for (let layer = 0; layer < 3; layer++) {
        const depth = layer / 2; // 0,.5,1
        let x = -rand(0, 60);
        while (x < w + 60) {
          const bw = rand(34, 96) * (0.7 + depth * 0.7);
          const bh = rand(70, 300) * (0.45 + depth * 0.95);
          const top = horizon - bh;
          const lights: Building["lights"] = [];
          const cols = Math.max(1, Math.floor(bw / 13));
          const rows = Math.max(1, Math.floor(bh / 15));
          for (let c = 0; c < cols; c++)
            for (let r = 0; r < rows; r++)
              if (Math.random() > 0.58)
                lights.push({ x: 4 + c * 13, y: 8 + r * 15, warm: Math.random() > 0.5, flicker: Math.random() });
          const roofTypes: Building['roofType'][] = ['flat', 'antenna', 'tank', 'ac', 'dish', 'spire'];
          const roofType = depth > 0.3 ? roofTypes[Math.floor(Math.random() * roofTypes.length)] : 'flat';
          const hasPipes = depth > 0.5 && Math.random() > 0.6;
          const hasBalconies = depth > 0.7 && bw > 40 && Math.random() > 0.55;
          buildings.push({ x, w: bw, top, depth, lights, roofType, hasPipes, hasBalconies });
          x += bw + rand(2, 16);
        }
      }
      // tri arrière → avant
      buildings.sort((a, b) => a.depth - b.depth);

      // antennes (balise rouge clignotante en dynamique) + panneaux holographiques
      antennas = [];
      boards = [];
      for (const b of buildings) {
        if (b.depth < 0.6) continue;
        if (Math.random() > 0.5) {
          const len = rand(12, 28);
          antennas.push({ x: b.x + b.w / 2, y: b.top - len, base: b.top });
        }
        if (Math.random() > 0.66 && b.w > 26) {
          const bw = rand(14, Math.min(34, b.w - 6));
          const bh = rand(10, 22);
          boards.push({
            x: b.x + rand(2, Math.max(3, b.w - bw - 2)),
            y: b.top + rand(8, 46),
            w: bw,
            h: bh,
            phase: Math.floor(Math.random() * BOARD_HUES.length),
          });
        }
      }

      // enseignes néon sur les immeubles proches
      signs = [];
      const hues = ["#ff3d60", "#00f5d4", "#7b5cf0", "#febc2e", "#ff7ac4"];
      for (const b of buildings) {
        if (b.depth < 0.5 || Math.random() > 0.4) continue;
        const vertical = Math.random() > 0.5;
        const sw = vertical ? rand(5, 9) : rand(16, 34);
        const sh = vertical ? rand(26, 60) : rand(6, 10);
        signs.push({
          x: b.x + rand(4, Math.max(5, b.w - sw - 4)),
          y: b.top + rand(10, 60),
          w: sw,
          h: sh,
          color: hues[Math.floor(Math.random() * hues.length)],
          phase: Math.random() * Math.PI * 2,
          vertical,
        });
      }

      // méga-panneaux iconiques : visage Kiroshi "CHOOSE A BETTER YOU" + enseigne
      megaBillboards = [];
      const clearOfTower = (b: Building) =>
        b.x + b.w < tower.x - 16 || b.x > tower.x + tower.w + 16;
      const faceCands = buildings.filter(
        (b) => b.depth >= 0.95 && b.w >= 56 && clearOfTower(b),
      );
      if (faceCands.length) {
        const b = faceCands[Math.floor(rand(0, faceCands.length))];
        const bw = Math.min(b.w - 8, 66);
        const bh = Math.min((horizon - b.top) * 0.66, bw * 1.6);
        megaBillboards.push({
          x: b.x + (b.w - bw) / 2, y: b.top + 12, w: bw, h: bh,
          kind: "face", hue: "255,61,96", label: "CHOOSE A|BETTER YOU",
        });
      }
      const signCands = buildings.filter(
        (b) =>
          b.depth >= 0.85 && b.w >= 42 && clearOfTower(b) &&
          !megaBillboards.some((m) => Math.abs(m.x - b.x) < 70),
      );
      if (signCands.length) {
        const b = signCands[Math.floor(rand(0, signCands.length))];
        const bw = Math.min(b.w - 6, 52);
        const hue = Math.random() > 0.5 ? "0,245,212" : "255,122,196";
        megaBillboards.push({
          x: b.x + 3, y: b.top + rand(18, 44), w: bw, h: rand(16, 24),
          kind: "sign", hue, label: Math.random() > 0.5 ? "PLUG IN NOW" : "DATA INC",
        });
      }

      // trafic : lanes horizontales près de la base de la ville
      cars = [];
      for (let i = 0; i < 70; i++) {
        const lane = Math.floor(rand(0, 6));
        const ly = horizon - 4 - lane * rand(5, 9);
        const near = lane < 3;
        cars.push({
          y: ly,
          x: Math.random() * w,
          sp: rand(0.4, 1.6) * (near ? 1.4 : 0.8),
          dir: lane % 2 === 0 ? 1 : -1,
          scale: near ? rand(1, 1.8) : rand(0.5, 0.9),
          color: lane % 2 === 0 ? "255,70,90" : Math.random() > 0.5 ? "0,245,212" : "220,230,255",
        });
      }

      rain = Array.from({ length: reduced ? 0 : Math.floor((w * h) / 9000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: rand(8, 20),
        sp: rand(7, 14),
        a: rand(0.05, 0.22),
      }));

      // cendres / braises portées par le vent ascendant (atmosphère)
      embers = Array.from({ length: reduced ? 0 : Math.floor((w * h) / 26000) }, () => ({
        x: Math.random() * w,
        y: rand(horizon * 0.2, h),
        vx: rand(-0.25, 0.45),
        vy: -rand(0.15, 0.55),
        r: rand(0.6, 1.8),
        a: rand(0.12, 0.5),
        warm: Math.random() > 0.4,
      }));

      // aéronefs lointains traversant le ciel (feux de navigation clignotants)
      aircraft = Array.from({ length: 3 }, () => {
        const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
        return {
          x: Math.random() * w,
          y: rand(h * 0.08, horizon * 0.5),
          sp: rand(0.18, 0.5),
          dir,
          scale: rand(0.6, 1.2),
          blink: Math.random() * Math.PI * 2,
        };
      });

      // projecteurs montés sur les toits proches, balayant le ciel
      searchlights = [];
      const tall = buildings.filter((b) => b.depth >= 0.6 && b.top < horizon - 120);
      for (let i = 0; i < Math.min(2, tall.length); i++) {
        const b = tall[Math.floor(rand(0, tall.length))];
        searchlights.push({
          x: b.x + b.w / 2,
          y: b.top,
          base: -Math.PI / 2 + rand(-0.25, 0.25),
          sweep: rand(0.35, 0.6),
          speed: rand(0.004, 0.009) * (Math.random() > 0.5 ? 1 : -1),
          hue: Math.random() > 0.5 ? "0,245,212" : "123,92,240",
        });
      }
    };

    /* ───────── scène statique (offscreen) ───────── */
    const drawStatic = () => {
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, w, h);

      // ciel
      const sky = octx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#05050d");
      sky.addColorStop(0.45, "#0a0815");
      sky.addColorStop(0.62, "#1a0b22");
      sky.addColorStop(0.66, "#250a1e");
      sky.addColorStop(1, "#070510");
      octx.fillStyle = sky;
      octx.fillRect(0, 0, w, h);

      // étoiles (base)
      for (const s of stars) {
        octx.fillStyle = `rgba(200,210,255,${s.a})`;
        octx.fillRect(s.x, s.y, 1, 1);
      }

      // lune rouge (Akira) + halo + god rays
      const halo = octx.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, moon.r * 5);
      halo.addColorStop(0, "rgba(255,80,90,0.35)");
      halo.addColorStop(0.3, "rgba(170,40,90,0.15)");
      halo.addColorStop(0.7, "rgba(100,20,60,0.05)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      octx.fillStyle = halo;
      octx.fillRect(moon.x - moon.r * 5, moon.y - moon.r * 5, moon.r * 10, moon.r * 10);

      // god rays from moon
      octx.save();
      octx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + Math.PI / 12;
        const rayLen = moon.r * (3.5 + Math.random() * 2);
        const spread = 0.04 + Math.random() * 0.03;
        const x1 = moon.x + Math.cos(ang - spread) * rayLen;
        const y1 = moon.y + Math.sin(ang - spread) * rayLen;
        const x2 = moon.x + Math.cos(ang + spread) * rayLen;
        const y2 = moon.y + Math.sin(ang + spread) * rayLen;
        const rg = octx.createLinearGradient(moon.x, moon.y, (x1 + x2) / 2, (y1 + y2) / 2);
        rg.addColorStop(0, "rgba(255,100,110,0.12)");
        rg.addColorStop(0.5, "rgba(255,60,80,0.04)");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        octx.fillStyle = rg;
        octx.beginPath();
        octx.moveTo(moon.x, moon.y);
        octx.lineTo(x1, y1);
        octx.lineTo(x2, y2);
        octx.closePath();
        octx.fill();
      }
      octx.restore();

      const disc = octx.createRadialGradient(
        moon.x - moon.r * 0.3, moon.y - moon.r * 0.3, moon.r * 0.2,
        moon.x, moon.y, moon.r
      );
      disc.addColorStop(0, "#ff8a7a");
      disc.addColorStop(0.6, "#e23b54");
      disc.addColorStop(1, "#7a1530");
      octx.fillStyle = disc;
      octx.beginPath();
      octx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
      octx.fill();

      // skyline (perspective atmosphérique : couches lointaines plus claires/brumeuses)
      for (const b of buildings) {
        const fog = b.depth; // 0 loin
        // couleur du corps : du brumeux (loin) au sombre (proche)
        const base = 10 + (1 - fog) * 26;
        octx.fillStyle = `rgb(${base + 6},${base},${base + 16})`;
        octx.fillRect(b.x, b.top, b.w, horizon - b.top);

        // ── Rooftop structures (varied silhouettes) ──
        if (b.roofType === 'antenna') {
          // thin antenna mast + small red light
          const ax = b.x + b.w * (0.3 + Math.random() * 0.4);
          const ah = rand(12, 30);
          octx.strokeStyle = 'rgba(140,140,170,0.5)';
          octx.lineWidth = 1;
          octx.beginPath(); octx.moveTo(ax, b.top); octx.lineTo(ax, b.top - ah); octx.stroke();
          // crossbar
          octx.beginPath(); octx.moveTo(ax - 3, b.top - ah * 0.6); octx.lineTo(ax + 3, b.top - ah * 0.6); octx.stroke();
        } else if (b.roofType === 'tank') {
          // water tank cylinder
          const tw = Math.min(b.w * 0.35, 18);
          const th = rand(8, 14);
          const tx = b.x + (b.w - tw) / 2;
          octx.fillStyle = `rgb(${base + 14},${base + 8},${base + 20})`;
          octx.fillRect(tx, b.top - th, tw, th);
          octx.fillStyle = 'rgba(0,245,212,0.15)';
          octx.fillRect(tx, b.top - th, tw, 1);
        } else if (b.roofType === 'ac') {
          // AC units (small boxes)
          const count = Math.floor(rand(1, 4));
          for (let i = 0; i < count; i++) {
            const aw = rand(5, 9);
            const ah = rand(4, 7);
            const ax = b.x + rand(3, Math.max(4, b.w - aw - 3));
            octx.fillStyle = `rgb(${base + 18},${base + 12},${base + 22})`;
            octx.fillRect(ax, b.top - ah, aw, ah);
          }
        } else if (b.roofType === 'dish') {
          // satellite dish (arc)
          const dx = b.x + b.w * 0.5;
          const dr = Math.min(b.w * 0.15, 8);
          octx.strokeStyle = 'rgba(160,160,190,0.4)';
          octx.lineWidth = 1.2;
          octx.beginPath(); octx.arc(dx, b.top - 2, dr, Math.PI, 0); octx.stroke();
          // mast
          octx.beginPath(); octx.moveTo(dx, b.top - 2); octx.lineTo(dx, b.top - 2 - dr * 1.5); octx.stroke();
        } else if (b.roofType === 'spire') {
          // pointed spire
          const sw = Math.min(b.w * 0.15, 6);
          const sh = rand(14, 28);
          const sx = b.x + b.w / 2;
          octx.fillStyle = `rgb(${base + 8},${base + 4},${base + 14})`;
          octx.beginPath();
          octx.moveTo(sx - sw, b.top);
          octx.lineTo(sx, b.top - sh);
          octx.lineTo(sx + sw, b.top);
          octx.closePath();
          octx.fill();
        }

        // ── Pipes / fire escapes on side ──
        if (b.hasPipes) {
          const px = Math.random() > 0.5 ? b.x + 1 : b.x + b.w - 2;
          const pipeLen = Math.min(horizon - b.top, 120);
          octx.strokeStyle = 'rgba(100,100,130,0.35)';
          octx.lineWidth = 1.5;
          octx.beginPath(); octx.moveTo(px, b.top + 8); octx.lineTo(px, b.top + 8 + pipeLen); octx.stroke();
          // horizontal rungs every ~18px
          for (let ry = b.top + 18; ry < b.top + 8 + pipeLen; ry += rand(14, 22)) {
            octx.beginPath(); octx.moveTo(px - 3, ry); octx.lineTo(px + 3, ry); octx.stroke();
          }
        }

        // ── Balconies ──
        if (b.hasBalconies) {
          const bside = Math.random() > 0.5 ? b.x : b.x + b.w - 6;
          for (let by = b.top + rand(20, 40); by < horizon - 20; by += rand(18, 30)) {
            octx.fillStyle = `rgba(${base + 20},${base + 14},${base + 26},0.8)`;
            octx.fillRect(bside, by, 6, 3);
          }
        }

        // liseré toit
        octx.fillStyle =
          b.depth > 0.6 ? "rgba(0,245,212,0.30)" : "rgba(123,92,240,0.20)";
        octx.fillRect(b.x, b.top, b.w, 1.5);

        // fenêtres (varied colors: warm yellow, cool cyan, TV blue flicker, pink apartment)
        for (const l of b.lights) {
          if (l.x > b.w - 3) continue;
          const a = (0.35 + b.depth * 0.5);
          if (l.flicker > 0.85) {
            // TV-like blue-white flicker
            octx.fillStyle = `rgba(140,170,255,${a * 0.6})`;
            octx.fillRect(b.x + l.x, b.top + l.y, 3, 4);
          } else if (l.flicker > 0.7) {
            // pink/magenta apartment
            octx.fillStyle = `rgba(255,122,196,${a * 0.4})`;
            octx.fillRect(b.x + l.x, b.top + l.y, 2.5, 3.5);
          } else {
            octx.fillStyle = l.warm
              ? `rgba(254,188,46,${a * 0.5})`
              : `rgba(0,245,212,${a * 0.45})`;
            octx.fillRect(b.x + l.x, b.top + l.y, 2.5, 3.5);
          }
        }

        // voile de brume sur les couches lointaines
        if (fog < 1) {
          octx.fillStyle = `rgba(26,16,40,${(1 - fog) * 0.35})`;
          octx.fillRect(b.x, b.top, b.w, horizon - b.top);
        }
      }

      // mâts d'antennes + cadres des panneaux holographiques
      octx.strokeStyle = "rgba(180,180,210,0.45)";
      octx.lineWidth = 1;
      for (const a of antennas) {
        octx.beginPath();
        octx.moveTo(a.x, a.base);
        octx.lineTo(a.x, a.y);
        octx.stroke();
      }
      for (const bd of boards) {
        octx.fillStyle = "rgba(8,8,16,0.92)";
        octx.fillRect(bd.x - 1, bd.y - 1, bd.w + 2, bd.h + 2);
      }

      // ───── Méga-panneaux iconiques (visage Kiroshi + enseignes) ─────
      for (const m of megaBillboards) {
        octx.fillStyle = "rgba(8,5,14,0.96)";
        octx.fillRect(m.x - 1, m.y - 1, m.w + 2, m.h + 2);
        const bg = octx.createLinearGradient(m.x, m.y, m.x, m.y + m.h);
        bg.addColorStop(0, "rgba(123,92,240,0.30)");
        bg.addColorStop(0.55, `rgba(${m.hue},0.22)`);
        bg.addColorStop(1, "rgba(15,6,24,0.25)");
        octx.fillStyle = bg;
        octx.fillRect(m.x, m.y, m.w, m.h);

        if (m.kind === "face") {
          const fcx = m.x + m.w / 2;
          const fcy = m.y + m.h * 0.4;
          const fr = Math.min(m.w, m.h) * 0.24;
          // tête (silhouette pâle)
          octx.fillStyle = "rgba(232,222,238,0.55)";
          octx.beginPath();
          octx.ellipse(fcx, fcy, fr * 0.8, fr, 0, 0, Math.PI * 2);
          octx.fill();
          // yeux
          octx.fillStyle = "rgba(18,8,22,0.85)";
          octx.beginPath();
          octx.ellipse(fcx - fr * 0.34, fcy - fr * 0.08, fr * 0.15, fr * 0.1, 0, 0, Math.PI * 2);
          octx.fill();
          octx.beginPath();
          octx.ellipse(fcx + fr * 0.34, fcy - fr * 0.08, fr * 0.15, fr * 0.1, 0, 0, Math.PI * 2);
          octx.fill();
          // optique cyan Kiroshi sur un œil
          octx.fillStyle = "rgba(0,245,212,0.9)";
          octx.beginPath();
          octx.arc(fcx + fr * 0.34, fcy - fr * 0.08, fr * 0.07, 0, Math.PI * 2);
          octx.fill();
          // bouche
          octx.strokeStyle = `rgba(${m.hue},0.7)`;
          octx.lineWidth = 1.4;
          octx.beginPath();
          octx.moveTo(fcx - fr * 0.22, fcy + fr * 0.55);
          octx.lineTo(fcx + fr * 0.22, fcy + fr * 0.55);
          octx.stroke();
          // texte
          octx.fillStyle = "rgba(245,245,255,0.6)";
          octx.font = `bold ${Math.max(5, m.w * 0.11)}px Arial, sans-serif`;
          octx.textAlign = "center";
          octx.textBaseline = "alphabetic";
          m.label.split("|").forEach((ln, i) =>
            octx.fillText(ln, fcx, m.y + m.h * 0.8 + i * m.w * 0.13),
          );
        } else {
          octx.save();
          octx.fillStyle = `rgba(${m.hue},0.85)`;
          octx.shadowColor = `rgba(${m.hue},1)`;
          octx.shadowBlur = 8;
          octx.font = `bold ${Math.max(6, m.h * 0.4)}px Arial, sans-serif`;
          octx.textAlign = "center";
          octx.textBaseline = "middle";
          octx.fillText(m.label, m.x + m.w / 2, m.y + m.h / 2);
          octx.restore();
        }
        // scanlines CRT
        octx.fillStyle = "rgba(0,0,0,0.16)";
        for (let ly = m.y; ly < m.y + m.h; ly += 3) octx.fillRect(m.x, ly, m.w, 1);
        // cadre néon
        octx.strokeStyle = `rgba(${m.hue},0.45)`;
        octx.lineWidth = 1;
        octx.strokeRect(m.x + 0.5, m.y + 0.5, m.w - 1, m.h - 1);
      }

      // ───── Arasaka Tower (design jumeau scindé) ─────
      {
        const t = tower;
        const cx = t.emX;
        // lueur rouge ambiante derrière la tour
        const aura = octx.createRadialGradient(cx, t.splitY, 0, cx, t.splitY, t.w * 4.5);
        aura.addColorStop(0, "rgba(255,40,70,0.16)");
        aura.addColorStop(1, "rgba(0,0,0,0)");
        octx.fillStyle = aura;
        octx.fillRect(cx - t.w * 4.5, t.top - t.w, t.w * 9, horizon - t.top + t.w);

        // colonne noire : verre teinté + liserés néon + fenêtres froides
        const column = (x: number, cw: number, y0: number, y1: number) => {
          const g = octx.createLinearGradient(x, 0, x + cw, 0);
          g.addColorStop(0, "#040409");
          g.addColorStop(0.5, "#101019");
          g.addColorStop(1, "#040409");
          octx.fillStyle = g;
          octx.fillRect(x, y0, cw, y1 - y0);
          octx.fillStyle = "rgba(0,245,212,0.22)";
          octx.fillRect(x, y0, 1, y1 - y0);
          octx.fillRect(x + cw - 1, y0, 1, y1 - y0);
          octx.fillStyle = "rgba(123,92,240,0.12)";
          octx.fillRect(x + cw / 2, y0, 1, y1 - y0);
          for (let y = y0 + 6; y < y1 - 4; y += 11)
            for (let xx = x + 4; xx < x + cw - 3; xx += 8)
              if (Math.random() > 0.74) {
                octx.fillStyle =
                  Math.random() > 0.85 ? "rgba(255,61,96,0.45)" : "rgba(0,245,212,0.26)";
                octx.fillRect(xx, y, 2, 3);
              }
        };

        // base unique puis deux spires jumelles
        column(t.x, t.w, t.splitY, horizon);
        column(t.leftX, t.spireW, t.spireTopL, t.splitY);
        column(t.rightX, t.spireW, t.spireTopR, t.splitY);

        // passerelles fermées (skyways) reliant les deux spires
        const gx0 = t.leftX + t.spireW;
        const gx1 = t.rightX;
        if (gx1 > gx0) {
          const top2 = Math.min(t.spireTopL, t.spireTopR);
          const n = 3;
          for (let i = 1; i <= n; i++) {
            const sy = t.splitY - ((t.splitY - top2) * i) / (n + 1);
            octx.fillStyle = "rgba(18,20,32,0.95)";
            octx.fillRect(gx0, sy - 2.5, gx1 - gx0, 5);
            octx.fillStyle = "rgba(0,245,212,0.5)";
            octx.fillRect(gx0, sy - 2.5, gx1 - gx0, 1);
          }
        }

        // mâts d'antennes (balises rouges en couche dynamique)
        octx.strokeStyle = "rgba(180,180,210,0.5)";
        octx.lineWidth = 1;
        octx.beginPath();
        octx.moveTo(t.beaconLX, t.spireTopL);
        octx.lineTo(t.beaconLX, t.beaconLY);
        octx.moveTo(t.beaconRX, t.spireTopR);
        octx.lineTo(t.beaconRX, t.beaconRY);
        octx.stroke();

        // logo ARASAKA blanc rétroéclairé (vertical sur la base)
        octx.save();
        octx.translate(cx, (t.splitY + horizon) / 2);
        octx.rotate(-Math.PI / 2);
        octx.font = `bold ${Math.max(8, t.w * 0.26)}px Arial, sans-serif`;
        octx.textAlign = "center";
        octx.textBaseline = "middle";
        octx.shadowColor = "rgba(255,255,255,0.6)";
        octx.shadowBlur = 8;
        octx.fillStyle = "rgba(240,245,255,0.85)";
        octx.letterSpacing = "3px";
        octx.fillText("ARASAKA", 0, 0);
        octx.restore();
        octx.shadowBlur = 0;
        octx.letterSpacing = "0px";

        // emblème (base sombre — le glow pulse en dynamique)
        octx.fillStyle = "rgba(255,61,96,0.35)";
        octx.beginPath();
        octx.moveTo(cx, t.emY - t.emR);
        octx.lineTo(cx + t.emR * 0.7, t.emY);
        octx.lineTo(cx, t.emY + t.emR);
        octx.lineTo(cx - t.emR * 0.7, t.emY);
        octx.closePath();
        octx.fill();
      }

      // halo lumineux de la ville au niveau de l'horizon
      const cityGlow = octx.createLinearGradient(0, horizon - 120, 0, horizon + 30);
      cityGlow.addColorStop(0, "rgba(123,92,240,0)");
      cityGlow.addColorStop(0.7, "rgba(123,92,240,0.08)");
      cityGlow.addColorStop(1, "rgba(255,61,96,0.10)");
      octx.fillStyle = cityGlow;
      octx.fillRect(0, horizon - 120, w, 150);

      // asphalte mouillé
      const road = octx.createLinearGradient(0, horizon, 0, h);
      road.addColorStop(0, "#120a1a");
      road.addColorStop(1, "#05040a");
      octx.fillStyle = road;
      octx.fillRect(0, horizon, w, h - horizon);
    };

    /* ───────── rendu d'une frame ───────── */
    const blitStatic = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    };

    const drawReflection = () => {
      // reflet de la ville sur l'asphalte (image statique retournée) — stronger
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.22;
      const hzPx = horizon * dpr;
      ctx.translate(0, 2 * hzPx);
      ctx.scale(1, -1);
      ctx.drawImage(off, 0, 0, w * dpr, hzPx, 0, 0, w * dpr, hzPx);
      ctx.restore();
      // distorsion / fondu du reflet
      ctx.save();
      const g = ctx.createLinearGradient(0, horizon, 0, h);
      g.addColorStop(0, "rgba(7,5,16,0.20)");
      g.addColorStop(0.5, "rgba(7,5,16,0.55)");
      g.addColorStop(1, "rgba(7,5,16,0.88)");
      ctx.fillStyle = g;
      ctx.fillRect(0, horizon, w, h - horizon);
      ctx.restore();
    };

    const drawCars = () => {
      for (const c of cars) {
        const len = 26 * c.scale;
        const tailX = c.x - c.dir * len;
        const grad = ctx.createLinearGradient(tailX, c.y, c.x, c.y);
        grad.addColorStop(0, `rgba(${c.color},0)`);
        grad.addColorStop(1, `rgba(${c.color},${0.5 * c.scale})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4 * c.scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, c.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        // tête lumineuse avec bloom
        ctx.shadowColor = `rgba(${c.color},0.9)`;
        ctx.shadowBlur = 9 * c.scale;
        ctx.fillStyle = `rgba(${c.color},0.95)`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.3 * c.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // reflet vertical du phare sur l'asphalte
        const ry0 = horizon + (horizon - c.y);
        const rg = ctx.createLinearGradient(c.x, horizon, c.x, ry0 + 18);
        rg.addColorStop(0, `rgba(${c.color},${0.16 * c.scale})`);
        rg.addColorStop(1, `rgba(${c.color},0)`);
        ctx.fillStyle = rg;
        ctx.fillRect(c.x - 1.2 * c.scale, horizon, 2.4 * c.scale, 22);
      }
    };

    const drawSigns = () => {
      for (const s of signs) {
        const flick =
          0.55 + 0.45 * Math.sin(frame * 0.12 + s.phase) * (Math.random() > 0.04 ? 1 : 0.2);
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = Math.max(0.15, flick);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    };

    const drawRain = () => {
      ctx.strokeStyle = "rgba(150,180,255,0.5)";
      ctx.lineWidth = 1;
      for (const d of rain) {
        ctx.globalAlpha = d.a;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len);
        ctx.stroke();
        // splash effect at horizon
        if (d.y + d.len > horizon - 5 && d.y + d.len < horizon + 8) {
          ctx.globalAlpha = d.a * 0.6;
          ctx.fillStyle = "rgba(150,180,255,0.3)";
          ctx.beginPath();
          ctx.arc(d.x - 2, horizon, rand(0.8, 1.6), 0, Math.PI * 2);
          ctx.fill();
          // tiny splash lines
          ctx.strokeStyle = "rgba(150,180,255,0.25)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(d.x - 4, horizon); ctx.lineTo(d.x - 5, horizon - 2);
          ctx.moveTo(d.x, horizon); ctx.lineTo(d.x + 1, horizon - 2);
          ctx.stroke();
          ctx.strokeStyle = "rgba(150,180,255,0.5)";
          ctx.lineWidth = 1;
        }
      }
      ctx.globalAlpha = 1;
    };

    let fogX = 0;
    const drawFog = () => {
      fogX += 0.15;
      // multi-layer volumetric fog
      for (let i = 0; i < 3; i++) {
        const cx = ((fogX * (i + 1) * 0.35) % (w + 500)) - 250;
        const cy = horizon - 40 + i * 20;
        const radius = 280 + i * 40;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, `rgba(123,92,240,${0.06 - i * 0.012})`);
        g.addColorStop(0.5, `rgba(80,50,160,${0.025 - i * 0.006})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      }
      // ground-level atmospheric haze (warmer)
      const haze = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 10);
      haze.addColorStop(0, "rgba(0,0,0,0)");
      haze.addColorStop(0.5, "rgba(30,15,45,0.06)");
      haze.addColorStop(1, "rgba(20,10,35,0.08)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, horizon - 60, w, 70);
    };

    const vignette = () => {
      const v = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.25, w / 2, h * 0.5, h * 0.9);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(5,4,12,0.75)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    };

    const drawBoards = () => {
      for (const bd of boards) {
        const idx = (bd.phase + Math.floor(frame / 200)) % BOARD_HUES.length;
        const hue = BOARD_HUES[idx];
        const flick = 0.55 + 0.45 * Math.sin(frame * 0.08 + bd.x);
        ctx.shadowColor = `rgba(${hue},1)`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(${hue},${0.35 + flick * 0.4})`;
        ctx.fillRect(bd.x, bd.y, bd.w, bd.h);
        // lignes de "contenu" du panneau
        ctx.fillStyle = `rgba(255,255,255,0.12)`;
        for (let ly = bd.y + 3; ly < bd.y + bd.h - 2; ly += 4)
          ctx.fillRect(bd.x + 2, ly, bd.w - 4, 1);
        ctx.shadowBlur = 0;
      }
    };

    const drawAntennas = () => {
      antennas.forEach((a, i) => {
        if (Math.floor(frame / 22 + i) % 2 !== 0) return;
        ctx.shadowColor = "#ff3d60";
        ctx.shadowBlur = 9;
        ctx.fillStyle = "#ff5a6e";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const drawTowerFx = () => {
      const t = tower;
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05);
      // emblème pulsant
      ctx.shadowColor = "#ff3d60";
      ctx.shadowBlur = 14 + pulse * 18;
      ctx.fillStyle = `rgba(255,84,104,${0.55 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(t.emX, t.emY - t.emR);
      ctx.lineTo(t.emX + t.emR * 0.7, t.emY);
      ctx.lineTo(t.emX, t.emY + t.emR);
      ctx.lineTo(t.emX - t.emR * 0.7, t.emY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // balises rouges sur les deux spires (clignotent en alternance)
      const beacon = (x: number, y: number) => {
        ctx.shadowColor = "#ff3d60";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ff6a7e";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      };
      const phase = Math.floor(frame / 26) % 2 === 0;
      if (phase) beacon(t.beaconLX, t.beaconLY);
      else beacon(t.beaconRX, t.beaconRY);
    };

    const drawSearchlights = () => {
      for (const sl of searchlights) {
        const ang = sl.base + Math.sin(frame * sl.speed) * sl.sweep;
        const len = horizon * 1.05;
        const spread = 0.06;
        const x1 = sl.x + Math.cos(ang - spread) * len;
        const y1 = sl.y + Math.sin(ang - spread) * len;
        const x2 = sl.x + Math.cos(ang + spread) * len;
        const y2 = sl.y + Math.sin(ang + spread) * len;
        const g = ctx.createLinearGradient(sl.x, sl.y, (x1 + x2) / 2, (y1 + y2) / 2);
        g.addColorStop(0, `rgba(${sl.hue},0.16)`);
        g.addColorStop(0.6, `rgba(${sl.hue},0.05)`);
        g.addColorStop(1, `rgba(${sl.hue},0)`);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(sl.x, sl.y);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();
        // source lumineuse au pied du faisceau
        ctx.shadowColor = `rgba(${sl.hue},1)`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(${sl.hue},0.9)`;
        ctx.beginPath();
        ctx.arc(sl.x, sl.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawAircraft = () => {
      for (const a of aircraft) {
        const s = a.scale;
        // traînée
        const trail = ctx.createLinearGradient(a.x - a.dir * 26 * s, a.y, a.x, a.y);
        trail.addColorStop(0, "rgba(180,200,255,0)");
        trail.addColorStop(1, "rgba(180,200,255,0.12)");
        ctx.strokeStyle = trail;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(a.x - a.dir * 26 * s, a.y);
        ctx.lineTo(a.x, a.y);
        ctx.stroke();
        // corps sombre
        ctx.fillStyle = "rgba(20,22,34,0.85)";
        ctx.fillRect(a.x - 3 * s, a.y - 0.8 * s, 6 * s, 1.6 * s);
        // feux de navigation clignotants (rouge / vert)
        const on = Math.sin(frame * 0.18 + a.blink) > 0;
        ctx.shadowBlur = 6;
        if (on) {
          ctx.shadowColor = "#ff3d60";
          ctx.fillStyle = "#ff5a6e";
          ctx.beginPath();
          ctx.arc(a.x - a.dir * 3 * s, a.y, 0.9 * s, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.shadowColor = "#00f5d4";
          ctx.fillStyle = "#00f5d4";
          ctx.beginPath();
          ctx.arc(a.x + a.dir * 3 * s, a.y, 0.9 * s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    };

    const drawEmbers = () => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        const tw = 0.6 + 0.4 * Math.sin(frame * 0.05 + e.x);
        ctx.fillStyle = e.warm
          ? `rgba(254,188,46,${e.a * tw})`
          : `rgba(0,245,212,${e.a * tw})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      blitStatic();
      drawReflection();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawAircraft();
      drawSearchlights();
      drawFog();
      drawBoards();
      drawAntennas();
      drawCars();
      drawSigns();
      drawTowerFx();
      drawRain();
      drawEmbers();
      vignette();
    };

    // Plafond ~30 FPS : ce fond est un décor, inutile de le rendre à 60 FPS.
    // Divise par ~2 le coût CPU/GPU (reflet plein écran + gradients par frame).
    let lastT = 0;
    const step = (now = 0) => {
      raf = requestAnimationFrame(step);
      if (now - lastT < 33) return;
      lastT = now;
      frame++;
      for (const c of cars) {
        c.x += c.sp * c.dir;
        if (c.dir === 1 && c.x - 30 > w) c.x = -30;
        else if (c.dir === -1 && c.x + 30 < 0) c.x = w + 30;
      }
      for (const d of rain) {
        d.y += d.sp;
        d.x -= 2;
        if (d.y > h) {
          d.y = -d.len;
          d.x = Math.random() * (w + 100);
        }
      }
      // braises ascendantes
      for (const e of embers) {
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < -4 || e.x < -4 || e.x > w + 4) {
          e.x = Math.random() * w;
          e.y = h + rand(0, 40);
          e.vx = rand(-0.25, 0.45);
          e.vy = -rand(0.15, 0.55);
        }
      }
      // aéronefs
      for (const a of aircraft) {
        a.x += a.sp * a.dir;
        if (a.dir === 1 && a.x - 40 > w) {
          a.x = -40;
          a.y = rand(h * 0.08, horizon * 0.5);
        } else if (a.dir === -1 && a.x + 40 < 0) {
          a.x = w + 40;
          a.y = rand(h * 0.08, horizon * 0.5);
        }
      }
      if (frame % 7 === 0)
        for (const s of stars) s.a = Math.max(0.08, Math.min(0.7, s.a + (Math.random() - 0.5) * 0.1));
      render();
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = off.width = Math.floor(w * dpr);
      canvas.height = off.height = Math.floor(h * dpr);
      generate();
      drawStatic();
      render();
    };

    resize();
    if (!reduced) raf = requestAnimationFrame(step);

    const onResize = () => resize();
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(step);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [lite]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: lite ? "none" : undefined }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.7]"
    />
  );
}
