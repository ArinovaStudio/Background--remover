"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Ban, Save, CreditCard } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface Plan {
  id: string;
  name: string;
  price: number;
  creditsPerMonth: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  subscription?: {
    plan?: { id: string; name: string };
    creditsRemaining: number;
    status: string;
  } | null;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

export default function UserModal({ isOpen, onClose, user, onUpdate }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Form State
  const [credits, setCredits] = useState(user.subscription?.creditsRemaining || 0);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(user.subscription?.plan?.id || "");
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch Plans on Open
  useEffect(() => {
    if (isOpen) {
      setCredits(user.subscription?.creditsRemaining || 0);
      setSelectedPlanId(user.subscription?.plan?.id || "");

      const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
          const res = await fetch("/api/plans");
          const data = await res.json();
          if (data.success) setPlans(data.plans);
        } catch (e) {
          console.error("Failed to load plans", e);
        } finally {
          setLoadingPlans(false);
        }
      };
      fetchPlans();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedPlanId) {
      alert("Please select a plan first.");
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: selectedPlanId,
          credits: Number(credits) 
        }),
      });

      onUpdate();
      onClose();
    } catch {
      alert("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = () => setIsConfirmOpen(true);

  const handleConfirmRemove = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removePlan: true }),
      });
      onUpdate();
      setIsConfirmOpen(false);
      onClose();
    } catch {
      alert("Failed to remove plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
            <h3 className="font-bold text-gray-900">Manage User Subscription</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* User Details */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user.name || "No Name"}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Plan Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Selected Plan
                </label>
                <div className="relative">
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={loadingPlans}
                    className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block w-full p-3 pr-10 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="" disabled>Select a plan...</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — ₹{plan.price}/mo ({plan.creditsPerMonth} credits)
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                     <CreditCard className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Credits Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Credits Balance
                </label>
                <div className="relative">
                   <input
                    type="number"
                    min="0"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block w-full p-3"
                    placeholder="0"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400">
                   *Modifying the plan will not automatically reset these credits. Adjust manually if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
             {/* Remove Plan Button (Only if user has a plan) */}
             {user.subscription && (
                <button
                  onClick={handleRemoveClick}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" /> Remove Plan
                </button>
             )}

             {/* Save Button */}
             <button
                onClick={handleSave}
                disabled={loading || !selectedPlanId}
                className="flex-[2] py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
             </button>
          </div>

        </div>
      </div>

      {/* Confirmation Modal for Removal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Subscription?"
        description="This will immediately cancel the user's plan. They will lose access to premium features."
        confirmText="Remove Plan"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </>
  );
}