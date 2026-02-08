"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, Search, User } from "lucide-react";

export default function AdminHeader() {
  const { user } = useAuth(); // Assuming we might want to show user email

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm/50">
      {/* Search / Breadcrumbs area */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">
              Admin User
            </p>
            <p className="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
