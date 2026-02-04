"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar"; 
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-30 shrink-0">
          
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img
                    src="/logo.png" 
                    alt="Arinova Studio"
                    fill
                    className="object-cover"
                />
             </div>
             <span className="font-bold text-lg text-gray-900 tracking-tight">Arinova Studio</span>
          </div>

          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </header>

        {/* Scrollable Page Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}