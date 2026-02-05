"use client";

import { useState, useEffect } from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import BackgroundModal from "@/components/admin/BackgroundModal";
import BackgroundCard from "@/components/admin/BackgroundCard";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Background {
  id: string;
  name: string;
  category: string;
  isPublic: boolean;
  url: string;
  user: { name: string | null; email: string };
}

export default function BackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
  
  // Edit/View Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBg, setEditingBg] = useState<Background | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bgToDelete, setBgToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBackgrounds = async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams();
        if(search) params.append("search", search);
        if(activeTab !== "ALL") params.append("filter", activeTab);

        const res = await fetch(`/api/backgrounds?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
            setBackgrounds(data.backgrounds);
        }
    } catch (err) {
        console.error("Failed to fetch backgrounds", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchBackgrounds();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const handleSave = async (formData: FormData, id?: string) => {
    if (!id) return; 

    try {
        const res = await fetch(`/api/backgrounds/${id}`, {
            method: "PUT",
            body: formData,
        });
        
        const data = await res.json();
        if (data.success) {
            setIsModalOpen(false);
            fetchBackgrounds();
        } else {
            alert(data.message || "Failed to save");
        }
    } catch (error) {
        console.error(error);
        alert("Network Error");
    }
  };

  const handleDeleteClick = (id: string) => {
    setBgToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bgToDelete) return;

    setIsDeleting(true);
    try {
        await fetch(`/api/backgrounds/${bgToDelete}`, { method: "DELETE" });
        await fetchBackgrounds(); 
        setIsDeleteModalOpen(false);
        setBgToDelete(null);
    } catch (err) {
        alert("Failed to delete");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleOpenEdit = (bg: Background) => {
    setEditingBg(bg);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Backgrounds</h1>
          <p className="text-gray-500 text-sm">Manage visibility and categories of user-uploaded images.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl self-start">
            {(["ALL", "PUBLIC", "PRIVATE"] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === tab 
                        ? "bg-white text-black shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    {tab === "ALL" ? "All Items" : tab === "PUBLIC" ? "Public" : "Private"}
                </button>
            ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search by name or user..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400"
            />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
                <div key={i} className="aspect-video bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
        </div>
      ) : backgrounds.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-semibold">No Backgrounds Found</h3>
            <p className="text-gray-500 text-sm mt-1">
                User uploads will appear here.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {backgrounds.map((bg) => (
                <BackgroundCard 
                    key={bg.id} 
                    bg={bg} 
                    onEdit={handleOpenEdit} 
                    onDelete={handleDeleteClick} 
                />
            ))}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingBg && (
          <BackgroundModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSave} 
            initialData={editingBg} 
          />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Background"
        description="Are you sure you want to permanently delete this user's image? This action cannot be undone."
        confirmText="Delete Image"
        variant="danger"
        loading={isDeleting}
      />

    </div>
  );
}