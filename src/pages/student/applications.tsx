import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import API_BASE_URL from "@/lib/api";

interface InternshipInfo {
  role?: string;
  company?: string;
  location?: string;
  stipend?: string;
  domain?: string;
  applyLink?: string;
}

interface Application {
  _id: string;
  company?: string;
  role?: string;
  status: string;
  note?: string;
  internshipId?: InternshipInfo;
  appliedAt?: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const highlightApplicationId = new URLSearchParams(location.search).get("highlightApplicationId");

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!profileRes.ok) {
        setProfileComplete(false);
        setApps([]);
        return;
      }

      const profileData = await profileRes.json();
      const complete =
        !!profileData.name &&
        profileData.cgpa !== null &&
        profileData.cgpa !== undefined &&
        profileData.graduationYear !== null &&
        profileData.graduationYear !== undefined;

      setProfileComplete(complete);
      if (!complete) {
        setApps([]);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/applications/student`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch applications");

      const data = await res.json();
      const filtered = data.filter((app: Application) => app.internshipId);
      setApps(filtered);
      if (highlightApplicationId) {
        setExpandedDetails((prev) => ({ ...prev, [highlightApplicationId]: true }));
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    
    // Set up auto-refresh every 5 seconds to get real-time shortlist updates
    const interval = setInterval(fetchApplications, 5000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Applications</h2>
          <Button 
            onClick={() => fetchApplications()} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Loading state */}
        {loading && <p className="text-gray-500">Loading...</p>}

        {/* No user */}
        {!user && (
          <p className="text-red-500">User not found. Please login again.</p>
        )}

        {/* No profile or applications */}
        {!loading && user && !profileComplete && (
          <p className="text-gray-500">Complete your profile to view applications.</p>
        )}
        {!loading && user && profileComplete && apps.length === 0 && (
          <p className="text-gray-500">No applications found</p>
        )}

        {/* Applications list */}
        <div className="space-y-3">
          {apps.map((app) => {
            const internship = app.internshipId;
            const isShortlisted = app.status === "Shortlisted";
            const isSelected = app.status === "Selected";
            const isApplied = app.status === "Applied";
            return (
              <div
                key={app._id}
                className={`border p-4 rounded-lg bg-white shadow-sm ${
                  highlightApplicationId === app._id ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {app.role || internship?.role || 'Unknown role'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {app.company || internship?.company || 'Unknown company'}
                    </p>
                    {internship?.location && (
                      <p className="text-sm text-muted-foreground">{internship.location}</p>
                    )}
                  </div>
                  <span
                    className={`inline-block mt-3 md:mt-0 px-3 py-1 rounded-full text-sm ${
                      isSelected
                        ? "bg-green-600 text-white font-semibold"
                        : isShortlisted
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isShortlisted
                      ? "Shortlisted - Check Details"
                      : isSelected
                      ? "Selected"
                      : isApplied
                      ? "Applied"
                      : app.status}
                  </span>
                </div>

                {isShortlisted && (
                  <button
                    className="mt-2 text-sm text-blue-700 underline"
                    onClick={() =>
                      setExpandedDetails((prev) => ({
                        ...prev,
                        [app._id]: !prev[app._id],
                      }))
                    }
                  >
                    {expandedDetails[app._id] ? "Hide Details" : "Check Details"}
                  </button>
                )}

                {(isSelected || expandedDetails[app._id]) && app.note && (
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Note:</span> {app.note}
                  </p>
                )}

                {isShortlisted && (
                  <p className="mt-2 text-sm text-blue-700">
                    You have been shortlisted by {app.company || internship?.company || "the company"}. Check details.
                  </p>
                )}
                {isSelected && (
                  <p className="mt-2 text-sm text-green-700 font-medium">
                    You have been selected by {app.company || internship?.company || "the company"} 🎉
                  </p>
                )}

                {internship?.domain && (
                  <p className="mt-3 text-sm text-gray-600">Domain: {internship.domain}</p>
                )}
                {internship?.stipend && (
                  <p className="text-sm text-gray-600">Stipend: {internship.stipend}</p>
                )}
                {app.appliedAt && (
                  <p className="mt-2 text-xs text-gray-500">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                )}
                {internship?.applyLink && (
                  <a
                    href={internship.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                  >
                    View internship details
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}