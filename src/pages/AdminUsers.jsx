import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth, ROLES, ALL_PERMISSIONS } from '../contexts/AuthContext';
import { RoleIcon, PermIcon } from '../components/ui/RoleIcon';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Pencil, Trash2, X, Eye, EyeOff, Shield, Search,
    User, KeyRound, AlertCircle, CheckCircle, ChevronDown, EyeIcon, PenLine
} from 'lucide-react';

export default function AdminUsers() {
    const { users, currentUser, createUser, updateUser, deleteUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [notification, setNotification] = useState(null);

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-[hsl(var(--muted-foreground))]">Bu sahifaga kirishga ruxsat yo'q.</p>
            </div>
        );
    }

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (userId) => {
        const result = deleteUser(userId);
        if (result.success) {
            showNotification("Foydalanuvchi o'chirildi!");
            setDeleteConfirm(null);
        } else {
            showNotification(result.error, 'error');
        }
    };

    const handleSave = (formData) => {
        if (editingUser) {
            const result = updateUser(editingUser.id, formData);
            if (result.success) {
                showNotification("Foydalanuvchi yangilandi!");
                setIsModalOpen(false);
            } else {
                return result.error;
            }
        } else {
            const result = createUser(formData);
            if (result.success) {
                showNotification("Yangi foydalanuvchi yaratildi!");
                setIsModalOpen(false);
            } else {
                return result.error;
            }
        }
        return null;
    };

    const getPermissionSummary = (user) => {
        const perms = user.permissions;
        if (!perms || typeof perms !== 'object') return [];
        return Object.entries(perms)
            .filter(([, val]) => val.view || val.edit)
            .map(([key, val]) => ({
                key,
                label: ALL_PERMISSIONS[key]?.label,
                view: val.view,
                edit: val.edit,
            }));
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ROLES[u.role]?.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in">
            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 left-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${notification.type === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                            }`}
                    >
                        {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-7 h-7 text-blue-500" />
                        Foydalanuvchilar Boshqaruvi
                    </h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                        Login/parol yaratish va rollarni boshqarish
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddUser}
                        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        <UserPlus size={18} />
                        Yangi Foydalanuvchi
                    </button>
                </div>
            </div>

            {/* Rollar Haqida Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(ROLES).filter(([key]) => key !== 'exam_taker').map(([key, role]) => {
                    const count = users.filter(u => u.role === key).length;
                    return (
                        <div key={key} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 flex items-center gap-3">
                            <RoleIcon roleKey={key} size={22} variant="badge" />
                            <div>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{role.label}</p>
                                <p className="text-lg font-bold">{count} nafar</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Users Table */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                                <th className="text-left px-6 py-4 font-semibold">#</th>
                                <th className="text-left px-6 py-4 font-semibold">F.I.SH</th>
                                <th className="text-left px-6 py-4 font-semibold">Login</th>
                                <th className="text-left px-6 py-4 font-semibold">Rol</th>
                                <th className="text-left px-6 py-4 font-semibold">Ruxsatlar</th>
                                <th className="text-right px-6 py-4 font-semibold">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => {
                                const role = ROLES[user.role];
                                const permSummary = getPermissionSummary(user);
                                return (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--secondary)/0.3)] transition-colors"
                                    >
                                        <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 bg-gradient-to-br ${role?.color || 'from-gray-500 to-gray-600'} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{user.fullName}</p>
                                                    {String(user.id) === String(currentUser.id) && (
                                                        <span className="text-xs text-blue-500">(Siz)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-[hsl(var(--secondary))] rounded text-xs font-mono">
                                                {user.username}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <RoleIcon roleKey={user.role} size={16} variant="flat" />
                                                <span className="text-xs font-medium">{role?.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {permSummary.map(p => (
                                                    <span
                                                        key={p.key}
                                                        className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${p.edit
                                                            ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                                                            }`}
                                                        title={p.edit ? 'Ko\'rish + Tahrirlash' : 'Faqat ko\'rish'}
                                                    >
                                                        <PermIcon permKey={p.key} size={10} variant="icon" />
                                                        {p.label}
                                                    </span>
                                                ))}
                                                {permSummary.length === 0 && (
                                                    <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                                                    title="Tahrirlash"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                {deleteConfirm === user.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                                        >
                                                            Ha, o'chir
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-2 py-1 bg-[hsl(var(--secondary))] text-xs rounded hover:opacity-80 transition-colors"
                                                        >
                                                            Yo'q
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (String(user.id) === String(currentUser.id)) {
                                                                return alert("O'zingizni o'chira olmaysiz!");
                                                            }
                                                            setDeleteConfirm(user.id);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${String(user.id) === String(currentUser.id)
                                                            ? 'text-gray-400 cursor-not-allowed opacity-40'
                                                            : 'hover:bg-red-500/10 text-red-500'
                                                            }`}
                                                        title={String(user.id) === String(currentUser.id) ? "O'zingizni o'chira olmaysiz" : "O'chirish"}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-[hsl(var(--muted-foreground))]">
                                        Foydalanuvchilar topilmadi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingUser={editingUser}
            />
        </div>
    );
}

// ===================== USER FORM MODAL =====================
function UserFormModal({ isOpen, onClose, onSave, editingUser }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        role: 'teacher',
        permissions: {},
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

    React.useEffect(() => {
        if (editingUser) {
            setFormData({
                fullName: editingUser.fullName,
                username: editingUser.username,
                password: '',
                role: editingUser.role,
                permissions: editingUser.permissions || ROLES[editingUser.role]?.defaultPermissions || {},
            });
        } else {
            const defaultRole = 'teacher';
            setFormData({
                fullName: '',
                username: '',
                password: '',
                role: defaultRole,
                permissions: { ...ROLES[defaultRole].defaultPermissions },
            });
        }
        setError('');
        setShowPassword(false);
        setRoleDropdownOpen(false);
    }, [editingUser, isOpen]);

    const handleRoleChange = (roleKey) => {
        setFormData(f => ({
            ...f,
            role: roleKey,
            permissions: { ...ROLES[roleKey].defaultPermissions },
        }));
        setRoleDropdownOpen(false);
    };

    const togglePermission = (permKey, type) => {
        setFormData(f => {
            const perms = { ...f.permissions };
            if (!perms[permKey]) {
                perms[permKey] = { view: false, edit: false };
            }
            perms[permKey] = { ...perms[permKey] };

            if (type === 'view') {
                perms[permKey].view = !perms[permKey].view;
                if (!perms[permKey].view) {
                    perms[permKey].edit = false;
                }
            } else if (type === 'edit') {
                perms[permKey].edit = !perms[permKey].edit;
                if (perms[permKey].edit) {
                    perms[permKey].view = true;
                }
            }

            return { ...f, permissions: perms };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            setError("F.I.SH kiriting!");
            return;
        }
        if (!formData.username.trim()) {
            setError("Login kiriting!");
            return;
        }
        if (!editingUser && !formData.password.trim()) {
            setError("Parol kiriting!");
            return;
        }

        const saveData = { ...formData };
        if (editingUser && !saveData.password) {
            delete saveData.password;
        }

        const errorMsg = onSave(saveData);
        if (errorMsg) {
            setError(errorMsg);
        }
    };

    const availableRoles = Object.entries(ROLES).filter(([key]) => key !== 'exam_taker');
    const selectedRole = ROLES[formData.role];

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] shrink-0">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            {editingUser ? <Pencil className="w-5 h-5 text-blue-500" /> : <UserPlus className="w-5 h-5 text-green-500" />}
                            {editingUser ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi"}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* F.I.SH */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                                F.I.SH (To'liq ism)
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => { setFormData(f => ({ ...f, fullName: e.target.value })); setError(''); }}
                                    placeholder="Familiya Ism..."
                                    className="w-full pl-10 pr-4 py-3 bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Login */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                                Login
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => { setFormData(f => ({ ...f, username: e.target.value })); setError(''); }}
                                    placeholder="Login..."
                                    className="w-full pl-10 pr-4 py-3 bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Parol */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                                Parol {editingUser && <span className="normal-case text-slate-500">(bo'sh qoldiring agar o'zgartirmoqchi bo'lmasangiz)</span>}
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => { setFormData(f => ({ ...f, password: e.target.value })); setError(''); }}
                                    placeholder={editingUser ? "Yangi parol..." : "Parol..."}
                                    className="w-full pl-10 pr-12 py-3 bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Rol tanlash */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                                Rol (Lavozim)
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <RoleIcon roleKey={formData.role} size={18} variant="badge" />
                                        <div className="text-left">
                                            <p className="font-medium text-sm">{selectedRole?.label}</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{selectedRole?.description}</p>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-[hsl(var(--muted-foreground))] transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {roleDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-50 overflow-hidden"
                                        >
                                            {availableRoles.map(([key, role]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => handleRoleChange(key)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--secondary))] transition-colors text-left ${formData.role === key ? 'bg-[hsl(var(--secondary)/0.5)]' : ''}`}
                                                >
                                                    <RoleIcon roleKey={key} size={16} variant="badge" />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{role.label}</p>
                                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{role.description}</p>
                                                    </div>
                                                    {formData.role === key && (
                                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <p className="text-[11px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Rol tanlaganingizda standart ruxsatlar o'rnatiladi. Keyin quyida alohida sozlashingiz mumkin.
                            </p>
                        </div>

                        {/* ============ RUXSATLAR PANELI ============ */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5" />
                                    Ruxsatlar (Menyular)
                                </label>
                                <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
                                    <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" /> Ko'rish</span>
                                    <span className="flex items-center gap-1"><PenLine className="w-3 h-3" /> Tahrirlash</span>
                                </div>
                            </div>

                            <div className="bg-[hsl(var(--secondary)/0.3)] border border-[hsl(var(--border))] rounded-xl overflow-hidden divide-y divide-[hsl(var(--border)/0.5)]">
                                {Object.entries(ALL_PERMISSIONS).map(([permKey, perm]) => {
                                    const currentPerm = formData.permissions?.[permKey] || { view: false, edit: false };
                                    return (
                                        <div key={permKey} className="flex items-center justify-between px-4 py-3 hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <PermIcon permKey={permKey} size={18} variant="badge" />
                                                <div>
                                                    <p className="text-sm font-medium">{perm.label}</p>
                                                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{perm.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePermission(permKey, 'view')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${currentPerm.view
                                                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/10'
                                                        : 'bg-[hsl(var(--secondary)/0.5)] text-[hsl(var(--muted-foreground))] border-transparent hover:border-[hsl(var(--border))]'
                                                        }`}
                                                    title="Ko'rish ruxsati"
                                                >
                                                    <EyeIcon className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Ko'rish</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => togglePermission(permKey, 'edit')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${currentPerm.edit
                                                        ? 'bg-green-500/15 text-green-400 border-green-500/30 shadow-sm shadow-green-500/10'
                                                        : 'bg-[hsl(var(--secondary)/0.5)] text-[hsl(var(--muted-foreground))] border-transparent hover:border-[hsl(var(--border))]'
                                                        }`}
                                                    title="Tahrirlash ruxsati"
                                                >
                                                    <PenLine className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Tahrir</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)] rounded-xl transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-medium"
                            >
                                {editingUser ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                {editingUser ? "Saqlash" : "Yaratish"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
