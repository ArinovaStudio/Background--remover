"use client";

import { useState } from "react";
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to send code");
        setIsLoading(false);
        return;
      }

      setStep(2);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setError(verifyData.message || "Invalid Code");
        setIsLoading(false);
        return;
      }

      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerData.success) {
        setError(registerData.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      router.push("/");

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#2d2d2d] via-[#252525] to-[#1f1f1f] border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] p-8 backdrop-blur-sm transition-all duration-300">
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">
          {step === 1 ? "Sign Up" : "Verify Email"}
        </h1>
        <p className="text-base text-white/60">
          {step === 1 
            ? "Create your new account" 
            : `We sent a code to ${formData.email}`
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="Create password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-to-b from-[#404040] via-[#353535] to-[#2a2a2a] border border-white/15 text-white font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:from-[#454545] hover:via-[#3a3a3a] hover:to-[#2f2f2f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#404040] disabled:hover:via-[#353535] disabled:hover:to-[#2a2a2a] disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyAndRegister} className="space-y-6">
          
          {/* Email Preview (Read Only) */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-full bg-white/10 shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm truncate">
                <p className="text-white/40 text-xs">Verifying</p>
                <p className="text-white font-medium truncate">{formData.email}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="text-xs text-[#E8D7B5] hover:underline shrink-0 whitespace-nowrap"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-3 text-center">
              Enter Verification Code
            </label>
            <input
              name="otp"
              type="text"
              required
              maxLength={6}
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              className="w-full h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:border-white/30 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
              placeholder="000000"
            />
            <p className="text-center text-xs text-white/40 mt-3">
              Code expires in 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || formData.otp.length < 6}
            className="w-full h-12 rounded-xl bg-gradient-to-b from-[#404040] via-[#353535] to-[#2a2a2a] border border-white/15 text-white font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:from-[#454545] hover:via-[#3a3a3a] hover:to-[#2f2f2f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#404040] disabled:hover:via-[#353535] disabled:hover:to-[#2a2a2a] disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                Verify & Create Account <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 1 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}