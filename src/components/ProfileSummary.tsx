import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import API_BASE_URL from "@/lib/api";

interface StudentProfile {
  name?: string;
  email?: string;
  cgpa?: number | null;
  graduationYear?: number | null;
  skills?: string;
  projects?: string;
}

export default function ProfileSummary() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user || user.role !== "student") return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setProfile(null);
          return;
        }
        const data = await res.json();
        const hasProfile =
          !!data.name &&
          data.cgpa !== null &&
          data.cgpa !== undefined &&
          data.graduationYear !== null &&
          data.graduationYear !== undefined;
        setProfile(hasProfile ? data : null);
      } catch {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h3 className="font-semibold mb-3">Profile Summary</h3>

      {profile ? (
        <div className="text-sm space-y-2">
          <p>
            <span className="font-medium">Name:</span>{" "}
            {profile.name || "-"}
          </p>

          <p>
            <span className="font-medium">Email:</span>{" "}
            {profile.email || user?.email || "-"}
          </p>

          <p>
            <span className="font-medium">CGPA:</span>{" "}
            {profile.cgpa ?? "-"}
          </p>

          <p>
            <span className="font-medium">Graduation Year:</span>{" "}
            {profile.graduationYear ?? "-"}
          </p>

          <p>
            <span className="font-medium">Skills:</span>{" "}
            {profile.skills || "-"}
          </p>

          <p>
            <span className="font-medium">Projects:</span>{" "}
            {profile.projects || "-"}
          </p>

          <p>
            <span className="font-medium">Resume:</span>{" "}
            {profile.resumeName ? "Uploaded ✅" : "Not uploaded"}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Please complete your profile
        </p>
      )}
    </div>
  );
}