import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "@/lib/api";

export type UserRole = "student" | "employer" | "placement" | "hod";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  // Removed name to match backend
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;  // Removed name
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = `${API_BASE_URL}/api/auth`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const isTokenExpired = (decoded: any) => {
    if (!decoded?.exp) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return decoded.exp < nowInSeconds;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (isTokenExpired(decoded)) {
          localStorage.removeItem("token");
          setUser(null);
          return;
        }
        setUser(decoded);
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      const decoded: any = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {  // Removed name
    try {
      await axios.post(`${API_BASE}/register`, { email, password, role });  // Removed name
      // Optionally auto-login after register
      await login(email, password);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
