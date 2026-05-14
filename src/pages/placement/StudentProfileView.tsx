import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface StudentProfile {
  name: string;
  email: string;
  rollNo: string;
  department: string;
  skills: string;
  projects: string;
  cgpa: number;
  graduationYear: number;
  resumeName: string;
  resumeFile: string;
}

export default function StudentProfileView() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "placement") {
      navigate("/placement");
      return;
    }

    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          return;
        }

        console.log("Fetching student profile for ID:", id);
        const response = await fetch(`${API_BASE_URL}/api/applications/student-profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.log("Error response:", errorData);
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Student data:", data);
        setProfile(data);
      } catch (err) {
        setError("Failed to load student profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentProfile();
    }
  }, [id, user, navigate]);

  const openResume = () => {
    if (!profile?.resumeFile) return;

    const byteCharacters = atob(profile.resumeFile.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (user?.role !== "placement") {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div>Loading student profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-muted-foreground mb-4">{error || "Student not found"}</p>
            <Button onClick={() => navigate("/placement/shortlisted")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shortlisted & Selected
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/placement/shortlisted")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shortlisted & Selected
          </Button>
          <h1 className="text-2xl font-bold">Student Profile</h1>
        </div>

        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="space-y-3">
                <p><b>Name:</b> {profile.name || "-"}</p>
                <p><b>Email:</b> {profile.email || "-"}</p>
                <p><b>Roll Number:</b> {profile.rollNo || "-"}</p>
                <p><b>Department:</b> {profile.department || "-"}</p>
                <p><b>CGPA:</b> {profile.cgpa || "-"}</p>
                <p><b>Graduation Year:</b> {profile.graduationYear || "-"}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Academic Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-1">Skills:</p>
                  <p className="text-sm text-gray-600">{profile.skills || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Projects:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.projects || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Resume:</p>
                  {profile.resumeFile ? (
                    <button
                      onClick={openResume}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      📄 View Resume
                    </button>
                  ) : (
                    <span className="text-gray-500">Not uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}