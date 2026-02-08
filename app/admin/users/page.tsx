"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Zap,
  UserCheck,
  UserX,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ActionMenu from "@/components/ui/ActionMenu";
import EditUserModal from "@/components/admin/EditUserModal";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()),
  );

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ status })
        .eq("id", userId);

      if (error) throw error;

      toast.success(
        `User ${status === "suspended" ? "suspended" : "activated"} successfully`,
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user status");
    }
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    // Limits based on original admin panel logic
    const limits =
      plan === "pro"
        ? { monthly_generation_limit: 150 } // Note: original had video limit too, focusing on gen limit for now as per schema
        : plan === "creator"
          ? { monthly_generation_limit: 60 }
          : { monthly_generation_limit: 10 };

    try {
      const { error } = await supabase
        .from("users")
        .update({ plan, ...limits })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User plan updated to ${plan}`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user plan:", error);
      toast.error("Failed to update user plan");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    )
      return;

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) throw error;
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-slate-500 mt-1">
            Manage platform accounts and permissions.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Credits Used</th>
                <th className="px-6 py-4">Monthly Limit</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={7}
                        className="px-6 py-8 h-16 bg-slate-50/50"
                      />
                    </tr>
                  ))
                : filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {user.full_name || "—"}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[150px]">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.plan === "pro"
                              ? "bg-slate-900 text-white"
                              : user.plan === "creator"
                                ? "bg-slate-100 text-slate-900"
                                : "border border-slate-200 text-slate-600"
                          }`}
                        >
                          {user.plan?.toUpperCase() || "FREE"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "suspended"
                              ? "bg-rose-100 text-rose-800"
                              : "border border-slate-200 text-slate-600"
                          }`}
                        >
                          {user.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-slate-500">
                          <Zap className="h-3 w-3 text-amber-500" />
                          {user.generations_used_this_month || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div>
                          {user.monthly_generation_limit === 999
                            ? "Unlimited"
                            : `${user.monthly_generation_limit}/mo`}
                        </div>
                        {user.monthly_generation_limit &&
                          user.monthly_generation_limit !== 999 && (
                            <div className="text-xs mt-1 text-slate-400">
                              {Math.round(
                                ((user.generations_used_this_month || 0) /
                                  user.monthly_generation_limit) *
                                  100,
                              )}
                              % used
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionMenu
                          actions={[
                            {
                              label:
                                user.status === "suspended"
                                  ? "Activate"
                                  : "Suspend",
                              icon:
                                user.status === "suspended" ? UserCheck : UserX,
                              onClick: () =>
                                updateUserStatus(
                                  user.id,
                                  user.status === "suspended"
                                    ? "active"
                                    : "suspended",
                                ),
                            },
                            {
                              label: "Upgrade to Pro",
                              icon: ArrowUpCircle,
                              onClick: () => updateUserPlan(user.id, "pro"),
                            },
                            {
                              label: "Set to Creator",
                              icon: ArrowUpCircle,
                              onClick: () => updateUserPlan(user.id, "creator"),
                            },
                            {
                              label: "Downgrade to Free",
                              icon: ArrowDownCircle,
                              onClick: () => updateUserPlan(user.id, "free"),
                            },
                            {
                              label: "Edit Details",
                              icon: MoreVertical,
                              onClick: () => {
                                setSelectedUser(user);
                                setIsEditModalOpen(true);
                              },
                            },
                            {
                              label: "Delete User",
                              icon: ShieldCheck,
                              onClick: () => handleDeleteUser(user.id),
                              variant: "destructive",
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={fetchUsers}
      />
    </div>
  );
}
