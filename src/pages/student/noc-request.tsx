import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileCheck } from "lucide-react";
import API_BASE_URL from "@/lib/api";

export default function NocRequestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    offerLetter: null as File | null,
    nocDocument: null as File | null,
  });

  const handleFileChange = (field: "offerLetter" | "nocDocument") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "File type not supported. Please upload PDF, DOC, DOCX, or image files.",
          variant: "destructive",
        });
        return;
      }
    }
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company || !formData.offerLetter) {
      toast({
        title: "Error",
        description: "Company name and offer letter are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      // Convert files to base64
      const offerLetterBase64 = await fileToBase64(formData.offerLetter);
      const nocDocumentBase64 = formData.nocDocument ? await fileToBase64(formData.nocDocument) : "";

      const response = await fetch(`${API_BASE_URL}/api/noc-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: formData.company,
          offerLetter: offerLetterBase64,
          nocDocument: nocDocumentBase64,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit NOC request");
      }

      toast({
        title: "Success",
        description: "NOC request submitted successfully",
      });

      // Reset form
      setFormData({
        company: "",
        offerLetter: null,
        nocDocument: null,
      });

      // Reset file inputs
      const offerLetterInput = document.getElementById("offerLetter") as HTMLInputElement;
      const nocDocumentInput = document.getElementById("nocDocument") as HTMLInputElement;
      if (offerLetterInput) offerLetterInput.value = "";
      if (nocDocumentInput) nocDocumentInput.value = "";

    } catch (error) {
      console.error("NOC request error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit NOC request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  if (user?.role !== "student") {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Access denied. This page is for students only.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FileCheck className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold">Request NOC</h1>
          </div>
          <p className="text-muted-foreground">
            Submit your No Objection Certificate request for internship placement
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>NOC Request Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter the company name offering you the internship"
                  required
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the exact company name as mentioned in your offer letter
                </p>
              </div>

              <div>
                <Label htmlFor="offerLetter">Offer Letter *</Label>
                <Input
                  id="offerLetter"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange("offerLetter")}
                  required
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your internship offer letter (PDF, DOC, DOCX, or image files only, max 10MB)
                </p>
              </div>

              <div>
                <Label htmlFor="nocDocument">NOC Document (Optional)</Label>
                <Input
                  id="nocDocument"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange("nocDocument")}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  If you have an existing NOC document, upload it here
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Important Notes:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Make sure all information is accurate and matches your offer letter</li>
                  <li>• Your request will be reviewed by the placement cell</li>
                  <li>• You will receive a notification once your request is processed</li>
                  <li>• Processing may take 2-3 working days</li>
                </ul>
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Submitting..." : "Submit NOC Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}