"use client";

import { useState, useEffect } from "react";
import { Search, Edit3, Trash2 } from "lucide-react";
import UserModal from "@/components/admin/UserModal";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  subscription?: {
    plan?: { name: string };
    creditsRemaining: number;
    status: string;
  } | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "SUBSCRIBED">("ALL");
  
  // Edit Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeTab === "SUBSCRIBED") params.append("filter", "SUBSCRIBED");

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search & Effect
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/users/${userToDelete}`, { method: "DELETE" });
      await fetchUsers(); 
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">View, manage, and edit your user base.</p>
        </div>
      </div>

      {/* Toolbar: Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl self-start">
            <button
                onClick={() => setActiveTab("ALL")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "ALL" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
                All Users
            </button>
            <button
                onClick={() => setActiveTab("SUBSCRIBED")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "SUBSCRIBED" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Subscribers
            </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400"
            />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Loading Skeleton
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No users found matching your criteria.
                    </td>
                 </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 border border-white shadow-sm flex items-center justify-center font-bold text-xs text-gray-600">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{user.name || "Unknown"}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        {user.subscription?.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                Inactive
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-medium">
                            {user.subscription?.plan?.name || "-"}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900">
                            {user.subscription?.creditsRemaining ?? "-"}
                          </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => setSelectedUser(user)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                                title="Edit Credits/Plan"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(user.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete User"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
            <span>Showing {users.length} results</span>
            <span>Admin Access Only</span>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <UserModal 
            isOpen={!!selectedUser} 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)}
            onUpdate={fetchUsers}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description="Are you sure you want to permanently delete this user? All their data, including subscription history and credits, will be lost."
        confirmText="Delete User"
        variant="danger"
        loading={isDeleting}
      />

    </div>
  );
}