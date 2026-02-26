import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Calendar, Clock, User, MapPin, CheckCircle2, XCircle, AlertCircle, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddLessonModal from './AddLessonModal';

const STATUS_CONFIG = {
    planned: {
        label: 'Rejalashtirilgan',
        icon: AlertCircle,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
        dot: 'bg-blue-400',
    },
    completed: {
        label: 'O\'tkazildi',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        dot: 'bg-emerald-400',
    },
    cancelled: {
        label: 'Bekor qilindi',
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
        dot: 'bg-red-400',
    },
};

const MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export default function LessonSchedule({ lessons, topics, onLessonsChange, onNavigateToAttendance }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
    const [statusFilter, setStatusFilter] = useState('all');

    // Filtrlash
    const filteredLessons = lessons
        .filter(l => {
            const lessonDate = new Date(l.date);
            const monthName = MONTHS[lessonDate.getMonth()];
            return monthName === selectedMonth;
        })
        .filter(l => statusFilter === 'all' || l.status === statusFilter)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleSaveLesson = (lessonData) => {
        if (editingLesson) {
            onLessonsChange(lessons.map(l => l.id === lessonData.id ? lessonData : l));
        } else {
            onLessonsChange([...lessons, lessonData]);
        }
        setEditingLesson(null);
    };

    const handleDeleteLesson = (id) => {
        if (confirm('Ushbu darsni o\'chirmoqchimisiz?')) {
            onLessonsChange(lessons.filter(l => l.id !== id));
        }
    };

    const handleEdit = (lesson) => {
        setEditingLesson(lesson);
        setIsModalOpen(true);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Statistika
    const stats = {
        total: filteredLessons.length,
        completed: filteredLessons.filter(l => l.status === 'completed').length,
        planned: filteredLessons.filter(l => l.status === 'planned').length,
        cancelled: filteredLessons.filter(l => l.status === 'cancelled').length,
    };

    return (
        <div className="space-y-6">
            {/* Mini Statistika */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Jami', value: stats.total, color: 'from-slate-500 to-gray-600', icon: Calendar },
                    { label: 'O\'tkazildi', value: stats.completed, color: 'from-emerald-500 to-green-600', icon: CheckCircle2 },
                    { label: 'Rejalashtirilgan', value: stats.planned, color: 'from-blue-500 to-cyan-600', icon: AlertCircle },
                    { label: 'Bekor qilindi', value: stats.cancelled, color: 'from-red-500 to-rose-600', icon: XCircle },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-xl text-white/80`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filtr satri */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {MONTHS.map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedMonth(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedMonth === m
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
                                }`}
                        >
                            {m.slice(0, 3)}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 shrink-0">
                    {/* Status filtri */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-xs focus:ring-2 focus:ring-blue-500/50 outline-none"
                    >
                        <option value="all">Barcha holatlar</option>
                        <option value="planned">Rejalashtirilgan</option>
                        <option value="completed">O'tkazildi</option>
                        <option value="cancelled">Bekor qilindi</option>
                    </select>

                    <button
                        onClick={() => { setEditingLesson(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98]"
                    >
                        <Plus size={16} /> Yangi Dars
                    </button>
                </div>
            </div>

            {/* Darslar ro'yxati */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredLessons.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <Calendar size={48} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-30" />
                            <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                {selectedMonth} oyida darslar mavjud emas
                            </p>
                            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1 opacity-60">
                                "Yangi Dars" tugmasini bosib dars qo'shing
                            </p>
                        </motion.div>
                    ) : (
                        filteredLessons.map((lesson, index) => {
                            const statusConfig = STATUS_CONFIG[lesson.status] || STATUS_CONFIG.planned;
                            const StatusIcon = statusConfig.icon;

                            return (
                                <motion.div
                                    key={lesson.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                    transition={{ delay: index * 0.04 }}
                                    layout
                                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {/* Sana bloki */}
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center shrink-0">
                                                <span className="text-lg font-bold text-blue-400">{new Date(lesson.date).getDate()}</span>
                                                <span className="text-[9px] text-blue-300/70 -mt-0.5">{MONTHS[new Date(lesson.date).getMonth()]?.slice(0, 3)}</span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm">{lesson.topicName}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} /> {lesson.time} • {lesson.duration} daq
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} /> {lesson.instructor}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} /> {lesson.location}
                                                    </span>
                                                    {lesson.attendees && lesson.attendees.length > 0 && (
                                                        <span className="flex items-center gap-1 text-emerald-400">
                                                            <Users size={12} /> {lesson.attendees.length} qatnashchi
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div className="mt-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border ${statusConfig.bg} ${statusConfig.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amallar */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {onNavigateToAttendance && (
                                                <button
                                                    onClick={() => onNavigateToAttendance(lesson)}
                                                    className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Qatnashish jurnali"
                                                >
                                                    <Users size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(lesson)}
                                                className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Tahrirlash"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="O'chirish"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AddLessonModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingLesson(null); }}
                onSave={handleSaveLesson}
                editData={editingLesson}
                topics={topics}
            />
        </div>
    );
}
