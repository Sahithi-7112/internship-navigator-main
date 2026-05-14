import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: "default" | "accent" | "student" | "employer" | "placement";
}

const variantStyles = {
  default: "bg-card",
  accent: "bg-accent/10 border-accent/20",
  student: "bg-info/10 border-info/20",
  employer: "bg-employer/10 border-employer/20",
  placement: "bg-placement/10 border-placement/20",
};

export default function StatCard({ title, value, icon, trend, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl border p-5 card-shadow transition-shadow hover:card-shadow-hover ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold font-display">{value}</p>
          {trend && <p className="mt-1 text-xs text-success">{trend}</p>}
        </div>
        <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
