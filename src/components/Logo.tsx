import { GlitchText } from "@/components/animations/GlitchText";
import { XLogo } from "@/components/XLogo";

export function LogoWordmark() {
  return (
    <span className="flex items-center gap-2 select-none group">
      <XLogo size={30} />
      <GlitchText
        as="span"
        text="UnknownX-077"
        className="font-display font-bold tracking-[2px] text-ink"
      />
    </span>
  );
}
