"use client";

import { Edit3, Trash2, Check, Zap } from "lucide-react";

interface Plan {
  id?: string;
  name: string;
  price: number;
  creditsPerMonth: number;
  features: string[];
}

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}

export default function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  return (
    <div className="group relative bg-white rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-transparent rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity -z-10" />
      
      <div className="bg-white rounded-[20px] p-6 h-full flex flex-col border border-gray-100 group-hover:border-transparent transition-colors">
        
        {/* Header: Name & Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-gray-400">₹</span>
                <span className="text-4xl font-bold text-gray-900 tracking-tighter">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-gray-400">/mo</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200">
            <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold">{plan.creditsPerMonth} Credits</span>
          </div>
        </div>

        {/* Features List */}
        <div className="flex-1 mb-8">
            <div className="space-y-3.5">
                {plan.features.slice(0, 5).map((feature, i) => (
                <div key={i} className="flex items-start gap-3 group/item">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover/item:border-green-200 group-hover/item:bg-green-50 transition-colors">
                        <Check className="w-3 h-3 text-gray-400 group-hover/item:text-green-600 transition-colors" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium leading-tight group-hover/item:text-gray-900 transition-colors">
                        {feature}
                    </span>
                </div>
                ))}
                {plan.features.length > 5 && (
                    <div className="pl-8 text-xs font-medium text-gray-400">
                        + {plan.features.length - 5} more features...
                    </div>
                )}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-[1fr_auto] gap-3 mt-auto pt-6 border-t border-gray-50">
          <button 
            onClick={() => onEdit(plan)}
            className="h-11 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            <Edit3 className="w-4 h-4" /> 
            Edit Plan
          </button>
          
          <button 
            onClick={() => onDelete(plan.id!)}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-[0.95] transition-all"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}