import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { Search, MoreHorizontal, UserX, UserCheck, ArrowUpCircle, ArrowDownCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  plan: string | null;
  status: string | null;
  created_at: string | null;
  monthly_generation_limit: number | null;
  generations_used_this_month: number | null;
  plan_expires_at: string | null;
  subscription_status: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, plan, status, created_at, monthly_generation_limit, generations_used_this_month, plan_expires_at, subscription_status")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Real-time updates: refresh when any user row changes (webhooks, user self-service, etc.)
  useEffect(() => {
    const channel = supabase
      .channel("admin-users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => { fetchUsers(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ status })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${status === "suspended" ? "suspended" : "activated"}`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    try {
      if (plan === "free") {
        // Best-effort: cancel the Dodo subscription so the user isn't charged again
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (accessToken) {
          try {
            await supabase.functions.invoke("admin-update-subscription", {
              body: { userId, action: "cancel" },
              headers: { Authorization: `Bearer ${accessToken}` },
            });
          } catch {
            // User may have no Dodo subscription — proceed with DB downgrade anyway
          }
        }

        // Immediately downgrade in DB and set override so check-subscription
        // won't re-sync the old Dodo subscription back to a paid plan.
        const { error } = await supabase
          .from("users")
          .update({
            plan: "free",
            monthly_generation_limit: 10,
            monthly_video_limit: 2,
            plan_expires_at: null,
            subscription_status: "free",
            plan_override_by_admin: true,
          })
          .eq("id", userId);

        if (error) throw error;
      } else {
        // Admin grant of a paid plan — set override so check-subscription
        // respects this until a real Dodo webhook clears it.
        const limits = plan === "pro"
          ? { monthly_generation_limit: 150, monthly_video_limit: 999 }
          : { monthly_generation_limit: 60, monthly_video_limit: 20 };

        const { error } = await supabase
          .from("users")
          .update({
            plan,
            ...limits,
            plan_expires_at: null,
            subscription_status: "active",
            plan_override_by_admin: true,
          })
          .eq("id", userId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `User plan updated to ${plan}`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user plan:", error);
      toast({
        title: "Error",
        description: "Failed to update user plan",
        variant: "destructive",
      });
    }
  };

  const updateSubscriptionStatus = async (userId: string, nextStatus: "active" | "cancelled") => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Must be logged in");
      }

      const { data, error } = await supabase.functions.invoke("admin-update-subscription", {
        body: {
          userId,
          action: nextStatus === "cancelled" ? "cancel" : "restore",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: `Subscription marked ${nextStatus}`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating subscription status:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const getPlanBadgeVariant = (plan: string | null) => {
    switch ((plan ?? "").toLowerCase()) {
      case "pro": return "default";
      case "creator": return "secondary";
      default: return "outline";
    }
  };

  const getSubscriptionStatus = (user: User): string => {
    // Use the DB subscription_status column which is kept accurate by webhooks
    // and set explicitly when admin or user makes changes.
    if (user.subscription_status) return user.subscription_status;
    // Fallback for rows before the migration
    const planLower = (user.plan ?? "free").toLowerCase();
    return planLower === "free" ? "free" : "active";
  };

  const getSubscriptionBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "cancelling": return "secondary";
      case "on_hold": return "secondary";
      case "cancelled":
      case "expired":
      case "failed": return "destructive";
      case "free":
      default: return "outline";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">Manage user accounts and subscriptions</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Badge variant="outline">{filteredUsers.length} users</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Credits Used</TableHead>
                      <TableHead>Monthly Limit</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name || "—"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPlanBadgeVariant(user.plan)}>
                            {user.plan || "free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "suspended" ? "destructive" : "outline"}>
                            {user.status || "active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const subscriptionStatus = getSubscriptionStatus(user);
                            return (
                              <Badge variant={getSubscriptionBadgeVariant(subscriptionStatus)}>
                                {subscriptionStatus}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="font-medium text-muted-foreground">
                              {user.generations_used_this_month || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.monthly_generation_limit === 999
                            ? "Unlimited"
                            : `${user.monthly_generation_limit}/mo`}
                          {user.monthly_generation_limit && user.monthly_generation_limit !== 999 && (
                            <div className="text-xs mt-1">
                              {Math.round(((user.generations_used_this_month || 0) / user.monthly_generation_limit) * 100)}% used
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.status === "suspended" ? (
                                <DropdownMenuItem onClick={() => updateUserStatus(user.id, "active")}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => updateUserStatus(user.id, "suspended")}>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => updateUserPlan(user.id, "pro")}>
                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                Upgrade to Pro
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateUserPlan(user.id, "creator")}>
                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                Set to Creator
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateUserPlan(user.id, "free")}>
                                <ArrowDownCircle className="h-4 w-4 mr-2" />
                                Set plan to Free
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateSubscriptionStatus(user.id, "active")}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Mark subscription active
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateSubscriptionStatus(user.id, "cancelled")}>
                                <UserX className="h-4 w-4 mr-2" />
                                Mark subscription cancelled
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminUsers;
