import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import API_BASE_URL from "@/lib/api";

interface ShortlistStudent {
  name: string;
  email: string;
  status: "Shortlisted" | "Selected";
  note: string;
}

export default function EmployerDashboard() {
  const { logout } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [students, setStudents] = useState<ShortlistStudent[]>([
    { name: "", email: "", status: "Shortlisted", note: "" },
  ]);
  const [isSubmittingShortlist, setIsSubmittingShortlist] = useState(false);

  const handleAddStudentRow = () => {
    setStudents((prev) => [...prev, { name: "", email: "", status: "Shortlisted", note: "" }]);
  };

  const handleStudentChange = (index: number, field: keyof ShortlistStudent, value: string) => {
    setStudents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmitShortlist = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please login as an employer.");
      return;
    }

    const filteredStudents = students.filter((s) => s.email.trim() !== "");
    if (!companyName.trim() || filteredStudents.length === 0) {
      alert("Please provide company name and at least one student with email.");
      return;
    }

    setIsSubmittingShortlist(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/shortlist-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: companyName.trim(),
          students: filteredStudents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          alert("Your session has expired. Please login again.");
          logout();
          window.location.href = "/login";
          return;
        }
        alert(data.error || "Failed to submit shortlist.");
        return;
      }

      // Show detailed results
      console.log("Shortlist response:", data);
      console.log("Results details:", JSON.stringify(data.results, null, 2));
      
      const successCount = data.results?.filter((r: any) => r.matchedApplications > 0).length || 0;
      const alreadyUpdatedCount = data.results?.filter((r: any) => r.alreadyUpdated).length || 0;
      const failureCount = data.results?.filter((r: any) => r.error || (r.matchedApplications === 0 && !r.alreadyUpdated)).length || 0;
      
      let resultMessage = "Shortlist submitted successfully.";
      if (successCount > 0) {
        resultMessage += `\n✅ ${successCount} student(s) shortlisted successfully.`;
      }
      if (alreadyUpdatedCount > 0) {
        resultMessage += `\nℹ️ ${alreadyUpdatedCount} student(s) were already shortlisted.`;
      }
      if (failureCount > 0) {
        resultMessage += `\n⚠️ ${failureCount} student(s) could not be found or updated.`;
      }
      
      alert(resultMessage);
      setCompanyName("");
      setStudents([{ name: "", email: "", status: "Shortlisted", note: "" }]);
    } catch (err) {
      console.error("Error submitting shortlist:", err);
      alert("Error submitting shortlist. Please check console for details.");
    } finally {
      setIsSubmittingShortlist(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 card-shadow">
          <h2 className="font-display text-lg font-semibold mb-4">Shortlist Candidates</h2>
          <form onSubmit={handleSubmitShortlist} className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g. Microsoft"
                className="mt-1"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Students</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddStudentRow}>
                  + Add Another Student
                </Button>
              </div>

              {students.map((student, index) => (
                <div key={index} className="rounded-md border p-3 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Student Name</Label>
                    <Input
                      placeholder="e.g. Rahul"
                      className="mt-1"
                      value={student.name}
                      onChange={(e) => handleStudentChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Student Email</Label>
                    <Input
                      type="email"
                      placeholder="e.g. rahul@gmail.com"
                      className="mt-1"
                      value={student.email}
                      onChange={(e) => handleStudentChange(index, "email", e.target.value)}
                      required={index === 0}
                    />
                  </div>
                </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={student.status}
                        onValueChange={(value: "Shortlisted" | "Selected") =>
                          handleStudentChange(index, "status", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="Selected">Selected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Note / Message</Label>
                      <Textarea
                        placeholder="e.g. Interview on 10 Oct at 10AM"
                        className="mt-1"
                        value={student.note}
                        onChange={(e) => handleStudentChange(index, "note", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isSubmittingShortlist}
              >
                {isSubmittingShortlist ? "Submitting..." : "Submit Shortlist"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
