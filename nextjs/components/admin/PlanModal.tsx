"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, Check } from "lucide-react";

interface Plan {
  id?: string;
  name: string;
  price: number;
  creditsPerMonth: number;
  features: string[];
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Plan) => Promise<void>;
  initialData?: Plan | null;
}

export default function PlanModal({ isOpen, onClose, onSave, initialData }: PlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Plan>({
    name: "",
    price: 0,
    creditsPerMonth: 0,
    features: [],
  });
  
  // Feature Input State
  const [newFeature, setNewFeature] = useState("");

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: "", price: 0, creditsPerMonth: 0, features: [] });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFormData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData ? "Edit Plan" : "Create New Plan"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="plan-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Plan Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Pro Plan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                </div>
              </div>

              {/* Credits */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Credits / Month</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.creditsPerMonth}
                  onChange={(e) => setFormData({ ...formData, creditsPerMonth: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>
            </div>

            {/* Features List */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Features</label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a feature (e.g. 'Unlimited Exports')"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
                <button 
                  type="button" 
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Added Features List */}
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 font-medium">{feature}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFeature(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.features.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No features added yet.</p>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-white hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
          <button 
            form="plan-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? "Update Plan" : "Create Plan"}
          </button>
        </div>

      </div>
    </div>
  );
}