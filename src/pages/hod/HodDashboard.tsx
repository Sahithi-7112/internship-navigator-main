import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface NocRequest {
  _id: string;
  studentId: {
    name: string;
    rollNo: string;
    department: string;
  };
  company: string;
  offerLetter: string;
  nocDocument: string;
  status: string;
  hodRemarks: string;
  createdAt: string;
}

interface ShortlistedStudent {
  studentName: string;
  rollNo: string;
  department: string;
  company: string;
  role: string;
  status: string;
}

export default function HodDashboard() {
  const { user } = useAuth();
  const [nocRequests, setNocRequests] = useState<NocRequest[]>([]);
  const [shortlistedStudents, setShortlistedStudents] = useState<ShortlistedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<NocRequest | null>(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (user && user.role === 'hod') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Check if user has hod role
  if (user && user.role !== 'hod') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the HOD dashboard.
            </p>
            <p className="text-sm text-muted-foreground">
              Please login with HOD credentials.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch NOC requests
      const nocRes = await fetch(`${API_BASE_URL}/api/hod/noc-requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const nocData = await nocRes.json();
      setNocRequests(nocData);

      // Fetch shortlisted students
      const studentsRes = await fetch(`${API_BASE_URL}/api/hod/shortlisted-students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const studentsData = await studentsRes.json();
      setShortlistedStudents(studentsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleNocAction = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hod/noc-request/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, hodRemarks: remarks }),
      });

      if (response.ok) {
        alert(`NOC request ${status} successfully`);
        setRemarks("");
        setSelectedRequest(null);
        fetchData(); // Refresh data
      } else {
        alert('Failed to update NOC request');
      }
    } catch (error) {
      console.error('Error updating NOC request:', error);
      alert('Error updating NOC request');
    }
  };

  const viewDocument = (base64Data: string) => {
    try {
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

      // Create a URL for the blob and open it
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error opening document');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HOD Dashboard</h1>
          <p className="text-muted-foreground">Manage NOC requests and view shortlisted students</p>
        </div>

        <Tabs defaultValue="noc" className="space-y-4">
          <TabsList>
            <TabsTrigger value="noc">NOC Requests</TabsTrigger>
            <TabsTrigger value="students">Shortlisted Students</TabsTrigger>
          </TabsList>

          <TabsContent value="noc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>NOC Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {nocRequests.length === 0 ? (
                  <p className="text-muted-foreground">No NOC requests found</p>
                ) : (
                  <div className="space-y-4">
                    {nocRequests.map((request) => (
                      <Card key={request._id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="font-medium">{request.studentId.name}</p>
                            <p className="text-sm text-muted-foreground">{request.studentId.rollNo}</p>
                            <p className="text-sm text-muted-foreground">{request.studentId.department}</p>
                          </div>
                          <div>
                            <p className="font-medium">{request.company}</p>
                          </div>
                          <div>
                            <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewDocument(request.offerLetter)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Offer Letter
                            </Button>
                            {request.nocDocument && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewDocument(request.nocDocument)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                NOC Doc
                              </Button>
                            )}
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleNocAction(request._id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {request.hodRemarks && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="text-sm"><strong>Remarks:</strong> {request.hodRemarks}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedRequest && (
              <Card>
                <CardHeader>
                  <CardTitle>Reject NOC Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="remarks">Remarks (optional)</Label>
                    <Textarea
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter rejection remarks..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleNocAction(selectedRequest._id, 'rejected')}>
                      Confirm Reject
                    </Button>
                    <Button variant="outline" onClick={() => { setSelectedRequest(null); setRemarks(""); }}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shortlisted Students</CardTitle>
              </CardHeader>
              <CardContent>
                {shortlistedStudents.length === 0 ? (
                  <p className="text-muted-foreground">No shortlisted students found</p>
                ) : (
                  <div className="space-y-4">
                    {shortlistedStudents.map((student, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="font-medium">{student.studentName}</p>
                            <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                            <p className="text-sm text-muted-foreground">{student.department}</p>
                          </div>
                          <div>
                            <p className="font-medium">{student.company}</p>
                          </div>
                          <div>
                            <p className="font-medium">{student.role}</p>
                          </div>
                          <div>
                            <Badge variant={student.status === 'Selected' ? 'default' : 'secondary'}>
                              {student.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}