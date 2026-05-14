import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import API_BASE_URL from "@/lib/api";

interface Role {
  role: string;
  score: number;
  missing_skills: string[];
}

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleUploadResume = async () => {
    if (!resumeFile) {
      setError("Please choose a resume PDF first.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const res = await fetch(`${API_BASE_URL}/api/recommendations/student/upload-resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load recommendations");
      } else {
        setRoles(data.roles || []);
        setInternships(data.internships || []);
      }
    } catch {
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">AI Recommendations</h2>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex gap-3 items-center">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUploadResume} disabled={loading || !resumeFile}>
              Use Uploaded Resume
            </Button>
          </div>
        </div>
        {!loading && !error && roles.length === 0 && internships.length === 0 && (
          <p className="text-sm text-gray-500">Upload resume to get recommendations.</p>
        )}
        {loading && <p className="text-sm text-gray-500">Loading recommendations...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold mb-4">Recommended Roles</h3>
              {roles.length === 0 ? (
                <p className="text-sm text-gray-500">No role recommendations yet.</p>
              ) : (
                <div className="space-y-4">
                  {roles.map((item) => (
                    <div key={item.role} className="border-l-4 border-blue-400 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{item.role}</p>
                          <p className="text-sm text-gray-500">Match Score: {(item.score * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      {/* Missing Skills Section */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills Gap:</p>
                        {item.missing_skills && item.missing_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.missing_skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-green-600 font-medium">✓ You match all required skills</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold mb-3">Matching Internships</h3>
              {internships.length === 0 ? (
                <p className="text-sm text-gray-500">No matching internships found.</p>
              ) : (
                <div className="space-y-3">
                  {internships.map((internship) => (
                    <button
                      key={internship._id}
                      className="w-full text-left rounded-md border p-3 hover:bg-gray-50"
                      onClick={() =>
                        navigate(`/student/internships?highlightInternshipId=${internship._id}`)
                      }
                    >
                      <p className="font-medium">{internship.role}</p>
                      <p className="text-sm text-gray-600">
                        {internship.company} - {internship.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        Min CGPA: {internship.minCGPA}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}