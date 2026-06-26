/*
 * Logo ASCII (police bloc « ANSI Shadow ») — UNKNOWNX.
 * Rendu dans une vraie police monospace (les caractères de tableau s'alignent
 * correctement, contrairement à Share Tech Mono), avec un dégradé violet→cyan.
 */

const ART = ` ██╗   ██╗███╗   ██╗██╗  ██╗███╗   ██╗ ██████╗ ██╗    ██╗███╗   ██╗██╗  ██╗
██║   ██║████╗  ██║██║ ██╔╝████╗  ██║██╔═══██╗██║    ██║████╗  ██║╚██╗██╔╝
██║   ██║██╔██╗ ██║█████╔╝ ██╔██╗ ██║██║   ██║██║ █╗ ██║██╔██╗ ██║ ╚███╔╝
██║   ██║██║╚██╗██║██╔═██╗ ██║╚██╗██║██║   ██║██║███╗██║██║╚██╗██║ ██╔██╗
╚██████╔╝██║ ╚████║██║  ██╗██║ ╚████║╚██████╔╝╚███╔███╔╝██║ ╚████║██╔╝ ██╗
 ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝╚═╝  ╚═╝`;

export function AsciiLogo({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="w-full overflow-x-auto">
      <pre
        aria-label="UnknownX-077"
        className="mx-auto w-max select-none bg-gradient-to-r from-primary via-secondary to-primary
                   bg-clip-text text-transparent
                   text-[9px] sm:text-[10px] md:text-[13px]"
        style={{
          fontFamily:
            '"Cascadia Mono", "Cascadia Code", Consolas, "DejaVu Sans Mono", ui-monospace, monospace',
          lineHeight: 1.05,
          letterSpacing: 0,
        }}
      >
        {ART}
      </pre>
      {tagline && (
        <p className="text-center label mt-3 !text-muted">
          UNKNOWNX-077 <span className="text-secondary">//</span> SECURE VAULT
        </p>
      )}
    </div>
  );
}
