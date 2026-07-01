"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoWordmark } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { NAV_ITEMS, ADMIN_ITEM, type NavItem } from "@/lib/nav";
import { useAuth } from "@/lib/auth";


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

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [acc, setAcc] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>();

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const groupActive = (g: { hrefs: string[] }) => g.hrefs.some(isActive);

  const handleLogout = () => {
    // logout() efface la session puis recharge proprement sur /login.
    logout();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-primary/20 bg-base/60 backdrop-blur-[12px]" style={{ boxShadow: '0 1px 12px rgba(123,92,240,0.15), inset 0 -1px 0 rgba(123,92,240,0.1)' }}>
      <nav className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="Accueil UnknownX-077">
          <LogoWordmark />
        </Link>

        {/* Desktop */}
        <ul className="hidden lg:flex items-center gap-1">
          <li>
            <NavTopLink href="/" active={isActive("/")}>
              Dashboard
            </NavTopLink>
          </li>

          {GROUPS.map((g) => (
            <li
              key={g.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(g.label)}
              onMouseLeave={() => setOpenGroup((v) => (v === g.label ? null : v))}
            >
              <button
                onClick={() => setOpenGroup((v) => (v === g.label ? null : g.label))}
                className={`hud-tab px-3.5 py-2 text-xs font-mono uppercase tracking-[2px] flex items-center ${
                  groupActive(g) ? "is-active text-secondary" : "text-muted hover:text-ink"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1">
                  {g.label}
                  <span className="text-[8px]">▾</span>
                </span>
              </button>

              <AnimatePresence>
                {openGroup === g.label && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full w-64 p-1.5 rounded-sm border bg-surface/90 backdrop-blur-xl"
                    style={{ borderColor: "rgba(123,92,240,0.3)", boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(123,92,240,0.3)' }}
                  >
                    {g.hrefs.map((h) => {
                      const it = item(h);
                      const active = isActive(h);
                      return (
                        <Link
                          key={h}
                          href={h}
                          onClick={() => setOpenGroup(null)}
                          className={`flex items-start gap-3 px-3 py-2.5 border-l-2 transition-colors ${
                            active
                              ? "border-secondary bg-secondary/5"
                              : "border-transparent hover:bg-primary/5"
                          }`}
                        >
                          <span className="label !text-primary mt-0.5">{it.code}</span>
                          <span className="min-w-0">
                            <span className={`block font-mono text-sm ${active ? "text-secondary" : "text-ink"}`}>
                              {it.label}
                            </span>
                            <span className="block font-mono text-[10px] text-muted truncate">
                              {it.desc}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}

          <li>
            <NavTopLink href="/vault" active={isActive("/vault")}>
              Vault
            </NavTopLink>
          </li>
          {user?.role === "admin" && (
            <li>
              <NavTopLink href="/admin" active={isActive("/admin")}>
                Admin
              </NavTopLink>
            </li>
          )}
          <li>
            <button
              onClick={openTerminal}
              className="hud-tab px-3.5 py-2 text-xs font-mono uppercase tracking-[2px] text-muted hover:text-secondary"
            >
              <span className="relative z-10">❯_ Terminal</span>
            </button>
          </li>
        </ul>

        {/* État auth desktop */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 focus-ring" title="Mon profil">
                <Avatar src={avatar} name={user.name} size={26} />
                <span className="font-mono text-xs text-muted">
                  {user.name}
                  <span className="text-primary"> · {user.role}</span>
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost !py-2 !px-3">
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary !py-2 !px-4">
              {"// Connect"}
            </Link>
          )}
        </div>

        {/* Burger mobile */}
        <button
          className="lg:hidden p-2 text-ink"
          aria-label="Menu"
          aria-expanded={mobile}
          onClick={() => setMobile((o) => !o)}
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-current transition-transform ${mobile ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-opacity ${mobile ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-transform ${mobile ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {/* Drawer mobile */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-line-strong bg-base/95 backdrop-blur-md"
          >
            <div className="px-4 py-3 flex flex-col">
              <MobLink href="/" active={isActive("/")} onClick={() => setMobile(false)}>
                Dashboard
              </MobLink>

              {GROUPS.map((g) => (
                <div key={g.label} className="border-b border-line">
                  <button
                    onClick={() => setAcc((v) => (v === g.label ? null : g.label))}
                    className={`w-full flex items-center justify-between py-3 font-mono text-sm uppercase tracking-[2px] ${
                      groupActive(g) ? "text-secondary" : "text-ink"
                    }`}
                  >
                    {g.label}
                    <span className="text-xs">{acc === g.label ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence>
                    {acc === g.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-2 pl-3">
                          {g.hrefs.map((h) => {
                            const it = item(h);
                            return (
                              <Link
                                key={h}
                                href={h}
                                onClick={() => setMobile(false)}
                                className={`flex items-center gap-2 py-2 font-mono text-sm ${
                                  isActive(h) ? "text-secondary" : "text-muted"
                                }`}
                              >
                                <span className="label !text-primary">{it.code}</span>
                                {it.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <MobLink href="/vault" active={isActive("/vault")} onClick={() => setMobile(false)}>
                Vault
              </MobLink>
              {user?.role === "admin" && (
                <MobLink href="/admin" active={isActive("/admin")} onClick={() => setMobile(false)}>
                  Admin
                </MobLink>
              )}

              <div className="pt-4">
                {user ? (
                  <button onClick={handleLogout} className="btn btn-ghost w-full justify-center">
                    Déconnexion · {user.name}
                  </button>
                ) : (
                  <Link href="/login" className="btn btn-primary w-full justify-center">
                    {"// Connect"}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavTopLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`hud-tab inline-block px-3.5 py-2 text-xs font-mono uppercase tracking-[2px] ${
        active ? "is-active text-secondary" : "text-muted hover:text-ink"
      }`}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

function MobLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block py-3 border-b border-line border-l-2 font-mono text-sm uppercase tracking-[2px] pl-3 transition-all ${
        active ? "border-l-secondary text-secondary bg-secondary/5" : "border-l-transparent text-ink hover:text-ink-strong"
      }`}
    >
      {children}
    </Link>
  );
}
