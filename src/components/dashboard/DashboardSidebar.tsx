import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  Clock,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CreditCard,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_PLANS, PlanType } from "@/lib/stripe-config";
import type { UserProfile } from "./DashboardLayout";

interface DashboardSidebarProps {
  profile: UserProfile | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { name: "Home", path: "/dashboard", icon: LayoutDashboard },
  { name: "Create", path: "/dashboard/generate", icon: Sparkles },
  { name: "Projects", path: "/dashboard/projects", icon: FolderOpen },
  { name: "Content Library", path: "/dashboard/history", icon: Clock },
];

const secondaryNavItems = [
  { name: "Usage", path: "/dashboard/usage", icon: BarChart3 },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

const DashboardSidebar = ({ profile, collapsed, onToggleCollapse }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useRole();
  const { plan: subscriptionPlan } = useSubscription();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const normalizePlan = (value?: string | null): PlanType => {
    const normalized = (value ?? "").toLowerCase();
    if (normalized.includes("pro")) return "pro";
    if (normalized.includes("creator")) return "creator";
    return "free";
  };

  const profilePlan = normalizePlan(profile?.plan);
  const effectivePlan = subscriptionPlan !== "free" ? subscriptionPlan : profilePlan;

  const getPlanBadgeColor = (plan: PlanType) => {
    if (plan === "pro") return "bg-primary/20 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.25)]";
    if (plan === "creator") return "bg-accent/20 text-accent";
    return "bg-muted text-muted-foreground";
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo & Brand */}
      <div className={`p-4 flex items-center border-b border-sidebar-border ${collapsed ? "justify-center" : "justify-between"}`}>
        <Link to="/" className={`flex items-center gap-2.5 ${collapsed ? "" : "overflow-hidden"}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <span className="text-lg font-black text-primary-foreground">P</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold text-sidebar-foreground"
              >
                Postr
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Collapse toggle for collapsed state */}
      {collapsed && (
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full h-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Primary CTA */}
      <div className="p-3">
        <Button
          variant="hero"
          className={`w-full gap-2 ${collapsed ? "px-0 justify-center" : ""}`}
          onClick={() => {
            const match = location.pathname.match(/^\/dashboard\/projects\/(.+)$/);
            const projectId = match?.[1];
            navigate(projectId ? `/dashboard/generate?projectId=${encodeURIComponent(projectId)}` : "/dashboard/generate");
          }}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                New Idea
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Core Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <LayoutGroup>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId={collapsed ? "activeIndicatorCollapsed" : "activeIndicatorExpanded"}
                    layout="position"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-105"}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium text-sm"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="py-3">
          <div className="h-px bg-sidebar-border" />
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={collapsed ? "activeIndicatorCollapsed" : "activeIndicatorExpanded"}
                    layout="position"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-105"}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium text-sm"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
        </LayoutGroup>
      </nav>

      {/* User Account Section */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors duration-200 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {getInitials(profile?.full_name || null, profile?.email || "U")}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 text-left overflow-hidden"
                  >
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || profile?.email?.split("@")[0] || "User"}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPlanBadgeColor(effectivePlan)}`}>
                      {STRIPE_PLANS[effectivePlan].name}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings?tab=plan")}>
              <User className="h-4 w-4 mr-2" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings?tab=plan")}>
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
