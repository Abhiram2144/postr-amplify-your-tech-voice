"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Flag,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ActionMenu from "@/components/ui/ActionMenu";

export default function AdminFlags() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_outputs")
        .select("*")
        .lt("analysis_score", 60)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      console.error("Error fetching flags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flags & Abuse</h1>
          <p className="text-slate-500 mt-1">
            Review content flagged by AI guardian for low quality or rules
            violation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
            Auto-Guardian: LIVE
          </div>
          <button
            onClick={fetchFlags}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 text-slate-600 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[
          {
            label: "Active Flags",
            value: flags.length,
            icon: Flag,
            color: "text-orange-500",
          },
          {
            label: "High Sensitivity",
            value: flags.filter((f) => (f.analysis_score || 0) < 40).length,
            icon: AlertTriangle,
            color: "text-rose-500",
          },
          {
            label: "Resolved (30d)",
            value: 124,
            icon: ShieldCheck,
            color: "text-emerald-500",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">
                {item.label}
              </span>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold">
              {loading ? "..." : item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold">Investigation Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Source & Target</th>
                <th className="px-6 py-4">Analysis Score</th>
                <th className="px-6 py-4">Flag Status</th>
                <th className="px-6 py-4">Detected On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? [1, 2, 3].map((i) => (
                    <tr key={i} className="h-16 animate-pulse bg-slate-50/50">
                      <td colSpan={5} />
                    </tr>
                  ))
                : flags.map((flag) => (
                    <tr
                      key={flag.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {flag.platform?.toUpperCase() || "UNKNOWN"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {flag.content_type || "Generic"} output
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center font-bold text-rose-600 text-xs">
                            {Math.round(flag.analysis_score || 0)}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Guardian Score
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            (flag.analysis_score || 0) < 40
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-orange-50 text-orange-700 border-orange-100"
                          }`}
                        >
                          {(flag.analysis_score || 0) < 40
                            ? "HIGH RISK"
                            : "MANUAL REVIEW"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(flag.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => console.log("Quarantine", flag.id)}
                            className="p-1 px-2 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold"
                          >
                            QUARANTINE
                          </button>
                          <ActionMenu
                            actions={[
                              {
                                label: "Dismiss Flag",
                                icon: ShieldCheck,
                                onClick: () =>
                                  console.log("Dismiss flag", flag.id),
                              },
                              {
                                label: "Ban User",
                                icon: AlertTriangle,
                                onClick: () =>
                                  console.log("Ban user", flag.user_id),
                                variant: "destructive",
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              {!loading && flags.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <ShieldCheck className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">
                      Safe Mode: No abuse patterns detected.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
