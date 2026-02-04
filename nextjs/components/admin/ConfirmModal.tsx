"use client";

import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning"; 
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === "danger" ? "bg-red-50" : "bg-orange-50"
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
               variant === "danger" ? "text-red-500" : "text-orange-500"
            }`} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
              variant === "danger" 
                ? "bg-red-500 hover:bg-red-600 shadow-red-200" 
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}