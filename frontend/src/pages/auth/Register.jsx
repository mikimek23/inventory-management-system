import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi } from "../../services/auth.api";
import { apiError } from "../../services/api";
import { useToast } from "../../components/ui/Toast";

const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/\d/, "Must include at least one number")
      .regex(/[@$!%*?&]/, "Must include at least one special character (@$!%*?&)"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    navigate("/dashboard", { replace: true });
  }

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "One lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "One number", met: /\d/.test(formData.password) },
    { label: "One special character (@$!%*?&)", met: /[@$!%*?&]/.test(formData.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const result = registerSchema.safeParse(formData);
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
      await authApi.register({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });
      success("Registration successful! You can now sign in.");
      navigate("/login");
    } catch (err) {
      const msg = apiError(err);
      setServerError(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* Brand Hero Side */}
      <div className="lg:col-span-5 xl:col-span-5 bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
            IM
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">StockFlow</h1>
            <p className="text-xs text-blue-400 font-semibold tracking-wider">
              INVENTORY MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        <div className="relative z-10 my-10 max-w-lg space-y-6">
          <span className="inline-block px-3 py-1 bg-blue-950/80 border border-blue-800/80 rounded-full text-xs font-semibold text-blue-300">
            Staff & Operator Registration
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Join your organization's inventory control team.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Create an account to participate in stock movements, record purchases, register sales, and track real-time inventory updates.
          </p>

          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Account Registration Checklist
            </h4>
            <div className="space-y-2">
              {passwordRequirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      req.met
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {req.met ? "✓" : "•"}
                  </span>
                  <span className={req.met ? "text-slate-200" : "text-slate-400"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          Already have an authorized user account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold underline ml-1">
            Sign In
          </Link>
        </div>
      </div>

      {/* Registration Form Side */}
      <div className="lg:col-span-7 xl:col-span-7 p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              REGISTRATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Create New Account
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Fill in your details below to register for the inventory system.
            </p>
          </div>

          {serverError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
              autoComplete="name"
            />

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
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="text-blue-700 hover:text-blue-800 font-bold hover:underline">
              Sign in to your account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
