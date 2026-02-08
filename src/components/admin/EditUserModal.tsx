"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface EditUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditUserModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plan: "free",
    monthly_generation_limit: 10,
    reset_usage: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        plan: user.plan || "free",
        monthly_generation_limit: user.monthly_generation_limit || 10,
        reset_usage: false,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {
        plan: formData.plan,
        monthly_generation_limit: parseInt(
          String(formData.monthly_generation_limit),
        ),
      };

      if (formData.reset_usage) {
        updates.generations_used_this_month = 0;
      }

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("User updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold">Edit User</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Plan
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monthly Credit Limit
                </label>
                <input
                  type="number"
                  value={formData.monthly_generation_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_generation_limit: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <input
                  type="checkbox"
                  id="reset_usage"
                  checked={formData.reset_usage}
                  onChange={(e) =>
                    setFormData({ ...formData, reset_usage: e.target.checked })
                  }
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="reset_usage" className="text-sm">
                  <span className="font-medium text-slate-700 block">
                    Reset Usage Data
                  </span>
                  <span className="text-slate-500 text-xs">
                    Reset "Generations Used" to 0 for this month.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
