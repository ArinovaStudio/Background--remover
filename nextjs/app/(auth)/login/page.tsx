"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }

    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#2d2d2d] via-[#252525] to-[#1f1f1f] border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] p-8 backdrop-blur-sm transition-all duration-300">
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Sign In</h1>
        <p className="text-base text-white/60">Welcome back to your account</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email */}
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

        {/* Password */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-white/90">Password</label>
            <Link href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-gradient-to-b from-[#404040] via-[#353535] to-[#2a2a2a] border border-white/15 text-white font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:from-[#454545] hover:via-[#3a3a3a] hover:to-[#2f2f2f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#404040] disabled:hover:via-[#353535] disabled:hover:to-[#2a2a2a] disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* FOOTER */}
      <div className="mt-6 text-center">
        <p className="text-sm text-white/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}