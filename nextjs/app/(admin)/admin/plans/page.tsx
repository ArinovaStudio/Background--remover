"use client";

import { useState, useEffect } from "react";
import { Plus, Layers, AlertCircle } from "lucide-react";
import PlanModal from "@/components/admin/PlanModal";
import PlanCard from "@/components/admin/PlanCard";

interface Plan {
  id?: string;
  name: string;
  price: number;
  creditsPerMonth: number;
  features: string[];
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Fetch Plans
  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch {
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handlers
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        fetchPlans();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to delete plan");
    }
  };

  const handleSave = async (formData: Plan) => {
    try {
      let res;
      if (editingPlan && editingPlan.id) {
        // UPDATE
        res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // CREATE
        res = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Operation failed");
        return;
      }

      // Success
      setIsModalOpen(false);
      fetchPlans();

    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 text-sm">Manage pricing tiers and features for your users.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-black/20"
        >
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-semibold">No Plans Found</h3>
          <p className="text-gray-500 text-sm mt-1">Create your first subscription tier to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onEdit={handleOpenEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <PlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        initialData={editingPlan}
      />
      
    </div>
  );
}