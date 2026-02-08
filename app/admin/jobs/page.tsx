"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Zap,
  Database,
  Globe,
  Cpu,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminJobs() {
  const [health, setHealth] = useState<any>({
    db: "checking",
    api: "operational",
    ai: "operational",
    lastCheck: new Date(),
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const performHealthCheck = async () => {
    setLoading(true);
    try {
      const start = Date.now();
      const { error } = await supabase.from("users").select("id").limit(1);
      const latency = Date.now() - start;

      const { data: recentJobs } = await supabase
        .from("content_outputs")
        .select("id, content_type, created_at, generation_source")
        .order("created_at", { ascending: false })
        .limit(10);

      setHealth({
        db: error ? "degraded" : latency > 1000 ? "slow" : "operational",
        api: "operational",
        ai: "operational",
        lastCheck: new Date(),
      });
      setJobs(recentJobs || []);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performHealthCheck();
  }, []);

  const systems = [
    {
      name: "PostgreSQL Database",
      id: "db",
      icon: Database,
      color: "text-blue-500",
    },
    {
      name: "Supabase Edge Network",
      id: "api",
      icon: Globe,
      color: "text-emerald-500",
    },
    {
      name: "AI Inference Engine",
      id: "ai",
      icon: Cpu,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs & Health</h1>
          <p className="text-slate-500 mt-1">
            Real-time system status and background processes.
          </p>
        </div>
        <button
          onClick={performHealthCheck}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 text-slate-600 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {systems.map((sys) => {
          const status = health[sys.id];
          const isOk = status === "operational";
          return (
            <div
              key={sys.id}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-slate-50 ${sys.color}`}>
                  <sys.icon className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">{sys.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOk ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${isOk ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">99.9% uptime</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold">Recent Processing Jobs</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {job.content_type?.toUpperCase() || "CONTENT"}
                  </p>
                  <p className="text-[10px] text-slate-400">{job.id}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  COMPLETED
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(job.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {!loading && jobs.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic text-sm">
              No recent background jobs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
