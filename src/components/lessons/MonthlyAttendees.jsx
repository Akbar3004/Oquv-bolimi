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

function getDatesInMonth(year, monthIndex, weekdayId) {
    const dates = [];
    const date = new Date(year, monthIndex, 1);
    const dayMap = { dushanba: 1, seshanba: 2, chorshanba: 3, payshanba: 4, juma: 5 };
    const target = dayMap[weekdayId];

    while (date.getDay() !== target) {
        date.setDate(date.getDate() + 1);
    }
    while (date.getMonth() === monthIndex) {
        dates.push(date.getDate());
        date.setDate(date.getDate() + 7);
    }
    return dates;
}

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
    const [selectedWorkerDates, setSelectedWorkerDates] = useState({}); // { workerId: Set([2, 9, 16]) }
    const [availableDates, setAvailableDates] = useState([]);
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

        // Sanalarni hisoblash (hafta kuni bo'yicha)
        const plan = getPlanById(slot.planId);
        const year = plan ? plan.year : new Date().getFullYear();
        const monthIndex = MONTHS.indexOf(selectedMonth);
        const dates = getDatesInMonth(year, monthIndex, slot.dayId);
        setAvailableDates(dates);

        // Shu oy va shu slot uchun xodimlarni yuklash
        const monthData = attendees[selectedMonth] || {};
        const slotAttendees = monthData[slot.id] || {};

        const initialData = {};
        if (Array.isArray(slotAttendees)) {
            // Eskicha format (faqat IDlar massivi) -> barcha sanalarga belgilash
            slotAttendees.forEach(wid => {
                initialData[wid] = new Set(dates);
            });
        } else {
            // Yangi format ({ workerId: [2, 9, 16] })
            for (const [wid, days] of Object.entries(slotAttendees)) {
                initialData[wid] = new Set(days);
            }
        }
        setSelectedWorkerDates(initialData);
    };

    const toggleWorkerDate = (workerId, dateNum) => {
        setSelectedWorkerDates(prev => {
            const next = { ...prev };
            const nextSet = next[workerId] ? new Set(next[workerId]) : new Set();

            if (nextSet.has(dateNum)) {
                nextSet.delete(dateNum);
                if (nextSet.size === 0) delete next[workerId];
                else next[workerId] = nextSet;
            } else {
                nextSet.add(dateNum);
                next[workerId] = nextSet;
            }
            return next;
        });
    };

    const toggleWorkerAllDates = (workerId) => {
        setSelectedWorkerDates(prev => {
            const next = { ...prev };
            const currentSize = next[workerId]?.size || 0;
            if (currentSize === availableDates.length) {
                delete next[workerId]; // barchasini o'chirish
            } else {
                next[workerId] = new Set(availableDates); // barchasini tanlash
            }
            return next;
        });
    };

    const toggleColumnDate = (dateNum, eligibleList) => {
        setSelectedWorkerDates(prev => {
            const next = { ...prev };
            const isAllChecked = eligibleList.length > 0 && eligibleList.every(w => next[w.id]?.has(dateNum));

            eligibleList.forEach(w => {
                const nextSet = next[w.id] ? new Set(next[w.id]) : new Set();
                if (isAllChecked) {
                    nextSet.delete(dateNum);
                    if (nextSet.size === 0) delete next[w.id];
                    else next[w.id] = nextSet;
                } else {
                    nextSet.add(dateNum);
                    next[w.id] = nextSet;
                }
            });
            return next;
        });
    };

    const toggleAllGridWorkers = (eligibleList) => {
        setSelectedWorkerDates(prev => {
            const next = { ...prev };
            const isAllChecked = eligibleList.length > 0 && eligibleList.every(w => {
                const s = next[w.id];
                return s && s.size === availableDates.length;
            });

            if (isAllChecked) {
                eligibleList.forEach(w => { delete next[w.id]; });
            } else {
                eligibleList.forEach(w => { next[w.id] = new Set(availableDates); });
            }
            return next;
        });
    };

    const saveAttendees = () => {
        if (!editingSlot) return;
        const monthData = attendees[selectedMonth] || {};

        const toSave = {};
        for (const [wid, dateSet] of Object.entries(selectedWorkerDates)) {
            if (dateSet.size > 0) {
                toSave[wid] = Array.from(dateSet);
            }
        }

        monthData[editingSlot.id] = toSave;

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
        const slotData = monthData[slotId];
        if (!slotData) return 0;
        if (Array.isArray(slotData)) return slotData.length; // oldingi versiya
        return Object.keys(slotData).length; // yangi versiya (har bir xodim bitta hisobiga kiradi)
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
                                        Tanlandi: {Object.keys(selectedWorkerDates).length} ta xodim
                                    </span>
                                </div>
                            </div>

                            {/* Xodimlar va Sanalar Matritsasi */}
                            <div className="p-0 overflow-y-auto overflow-x-auto flex-1 h-full max-h-[50vh] min-h-[50vh]">
                                {eligibleWorkers.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <Users size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                                        <p className="text-sm">Ushbu sexlarga tegishli xodimlar topilmadi</p>
                                        {searchQuery && <p className="text-xs mt-1">Qidiruv bo'yicha natija yo'q</p>}
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse min-w-max">
                                        <thead className="sticky top-0 bg-[hsl(var(--secondary))] z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3 border-b text-xs font-semibold text-[hsl(var(--muted-foreground))]">F.I.SH va Tabel</th>
                                                <th className="px-3 py-3 border-b text-center border-l border-[hsl(var(--border))] w-20">
                                                    <span className="text-[10px] block mb-1 font-semibold text-indigo-400">Barchasi</span>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-indigo-500 cursor-pointer rounded transition-transform active:scale-95"
                                                        checked={eligibleWorkers.length > 0 && eligibleWorkers.every(w => selectedWorkerDates[w.id]?.size === availableDates.length)}
                                                        onChange={() => toggleAllGridWorkers(eligibleWorkers)}
                                                    />
                                                </th>
                                                {availableDates.map(date => {
                                                    const isAllChecked = eligibleWorkers.length > 0 && eligibleWorkers.every(w => selectedWorkerDates[w.id]?.has(date));
                                                    return (
                                                        <th key={date} className="px-3 py-3 border-b text-center text-xs font-semibold border-l border-[hsl(var(--border))] w-20 hover:bg-[hsl(var(--border)/0.2)] transition-colors">
                                                            <span className="block mb-1 text-[hsl(var(--foreground))]">{date} <span className="opacity-50">{selectedMonth.slice(0, 3)}</span></span>
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 accent-indigo-500 cursor-pointer rounded transition-transform active:scale-95"
                                                                checked={isAllChecked}
                                                                onChange={() => toggleColumnDate(date, eligibleWorkers)}
                                                            />
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eligibleWorkers.map(worker => {
                                                const wSet = selectedWorkerDates[worker.id] || new Set();
                                                const isAll = wSet.size === availableDates.length && availableDates.length > 0;
                                                const isAny = wSet.size > 0;

                                                return (
                                                    <tr key={worker.id} className={`border-b border-[hsl(var(--border)/0.5)] transition-colors hover:bg-[hsl(var(--secondary)/0.3)] ${isAny ? 'bg-indigo-500/5' : ''}`}>
                                                        <td className="px-4 py-3 flex flex-col justify-center">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className={`text-sm font-semibold leading-tight ${isAny ? 'text-indigo-400' : ''}`}>{worker.name}</p>
                                                                {wSet.size > 0 && (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                                                        {wSet.size} kun
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] px-1.5 rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-mono">T: {worker.tabelId}</span>
                                                                <span className="text-[10px] px-1.5 rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">{worker.sex}</span>
                                                                <span className="text-[10px] px-1.5 rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] line-clamp-1">{worker.lavozim}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-center border-l border-[hsl(var(--border)/0.5)] bg-[hsl(var(--secondary)/0.1)]">
                                                            <input
                                                                type="checkbox"
                                                                checked={isAll}
                                                                onChange={() => toggleWorkerAllDates(worker.id)}
                                                                className="w-4 h-4 accent-indigo-500 cursor-pointer rounded transition-transform active:scale-95"
                                                            />
                                                        </td>
                                                        {availableDates.map(date => (
                                                            <td key={date} className={`px-3 py-3 text-center border-l border-[hsl(var(--border)/0.5)] transition-colors ${wSet.has(date) ? 'bg-indigo-500/5' : 'hover:bg-[hsl(var(--secondary))]'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={wSet.has(date)}
                                                                    onChange={() => toggleWorkerDate(worker.id, date)}
                                                                    className="w-4 h-4 accent-indigo-500 cursor-pointer rounded transition-transform active:scale-95"
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
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
