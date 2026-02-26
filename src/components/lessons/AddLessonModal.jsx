import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, Clock, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
    '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const STATUS_OPTIONS = [
    { value: 'planned', label: 'Rejalashtirilgan', color: 'text-blue-400' },
    { value: 'completed', label: 'O\'tkazildi', color: 'text-emerald-400' },
    { value: 'cancelled', label: 'Bekor qilindi', color: 'text-red-400' },
];

export default function AddLessonModal({ isOpen, onClose, onSave, editData, topics }) {
    const [formData, setFormData] = useState({
        topicId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: '90',
        instructor: '',
        location: 'O\'quv xonasi №1',
        status: 'planned',
        notes: '',
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                topicId: editData.topicId || '',
                date: editData.date || new Date().toISOString().split('T')[0],
                time: editData.time || '09:00',
                duration: editData.duration || '90',
                instructor: editData.instructor || '',
                location: editData.location || 'O\'quv xonasi №1',
                status: editData.status || 'planned',
                notes: editData.notes || '',
            });
        } else {
            setFormData({
                topicId: topics.length > 0 ? topics[0].id.toString() : '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                duration: '90',
                instructor: '',
                location: 'O\'quv xonasi №1',
                status: 'planned',
                notes: '',
            });
        }
    }, [editData, isOpen, topics]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.topicId || !formData.instructor.trim()) return;

        const topic = topics.find(t => t.id.toString() === formData.topicId.toString());
        onSave({
            ...formData,
            id: editData?.id || Date.now(),
            topicName: topic?.name || 'Noma\'lum mavzu',
            topicCategory: topic?.category || '',
            attendees: editData?.attendees || [],
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
                        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Sarlavha */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                    <CalendarPlus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{editData ? 'Darsni Tahrirlash' : 'Yangi Dars'}</h2>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Dars ma'lumotlarini kiriting</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Mavzu tanlash */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                    <BookOpen size={14} className="inline mr-1.5" />Mavzu
                                </label>
                                <select
                                    value={formData.topicId}
                                    onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                    required
                                >
                                    <option value="">Mavzuni tanlang...</option>
                                    {topics.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.month})</option>
                                    ))}
                                </select>
                                {topics.length === 0 && (
                                    <p className="text-xs text-amber-400 mt-1">⚠️ Avval "Mavzular" bo'limida mavzu qo'shing</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Sana */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                        📅 Sana
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Vaqt */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                        <Clock size={14} className="inline mr-1.5" />Vaqt
                                    </label>
                                    <select
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                    >
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Davomiylik */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                        ⏱️ Davomiylik (daqiqa)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                        min="15"
                                        max="480"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                        📊 Holat
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* O'qituvchi */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                    <User size={14} className="inline mr-1.5" />O'qituvchi
                                </label>
                                <input
                                    type="text"
                                    value={formData.instructor}
                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Masalan: Abdullayev A.B."
                                    required
                                />
                            </div>

                            {/* Joylashuv */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                    📍 Joylashuv
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                    placeholder="O'quv xonasi raqami"
                                />
                            </div>

                            {/* Izoh */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">
                                    📝 Izoh (ixtiyoriy)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none"
                                    rows={2}
                                    placeholder="Qo'shimcha ma'lumot..."
                                />
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
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98]"
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
