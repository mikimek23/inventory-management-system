import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { apiError } from "../../services/api";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "admin@example.com",
    password: "Admin@1234",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(result.data);
      navigate("/dashboard");
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Brand Hero Side */}
      <div className="lg:col-span-6 xl:col-span-7 bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
            IM
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">StockFlow</h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-wider">
              INVENTORY MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        <div className="relative z-10 my-12 lg:my-0 max-w-lg space-y-6">
          <span className="inline-block px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-xs font-semibold text-emerald-300">
            Enterprise Simplicity for Growing Business
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Inventory control from supplier purchase to customer sale.
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Real-time ledger calculations, low-stock threshold detection, multi-line purchase & sales workflows, and granular role management.
          </p>
        </div>

        {/* Demo Credentials Helper */}
        <div className="relative z-10 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 backdrop-blur-xs max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            Click to fill test credentials:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillDemo("admin@example.com", "Admin@1234")}
              className="p-3 bg-slate-900/90 hover:bg-slate-900 rounded-xl border border-slate-700 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                  Administrator
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  Full
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">admin@example.com</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Admin@1234</p>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("staff@example.com", "Staff@1234")}
              className="p-3 bg-slate-900/90 hover:bg-slate-900 rounded-xl border border-slate-700 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                  Staff Member
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  Ops
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">staff@example.com</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Staff@1234</p>
            </button>
          </div>
        </div>
      </div>

      {/* Login Form Side */}
      <div className="lg:col-span-6 xl:col-span-5 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              SECURE PORTAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Sign in to your account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Enter your authorized staff or admin credentials to proceed.
            </p>
          </div>

          {serverError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-3 animate-in fade-in">
              <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In to Workspace"}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Protected by role-based authorization & session token verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
