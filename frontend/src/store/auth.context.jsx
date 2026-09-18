import { createContext, useContext, useState, useEffect } from "react";
import authApi from "../services/auth.api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("inventory_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("inventory_access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
        localStorage.setItem("inventory_user", JSON.stringify(profile));
      } catch {
        // Interceptor handles refresh, but if it completely fails:
        setUser(null);
        localStorage.removeItem("inventory_user");
        localStorage.removeItem("inventory_access_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const { accessToken, ...profile } = data;
    if (accessToken) {
      localStorage.setItem("inventory_access_token", accessToken);
    }
    localStorage.setItem("inventory_user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore error on logout
    } finally {
      localStorage.removeItem("inventory_access_token");
      localStorage.removeItem("inventory_user");
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isStaff: user?.role === "STAFF",
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
