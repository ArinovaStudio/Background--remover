"use client";

import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";

interface Asset {
  id?: string;
  name: string;
  type: "MOCKUP" | "DEMO";
  category: string;
  isPremium: boolean;
  url?: string;
}

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData, id?: string) => Promise<void>;
  initialData?: Asset | null;
}

export default function AssetModal({ isOpen, onClose, onSave, initialData }: AssetModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const [formData, setFormData] = useState<Asset>({
    name: "",
    type: "MOCKUP",
    category: "",
    isPremium: false,
  });

  // Reset/Load Data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewUrl(initialData.url || "");
      setFile(null);
    } else {
      setFormData({ name: "", type: "MOCKUP", category: "General", isPremium: false });
      setPreviewUrl("");
      setFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("category", formData.category);
    data.append("isPremium", String(formData.isPremium));
    
    if (file) {
      data.append("file", file);
    }

    await onSave(data, initialData?.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData ? "Edit Asset" : "Upload Asset"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="asset-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Image Preview / Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                previewUrl ? "border-gray-200" : "border-gray-300 hover:border-black hover:bg-gray-50"
              }`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    Change Image
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UploadCloud className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                required={!initialData} 
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Asset Name</label>
              <input
                required
                type="text"
                placeholder="e.g. iPhone 15 Pro Mockup"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            {/* Grid for Selects */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as "MOCKUP" | "DEMO" })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none bg-white"
                    >
                        <option value="MOCKUP">Mockup</option>
                        <option value="DEMO">Demo Image</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category</label>
                    <input
                        type="text"
                        placeholder="e.g. Technology"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none"
                    />
                </div>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Premium Asset</p>
                        <p className="text-xs text-gray-500">Only for Pro users</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={formData.isPremium} 
                        onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })} 
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-white transition-all">
            Cancel
          </button>
          <button 
            form="asset-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? "Save Changes" : "Upload Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}