"use client";

import { Edit3, Trash2, Crown, LayoutTemplate, ImageIcon } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: "MOCKUP" | "DEMO";
  category: string;
  isPremium: boolean;
  url: string;
}

interface AssetCardProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export default function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
      
      {/* Image Area */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-50">
        <img 
            src={asset.url} 
            alt={asset.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
            {asset.isPremium && (
                <div className="bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    PREMIUM
                </div>
            )}
        </div>
        
        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <button 
                onClick={() => onEdit(asset)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
            >
                <Edit3 className="w-4 h-4 text-gray-700" />
            </button>
            <button 
                onClick={() => onDelete(asset.id)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-lg"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-900 truncate pr-2" title={asset.name}>{asset.name}</h3>
            {asset.type === "MOCKUP" ? (
                <LayoutTemplate className="w-4 h-4 text-gray-400 shrink-0" />
            ) : (
                <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
            )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-md">{asset.category}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="capitalize text-gray-400">{asset.type.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
}