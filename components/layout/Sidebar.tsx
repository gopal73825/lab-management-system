"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Monitor, LayoutDashboard, FlaskConical, Cpu, Package,
  Archive, ArrowLeftRight, AlertCircle, FileText,
  Store, ShoppingCart, X, ChevronDown, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Labs", href: "/labs", icon: <FlaskConical className="w-4 h-4" /> },
  { label: "Systems", href: "/systems", icon: <Cpu className="w-4 h-4" /> },
  { label: "Assets", href: "/assets", icon: <Package className="w-4 h-4" /> },
  { label: "Inventory", href: "/inventory", icon: <Archive className="w-4 h-4" /> },
  { label: "Assignments", href: "/assignments", icon: <ArrowLeftRight className="w-4 h-4" /> },
  { label: "Complaints", href: "/complaints", icon: <AlertCircle className="w-4 h-4" /> },
  {
    label: "Reports",
    icon: <FileText className="w-4 h-4" />,
    children: [
      { label: "Daily Reports", href: "/reports/daily" },
      { label: "Monthly Reports", href: "/reports/monthly" },
      { label: "Yearly Reports", href: "/reports/yearly" },
    ],
  },
  { label: "Vendors", href: "/vendors", icon: <Store className="w-4 h-4" /> },
  { label: "Purchases", href: "/purchases", icon: <ShoppingCart className="w-4 h-4" /> },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["Reports"]);

  const toggle = (label: string) =>
    setExpanded((p) => p.includes(label) ? p.filter((x) => x !== label) : [...p, label]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 w-64 flex flex-col",
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:h-screen"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Lab Assets</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            if (item.children) {
              const isExp = expanded.includes(item.label);
              const anyActive = item.children.some((c) => pathname.startsWith(c.href));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={cn(
                      "sidebar-link w-full justify-between",
                      anyActive && "active"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    {isExp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {isExp && (
                    <div className="ml-7 mt-0.5 space-y-0.5">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className={cn(
                            "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                            pathname === c.href
                              ? "text-primary-700 dark:text-primary-400 font-medium"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                          )}
                          onClick={onClose}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href!);
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={onClose}
                className={cn("sidebar-link", active && "active")}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            College Lab Asset Manager v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
