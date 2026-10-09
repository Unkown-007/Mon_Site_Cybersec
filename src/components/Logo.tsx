import { GlitchText } from "@/components/animations/GlitchText";
import { XLogo } from "@/components/XLogo";

export function LogoWordmark() {
  return (
    <span className="group flex select-none items-center gap-2.5">
      <span className="transition-transform duration-500 ease-out-soft group-hover:rotate-[8deg] group-hover:scale-105">
        <XLogo size={32} />
      </span>
      <span className="flex items-baseline gap-1.5">
        <GlitchText
          as="span"
          text="UnknownX"
          className="font-display text-[15px] font-bold tracking-tight text-ink-strong"
        />
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-px font-mono text-[10px] font-medium text-secondary">
          077
        </span>
      </span>
    </span>
  );
}
