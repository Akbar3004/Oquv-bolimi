import React, { useState, useEffect } from 'react';
import { Users, Calendar, Search, Check, X, Save, AlertCircle, CheckSquare, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const WEEKDAYS = {
    dushanba: 'Dushanba',
    seshanba: 'Seshanba',
    chorshanba: 'Chorshanba',
    payshanba: 'Payshanba',
    juma: 'Juma'
};

const STORAGE_KEY = 'oquv_monthly_attendees';

// Sexlarni solishtirish uchun yordamchi funksiya
const extractWorkshopKeys = (str) => {
    if (!str) return [];
    const numbers = str.match(/\d+/g);
    if (numbers && numbers.length > 0) {
        return numbers.map(n => Number(n).toString()); // "02" -> "2"
    }
    return [str.toLowerCase().trim()];
};

const isWorkerEligible = (workerSex, planWorkshops) => {
    const workerKeys = extractWorkshopKeys(workerSex);
    const planKeys = planWorkshops.flatMap(pw => extractWorkshopKeys(pw));
    return workerKeys.some(wk => planKeys.includes(wk));
};

export default function MonthlyAttendees({ annualPlans, workers }) {
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);

    const [schedule, setSchedule] = useState(() => {
        try {
            const saved = localStorage.getItem('oquv_weekly_schedule');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    const [attendees, setAttendees] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    const [editingSlot, setEditingSlot] = useState(null); // qaysi slot tahrirlanyapti (id)
    const [selectedWorkerIds, setSelectedWorkerIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
    }, [attendees]);

    // Barcha slotlarni tekis massivga (flat array) aylantirish
    const allSlots = Object.entries(schedule).flatMap(([dayId, slots]) =>
        (slots || []).map(slot => ({ ...slot, dayId }))
    );

    // Kunga va vaqtga qarab tartiblash
    const dayOrder = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma'];
    allSlots.sort((a, b) => {
        const dDiff = dayOrder.indexOf(a.dayId) - dayOrder.indexOf(b.dayId);
        if (dDiff !== 0) return dDiff;
        return (a.time || '').localeCompare(b.time || '');
    });

    const getPlanById = (id) => annualPlans.find(p => p.id === parseInt(id) || p.id === id);

    const openAssignModal = (slot) => {
        setEditingSlot(slot);
        setSearchQuery('');
        // Shu oy va shu slot uchun oldindan belgilangan xodimlarni yuklash
        const monthData = attendees[selectedMonth] || {};
        const slotAttendees = monthData[slot.id] || [];
        setSelectedWorkerIds(new Set(slotAttendees));
    };

    const toggleWorker = (id) => {
        const newSet = new Set(selectedWorkerIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedWorkerIds(newSet);
    };

    const toggleAllWorkers = (eligibleWorkers) => {
        if (selectedWorkerIds.size === eligibleWorkers.length) {
            setSelectedWorkerIds(new Set());
        } else {
            setSelectedWorkerIds(new Set(eligibleWorkers.map(w => w.id)));
        }
    };

    const saveAttendees = () => {
        if (!editingSlot) return;
        const monthData = attendees[selectedMonth] || {};
        monthData[editingSlot.id] = Array.from(selectedWorkerIds);

        setAttendees(prev => ({
            ...prev,
            [selectedMonth]: monthData
        }));

        setEditingSlot(null);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const getAssignedCount = (slotId) => {
        const monthData = attendees[selectedMonth] || {};
        return (monthData[slotId] || []).length;
    };

    // Modal ma'lumotlari
    let eligibleWorkers = [];
    if (editingSlot) {
        eligibleWorkers = workers.filter(w => isWorkerEligible(w.sex, editingSlot.workshops || []));
        if (searchQuery) {
            eligibleWorkers = eligibleWorkers.filter(w =>
                w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (w.tabelId && w.tabelId.toString().includes(searchQuery))
            );
        }
    }

    return (
        <div className="space-y-6">
            {/* Sarlavha */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Oylik Ishtirokchilar
                        <Users size={20} className="text-indigo-400" />
                    </h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                        Haftalik dars jadvaliga muvofiq qaysi xodimlar qatnashishini belgilang
                    </p>
                </div>

                <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl p-1.5 flex flex-wrap gap-1 max-w-[400px]">
                    {MONTHS.map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedMonth(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedMonth === m
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
                                }`}
                        >
                            {m.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asosiy Kartalar ro'yxati */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allSlots.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
                        <Calendar size={48} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-30" />
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">
                            Haftalik dars jadvali hali tuzilmagan
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 opacity-70">
                            Oldin haftalik jadvalni shakllantiring
                        </p>
                    </div>
                ) : (
                    allSlots.map(slot => {
                        const plan = getPlanById(slot.planId);
                        const assignedCount = getAssignedCount(slot.id);

                        // Ushbu slot uchun mos keladigan jami xodimlar soni
                        const totalEligible = workers.filter(w => isWorkerEligible(w.sex, slot.workshops || [])).length;

                        return (
                            <motion.div
                                key={slot.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 flex flex-col hover:border-indigo-500/30 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-indigo-400">
                                                {WEEKDAYS[slot.dayId]}
                                            </p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                                                Soat: {slot.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${assignedCount > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                        {assignedCount} / {totalEligible} xodim
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2 mb-4">
                                    {plan ? (
                                        <div>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">Yillik Reja:</p>
                                            <p className="text-sm font-medium leading-tight line-clamp-2">{plan.name}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm italic text-[hsl(var(--muted-foreground))]">Reja biriktirilmagan</p>
                                    )}

                                    <div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Sexlar:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(slot.workshops || []).map((w, i) => (
                                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
                                                    Sex {w}
                                                </span>
                                            ))}
                                            {(slot.workshops || []).length === 0 && (
                                                <span className="text-xs italic opacity-50">Ko'rsatilmagan</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openAssignModal(slot)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
                                >
                                    <CheckSquare size={14} />
                                    {assignedCount > 0 ? 'Ishtirokchilarni yangilash' : "Ishtirokchilarni tanlash"}
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* ===== Ishtirokchilarni Belgilash Modali ===== */}
            <AnimatePresence>
                {editingSlot && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingSlot(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        Ishtirokchilarni belgilash <span className="text-indigo-400">({selectedMonth})</span>
                                    </h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                                        {WEEKDAYS[editingSlot.dayId]}, {editingSlot.time} • Sex: {editingSlot.workshops?.join(', ')}
                                    </p>
                                </div>
                                <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-xl transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Qidiruv va Statistikasi */}
                            <div className="p-4 border-b border-[hsl(var(--border))] shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[hsl(var(--secondary)/0.3)]">
                                <div className="relative w-full sm:w-64">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Xodimni ism/tabel bo'yicha qidirish..."
                                        className="w-full pl-9 pr-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <span className="text-xs font-medium px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md">
                                        Tanlandi: {selectedWorkerIds.size} ta
                                    </span>
                                    <button
                                        onClick={() => toggleAllWorkers(eligibleWorkers)}
                                        className="px-3 py-1.5 text-xs font-medium border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                                    >
                                        Barchasini {selectedWorkerIds.size === eligibleWorkers.length ? 'bekor qilish' : 'tanlash'}
                                    </button>
                                </div>
                            </div>

                            {/* Xodimlar ro'yxati */}
                            <div className="p-4 overflow-y-auto flex-1 space-y-2">
                                {eligibleWorkers.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <Users size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                                        <p className="text-sm">Ushbu sexlarga tegishli xodimlar topilmadi</p>
                                        {searchQuery && <p className="text-xs mt-1">Qidiruv bo'yicha natija yo'q</p>}
                                    </div>
                                ) : (
                                    eligibleWorkers.map(worker => {
                                        const isSelected = selectedWorkerIds.has(worker.id);
                                        return (
                                            <div
                                                key={worker.id}
                                                onClick={() => toggleWorker(worker.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                                                        ? 'bg-indigo-500/5 border-indigo-500 text-indigo-400 shadow-sm'
                                                        : 'bg-[hsl(var(--secondary))] border-[hsl(var(--border))] hover:border-indigo-500/40 text-[hsl(var(--foreground))]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-[hsl(var(--muted-foreground))] text-transparent'
                                                        }`}>
                                                        <Check size={14} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-400' : ''}`}>
                                                            {worker.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                                                            <span className="bg-[hsl(var(--background))] px-1.5 py-0.5 rounded border border-[hsl(var(--border))]">Tabel: {worker.tabelId}</span>
                                                            <span className="bg-[hsl(var(--background))] px-1.5 py-0.5 rounded border border-[hsl(var(--border))]">{worker.sex}</span>
                                                            <span className="bg-[hsl(var(--background))] px-1.5 py-0.5 rounded border border-[hsl(var(--border))] truncate max-w-[150px]">{worker.lavozim}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-[hsl(var(--border))] shrink-0 flex items-center justify-between bg-[hsl(var(--secondary)/0.3)]">
                                <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                    <Info size={14} /> Jami ro'yxatda: {eligibleWorkers.length} ta xodim
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingSlot(null)} className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors text-sm font-medium">
                                        Bekor qilish
                                    </button>
                                    <button onClick={saveAttendees} className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 transition-colors text-sm font-semibold flex items-center gap-2">
                                        <Save size={16} /> Saqlash
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Saqlandi xabari */}
            <AnimatePresence>
                {isSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25 text-sm font-medium z-50"
                    >
                        <Check size={16} /> Ishtirokchilar saqlandi!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
