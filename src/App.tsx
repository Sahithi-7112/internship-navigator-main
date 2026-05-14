import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "@/pages/ProfilePage";



// ✅ Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import InternshipsPage from "./pages/student/internships";
import ApplicationsPage from "./pages/student/applications";
import RecommendationsPage from "./pages/student/recommendations";
import ResourcesPage from "./pages/student/resources";
import NocRequestPage from "./pages/student/noc-request";

// (keep your existing ones)
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import PlacementDashboard from "./pages/placement/PlacementDashboard";
import ShortlistedStudents from "./pages/placement/ShortlistedStudents";
import PlacementResourcesPage from "./pages/placement/resources";
import StudentProfileView from "./pages/placement/StudentProfileView";
import NocManagement from "./pages/placement/NocManagement";
import HodDashboard from "./pages/hod/HodDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ✅ STUDENT ROUTES */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/internships" element={<InternshipsPage />} />
            <Route path="/student/applications" element={<ApplicationsPage />} />
            <Route path="/student/noc-request" element={<NocRequestPage />} />
            <Route path="/student/recommendations" element={<RecommendationsPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
            <Route path="/student/resources" element={<ResourcesPage />} />
            {/* EXISTING */}
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employer/*" element={<EmployerDashboard />} />
            <Route path="/placement" element={<PlacementDashboard />} />
            <Route path="/placement/*" element={<PlacementDashboard />} />
            <Route path="/placement/shortlisted" element={<ShortlistedStudents />} />
            <Route path="/placement/resources" element={<PlacementResourcesPage />} />
            <Route path="/placement/student-profile/:id" element={<StudentProfileView />} />
            <Route path="/placement/noc" element={<NocManagement />} />

            <Route path="/hod" element={<HodDashboard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;