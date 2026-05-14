import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

export default function BrowseInternships() {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [appliedStatus, setAppliedStatus] = useState<Record<string, string>>({});
  const [profileComplete, setProfileComplete] = useState(false);
  const [countdown, setCountdown] = useState<Record<string, string>>({});

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const highlightInternshipId = new URLSearchParams(location.search).get("highlightInternshipId");
  const [highlightNotified, setHighlightNotified] = useState(false);

  const getCountdown = (deadline: string | null | undefined): string => {
    if (!deadline) return "";
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Deadline Passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  useEffect(() => {
    fetchInternships();
    fetchUserApplications();
    fetchProfileStatus();
  }, [user]);

  useEffect(() => {
    if (!highlightInternshipId || !internships.length || highlightNotified) return;
    const exists = internships.some((i) => i._id === highlightInternshipId);
    if (exists) {
      toast({
        title: "Recommended internship",
        description: "You can apply for this highlighted internship below.",
      });
      setHighlightNotified(true);
    }
  }, [highlightInternshipId, internships, highlightNotified, toast]);

  // Update countdown timers every second for real-time updates
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdown: Record<string, string> = {};
      internships.forEach((internship) => {
        newCountdown[internship._id] = getCountdown(internship.lastDateToApply);
      });
      setCountdown(newCountdown);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000); // Update every second
    return () => clearInterval(interval);
  }, [internships]);

  const fetchInternships = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/internships`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setInternships(data);
  };

  const fetchUserApplications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/student`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      const statusMap: Record<string, string> = {};
      data.forEach((app: any) => {
        if (app.internshipId?._id) {
          statusMap[app.internshipId._id] = app.status;
        }
      });
      setAppliedStatus(statusMap);
    } catch (err) {
      console.error('Error fetching user applications:', err);
    }
  };

  const fetchProfileStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user || user.role !== "student") {
      setProfileComplete(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setProfileComplete(false);
        return;
      }
      const data = await res.json();
      setProfileComplete(
        !!data.name &&
        data.cgpa !== null &&
        data.cgpa !== undefined &&
        data.graduationYear !== null &&
        data.graduationYear !== undefined
      );
    } catch {
      setProfileComplete(false);
    }
  };

  const applyInternship = async (internship: Internship) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to apply",
        variant: "destructive",
      });
      return;
    }
    if (!profileComplete) {
      toast({
        title: "Profile required",
        description: "Please complete your profile",
        variant: "destructive",
      });
      return;
    }

    let shouldOpenLink = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ internshipId: internship._id }),
      });

      if (!res.ok) {
        const error = await res.json();
        const message = error.error || "Failed to apply";
        if (message.toLowerCase().includes("already applied")) {
          toast({
            title: "Already applied",
            description: "Opening the internship link for you.",
          });
          shouldOpenLink = true;
        } else {
          throw new Error(message);
        }
      } else {
        toast({
          title: "Success",
          description: "Applied successfully!",
        });
        fetchUserApplications();
        shouldOpenLink = true;
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      if (shouldOpenLink) {
      window.open(internship.applyLink, "_blank");
      }
    }
  };

  const normalize = (str: string) => str.toLowerCase().replace(/\s|,/g, "");

  const resetFilters = () => {
    setSelectedCompanies([]);
    setSelectedLocations([]);
    setCompanySearch("");
    setLocationSearch("");
  };

  const toggleSelection = (current: string[], setter: (values: string[]) => void, value: string) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  // FILTER LOGIC
  const filteredInternships = internships.filter((internship) => {
    const company = normalize(internship.company);
    const location = normalize(internship.location);
    const matchCompany =
      selectedCompanies.length === 0 ||
      selectedCompanies.map(normalize).includes(company);

    const matchLocation =
      selectedLocations.length === 0 ||
      selectedLocations.map(normalize).includes(location);

    return matchCompany && matchLocation;
  });
  const companyOptions = [...new Set(internships.map((i) => i.company))];
  const locationOptions = [...new Set(internships.map((i) => i.location))];
  const visibleCompanyOptions = companyOptions.filter((item) =>
    item.toLowerCase().includes(companySearch.toLowerCase())
  );
  const visibleLocationOptions = locationOptions.filter((item) =>
    item.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center border-b pb-3">
        <h1 className="text-xl font-bold">Internships</h1>

        <Button variant="outline" onClick={resetFilters}>
          Clear Filters
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-3">
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
                  onChange={() =>
                    toggleSelection(selectedCompanies, setSelectedCompanies, company)
                  }
                />
                <span>{company}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <Input
            placeholder="Search location"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="mb-3"
          />
          <div className="max-h-40 overflow-y-auto space-y-2">
            {visibleLocationOptions.map((location) => (
              <label key={location} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(location)}
                  onChange={() =>
                    toggleSelection(selectedLocations, setSelectedLocations, location)
                  }
                />
                <span>{location}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {!profileComplete && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          Please complete your profile
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredInternships.map((internship) => {
          const status = appliedStatus[internship._id];
          return (
            <Card key={internship._id} className="relative overflow-visible">
              {highlightInternshipId === internship._id && (
                <div className="absolute left-4 top-4 z-10 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                  New internship
                </div>
              )}
              {status && (
                <div
                  className={`absolute right-4 top-4 z-10 rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${
                    status === 'Selected'
                      ? 'bg-green-600 text-white'
                      : status === 'Shortlisted'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {status}
                </div>
              )}
              <CardHeader>
                <CardTitle>{internship.role}</CardTitle>
                <CardDescription>
                  {internship.company} • {internship.location}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-3 space-y-2">
                  <p className="text-sm text-muted-foreground">Domain: {internship.domain}</p>
                  <p className="text-sm text-muted-foreground">Stipend: {internship.stipend}</p>
                  <p className="text-sm text-muted-foreground">Minimum CGPA: {internship.minCGPA}</p>
                  <p className="text-sm text-muted-foreground">Graduation Year: {internship.graduationYear}</p>

                  {internship.lastDateToApply && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-gray-700">
                        Last Date: {new Date(internship.lastDateToApply).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </p>
                      <p className={`text-xs font-semibold mt-1 ${getCountdown(internship.lastDateToApply) === 'Deadline Passed' ? 'text-red-600' : 'text-orange-600'}`}>
                        ⏰ {countdown[internship._id] || getCountdown(internship.lastDateToApply)}
                      </p>
                    </div>
                  )}

                  {internship.deadlineNote && (
                    <p className="text-xs text-blue-600 italic mt-2">📌 {internship.deadlineNote}</p>
                  )}

                  {status && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                      <p className="font-semibold">Application Status</p>
                      <p className="mt-1 text-sm">
                        You have already applied for this role. Current status: <span className="font-semibold">{status}</span>.
                      </p>
                    </div>
                  )}
                </div>

                {profileComplete && (
                  <Button 
                    onClick={() => applyInternship(internship)}
                    disabled={getCountdown(internship.lastDateToApply) === 'Deadline Passed'}
                  >
                    {getCountdown(internship.lastDateToApply) === 'Deadline Passed' ? 'Deadline Passed' : (status ? 'Open Job Link' : 'Apply Now')}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}