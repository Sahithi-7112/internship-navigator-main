import { ReactNode, useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Building2,
  Landmark,
  LogOut,
  Menu,
  LayoutDashboard,
  Briefcase,
  FileText,
  Bot,
  ClipboardCheck,
  BookOpen,
  FileCheck,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface RoleConfig {
  label: string;
  icon: ReactNode;
  navItems: NavItem[];
  profilePath: string; // ✅ ADDED (important fix)
}

const roleConfig: Record<UserRole, RoleConfig> = {
  student: {
    label: "Student",
    icon: <GraduationCap className="h-5 w-5" />,
    profilePath: "/student/profile",
    navItems: [
      { label: "Dashboard", path: "/student", icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: "Internships", path: "/student/internships", icon: <Briefcase className="h-4 w-4" /> },
      { label: "My Applications", path: "/student/applications", icon: <FileText className="h-4 w-4" /> },
      { label: "Request NOC", path: "/student/noc-request", icon: <FileCheck className="h-4 w-4" /> },
      { label: "AI Recommendations", path: "/student/recommendations", icon: <Bot className="h-4 w-4" /> },
      { label: "Resources", path: "/student/resources", icon: <BookOpen className="h-4 w-4" /> },
    ],
  },

  employer: {
    label: "Employer",
    icon: <Building2 className="h-5 w-5" />,
    profilePath: "/employer/profile",
    navItems: [
      { label: "Dashboard", path: "/employer", icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },

  placement: {
    label: "Placement Cell",
    icon: <Landmark className="h-5 w-5" />,
    profilePath: "/placement/profile",
    navItems: [
      { label: "Dashboard", path: "/placement", icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: "Shortlisted & Selected", path: "/placement/shortlisted", icon: <ClipboardCheck className="h-4 w-4" /> },
      { label: "Resources", path: "/placement/resources", icon: <BookOpen className="h-4 w-4" /> },
    ],
  },

  hod: {
    label: "HOD",
    icon: <Shield className="h-5 w-5" />,
    profilePath: "/hod/profile",
    navItems: [
      { label: "Dashboard", path: "/hod", icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const config = roleConfig[user.role];

  const handleLogout = (): void => {
    logout();
    navigate("/");
  };

  const goToProfile = (): void => {
    if (user.role === "student") {
      navigate(config.profilePath);
    }
  };

  // Determine if profile is clickable (only for students)
  const isProfileClickable = user.role === "student";

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div className="flex h-full flex-col">

          {/* USER HEADER */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-white">
              {config.icon}
            </div>

            <div>

              {/* ✅ CLICKABLE EMAIL → ROLE BASED PROFILE (STUDENTS ONLY) */}
              <p
                onClick={goToProfile}
                className={`text-sm font-semibold ${
                  isProfileClickable
                    ? "cursor-pointer hover:underline"
                    : "cursor-default"
                }`}
              >
                {user.email}
              </p>

              <p className="text-xs text-sidebar-foreground/60">
                {config.label}
              </p>

            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {config.navItems.map((item: NavItem) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* LOGOUT */}
          <div className="border-t border-sidebar-border p-3">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

        </div>
      </aside>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col overflow-hidden">

        <header className="flex items-center gap-4 border-b bg-card px-6 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">InternHub</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

      </div>
    </div>
  );
}