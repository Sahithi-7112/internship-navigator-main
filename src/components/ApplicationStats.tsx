import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import API_BASE_URL from "@/lib/api";

export default function ApplicationStatus() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!profileRes.ok) {
          setProfileComplete(false);
          setApplications([]);
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
          setApplications([]);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/applications/student`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setApplications([]);
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          setApplications([]);
          return;
        }
        setApplications(data);
      } catch {
        setApplications([]);
      }
    };

    load();
  }, [user]);

  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-3">Application Status</h2>

      {!profileComplete ? (
        <p className="text-gray-500">Complete your profile to see applications.</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500">No applications yet</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div
              key={app._id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{app.company}</p>
                <p className="text-sm text-gray-500">{app.role}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  app.status === "Selected"
                    ? "bg-green-100 text-green-700"
                    : app.status === "Shortlisted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}