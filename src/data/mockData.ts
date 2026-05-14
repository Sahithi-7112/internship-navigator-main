export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "ON_CAMPUS" | "OFF_CAMPUS";
  duration: string;
  stipend: string;
  description: string;
  skills: string[];
  postedDate: string;
  deadline: string;
  applicants: number;
  status: "active" | "closed" | "draft";
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  internshipId: string;
  internshipTitle: string;
  company: string;
  appliedDate: string;
  status: "pending" | "shortlisted" | "rejected" | "accepted";
  cgpa: number;
  skills: string[];
  matchScore: number;
}

export interface Feedback {
  id: string;
  studentName: string;
  internshipTitle: string;
  technicalRating: number;
  communicationRating: number;
  overallRating: number;
  ppoRecommendation: boolean;
  comments: string;
}

export const mockInternships: Internship[] = [
  {
    id: "i1", title: "Frontend Developer Intern", company: "TechCorp India",
    location: "Bangalore", type: "ON_CAMPUS", duration: "6 months", stipend: "₹25,000/month",
    description: "Work on React.js applications with modern tooling. Build responsive UIs and collaborate with the design team.",
    skills: ["React", "TypeScript", "CSS", "Git"], postedDate: "2026-02-10", deadline: "2026-03-15",
    applicants: 45, status: "active",
  },
  {
    id: "i2", title: "Data Science Intern", company: "Analytics Pro",
    location: "Mumbai", type: "ON_CAMPUS", duration: "3 months", stipend: "₹20,000/month",
    description: "Analyze large datasets using Python and machine learning techniques. Create dashboards and reports.",
    skills: ["Python", "Pandas", "Machine Learning", "SQL"], postedDate: "2026-02-08", deadline: "2026-03-10",
    applicants: 32, status: "active",
  },
  {
    id: "i3", title: "Backend Developer Intern", company: "CloudNet Solutions",
    location: "Remote", type: "OFF_CAMPUS", duration: "4 months", stipend: "₹18,000/month",
    description: "Develop REST APIs using Node.js and Express. Work with MongoDB and cloud services.",
    skills: ["Node.js", "Express", "MongoDB", "AWS"], postedDate: "2026-02-12", deadline: "2026-03-20",
    applicants: 28, status: "active",
  },
  {
    id: "i4", title: "UI/UX Design Intern", company: "DesignHub",
    location: "Hyderabad", type: "OFF_CAMPUS", duration: "3 months", stipend: "₹15,000/month",
    description: "Create wireframes and prototypes using Figma. Conduct user research and usability testing.",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"], postedDate: "2026-02-14", deadline: "2026-03-18",
    applicants: 19, status: "active",
  },
  {
    id: "i5", title: "DevOps Intern", company: "InfraStack",
    location: "Pune", type: "ON_CAMPUS", duration: "6 months", stipend: "₹22,000/month",
    description: "Work with CI/CD pipelines, Docker, and Kubernetes. Automate deployment processes.",
    skills: ["Docker", "Kubernetes", "CI/CD", "Linux"], postedDate: "2026-02-05", deadline: "2026-03-05",
    applicants: 15, status: "active",
  },
];

export const mockApplications: Application[] = [
  { id: "a1", studentId: "s1", studentName: "Arjun Sharma", internshipId: "i1", internshipTitle: "Frontend Developer Intern", company: "TechCorp India", appliedDate: "2026-02-15", status: "shortlisted", cgpa: 8.5, skills: ["React", "TypeScript", "CSS"], matchScore: 92 },
  { id: "a2", studentId: "s1", studentName: "Arjun Sharma", internshipId: "i2", internshipTitle: "Data Science Intern", company: "Analytics Pro", appliedDate: "2026-02-16", status: "pending", cgpa: 8.5, skills: ["Python", "SQL"], matchScore: 67 },
  { id: "a3", studentId: "s2", studentName: "Sneha Patel", internshipId: "i1", internshipTitle: "Frontend Developer Intern", company: "TechCorp India", appliedDate: "2026-02-14", status: "shortlisted", cgpa: 9.0, skills: ["React", "JavaScript", "CSS", "Git"], matchScore: 95 },
  { id: "a4", studentId: "s3", studentName: "Rahul Gupta", internshipId: "i3", internshipTitle: "Backend Developer Intern", company: "CloudNet Solutions", appliedDate: "2026-02-13", status: "pending", cgpa: 7.8, skills: ["Node.js", "Express", "MongoDB"], matchScore: 88 },
  { id: "a5", studentId: "s4", studentName: "Kavya Reddy", internshipId: "i5", internshipTitle: "DevOps Intern", company: "InfraStack", appliedDate: "2026-02-11", status: "accepted", cgpa: 8.2, skills: ["Docker", "Linux", "CI/CD"], matchScore: 85 },
];

export const mockFeedback: Feedback[] = [
  { id: "f1", studentName: "Kavya Reddy", internshipTitle: "DevOps Intern", technicalRating: 4.5, communicationRating: 4.0, overallRating: 4.3, ppoRecommendation: true, comments: "Excellent problem-solving skills." },
  { id: "f2", studentName: "Amit Singh", internshipTitle: "ML Intern", technicalRating: 3.8, communicationRating: 4.2, overallRating: 4.0, ppoRecommendation: false, comments: "Good communication but needs more technical depth." },
];

export interface AIRecommendation {
  internshipId: string;
  title: string;
  company: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
}

export const mockRecommendations: AIRecommendation[] = [
  { internshipId: "i1", title: "Frontend Developer Intern", company: "TechCorp India", matchScore: 92, matchingSkills: ["React", "TypeScript", "CSS"], missingSkills: ["Git"] },
  { internshipId: "i3", title: "Backend Developer Intern", company: "CloudNet Solutions", matchScore: 78, matchingSkills: ["Node.js", "Express"], missingSkills: ["MongoDB", "AWS"] },
  { internshipId: "i5", title: "DevOps Intern", company: "InfraStack", matchScore: 45, matchingSkills: ["Linux"], missingSkills: ["Docker", "Kubernetes", "CI/CD"] },
  { internshipId: "i2", title: "Data Science Intern", company: "Analytics Pro", matchScore: 34, matchingSkills: ["Python"], missingSkills: ["Pandas", "Machine Learning", "SQL"] },
];
