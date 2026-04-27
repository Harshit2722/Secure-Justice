import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUserAccount } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers({ search, role: roleFilter });
      if (res.success) {
        setUsers(res.data);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const id = confirmDelete.id;
    if (!id) return;
    
    try {
      setDeletingId(id);
      await deleteUserAccount(id);
      setUsers(users.filter(u => u._id !== id));
      setConfirmDelete({ show: false, id: null });
    } catch (err) {
      console.error("Failed to delete user", err);
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadge = (role) => {
    const base = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ";
    switch (role) {
      case 'admin': return base + "bg-rose-100 text-rose-700 border border-rose-200";
      case 'police': return base + "bg-blue-100 text-blue-700 border border-blue-200";
      case 'forensic': return base + "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case 'citizen': return base + "bg-slate-100 text-slate-700 border border-slate-200";
      default: return base + "bg-primary/10 text-primary border border-primary/20";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface">User Management</h2>
          <p className="text-on-surface-variant text-lg">Oversee all platform participants and manage account access.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 focus:outline-none focus:border-primary text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary/50 transition-all text-sm font-bold min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <span className="capitalize">{roleFilter || 'All Roles'}</span>
              <span className={`material-symbols-outlined transition-transform duration-300 ${showRoleDropdown ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {showRoleDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                  <div className="p-1.5">
                    {[
                      { id: '', label: 'All Roles', icon: 'groups' },
                      { id: 'citizen', label: 'Citizens', icon: 'person' },
                      { id: 'police', label: 'Police', icon: 'shield' },
                      { id: 'forensic', label: 'Forensic', icon: 'science' },
                      { id: 'admin', label: 'Admins', icon: 'admin_panel_settings' }
                    ].map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setRoleFilter(role.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          roleFilter === role.id 
                            ? 'bg-primary text-on-primary' 
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{role.icon}</span>
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">User</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">Role</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">Joined Date</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-6 py-8">
                    <div className="h-10 bg-surface-container rounded-xl w-full opacity-40"></div>
                  </td>
                </tr>
              ))
            ) : users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((u) => (
              <tr key={u._id} className="hover:bg-surface-container/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      u.role === 'police' ? 'bg-blue-100 text-blue-700' :
                      u.role === 'forensic' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {u.name ? u.name.charAt(0) : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{u.name}</p>
                      <p className="text-xs text-on-surface-variant">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={getRoleBadge(u.role)}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">
                  {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-5">
                  {u.isVerified ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-on-surface-variant/50 text-[10px] font-black uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30"></span>
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  <Link 
                    to={`/admin-users/${u._id}`}
                    className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">group_off</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-1">No users found</h3>
            <p className="text-on-surface-variant">Try adjusting your search or filters.</p>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && Math.ceil(users.length / usersPerPage) > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10 bg-surface-container-lowest">
            <p className="text-sm text-on-surface-variant font-medium">
              Showing <span className="font-bold text-on-surface">{users.length > 0 ? (currentPage - 1) * usersPerPage + 1 : 0}</span> to <span className="font-bold text-on-surface">{Math.min(currentPage * usersPerPage, users.length)}</span> of <span className="font-bold text-on-surface">{users.length}</span> users
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    currentPage === num 
                      ? 'bg-primary text-on-primary shadow-sm' 
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(users.length / usersPerPage), p + 1))}
                disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
