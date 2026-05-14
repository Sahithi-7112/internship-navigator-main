import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // ✅ CORRECT PLACE
  useEffect(() => {
    if (user?.role) {
      navigate(`/${user.role}`);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password); // ✅ IMPORTANT
    } catch (error) {
      alert("Login failed");
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
          <h1 className="font-display text-4xl font-bold text-primary-foreground">
            Welcome back to <br />
            <span className="text-gradient">InternHub</span>
          </h1>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md">
          <h2 className="text-2xl font-bold">Sign In</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}