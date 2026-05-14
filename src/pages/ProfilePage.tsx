import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import API_BASE_URL from "@/lib/api";

type Profile = {
  name: string;
  rollNo: string;
  department: string;
  skills: string;
  projects: string;
  cgpa: string;
  graduationYear: string;
  resumeName: string;
  resumeFile: string; // base64
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    name: "",
    rollNo: "",
    department: "",
    skills: "",
    projects: "",
    cgpa: "",
    graduationYear: "",
    resumeName: "",
    resumeFile: "",
  });

  // Load saved profile
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
          setIsEditing(true);
          return;
        }
        const data = await res.json();
        setProfile({
          name: data.name || "",
          rollNo: data.rollNo || "",
          department: data.department || "",
          skills: data.skills || "",
          projects: data.projects || "",
          cgpa: data.cgpa !== null && data.cgpa !== undefined ? String(data.cgpa) : "",
          graduationYear: data.graduationYear !== null && data.graduationYear !== undefined ? String(data.graduationYear) : "",
          resumeName: data.resumeName || "",
          resumeFile: data.resumeFile || "",
        });
        setIsEditing(!(data.name && data.rollNo && data.department && data.cgpa !== null && data.cgpa !== undefined && data.graduationYear !== null && data.graduationYear !== undefined));
      } catch (err) {
        setIsEditing(true);
      }
    };
    fetchProfile();
  }, [user]);

  // Handle text input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Resume upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF allowed ❌");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        resumeName: file.name,
        resumeFile: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  // Save profile
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profile,
          cgpa: profile.cgpa,
          graduationYear: profile.graduationYear,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save profile");
        return;
      }
      setProfile({
        name: data.name || "",
        rollNo: data.rollNo || "",
        department: data.department || "",
        skills: data.skills || "",
        projects: data.projects || "",
        cgpa: data.cgpa !== null && data.cgpa !== undefined ? String(data.cgpa) : "",
        graduationYear: data.graduationYear !== null && data.graduationYear !== undefined ? String(data.graduationYear) : "",
        resumeName: data.resumeName || "",
        resumeFile: data.resumeFile || "",
      });
      setIsEditing(false);
      alert("Profile saved successfully");
    } catch (err) {
      alert("Failed to save profile");
    }
  };

  // Open resume
  const openResume = () => {
    if (!profile.resumeFile) return;

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

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Profile 👤</h1>
            <p className="text-muted-foreground">
              Manage your student profile
            </p>
          </div>

          {/* EDIT BUTTON */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="border px-4 py-2 rounded hover:bg-gray-100"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* ================= VIEW MODE ================= */}
        {!isEditing && (
          <div className="bg-white shadow rounded-xl p-6 space-y-3">

            <p><b>Name:</b> {profile.name || "-"}</p>
            <p><b>Roll Number:</b> {profile.rollNo || "-"}</p>
            <p><b>Department:</b> {profile.department || "-"}</p>
            <p><b>Skills:</b> {profile.skills || "-"}</p>
            <p><b>Projects:</b> {profile.projects || "-"}</p>
            <p><b>CGPA:</b> {profile.cgpa || "-"}</p>
            <p><b>Graduation Year:</b> {profile.graduationYear || "-"}</p>

            <p>
              <b>Resume:</b>{" "}
              {profile.resumeFile ? (
                <button
                  onClick={openResume}
                  className="text-blue-600 underline"
                >
                  View Resume 📄
                </button>
              ) : (
                "Not uploaded"
              )}
            </p>

          </div>
        )}

        {/* ================= EDIT MODE ================= */}
        {isEditing && (
          <div className="bg-white shadow rounded-xl p-6 space-y-4">

            {/* NAME */}
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full border p-2 rounded"
              required
            />

            {/* ROLL NUMBER */}
            <input
              name="rollNo"
              value={profile.rollNo}
              onChange={handleChange}
              placeholder="Roll Number"
              className="w-full border p-2 rounded"
              required
            />

            {/* DEPARTMENT */}
            <input
              name="department"
              value={profile.department}
              onChange={handleChange}
              placeholder="Department"
              className="w-full border p-2 rounded"
              required
            />

            {/* SKILLS */}
            <input
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              placeholder="Skills"
              className="w-full border p-2 rounded"
            />

            {/* PROJECTS */}
            <textarea
              name="projects"
              value={profile.projects}
              onChange={handleChange}
              placeholder="Projects"
              className="w-full border p-2 rounded"
            />

            {/* CGPA */}
            <input
              name="cgpa"
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={profile.cgpa}
              onChange={handleChange}
              placeholder="CGPA (out of 10)"
              className="w-full border p-2 rounded"
              required
            />

            {/* GRADUATION YEAR */}
            <input
              name="graduationYear"
              type="number"
              min="2020"
              max="2030"
              value={profile.graduationYear}
              onChange={handleChange}
              placeholder="Graduation Year (e.g., 2027)"
              className="w-full border p-2 rounded"
              required
            />

            {/* RESUME UPLOAD */}
            <div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />

              {profile.resumeName && (
                <p className="text-green-600 text-sm mt-1">
                  Selected: {profile.resumeName}
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save Profile
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}