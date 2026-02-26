import React, { useState, useEffect } from 'react';
import { Search, Check, X, Users, Calendar, Clock, User, ChevronDown, Save, ArrowLeft, CheckCheck, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendanceTracker({ lessons, workers, onLessonsChange, selectedLesson: initialLesson }) {
    const [selectedLesson, setSelectedLesson] = useState(initialLesson || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [workshopFilter, setWorkshopFilter] = useState('all');
    const [attendanceMap, setAttendanceMap] = useState({});
    const [isSaved, setIsSaved] = useState(false);

    // Lesson tanlanganda attendees ni yuklash
    useEffect(() => {
        if (selectedLesson) {
            const map = {};
            (selectedLesson.attendees || []).forEach(id => {
                map[id] = true;
            });
            setAttendanceMap(map);
            setIsSaved(false);
        }
    }, [selectedLesson]);

    useEffect(() => {
        if (initialLesson) {
            setSelectedLesson(initialLesson);
        }
    }, [initialLesson]);

    // Sexlar ro'yxati
    const workshops = [...new Set(workers.map(w => w.sex))].sort();

    // Filtrlangan ishchilar
    const filteredWorkers = workers
        .filter(w => workshopFilter === 'all' || w.sex === workshopFilter)
        .filter(w =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (w.tabelId && w.tabelId.toString().includes(searchQuery))
        );

    const toggleAttendance = (workerId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [workerId]: !prev[workerId]
        }));
        setIsSaved(false);
    };

    const selectAll = () => {
        const newMap = { ...attendanceMap };
        filteredWorkers.forEach(w => { newMap[w.id] = true; });
        setAttendanceMap(newMap);
        setIsSaved(false);
    };

    const deselectAll = () => {
        const newMap = { ...attendanceMap };
        filteredWorkers.forEach(w => { newMap[w.id] = false; });
        setAttendanceMap(newMap);
        setIsSaved(false);
    };

    const handleSave = () => {
        if (!selectedLesson) return;

        const attendees = Object.entries(attendanceMap)
            .filter(([_, present]) => present)
            .map(([id, _]) => parseInt(id) || id);

        const updatedLesson = {
            ...selectedLesson,
            attendees,
            status: attendees.length > 0 ? 'completed' : selectedLesson.status,
        };

        onLessonsChange(prev => prev.map(l => l.id === selectedLesson.id ? updatedLesson : l));
        setSelectedLesson(updatedLesson);
        setIsSaved(true);

        setTimeout(() => setIsSaved(false), 2000);
    };

    const attendeeCount = Object.values(attendanceMap).filter(Boolean).length;

    // O'tkazilgan darslar
    const completedOrPlannedLessons = lessons
        .filter(l => l.status !== 'cancelled')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!selectedLesson) {
        return (
            <div className="space-y-6">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold mb-2">Qatnashish Jurnali</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Qatnashishni belgilash uchun darsni tanlang
                    </p>
                </div>

                {completedOrPlannedLessons.length === 0 ? (
                    <div className="text-center py-16">
                        <Calendar size={48} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-30" />
                        <p className="text-[hsl(var(--muted-foreground))] text-sm">Hech qanday dars mavjud emas</p>
                        <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1 opacity-60">Avval "Dars Jadvali" bo'limida dars qo'shing</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {completedOrPlannedLessons.map((lesson, index) => (
                            <motion.button
                                key={lesson.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                onClick={() => setSelectedLesson(lesson)}
                                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 text-left hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{lesson.topicName}</h4>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={11} /> {new Date(lesson.date).toLocaleDateString('uz-UZ')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} /> {lesson.time}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                                                <User size={11} /> {lesson.instructor}
                                            </span>
                                            {lesson.attendees && lesson.attendees.length > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                    <Users size={11} /> {lesson.attendees.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDown size={16} className="text-[hsl(var(--muted-foreground))] group-hover:text-emerald-400 transition-colors rotate-[-90deg]" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Orqaga tugmasi va dars ma'lumotlari */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{selectedLesson.topicName}</h3>
                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        <span className="flex items-center gap-1">
                            <Calendar size={11} /> {new Date(selectedLesson.date).toLocaleDateString('uz-UZ')}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={11} /> {selectedLesson.time}
                        </span>
                        <span className="flex items-center gap-1">
                            <User size={11} /> {selectedLesson.instructor}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-medium text-emerald-400">
                        <Users size={12} className="inline mr-1" />{attendeeCount} / {workers.length}
                    </span>
                </div>
            </div>

            {/* Filtrlar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Ism yoki tabel raqami bo'yicha qidirish..."
                    />
                </div>

                <select
                    value={workshopFilter}
                    onChange={(e) => setWorkshopFilter(e.target.value)}
                    className="px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                >
                    <option value="all">Barcha sexlar</option>
                    {workshops.map(w => <option key={w} value={w}>{w}</option>)}
                </select>

                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                        <CheckCheck size={14} className="inline mr-1" /> Barchasini belgilash
                    </button>
                    <button
                        onClick={deselectAll}
                        className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors"
                    >
                        <X size={14} className="inline mr-1" /> Tozalash
                    </button>
                </div>
            </div>

            {/* Xodimlar ro'yxati */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                {/* Jadval sarlavha */}
                <div className="grid grid-cols-[auto_1fr_100px_100px_60px] gap-3 px-4 py-3 bg-[hsl(var(--secondary)/0.5)] border-b border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    <span className="w-5">№</span>
                    <span>F.I.SH</span>
                    <span className="text-center">Tabel №</span>
                    <span className="text-center">Sex</span>
                    <span className="text-center">✓</span>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {filteredWorkers.length === 0 ? (
                        <div className="text-center py-10 text-sm text-[hsl(var(--muted-foreground))]">
                            Xodim topilmadi
                        </div>
                    ) : (
                        filteredWorkers.map((worker, index) => {
                            const isPresent = attendanceMap[worker.id] || false;

                            return (
                                <motion.div
                                    key={worker.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => toggleAttendance(worker.id)}
                                    className={`grid grid-cols-[auto_1fr_100px_100px_60px] gap-3 px-4 py-3 border-b border-[hsl(var(--border)/0.5)] cursor-pointer transition-all hover:bg-[hsl(var(--secondary)/0.3)] ${isPresent ? 'bg-emerald-500/5' : ''}`}
                                >
                                    <span className="text-xs text-[hsl(var(--muted-foreground))] w-5">{index + 1}</span>
                                    <span className={`text-sm font-medium truncate ${isPresent ? 'text-emerald-300' : ''}`}>
                                        {worker.name}
                                    </span>
                                    <span className="text-xs text-[hsl(var(--muted-foreground))] text-center">{worker.tabelId || '-'}</span>
                                    <span className="text-xs text-[hsl(var(--muted-foreground))] text-center">{worker.sex}</span>
                                    <div className="flex justify-center">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isPresent
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-[hsl(var(--border))] hover:border-emerald-500/50'
                                            }`}>
                                            {isPresent && <Check size={14} />}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Saqlash tugmasi */}
            <div className="flex justify-end">
                <motion.button
                    onClick={handleSave}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${isSaved
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                        }`}
                >
                    {isSaved ? (
                        <><CheckCheck size={16} /> Saqlandi!</>
                    ) : (
                        <><Save size={16} /> Saqlash ({attendeeCount} qatnashchi)</>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
