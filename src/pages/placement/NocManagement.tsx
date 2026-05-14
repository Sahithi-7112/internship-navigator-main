import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, Check, X } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface NocRequest {
  _id: string;
  studentId: {
    name: string;
    rollNo: string;
    department: string;
    email: string;
  };
  company: string;
  offerLetter: string;
  nocDocument: string;
  status: "pending" | "approved" | "rejected";
  hodRemarks: string;
  createdAt: string;
}

export default function NocManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nocRequests, setNocRequests] = useState<NocRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchNocRequests();
  }, []);

  const fetchNocRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/noc-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNocRequests(data);
      }
    } catch (error) {
      console.error("Error fetching NOC requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch NOC requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNocRequest = async (id: string, status: "approved" | "rejected", remarks: string = "") => {
    setUpdating(id);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/noc-request/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          hodRemarks: remarks,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `NOC request ${status} successfully`,
        });
        fetchNocRequests(); // Refresh the list
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update NOC request");
      }
    } catch (error) {
      console.error("Error updating NOC request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update NOC request",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const viewDocument = (base64Data: string, filename: string) => {
    // Extract MIME type and base64 content
    const [mimePart, base64Content] = base64Data.split(',');
    const mimeType = mimePart.split(':')[1].split(';')[0];

    // Create a blob from base64 data
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Open in new tab
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (user?.role !== "placement") {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Access denied. This page is for placement officers only.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">NOC Request Management</h1>
          <p className="text-muted-foreground">Review and manage student NOC requests</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading NOC requests...</p>
          </div>
        ) : nocRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No NOC requests found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {nocRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.studentId.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.studentId.rollNo} • {request.studentId.department}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.studentId.email}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Company: {request.company}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested on: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDocument(request.offerLetter, "offer_letter")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Offer Letter
                      </Button>
                      {request.nocDocument && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocument(request.nocDocument, "noc_document")}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View NOC Document
                        </Button>
                      )}
                    </div>

                    {request.status === "pending" && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add remarks (optional)"
                          id={`remarks-${request._id}`}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              const remarks = (document.getElementById(`remarks-${request._id}`) as HTMLTextAreaElement)?.value || "";
                              updateNocRequest(request._id, "approved", remarks);
                            }}
                            disabled={updating === request._id}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const remarks = (document.getElementById(`remarks-${request._id}`) as HTMLTextAreaElement)?.value || "";
                              updateNocRequest(request._id, "rejected", remarks);
                            }}
                            disabled={updating === request._id}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {request.status !== "pending" && request.hodRemarks && (
                      <div>
                        <p className="font-medium">Remarks:</p>
                        <p className="text-sm text-muted-foreground">{request.hodRemarks}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}