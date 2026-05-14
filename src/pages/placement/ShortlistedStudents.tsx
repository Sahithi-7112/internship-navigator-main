import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "@/lib/api";

interface Internship {
  _id: string;
  role: string;
  company: string;
}

interface Application {
  _id: string;
  studentId: { 
    _id: string;
    email: string; 
    name?: string;
    rollNo?: string;
    department?: string;
  } | null;
  internshipId: Internship | null;
  studentEmail?: string;
  company: string;
  role: string;
  status: string;
  note?: string;
}

export default function ShortlistedStudents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "placement") {
      const fetchShortlisted = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setApplications([]);
            setLoading(false);
            return;
          }

          const res = await fetch(`${API_BASE_URL}/api/applications/all`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            console.error("Failed to fetch applications:", data);
            setApplications([]);
          } else {
            const shortlistedOrSelected = (data as Application[]).filter(
              (app) => app.status === "Shortlisted" || app.status === "Selected"
            );
            setApplications(shortlistedOrSelected);
          }
        } catch (err) {
          console.error("Error fetching shortlisted applications:", err);
          setApplications([]);
        } finally {
          setLoading(false);
        }
      };

      fetchShortlisted();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user && user.role !== "placement") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to view shortlisted and selected students.
            </p>
            <p className="text-sm text-muted-foreground">
              Please login with placement cell credentials.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const shortlisted = applications.filter((app) => app.status === "Shortlisted" || app.status === "Selected");
  const companyOptions = Array.from(
    new Set(shortlisted.map((app) => app.company || app.internshipId?.company).filter(Boolean))
  ) as string[];
  const visibleCompanyOptions = companyOptions.filter((item) =>
    item.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredApplications = shortlisted.filter((app) => {
    if (selectedCompanies.length === 0) return true;
    const companyName = app.company || app.internshipId?.company || "";
    return selectedCompanies.includes(companyName);
  });

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((item) => item !== company)
        : [...prev, company]
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Shortlisted & Selected Students</h1>
        <div className="mb-4 max-w-sm rounded-lg border p-3">
          <Input
            placeholder="Search company"
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            className="mb-3"
          />
          <div className="max-h-40 overflow-y-auto space-y-2">
            {visibleCompanyOptions.map((company) => (
              <label key={company} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company)}
                  onChange={() => toggleCompany(company)}
                />
                <span>{company}</span>
              </label>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading shortlisted and selected students...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No shortlisted or selected students found yet.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium border-b">Student Name</th>
                  <th className="px-4 py-3 font-medium border-b">Roll Number</th>
                  <th className="px-4 py-3 font-medium border-b">Department</th>
                  <th className="px-4 py-3 font-medium border-b">Student Email</th>
                  <th className="px-4 py-3 font-medium border-b">Company</th>
                  <th className="px-4 py-3 font-medium border-b">Role</th>
                  <th className="px-4 py-3 font-medium border-b">Status</th>
                  <th className="px-4 py-3 font-medium border-b">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          console.log('Clicked student:', app.studentId);
                          if (app.studentId?._id) {
                            console.log('Navigating to student ID:', app.studentId._id);
                            navigate(`/placement/student-profile/${app.studentId._id}`);
                          } else {
                            console.log('No student ID found');
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {app.studentId?.name || "Unknown"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {app.studentId?.rollNo || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {app.studentId?.department || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {app.studentId?.email || app.studentEmail || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      {app.company || app.internshipId?.company || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {app.role || app.internshipId?.role || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'Selected' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {app.note ? <span className="whitespace-pre-wrap">{app.note}</span> : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

