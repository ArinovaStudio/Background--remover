"use client";

import { useState } from "react";
import { X, Loader2, Ban } from "lucide-react";
import ConfirmModal from "./ConfirmModal";


interface User {
  id: string;
  name: string | null;
  email: string;
  subscription?: {
    plan?: { name: string };
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
  const [credits, setCredits] = useState(user.subscription?.creditsRemaining || 0);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleUpdateCredits = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ credits: Number(credits) }),
      });
      onUpdate();
      onClose();
    } catch (err) {
      alert("Failed to update credits");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
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
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900">Manage User</h3>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name || "No Name"}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            {/* Credits Management */}
            {user.subscription ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Credits</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="text-black flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                  <button 
                    onClick={handleUpdateCredits}
                    disabled={loading}
                    className="px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                User doesn&apos;t have a plan. No credits to manage.
              </div>
            )}

            {/* Danger Zone */}
            {user.subscription && (
              <div className="pt-6 border-t border-gray-100">
                 <button 
                   onClick={handleRemoveClick}
                   disabled={loading}
                   className="w-full py-3 rounded-xl border border-red-100 text-red-600 bg-red-50 text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
                 >
                   <Ban className="w-4 h-4" /> Remove Plan
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove User Subscription"
        description="Are you sure you want to cancel this user's subscription immediately? They will lose access to premium features and remaining credits."
        confirmText="Remove Plan"
        cancelText="Keep Plan"
        variant="danger"
        loading={loading}
      />
    </>
  );
}