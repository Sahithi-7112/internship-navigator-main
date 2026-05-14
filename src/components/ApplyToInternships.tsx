import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import API_BASE_URL from "@/lib/api";

interface Internship {
  _id: string;
  title: string;
  company: string;
  role?: string;
}

interface ApplyToInternshipsProps {
  internships: Internship[];
}

export default function ApplyToInternships({
  internships,
}: ApplyToInternshipsProps) {
  const { user } = useAuth();
  const [applied, setApplied] = useState<Set<string>>(new Set());

  // ✅ APPLY FUNCTION (Backend connected)
  const applyInternship = async (internship: Internship) => {
    if (!user) {
      toast({
        title: "Please login first",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user.id, // safe fallback
          studentEmail: user.email,
          internshipId: internship._id,
          company: internship.company,
          role: internship.role || internship.title,
          status: "Applied",
        }),
      });

      if (!res.ok) throw new Error("Apply failed");

      // mark as applied locally
      setApplied((prev) => new Set(prev).add(internship._id));

      toast({
        title: "Application submitted successfully!",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Application failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {internships.map((internship) => (
        <div
          key={internship._id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          {/* Internship Info */}
          <div>
            <h3 className="font-medium">{internship.title}</h3>
            <p className="text-sm text-muted-foreground">
              {internship.company}
            </p>
          </div>

          {/* Apply Button */}
          <Button
            onClick={() => applyInternship(internship)}
            disabled={applied.has(internship._id)}
          >
            {applied.has(internship._id) ? "Applied" : "Apply"}
          </Button>
        </div>
      ))}
    </div>
  );
}