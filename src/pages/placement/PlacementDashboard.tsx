import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import API_BASE_URL from "@/lib/api";

interface Internship {
  _id: string;
  role: string;
  company: string;
  location: string;
  stipend: string;
  domain: string;
  applyLink: string;
  minCGPA: number;
  graduationYear: number;
  lastDateToApply?: string | null;
  deadlineNote?: string;
}

interface Application {
  _id: string;
  studentId: { email: string };
  internshipId: Internship;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
}

export default function PlacementDashboard() {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    location: '',
    stipend: '',
    domain: '',
    applyLink: '',
    minCGPA: '',
    graduationYear: '',
    lastDateToApply: '',
    deadlineNote: ''
  });

  console.log('PlacementDashboard render, user:', user);
  console.log('PlacementDashboard render, loading:', loading);
  console.log('PlacementDashboard render, internships count:', internships.length);
  console.log('PlacementDashboard render, applications count:', applications.length);

  // Check if user has placement role
  if (user && user.role !== 'placement') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the placement dashboard.
            </p>
            <p className="text-sm text-muted-foreground">
              Please login with placement cell credentials.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    console.log('PlacementDashboard useEffect triggered');
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('fetchData called, token exists:', !!localStorage.getItem('token'));
    try {
      // Fetch internships (no auth required)
      console.log('Fetching internships...');
      const internshipsRes = await fetch(`${API_BASE_URL}/api/internships`);
      const internshipsData = await internshipsRes.json();
      console.log('Internships response status:', internshipsRes.status);
      console.log('Internships data:', internshipsData);
      setInternships(internshipsData);

      // Fetch applications (requires auth)
      const token = localStorage.getItem('token');
      console.log('Fetching applications, token present:', !!token);
      if (token) {
        try {
          const applicationsRes = await fetch(`${API_BASE_URL}/api/applications/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          console.log('Applications response status:', applicationsRes.status);
          const applicationsData = await applicationsRes.json();
          console.log('Applications data:', applicationsData);
          setApplications(applicationsData);
        } catch (appErr) {
          console.error('Error fetching applications:', appErr);
          setApplications([]);
        }
      } else {
        console.log('No token found, skipping applications fetch');
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
      setInternships([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    console.log('handleAddInternship called, token exists:', !!token);
    if (!token) {
      alert('No authentication token found. Please login again.');
      return;
    }
    console.log('Sending POST request with data:', formData);
    try {
      const res = await fetch(`${API_BASE_URL}/api/internships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      console.log('Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Success, saved internship:', data);
        setFormData({ role: '', company: '', location: '', stipend: '', domain: '', applyLink: '', minCGPA: '', graduationYear: '', lastDateToApply: '', deadlineNote: '' });
        fetchData(); // refresh
        alert('Internship added successfully!');
      } else {
        const errorData = await res.json();
        console.log('Error response:', errorData);
        alert(`Failed to add internship: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding internship:', err);
      alert('Error adding internship. Check console for details.');
    }
  };

  if (loading) {
    console.log('Showing loading...');
    return <DashboardLayout><div className="p-8 text-center">Loading placement dashboard...</div></DashboardLayout>;
  }

  console.log('Rendering dashboard content');

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Placement Cell Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Total Internships</h3>
            <p className="text-2xl font-bold text-blue-600">{internships.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Total Applications</h3>
            <p className="text-2xl font-bold text-green-600">{applications.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Shortlisted</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'Shortlisted').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Applied</h3>
            <p className="text-2xl font-bold text-orange-600">
              {applications.filter(a => a.status === 'Applied').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Internship</h2>
          <form onSubmit={handleAddInternship} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Frontend Developer Intern"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Bangalore, India"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stipend</label>
                <Input
                  type="text"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="e.g., ₹50,000/month"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Domain</label>
                <Input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="e.g., Web Development"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apply Link</label>
                <Input
                  type="url"
                  value={formData.applyLink}
                  onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                  placeholder="e.g., https://careers.google.com/jobs"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum CGPA</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={formData.minCGPA}
                  onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                  placeholder="e.g., 7.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <Input
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  placeholder="e.g., 2027"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Date to Apply (Optional)</label>
                <Input
                  type="date"
                  value={formData.lastDateToApply}
                  onChange={(e) => setFormData({ ...formData, lastDateToApply: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deadline Note (Optional)</label>
                <Input
                  type="text"
                  value={formData.deadlineNote}
                  onChange={(e) => setFormData({ ...formData, deadlineNote: e.target.value })}
                  placeholder="e.g., Early bird bonus for early applicants"
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">Post Internship</Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">All Internships</h2>

          {internships.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left">Role</th>
                    <th className="border p-2 text-left">Company</th>
                    <th className="border p-2 text-left">Location</th>
                    <th className="border p-2 text-left">Stipend</th>
                    <th className="border p-2 text-left">Domain</th>
                    <th className="border p-2 text-left">Min CGPA</th>
                    <th className="border p-2 text-left">Grad Year</th>
                    <th className="border p-2 text-left">Last Date</th>
                  </tr>
                </thead>
                <tbody>
                  {internships.map((intern) => (
                    <tr key={intern._id} className="hover:bg-gray-50">
                      <td className="border p-2">{intern.role}</td>
                      <td className="border p-2">{intern.company}</td>
                      <td className="border p-2">{intern.location}</td>
                      <td className="border p-2">{intern.stipend}</td>
                      <td className="border p-2">{intern.domain}</td>
                      <td className="border p-2">{intern.minCGPA}</td>
                      <td className="border p-2">{intern.graduationYear ?? "-"}</td>
                      <td className="border p-2">
                        {intern.lastDateToApply
                          ? new Date(intern.lastDateToApply).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No internships added yet. Use the form above to add internships.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
