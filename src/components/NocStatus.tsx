import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import API_BASE_URL from "@/lib/api";

interface NocRequest {
  _id: string;
  company: string;
  status: "pending" | "approved" | "rejected";
  hodRemarks: string;
  createdAt: string;
}

export default function NocStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nocRequests, setNocRequests] = useState<NocRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNocRequests();
  }, []);

  const fetchNocRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user || user.role !== "student") return;

      const response = await fetch(`${API_BASE_URL}/api/noc-request`, {
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

  if (user?.role !== "student") {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My NOC Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My NOC Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {nocRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No NOC requests submitted yet</p>
        ) : (
          <div className="space-y-4">
            {nocRequests.map((request) => (
              <div key={request._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{request.company}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested on: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                {request.hodRemarks && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Remarks:</p>
                    <p className="text-sm text-muted-foreground">{request.hodRemarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}