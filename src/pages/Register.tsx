import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { GraduationCap, Building2, Landmark, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import API_BASE_URL from "@/lib/api";
const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: "student", label: "Student", icon: <GraduationCap className="h-6 w-6" /> },
  { value: "employer", label: "Employer", icon: <Building2 className="h-6 w-6" /> },
  { value: "placement", label: "Placement Cell", icon: <Landmark className="h-6 w-6" /> },
  { value: "hod", label: "HOD", icon: <Shield className="h-6 w-6" /> },
];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      email,
      password,
      role,
    });

    alert("Registered successfully ✅");
    navigate("/login");

  } catch (error: any) {
    console.log("ERROR:", error.response?.data); // 🔥 IMPORTANT
    alert("Registration failed");
  }
};

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 hero-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground">Join<br /><span className="text-gradient">InternHub</span></h1>
          <p className="mt-4 text-lg text-primary-foreground/70">Start your internship journey today.</p>
        </div>
        <p className="text-sm text-primary-foreground/50">© 2026 InternHub. All rights reserved.</p>
      </div>

      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h2 className="font-display text-2xl font-bold">Create Account</h2>
          <p className="mt-1 text-muted-foreground">Register to get started</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                  role === r.value ? "border-accent bg-accent/5 text-accent" : "border-border hover:border-muted-foreground/30"
                }`}
              >
                {r.icon}
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Create Account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-accent hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
