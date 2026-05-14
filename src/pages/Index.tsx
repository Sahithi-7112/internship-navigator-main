import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Building2, Landmark, Bot, Shield, Zap, ArrowRight, Briefcase, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: <GraduationCap className="h-6 w-6" />, title: "Student Portal", desc: "Build your profile, browse internships, and get AI-powered recommendations." },
  { icon: <Building2 className="h-6 w-6" />, title: "Employer Hub", desc: "Post opportunities, review applicants, and submit feedback." },
  { icon: <Landmark className="h-6 w-6" />, title: "Placement Cell", desc: "Manage drives, verify internships, and publish shortlists." },
  { icon: <Bot className="h-6 w-6" />, title: "AI Matching", desc: "TF-IDF powered recommendations matching skills to roles." },
  { icon: <Shield className="h-6 w-6" />, title: "Role-Based Access", desc: "Secure RBAC with JWT authentication for every user." },
  { icon: <Zap className="h-6 w-6" />, title: "Real-Time Updates", desc: "Track application status and shortlist results instantly." },
];

const stats = [
  { value: "500+", label: "Internships Posted" },
  { value: "2,000+", label: "Students Registered" },
  { value: "150+", label: "Partner Companies" },
  { value: "92%", label: "Placement Rate" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-display text-xl font-bold">InternHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        </div>
        <div className="container relative mx-auto px-6 py-24 lg:py-32">
          <motion.div {...fadeUp} className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent-foreground">
              <Bot className="h-4 w-4" /> AI-Powered Matching Engine
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Your Internship Journey,{" "}
              <span className="text-gradient">Simplified</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
              A centralized platform connecting students, employers, and placement cells. 
              Powered by AI to match the right talent with the right opportunity.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-6 py-12 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="font-display text-3xl font-bold text-accent">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-3xl font-bold">Everything You Need</h2>
            <p className="mt-2 text-muted-foreground">A complete ecosystem for internship management</p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border bg-card p-6 card-shadow hover:card-shadow-hover transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-center font-display text-3xl font-bold">How It Works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", icon: <Users className="h-6 w-6" />, title: "Register & Build Profile", desc: "Sign up as a student, employer, or placement cell admin." },
              { step: "02", icon: <Bot className="h-6 w-6" />, title: "AI Matches You", desc: "Our TF-IDF engine analyzes your skills against available roles." },
              { step: "03", icon: <CheckCircle className="h-6 w-6" />, title: "Get Placed", desc: "Apply, get shortlisted, and start your career journey." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  {item.icon}
                </div>
                <p className="mt-4 text-sm font-semibold text-accent">STEP {item.step}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Ready to Transform Your Internship Process?</h2>
          <p className="mt-4 text-primary-foreground/70">Join thousands of students and employers already using InternHub.</p>
          <Link to="/register">
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 text-base px-10">
              Start Now — It's Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto flex items-center justify-between px-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="font-display font-semibold text-foreground">InternHub</span>
          </div>
          <p>© 2026 InternHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
