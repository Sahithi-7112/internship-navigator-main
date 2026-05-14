import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Eye, Trash2, FileText, Image as ImageIcon, BookOpen } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import API_BASE_URL from "@/lib/api";

interface Resource {
  _id: string;
  title: string;
  description: string;
  company: string;
  role: string;
  uploadedBy: {
    userId: string;
    name: string;
    role: string;
    rollNo?: string;
    department?: string;
  };
  files: string[];
  images: string[];
  createdAt: string;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/resources`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setResources(response.data);
    } catch (error) {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: at least one field must be filled
    if (!title && !description && selectedFiles.length === 0 && selectedImages.length === 0) {
      toast.error("Please fill at least one field");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);
      if (company) formData.append("company", company);
      if (role) formData.append("role", role);

      selectedFiles.forEach(file => formData.append("files", file));
      selectedImages.forEach(image => formData.append("images", image));

      await axios.post(`${API_BASE_URL}/api/resources`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Resource added successfully!");
      setDialogOpen(false);
      resetForm();
      fetchResources();
    } catch (error) {
      toast.error("Failed to add resource");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCompany("");
    setRole("");
    setSelectedFiles([]);
    setSelectedImages([]);
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/resources/${resourceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Resource deleted successfully!");
      fetchResources();
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const canDelete = (resource: Resource) => {
    return user?.id === resource.uploadedBy.userId || user?.role === "placement";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Resources & Experiences</h1>
            <p className="text-muted-foreground">
              Share and discover internship experiences and resources
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., My Google Internship Experience"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role (Optional)</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Software Engineering Intern"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share your experience, tips, or any other details..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="files">Upload Files (PDF, DOC, DOCX, XLSX, XLS, TXT, RTF)</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xlsx,.xls,.txt,.rtf"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  />
                </div>

                <div>
                  <Label htmlFor="images">Upload Images (JPG, PNG, GIF, WEBP, BMP)</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
                    onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Add Resource"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource._id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {resource.title && (
                      <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                    )}
                    {(resource.company || resource.role) && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {resource.company && <span>{resource.company}</span>}
                        {resource.company && resource.role && <span> • </span>}
                        {resource.role && <span>{resource.role}</span>}
                      </div>
                    )}
                  </div>
                  {canDelete(resource) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resource._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {resource.uploadedBy.role === "student" ? "Student" : "Placement"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    by {resource.uploadedBy.name}
                    {resource.uploadedBy.role === "student" && resource.uploadedBy.rollNo && (
                      <span> ({resource.uploadedBy.rollNo})</span>
                    )}
                    {resource.uploadedBy.role === "student" && resource.uploadedBy.department && (
                      <span> - {resource.uploadedBy.department}</span>
                    )}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {resource.description && (
                  <p className="text-sm">{resource.description}</p>
                )}

                {/* Files and Images */}
                {(resource.files.length > 0 || resource.images.length > 0) && (
                  <div className="space-y-2">
                    {resource.files.map((file, index) => (
                      <div key={`file-${index}`} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`${API_BASE_URL}${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex-1 truncate"
                        >
                          File {index + 1}
                        </a>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`${API_BASE_URL}${file}`} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}

                    {resource.images.map((image, index) => (
                      <div key={`image-${index}`} className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`${API_BASE_URL}${image}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex-1 truncate"
                        >
                          Image {index + 1}
                        </a>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`${API_BASE_URL}${image}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-4">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {resources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No resources yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share an internship experience or resource!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}