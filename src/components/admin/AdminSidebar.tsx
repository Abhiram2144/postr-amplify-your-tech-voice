import { Link, useLocation } from "react-router-dom";
import { motion, LayoutGroup } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  Flag,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Usage", path: "/admin/usage", icon: BarChart3 },
  { name: "Jobs / Health", path: "/admin/jobs", icon: Activity },
  { name: "Flags / Abuse", path: "/admin/flags", icon: Flag },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <Shield className="h-6 w-6 text-destructive" />
          <span className="text-lg font-bold text-foreground">Admin</span>
        </div>

        {/* Back to Dashboard */}
        <div className="px-3 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          <LayoutGroup>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                    ${isActive 
                      ? "bg-destructive/10 text-destructive" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      layout="position"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-destructive"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
          </LayoutGroup>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
