"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, CreditCard, FileText, X, LogOut, Users, Activity } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: Home, href: "/admin" },
    { name: "Plans", icon: CreditCard, href: "/admin/plans" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Assets", icon: FileText, href: "/admin/assets" },
    { name: "System", icon: Activity, href: "/admin/system" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      alert(`Logout failed`);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1a1a] text-white flex flex-col transition-transform duration-300
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1e1e1e] to-[#151515] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08)_0%,transparent_40%)] pointer-events-none z-0" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}
        />

        <div className="relative z-10 flex flex-col h-full px-4 py-6">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-lg shadow-white/10 border-2 border-white/20">
                    <img 
                        src="/logo.png"
                        alt="Arinova Studio"
                        fill
                        className="object-cover"
                    />
                </div>
                <span className="text-xl font-bold tracking-tight">Arinova Studio</span>
            </div>
            {/* Close Button*/}
            <button onClick={onClose} className="p-1 text-white/50 hover:text-white lg:hidden">
                <X className="w-6 h-6" />
            </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                    active
                        ? "bg-gradient-to-b from-[#404040] via-[#353535] to-[#2a2a2a] border border-white/[0.15] shadow-lg shadow-black/20"
                        : "text-[#8a8988] hover:text-white hover:bg-white/[0.05]"
                    }`}
                >
                    <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "group-hover:text-white"}`} />
                    <span className={`text-[15px] font-semibold ${active ? "text-white" : ""}`}>
                    {item.name}
                    </span>
                </Link>
                );
            })}
            </nav>

            {/* Logout Section */}
            <div className="pt-4 mt-2 border-t border-white/5">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-[#8a8988] hover:text-red-400 hover:bg-red-500/10 group"
                >
                    <LogOut className="w-5 h-5 group-hover:stroke-red-400" />
                    <span className="text-[15px] font-semibold">Log Out</span>
                </button>
            </div>
        </div>
      </aside>
    </>
  );
}