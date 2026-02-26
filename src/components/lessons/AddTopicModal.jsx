import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, AlignLeft, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const CATEGORIES = [
    'Texnik xavfsizlik',
    'Yangi texnologiyalar',
    'Mexanika va ta\'mirlash',
    'Elektr jihozlari',
    'Sanitariya va gigiyena',
    'O\'t xavfsizligi',
    'Mehnat muhofazasi',
    'Boshqa',
];

export default function AddTopicModal({ isOpen, onClose, onSave, editData }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '90',
        month: MONTHS[new Date().getMonth()],
        category: CATEGORIES[0],
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name || '',
                description: editData.description || '',
                duration: editData.duration || '90',
                month: editData.month || MONTHS[new Date().getMonth()],
                category: editData.category || CATEGORIES[0],
            });
        } else {
            setFormData({
                name: '',
                description: '',
                duration: '90',
                month: MONTHS[new Date().getMonth()],
                category: CATEGORIES[0],
            });
        }
    }, [editData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        onSave({
            ...formData,
            id: editData?.id || Date.now(),
            duration: formData.duration,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Sarlavha */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg shadow-violet-500/20">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{editData ? 'Mavzuni Tahrirlash' : 'Yangi Mavzu'}</h2>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Dars mavzusi ma'lumotlarini kiriting</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Mavzu nomi */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                    <BookOpen size={14} className="inline mr-1.5" />Mavzu nomi
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all"
                                    placeholder="Masalan: Elektr sxemalar asoslari"
                                    required
                                />
                            </div>

                            {/* Tavsifi */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                    <AlignLeft size={14} className="inline mr-1.5" />Tavsifi
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all resize-none"
                                    rows={3}
                                    placeholder="Mavzu haqida qisqacha ma'lumot..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Oy */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                        📅 Oy
                                    </label>
                                    <select
                                        value={formData.month}
                                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all"
                                    >
                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>

                                {/* Davomiylik */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                        <Clock size={14} className="inline mr-1.5" />Davomiylik (daqiqa)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all"
                                        min="15"
                                        max="480"
                                    />
                                </div>
                            </div>

                            {/* Kategoriya */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                    <Tag size={14} className="inline mr-1.5" />Kategoriya
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Tugmalar */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--border))] rounded-xl text-sm font-medium transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all active:scale-[0.98]"
                                >
                                    {editData ? 'Saqlash' : 'Qo\'shish'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
