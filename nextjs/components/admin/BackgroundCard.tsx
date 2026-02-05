"use client";

import { Edit3, Trash2, Globe, Lock, User } from "lucide-react";

interface Background {
  id: string;
  name: string;
  category: string;
  isPublic: boolean;
  url: string;
  user: { name: string | null; email: string };
}

interface BackgroundCardProps {
  bg: Background;
  onEdit: (bg: Background) => void;
  onDelete: (id: string) => void;
}

export default function BackgroundCard({ bg, onEdit, onDelete }: BackgroundCardProps) {
  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
      
      {/* Image Area */}
      <div className="aspect-video bg-gray-50 relative overflow-hidden border-b border-gray-50">
        <img 
            src={bg.url} 
            alt={bg.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
            {bg.isPublic ? (
                <div className="bg-white/90 backdrop-blur text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Globe className="w-3 h-3" /> PUBLIC
                </div>
            ) : (
                <div className="bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Lock className="w-3 h-3" /> PRIVATE
                </div>
            )}
        </div>
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <button 
                onClick={() => onEdit(bg)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
            >
                <Edit3 className="w-4 h-4 text-gray-700" />
            </button>
            <button 
                onClick={() => onDelete(bg.id)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-lg"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm truncate mb-1" title={bg.name}>
            {bg.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                {bg.category}
             </span>
        </div>

        {/* Owner Info */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                {bg.user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                    {bg.user.name || "User"}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                    {bg.user.email}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}