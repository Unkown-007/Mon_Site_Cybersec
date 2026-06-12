import { GlitchText } from "@/components/animations/GlitchText";
import { ArasakaLogo } from "@/components/ArasakaLogo";

export function HexLogo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2 28 9v14L16 30 4 23V9L16 2Z"
        stroke="#7b5cf0"
        strokeWidth="1.5"
        fill="rgba(123,92,240,0.08)"
      />
      <path
        d="M16 9 22 12.5v7L16 23l-6-3.5v-7L16 9Z"
        stroke="#00f5d4"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="16" cy="16" r="2" fill="#7b5cf0" />
    </svg>
  );
}

export function LogoWordmark() {
  return (
    <span className="flex items-center gap-2 select-none group">
      <ArasakaLogo size={30} />
      <GlitchText
        as="span"
        text="UnknownX-077"
        className="font-display font-bold tracking-[2px] text-ink"
      />
    </span>
  );
}
