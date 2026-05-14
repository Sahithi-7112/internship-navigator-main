import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import ProfileSummary from "@/components/ProfileSummary";
import ApplicationStatus from "@/components/ApplicationStats";
import NotificationsPanel from "@/components/NotificationsPanel";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.email} 👋
          </h1>
          <p className="text-muted-foreground">
            Your internship journey dashboard
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* VIEW ONLY PROFILE */}
          <ProfileSummary />

          {/* APPLICATION STATUS */}
          <ApplicationStatus />

          {/* NOTIFICATIONS - Full width */}
          <div className="md:col-span-2 xl:col-span-3">
            <NotificationsPanel />
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}