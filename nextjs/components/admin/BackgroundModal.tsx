"use client";

import { useState } from "react";
import { X, Loader2, Globe, Lock, User } from "lucide-react";

interface Background {
  id?: string;
  name: string;
  category: string;
  isPublic: boolean;
  url?: string;
  user?: { name: string | null; email: string };
}

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData, id?: string) => Promise<void>;
  initialData: Background; 
}

export default function BackgroundModal({ isOpen, onClose, onSave, initialData }: BackgroundModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Background>(initialData);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("isPublic", String(formData.isPublic));

    await onSave(data, initialData.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
             <h2 className="text-lg font-bold text-gray-900">
                Edit Background Details
             </h2>
             {initialData.user && (
                 <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 font-medium">
                    <User className="w-3 h-3" />
                    <span>Uploaded by: <span className="text-gray-900">{initialData.user.email}</span></span>
                 </div>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="bg-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Read-Only Image Preview */}
            <div className="relative h-48 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                <img 
                    src={initialData.url} 
                    alt="Current Background" 
                    className="h-full w-full object-contain" 
                />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Background Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category</label>
                <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
            </div>

            {/* Public/Private Toggle */}
            <div 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" 
                onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        formData.isPublic ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
                    }`}>
                        {formData.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            {formData.isPublic ? "Public Background" : "Private Background"}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formData.isPublic ? "Visible to all users" : "Only visible to owner"}
                        </p>
                    </div>
                </div>
                
                <div className={`w-11 h-6 rounded-full p-1 transition-colors ${formData.isPublic ? 'bg-black' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-white transition-all">
            Cancel
          </button>
          <button 
            form="bg-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}