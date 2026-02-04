"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Layers } from "lucide-react";
import AssetModal from "@/components/admin/AssetModal";
import AssetCard from "@/components/admin/AssetCard";
import ConfirmModal from "@/components/admin/ConfirmModal";


interface Asset {
  id: string;
  name: string;
  type: "MOCKUP" | "DEMO";
  category: string;
  isPremium: boolean;
  url: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "MOCKUP" | "DEMO">("ALL");
  
  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams();
        if(search) params.append("search", search);
        if(activeTab !== "ALL") params.append("type", activeTab);

        const res = await fetch(`/api/assets?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
            setAssets(data.assets);
        }
    } catch (err) {
        alert(`Failed to fetch assets: ${err}`);
    } finally {
        setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchAssets();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const handleSave = async (formData: FormData, id?: string) => {
    try {
        const url = id ? `/api/admin/assets/${id}` : "/api/admin/assets";
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            body: formData,
        });
        
        const data = await res.json();
        if (data.success) {
            setIsModalOpen(false);
            fetchAssets();
        } else {
            alert(data.message);
        }
    } catch {
        alert("Operation failed");
    }
  };

  const handleDeleteClick = (id: string) => {
    setAssetToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if(!assetToDelete) return;
    
    setIsDeleting(true);
    try {
        await fetch(`/api/admin/assets/${assetToDelete}`, { method: "DELETE" });
        await fetchAssets();
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
    } catch (err) {
        alert("Failed to delete");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets Library</h1>
          <p className="text-gray-500 text-sm">Manage mockups and demo images for the editor.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-black/20"
        >
          <Plus className="w-4 h-4" /> Upload Asset
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl self-start">
            {(["ALL", "MOCKUP", "DEMO"] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === tab 
                        ? "bg-white text-black shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    {tab === "ALL" ? "All Assets" : tab === "MOCKUP" ? "Mockups" : "Demo Images"}
                </button>
            ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search assets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400"
            />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1,2,3,4,5].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-semibold">No Assets Found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or upload a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {assets.map((asset) => (
                <AssetCard 
                    key={asset.id} 
                    asset={asset} 
                    onEdit={handleOpenEdit} 
                    onDelete={handleDeleteClick} 
                />
            ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <AssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingAsset} 
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        description="Are you sure you want to permanently delete this asset? This cannot be undone."
        confirmText="Delete Asset"
        variant="danger"
        loading={isDeleting}
      />

    </div>
  );
}