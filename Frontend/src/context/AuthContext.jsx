import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("authRole") || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  useEffect(() => {
    if (role) {
      localStorage.setItem("authRole", role);
    } else {
      localStorage.removeItem("authRole");
    }
  }, [role]);

  const loginAdmin = (adminData) => {
    setUser(adminData);
    setRole("admin");
    localStorage.setItem("Admin-Token", adminData.token || "");
  };

  const loginStudent = (studentData) => {
    setUser(studentData);
    setRole("student");
    localStorage.setItem("Student-Token", studentData.token || "");
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("Admin-Token");
    localStorage.removeItem("Student-Token");
  };

  const value = {
    user,
    role,
    loginAdmin,
    loginStudent,
    logout,
    isAdmin: role === "admin",
    isStudent: role === "student",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}