"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, LayoutGroup, type Transition } from "framer-motion";
import { LogoWordmark } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { StatusDot } from "@/components/StatusDot";
import { PerfToggle } from "@/components/PerfToggle";
import {
  IconChevron,
  IconClose,
  IconLogout,
  IconMenu,
  IconSearch,
  IconSliders,
  IconSparkle,
  IconTerminal,
  IconUser,
} from "@/components/icons";
import { NAV_ITEMS, ADMIN_ITEM, type NavItem } from "@/lib/nav";
import { BACKGROUNDS, useBackground } from "@/lib/background";
import { useAuth } from "@/lib/auth";
import { usePerf } from "@/lib/perf";

const item = (href: string): NavItem =>
  NAV_ITEMS.find((n) => n.href === href) ?? ADMIN_ITEM;

const GROUPS: { label: string; hrefs: string[] }[] = [
  { label: "Arsenal", hrefs: ["/resources", "/tools", "/toolkit", "/playground", "/arsenal"] },
  { label: "Opérations", hrefs: ["/writeups", "/lab", "/hardware", "/map", "/stats"] },
  { label: "Intel", hrefs: ["/veille", "/news", "/ai", "/reference"] },
  { label: "Apprendre", hrefs: ["/learn", "/certifications", "/events"] },
  { label: "Social", hrefs: ["/leaderboard", "/team", "/profile"] },
];

const openTerminal = () => window.dispatchEvent(new Event("ux077:open-terminal"));
const openPalette = () => window.dispatchEvent(new Event("ux077:open-palette"));

const SPRING: Transition = { type: "spring", stiffness: 520, damping: 38, mass: 0.7 };
const POP = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
};

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { lite } = usePerf();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menu, setMenu] = useState<"settings" | "user" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const transition: Transition = lite ? { duration: 0 } : SPRING;

  useEffect(() => {
    if (!user) {
      setAvatar(undefined);
      return;
    }
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { account?: { avatar?: string } }) => setAvatar(d.account?.avatar))
      .catch(() => {});
  }, [user]);

  // Tout se referme quand on change de page.
  useEffect(() => {
    setOpenGroup(null);
    setMenu(null);
    setMobile(false);
  }, [pathname]);

  // Ombre plus marquée dès qu'on a défilé (un seul listener passif).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Échap / clic extérieur ferment les menus.
  useEffect(() => {
    if (!menu && !openGroup && !mobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(null);
      setOpenGroup(null);
      setMobile(false);
    };
    const onDown = (e: MouseEvent) => {
      if (menu && rightRef.current && !rightRef.current.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [menu, openGroup, mobile]);

  // Pas de défilement de la page derrière le tiroir mobile.
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const groupActive = (g: { hrefs: string[] }) => g.hrefs.some(isActive);

  const enterGroup = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(label);
  };
  const leaveGroup = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
  };

  const activeKey =
    (isActive("/") && "/") ||
    GROUPS.find(groupActive)?.label ||
    (isActive("/vault") && "/vault") ||
    (isActive("/admin") && "/admin") ||
    null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <nav
        className={`glass mx-auto flex h-14 max-w-7xl items-center gap-2 rounded-2xl pl-3 pr-2 transition-shadow duration-300 ${
          scrolled ? "shadow-[0_18px_50px_-20px_rgba(0,0,0,0.95)]" : ""
        }`}
      >
        <Link href="/" className="shrink-0 rounded-xl focus-ring" aria-label="Accueil UnknownX-077">
          <LogoWordmark />
        </Link>

        {/* Desktop : pilules + surlignage qui glisse d'un onglet à l'autre */}
        <LayoutGroup id="nav">
          <ul className="ml-3 hidden items-center gap-0.5 lg:flex" onMouseLeave={() => setHovered(null)}>
            <NavPill
              id="/"
              href="/"
              hovered={hovered}
              activeKey={activeKey}
              onHover={setHovered}
              transition={transition}
            >
              Dashboard
            </NavPill>

            {GROUPS.map((g) => (
              <li
                key={g.label}
                className="relative"
                onMouseEnter={() => enterGroup(g.label)}
                onMouseLeave={leaveGroup}
              >
                <NavPill
                  id={g.label}
                  hovered={hovered}
                  activeKey={activeKey}
                  onHover={setHovered}
                  transition={transition}
                  expanded={openGroup === g.label}
                  onClick={() => setOpenGroup((v) => (v === g.label ? null : g.label))}
                  asItem={false}
                >
                  {g.label}
                  <IconChevron
                    size={13}
                    className={`opacity-60 transition-transform duration-200 ${openGroup === g.label ? "rotate-180" : ""}`}
                  />
                </NavPill>

                <AnimatePresence>
                  {openGroup === g.label && g.hrefs.length > 0 && (
                    <motion.div
                      key="dropdown"
                      {...POP}
                      transition={transition}
                      style={{ transformOrigin: "top center" }}
                      className="absolute left-1/2 top-full z-10 -ml-[11rem] w-[22rem] pt-3"
                    >
                      <div className="menu-surface rounded-2xl p-2">
                        {g.hrefs.map((h, i) => {
                          const it = item(h);
                          const active = isActive(h);
                          return (
                            <motion.div
                              key={h}
                              initial={lite ? false : { opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: lite ? 0 : 0.02 * i, duration: 0.2 }}
                            >
                              <Link
                                href={h}
                                onClick={() => setOpenGroup(null)}
                                className={`group flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                                  active ? "bg-primary/[0.12]" : "hover:bg-white/[0.05]"
                                }`}
                              >
                                <span className="icon-tile h-9 w-9 shrink-0 font-mono text-[10px] font-semibold tracking-wide">
                                  {it.code}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className={`block text-sm font-medium ${active ? "text-ink-strong" : "text-ink"}`}>
                                    {it.label}
                                  </span>
                                  <span className="block truncate text-xs text-muted">{it.desc}</span>
                                </span>
                                <span className="text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                                  →
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}

            <NavPill id="/vault" href="/vault" hovered={hovered} activeKey={activeKey} onHover={setHovered} transition={transition}>
              Vault
            </NavPill>
            {user?.role === "admin" && (
              <NavPill id="/admin" href="/admin" hovered={hovered} activeKey={activeKey} onHover={setHovered} transition={transition}>
                Admin
              </NavPill>
            )}
          </ul>
        </LayoutGroup>

        {/* Actions */}
        <div ref={rightRef} className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openPalette}
            className="hidden h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-2.5 pr-1.5 text-xs text-muted transition-colors hover:border-white/15 hover:text-ink sm:flex"
            aria-label="Rechercher (Ctrl+K)"
          >
            <IconSearch size={15} />
            <span className="hidden xl:inline">Rechercher</span>
            <kbd className="whitespace-nowrap rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-muted">
              Ctrl K
            </kbd>
          </button>

          <IconButton label="Terminal (Ctrl+~)" onClick={openTerminal}>
            <IconTerminal />
          </IconButton>

          <div className="relative hidden sm:block">
            <IconButton
              label="Affichage"
              active={menu === "settings"}
              onClick={() => setMenu((m) => (m === "settings" ? null : "settings"))}
            >
              <IconSliders />
            </IconButton>
            <AnimatePresence>
              {menu === "settings" && (
                <motion.div
                  {...POP}
                  transition={transition}
                  style={{ transformOrigin: "top right" }}
                  className="menu-surface absolute right-0 top-full mt-3 w-80 rounded-2xl p-2"
                >
                  <DisplaySettings />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setMenu((m) => (m === "user" ? null : "user"))}
                aria-expanded={menu === "user"}
                className={`ml-1 flex items-center gap-2 rounded-xl py-1 pl-1 pr-2.5 transition-colors hover:bg-white/[0.05] ${
                  menu === "user" ? "bg-white/[0.06]" : ""
                }`}
              >
                <Avatar src={avatar} name={user.name} size={30} />
                <span className="max-w-[9rem] truncate text-sm font-medium text-ink">{user.name}</span>
                <IconChevron size={13} className="text-muted" />
              </button>
              <AnimatePresence>
                {menu === "user" && (
                  <motion.div
                    {...POP}
                    transition={transition}
                    style={{ transformOrigin: "top right" }}
                    className="menu-surface absolute right-0 top-full mt-3 w-64 rounded-2xl p-2"
                  >
                    <div className="flex items-center gap-3 rounded-xl p-2.5">
                      <Avatar src={avatar} name={user.name} size={38} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-ink-strong">{user.name}</div>
                        <div className="truncate text-xs text-muted">{user.email}</div>
                        <div className="mt-1">
                          <StatusDot state="online" label={user.role} />
                        </div>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-white/[0.06]" />
                    <MenuLink href="/profile" icon={<IconUser size={16} />}>
                      Mon profil
                    </MenuLink>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new Event("ux077:show-onboarding"))}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-ink transition-colors hover:bg-white/[0.05]"
                    >
                      <IconSparkle size={16} className="text-muted" /> Revoir la visite guidée
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                    >
                      <IconLogout size={16} /> Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary ml-1 hidden !py-2 lg:inline-flex">
              Connexion
            </Link>
          )}

          <IconButton label="Menu" className="lg:hidden" onClick={() => setMobile(true)}>
            <IconMenu />
          </IconButton>
        </div>
      </nav>

      {/* Tiroir mobile */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: lite ? 0 : 0.2 }}
              onClick={() => setMobile(false)}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={lite ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 40 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[88vw] max-w-sm flex-col overflow-y-auto rounded-l-3xl border-l border-white/[0.08] bg-surface p-4 lg:hidden"
              aria-label="Navigation"
            >
              <div className="mb-4 flex items-center justify-between">
                <LogoWordmark />
                <IconButton label="Fermer" onClick={() => setMobile(false)}>
                  <IconClose />
                </IconButton>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobile(false);
                  openPalette();
                }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-muted"
              >
                <IconSearch size={16} /> Rechercher…
              </button>

              <MobileLink href="/" active={isActive("/")}>Dashboard</MobileLink>
              {GROUPS.map((g) => (
                <div key={g.label} className="mt-4">
                  <div className="label mb-1.5 px-2">{g.label}</div>
                  <div className="grid grid-cols-2 gap-1">
                    {g.hrefs.map((h) => (
                      <MobileLink key={h} href={h} active={isActive(h)} compact>
                        {item(h).label}
                      </MobileLink>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-1">
                <MobileLink href="/vault" active={isActive("/vault")} compact>Vault</MobileLink>
                {user?.role === "admin" && (
                  <MobileLink href="/admin" active={isActive("/admin")} compact>Admin</MobileLink>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5">
                <DisplaySettings />
              </div>

              <div className="mt-auto pt-6">
                {user ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
                    <Avatar src={avatar} name={user.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-strong">{user.name}</div>
                      <StatusDot state="online" label={user.role} />
                    </div>
                    <button type="button" onClick={logout} className="btn btn-ghost !px-3 !py-2" aria-label="Déconnexion">
                      <IconLogout size={16} />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="btn btn-primary w-full">Connexion</Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

/* Pilule de navigation : surlignages partagés (layoutId) pour le survol et
   la page active, qui glissent d'un onglet à l'autre. */
function NavPill({
  id,
  href,
  hovered,
  activeKey,
  onHover,
  onClick,
  expanded,
  transition,
  asItem = true,
  children,
}: {
  id: string;
  href?: string;
  hovered: string | null;
  activeKey: string | null;
  onHover: (id: string) => void;
  onClick?: () => void;
  expanded?: boolean;
  transition: Transition;
  asItem?: boolean;
  children: ReactNode;
}) {
  const active = activeKey === id;
  const cls = `relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 focus-ring ${
    active || expanded ? "text-ink-strong" : "text-muted hover:text-ink-strong"
  }`;
  const inner = (
    <>
      {active && (
        <motion.span
          layoutId="nav-active"
          transition={transition}
          className="absolute inset-0 rounded-full bg-primary/[0.16] ring-1 ring-inset ring-primary/35"
        />
      )}
      {hovered === id && !active && (
        <motion.span
          layoutId="nav-hover"
          transition={transition}
          className="absolute inset-0 rounded-full bg-white/[0.06]"
        />
      )}
      <span className="relative z-10 flex items-center gap-1">{children}</span>
    </>
  );
  const el = href ? (
    <Link href={href} className={cls} onMouseEnter={() => onHover(id)} aria-current={active ? "page" : undefined}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={cls} onMouseEnter={() => onHover(id)} onClick={onClick} aria-expanded={expanded}>
      {inner}
    </button>
  );
  return asItem ? <li>{el}</li> : el;
}

function IconButton({
  label,
  onClick,
  active,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-xl transition-colors focus-ring ${
        active ? "bg-white/[0.08] text-ink-strong" : "text-muted hover:bg-white/[0.06] hover:text-ink-strong"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-ink transition-colors hover:bg-white/[0.05]"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  compact,
  children,
}: {
  href: string;
  active: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-3 ${compact ? "py-2 text-sm" : "py-2.5 text-[15px] font-medium"} transition-colors ${
        active ? "bg-primary/[0.14] text-ink-strong ring-1 ring-inset ring-primary/30" : "text-ink hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </Link>
  );
}

/* Menu « Affichage » : effets on/off + choix du fond d'écran. */
function DisplaySettings() {
  const { bg, setBg } = useBackground();
  return (
    <div>
      <PerfToggle />
      <div className="label mx-3 mb-2 mt-3">Fond d&apos;écran</div>
      <div className="grid grid-cols-2 gap-1.5 p-1">
        {BACKGROUNDS.map((b) => {
          const active = bg === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setBg(b.id)}
              title={b.desc}
              className={`group rounded-xl p-1.5 text-left transition-colors ${
                active ? "bg-primary/[0.14] ring-1 ring-inset ring-primary/40" : "hover:bg-white/[0.05]"
              }`}
            >
              <span
                aria-hidden
                className="block h-10 w-full rounded-lg border border-white/10 transition-transform duration-300 group-hover:scale-[1.03]"
                style={{ background: b.swatch }}
              />
              <span className={`mt-1.5 block px-0.5 text-xs font-medium ${active ? "text-ink-strong" : "text-ink"}`}>
                {b.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
