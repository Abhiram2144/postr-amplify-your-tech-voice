"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  Flag,
  ArrowLeft,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Usage", path: "/admin/usage", icon: BarChart3 },
  { name: "Jobs / Health", path: "/admin/jobs", icon: Activity },
  { name: "Flags / Abuse", path: "/admin/flags", icon: Flag },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] bg-white border-r border-slate-200 shadow-sm">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            Postr
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-6">
          <LayoutGroup>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`
                      relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-md
                      ${
                        isActive
                          ? "bg-slate-100 text-rose-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-rose-600" />
                    )}
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-rose-600" : "text-slate-400 group-hover:text-slate-600"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </LayoutGroup>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-rose-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
