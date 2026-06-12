"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from "react-simple-maps";
import { PageHeader } from "@/components/PageHeader";
import { StatusDot } from "@/components/StatusDot";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Villes-cibles (destinations des arcs).
const HUBS: Record<string, [number, number]> = {
  "New York": [-74, 40.7],
  London: [-0.1, 51.5],
  Paris: [2.35, 48.85],
  Frankfurt: [8.68, 50.11],
  Toronto: [-79.4, 43.65],
  "São Paulo": [-46.6, -23.5],
  Mumbai: [72.8, 19],
  Tokyo: [139.7, 35.7],
  Singapore: [103.8, 1.35],
  Sydney: [151.2, -33.87],
};
const HUB_NAMES = Object.keys(HUBS);

// Mode simulé (repli total).
const CITIES: Record<string, [number, number]> = {
  ...HUBS,
  Moscow: [37.6, 55.75],
  Beijing: [116.4, 39.9],
  Tehran: [51.4, 35.7],
  Lagos: [3.4, 6.5],
  Seoul: [127, 37.5],
  Amsterdam: [4.9, 52.37],
};
const CITY_NAMES = Object.keys(CITIES);
const SIM_TYPES = ["DDoS", "Malware", "Exploit", "Phishing", "Bruteforce"];

const PALETTE = ["#ff3d60", "#febc2e", "#7b5cf0", "#00f5d4", "#00c9a7", "#ff7ac4", "#5ca8ff"];
const colorFor = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

interface ThreatNode {
  ip: string;
  label: string;
  country: string;
  info: string;
  lng: number;
  lat: number;
}

interface Attack {
  id: number;
  from: [number, number];
  to: [number, number];
  fromLabel: string;
  toLabel: string;
  label: string;
  color: string;
  ip?: string;
  info?: string;
  t: number;
}

type Source = "dshield" | "feodo" | "fallback" | null;

const SOURCE_NAME: Record<string, string> = {
  dshield: "SANS DShield · ip-api",
  feodo: "Feodo Tracker (abuse.ch)",
};

let counter = 0;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function MapPage() {
  const [nodes, setNodes] = useState<ThreatNode[]>([]);
  const [source, setSource] = useState<Source>(null);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [feed, setFeed] = useState<Attack[]>([]);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);
  const nodesRef = useRef<ThreatNode[]>([]);

  const load = useCallback(() => {
    fetch("/api/threats")
      .then((r) => r.json())
      .then((d: { source: Source; nodes: ThreatNode[] }) => {
        nodesRef.current = d.nodes ?? [];
        setNodes(d.nodes ?? []);
        setSource(d.source);
      })
      .catch(() => setSource("fallback"));
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      const live = nodesRef.current;
      let a: Attack;
      if (live.length > 0) {
        const n = pick(live);
        const hub = pick(HUB_NAMES);
        a = {
          id: ++counter,
          from: [n.lng, n.lat],
          to: HUBS[hub],
          fromLabel: n.country,
          toLabel: hub,
          label: n.label,
          color: colorFor(n.country),
          ip: n.ip,
          info: n.info,
          t: Date.now(),
        };
      } else {
        const f = pick(CITY_NAMES);
        let to = pick(CITY_NAMES);
        while (to === f) to = pick(CITY_NAMES);
        const type = pick(SIM_TYPES);
        a = {
          id: ++counter,
          from: CITIES[f],
          to: CITIES[to],
          fromLabel: f,
          toLabel: to,
          label: type,
          color: colorFor(type),
          t: Date.now(),
        };
      }
      totalRef.current += 1;
      setTotal(totalRef.current);
      setAttacks((prev) => [...prev.filter((x) => Date.now() - x.t < 4200), a]);
      setFeed((prev) => [a, ...prev].slice(0, 18));
    }, 850);
    return () => clearInterval(id);
  }, []);

  const isReal = source === "dshield" || source === "feodo";

  return (
    <div>
      <PageHeader
        code="MAP // CARTE DES ATTAQUES"
        title="Carte des attaques en direct"
        desc="Trajectoires entre sources d'attaques réelles et régions cibles."
        state={isReal ? "danger" : "warn"}
        right={
          <div className="card px-3 py-2 font-mono text-xs flex items-center gap-2">
            <StatusDot state={isReal ? "danger" : "warn"} />
            {source === null ? (
              <span className="text-muted">connexion<span className="cursor" aria-hidden="true" /></span>
            ) : isReal ? (
              <span className="text-danger">● flux réel · {nodes.length} sources</span>
            ) : (
              <span className="text-warning">● simulé (flux injoignable)</span>
            )}
          </div>
        }
      />

      <div className="card p-3 mb-4 border-line-strong">
        <p className="font-mono text-[11px] text-muted leading-relaxed">
          {isReal ? (
            <>
              ⚡ Source réelle : <span className="text-secondary">{SOURCE_NAME[source!]}</span> — IP
              {source === "dshield"
                ? " des principales sources d'attaques du jour, géolocalisées en direct."
                : " de serveurs C2 de botnets actifs, géolocalisées par pays."}{" "}
              Les hubs cibles sont indicatifs.
            </>
          ) : (
            <>⚠ Flux temps réel indisponible — visualisation simulée à but démonstratif.</>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card overflow-hidden bg-[#080812]">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 165 }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#14142a"
                    stroke="#2a2a4e"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#1c1c3a", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {isReal &&
              nodes.map((n, i) => (
                <Marker key={`${n.ip}-${i}`} coordinates={[n.lng, n.lat]}>
                  <circle r={1.3} fill={colorFor(n.country)} opacity={0.55} />
                </Marker>
              ))}

            {attacks.map((a) => (
              <g key={a.id}>
                <Line
                  from={a.from}
                  to={a.to}
                  stroke={a.color}
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  className="attack-line"
                  style={{ opacity: 0.95 }}
                />
                <Marker coordinates={a.from}>
                  <circle r={1.8} fill={a.color} opacity={0.8} />
                </Marker>
                <Marker coordinates={a.to}>
                  <circle r={2.6} fill={a.color} />
                  <circle r={5} fill="none" stroke={a.color} strokeWidth={1} className="attack-ping" />
                </Marker>
              </g>
            ))}
          </ComposableMap>

          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-line">
            <span className="label !text-muted">Sources géolocalisées</span>
            <span className="font-mono text-xs text-muted">
              <span className="text-danger font-bold">{total}</span> événements
            </span>
          </div>
        </div>

        <aside>
          <h2 className="label mb-4">Flux d&apos;attaques</h2>
          <ul className="space-y-1.5 font-mono text-xs">
            {feed.length === 0 ? (
              <li className="text-muted">
                acquisition du flux<span className="cursor" aria-hidden="true" />
              </li>
            ) : (
              feed.map((a) => (
                <li key={a.id} className="card p-2.5 flex items-start gap-2 animate-fade-up">
                  <span className="h-2 w-2 mt-1 shrink-0" style={{ background: a.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-ink truncate">{a.label}</span>
                      <span className="text-muted text-[10px]">
                        {new Date(a.t).toLocaleTimeString("fr-FR")}
                      </span>
                    </div>
                    <div className="text-muted text-[10px] truncate">
                      {a.fromLabel} <span className="text-danger">→</span> {a.toLabel}
                    </div>
                    {a.ip && <div className="text-secondary/70 text-[10px] truncate">{a.ip}</div>}
                    {a.info && <div className="text-muted/70 text-[10px] truncate">{a.info}</div>}
                  </div>
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
