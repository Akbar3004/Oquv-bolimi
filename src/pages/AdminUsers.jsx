import React, { useState } from 'react';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Pencil, Trash2, X, Eye, EyeOff, Shield, Search,
    User, KeyRound, AlertCircle, CheckCircle, ChevronDown
} from 'lucide-react';

export default function AdminUsers() {
    const { users, currentUser, createUser, updateUser, deleteUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [notification, setNotification] = useState(null);

    // Faqat admin ko'rishi mumkin
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

    // Filtrlash (admin o'zini ko'radi lekin o'chira olmaydi)
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(ROLES).filter(([key]) => key !== 'exam_taker').map(([key, role]) => {
                    const count = users.filter(u => u.role === key).length;
                    return (
                        <div key={key} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center text-lg shadow-sm`}>
                                {role.icon}
                            </div>
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
                                                    {user.id === currentUser.id && (
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
                                                <span className="text-lg">{role?.icon}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${role?.color || ''} bg-clip-text text-transparent`}>
                                                    {role?.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {role?.permissions.map(p => (
                                                    <span key={p} className="text-[10px] px-1.5 py-0.5 bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] rounded">
                                                        {p}
                                                    </span>
                                                ))}
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
                                                {user.id !== currentUser.id && (
                                                    <>
                                                        {deleteConfirm === user.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                                                >
                                                                    Ha
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
                                                                onClick={() => setDeleteConfirm(user.id)}
                                                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                                title="O'chirish"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </>
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
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

    // Form ma'lumotlarini yangilash
    React.useEffect(() => {
        if (editingUser) {
            setFormData({
                fullName: editingUser.fullName,
                username: editingUser.username,
                password: '', // Parolni ko'rsatmaymiz
                role: editingUser.role,
            });
        } else {
            setFormData({
                fullName: '',
                username: '',
                password: '',
                role: 'teacher',
            });
        }
        setError('');
        setShowPassword(false);
    }, [editingUser, isOpen]);

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

        // Saqlash
        const saveData = { ...formData };
        if (editingUser && !saveData.password) {
            delete saveData.password; // Bo'sh parolni yubormaymiz
        }

        const errorMsg = onSave(saveData);
        if (errorMsg) {
            setError(errorMsg);
        }
    };

    const availableRoles = Object.entries(ROLES).filter(([key]) => key !== 'exam_taker');
    const selectedRole = ROLES[formData.role];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            {editingUser ? <Pencil className="w-5 h-5 text-blue-500" /> : <UserPlus className="w-5 h-5 text-green-500" />}
                            {editingUser ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi"}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4" />
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
                                        <span className="text-lg">{selectedRole?.icon}</span>
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
                                                    onClick={() => {
                                                        setFormData(f => ({ ...f, role: key }));
                                                        setRoleDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--secondary))] transition-colors text-left ${formData.role === key ? 'bg-[hsl(var(--secondary)/0.5)]' : ''}`}
                                                >
                                                    <span className="text-lg">{role.icon}</span>
                                                    <div>
                                                        <p className="font-medium text-sm">{role.label}</p>
                                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{role.description}</p>
                                                    </div>
                                                    {formData.role === key && (
                                                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
            </motion.div>
        </AnimatePresence>
    );
}
