"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import {
  BookOpen,
  Database,
  History,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  SquareTerminal,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAppStore, useHydration } from "@/lib/store/app-store";
import { Toaster } from "@/components/ui/Toaster";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: { href: string; label: string }[];
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/learn",
    label: "Learn SQL",
    icon: BookOpen,
    children: [
      { href: "/learn#beginner", label: "Beginner" },
      { href: "/learn#intermediate", label: "Intermediate" },
      { href: "/learn#advanced", label: "Advanced" },
    ],
  },
  { href: "/playground", label: "Playground", icon: SquareTerminal },
  {
    href: "/challenges",
    label: "Challenges",
    icon: Trophy,
    children: [
      { href: "/challenges?level=easy", label: "Easy" },
      { href: "/challenges?level=medium", label: "Medium" },
      { href: "/challenges?level=hard", label: "Hard" },
    ],
  },
  {
    href: "/database",
    label: "Database",
    icon: Database,
    children: [
      { href: "/database/ecommerce", label: "E-Commerce" },
      { href: "/database/inventory", label: "Inventory" },
      { href: "/database/warehouse", label: "Warehouse" },
    ],
  },
  { href: "/history", label: "History", icon: History },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const setHydrated = useHydration((s) => s.setHydrated);
  const collapsed = useAppStore((s) => s.settings.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  // Mini-sidebar popup: only one open at a time, so hovering another item replaces it.
  const [flyout, setFlyout] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve(useAppStore.persist.rehydrate()).finally(setHydrated);
  }, [setHydrated]);

  const renderNav = (mini: boolean) => (
    <nav className={`flex flex-col gap-1 ${mini ? "items-center px-2 py-3" : "p-3"}`}>
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <div
            key={item.href}
            className={mini ? "relative" : "w-full"}
            {...(mini && {
              onMouseEnter: () => setFlyout(item.href),
              onMouseLeave: () => setFlyout((f) => (f === item.href ? null : f)),
              onFocus: () => setFlyout(item.href),
              onBlur: (e: FocusEvent<HTMLDivElement>) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFlyout((f) => (f === item.href ? null : f));
              },
              onKeyDown: (e: KeyboardEvent) => e.key === "Escape" && setFlyout(null),
            })}
          >
            <Link
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-label={mini ? item.label : undefined}
              className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                mini ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2"
              } ${active ? "bg-white/15 text-white" : "text-primary-100 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={18} />
              {!mini && item.label}
            </Link>
            {mini && flyout === item.href && (
              // Popup: label + submenu. pl-3 bridges the gap so the pointer can reach it.
              <div className="absolute left-full top-0 z-40 pl-3" onClick={() => setFlyout(null)}>
                <div className="min-w-44 overflow-hidden rounded-lg bg-primary-800 py-1 shadow-xl ring-1 ring-white/10">
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 text-sm font-semibold ${active ? "text-white" : "text-primary-100 hover:text-white"}`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="border-t border-white/10 py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-1.5 text-xs transition-colors hover:bg-white/10 ${
                            pathname === child.href ? "text-white" : "text-primary-200 hover:text-white"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {!mini && item.children && active && (
              <div className="ml-9 mt-1 flex flex-col border-l border-white/15">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMenuOpen(false)}
                    className={`py-1 pl-3 text-xs transition-colors ${
                      pathname === child.href ? "text-white" : "text-primary-200 hover:text-white"
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  const renderBrand = (mini: boolean) => (
    <Link href="/" title={mini ? "Dashboard" : undefined} className={`flex h-16 items-center gap-2 text-white ${mini ? "justify-center" : "px-5"}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white font-mono text-sm font-bold text-primary">SQL</span>
      {!mini && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold">SQL Learning</span>
          <span className="block text-xs text-primary-200">Playground</span>
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar: fixed so it stays put while the page scrolls; collapses to icons */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 hidden flex-col bg-primary transition-[width] duration-200 lg:flex ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {renderBrand(collapsed)}
        {/* Mini mode can't clip overflow, or the hover popups would be cut off */}
        <div className={`min-h-0 flex-1 ${collapsed ? "" : "overflow-y-auto overflow-x-hidden"}`}>{renderNav(collapsed)}</div>
        {!collapsed && <p className="px-5 pb-2 text-xs text-primary-300">Semua query berjalan di browser kamu.</p>}
        <button
          onClick={toggleSidebar}
          title={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
          aria-label={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
          className={`m-2 flex h-10 items-center gap-3 rounded-lg text-sm text-primary-200 hover:bg-white/10 hover:text-white ${
            collapsed ? "justify-center" : "px-3"
          }`}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && "Perkecil"}
        </button>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-primary lg:hidden">
        {renderBrand(false)}
        <button
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          onClick={() => setMenuOpen((o) => !o)}
          className="mr-3 rounded-lg p-2 text-white hover:bg-white/10"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-30 bg-primary shadow-lg lg:hidden">{renderNav(false)}</div>
      )}

      <main className={`min-w-0 pt-16 transition-[padding] duration-200 lg:pt-0 ${collapsed ? "lg:pl-16" : "lg:pl-60"}`}>{children}</main>
      <Toaster />
    </div>
  );
}
