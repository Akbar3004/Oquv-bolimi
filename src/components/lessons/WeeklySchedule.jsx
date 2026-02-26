import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Calendar, Clock, Users, BookOpen, Edit3, Trash2, CheckCheck, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WEEKDAYS = [
    { id: 'dushanba', name: 'Dushanba', short: 'Du', color: 'from-blue-500 to-cyan-500' },
    { id: 'seshanba', name: 'Seshanba', short: 'Se', color: 'from-violet-500 to-purple-500' },
    { id: 'chorshanba', name: 'Chorshanba', short: 'Ch', color: 'from-emerald-500 to-green-500' },
    { id: 'payshanba', name: 'Payshanba', short: 'Pa', color: 'from-amber-500 to-orange-500' },
    { id: 'juma', name: 'Juma', short: 'Ju', color: 'from-rose-500 to-pink-500' },
];

const STORAGE_KEY = 'oquv_weekly_schedule';

const DEFAULT_SCHEDULE = {};
WEEKDAYS.forEach(d => { DEFAULT_SCHEDULE[d.id] = []; });

export default function WeeklySchedule({ annualPlans }) {
    const [schedule, setSchedule] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : { ...DEFAULT_SCHEDULE };
        } catch { return { ...DEFAULT_SCHEDULE }; }
    });

    const [editingSlot, setEditingSlot] = useState(null); // { dayId, index } yoki { dayId, index: -1 } (yangi)
    const [slotForm, setSlotForm] = useState({ planId: '', workshops: [], time: '09:00', note: '' });
    const [workshopInput, setWorkshopInput] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    }, [schedule]);

    // Yillik reja topish
    const getPlanById = (id) => annualPlans.find(p => p.id === parseInt(id) || p.id === id);

    // Slot qo'shish/tahrirlash formani ochish
    const openSlotForm = (dayId, index = -1) => {
        if (index >= 0) {
            const slot = schedule[dayId][index];
            setSlotForm({
                planId: slot.planId || '',
                workshops: slot.workshops || [],
                time: slot.time || '09:00',
                note: slot.note || '',
            });
        } else {
            setSlotForm({ planId: '', workshops: [], time: '09:00', note: '' });
        }
        setEditingSlot({ dayId, index });
        setWorkshopInput('');
    };

    // Sex qo'shish
    const addWorkshopToSlot = () => {
        const val = workshopInput.trim();
        if (!val || slotForm.workshops.includes(val)) return;
        setSlotForm(prev => ({ ...prev, workshops: [...prev.workshops, val] }));
        setWorkshopInput('');
    };

    // Sex o'chirish
    const removeWorkshopFromSlot = (w) => {
        setSlotForm(prev => ({ ...prev, workshops: prev.workshops.filter(x => x !== w) }));
    };

    // Reja tanlaganda uning sexlarini avtomatik qo'shish
    const handlePlanSelect = (planId) => {
        const plan = getPlanById(planId);
        setSlotForm(prev => ({
            ...prev,
            planId,
            workshops: plan ? [...plan.workshops] : prev.workshops,
        }));
    };

    // Slotni saqlash
    const saveSlot = () => {
        if (!editingSlot) return;
        const { dayId, index } = editingSlot;
        const newSlot = {
            id: index >= 0 ? schedule[dayId][index].id : Date.now(),
            planId: slotForm.planId ? (parseInt(slotForm.planId) || slotForm.planId) : null,
            workshops: slotForm.workshops,
            time: slotForm.time,
            note: slotForm.note,
        };

        setSchedule(prev => {
            const updated = { ...prev };
            const daySlots = [...(updated[dayId] || [])];
            if (index >= 0) {
                daySlots[index] = newSlot;
            } else {
                daySlots.push(newSlot);
            }
            // Vaqt bo'yicha tartiblash
            daySlots.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
            updated[dayId] = daySlots;
            return updated;
        });

        setEditingSlot(null);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 1500);
    };

    // Slotni o'chirish
    const deleteSlot = (dayId, index) => {
        if (!confirm("Bu darsni jadvaldan o'chirmoqchimisiz?")) return;
        setSchedule(prev => {
            const updated = { ...prev };
            const daySlots = [...(updated[dayId] || [])];
            daySlots.splice(index, 1);
            updated[dayId] = daySlots;
            return updated;
        });
    };

    // Umumiy statistika
    const totalSlots = Object.values(schedule).reduce((sum, slots) => sum + slots.length, 0);
    const totalWorkshops = new Set(Object.values(schedule).flat().flatMap(s => s.workshops || [])).size;
    const linkedPlans = new Set(Object.values(schedule).flat().filter(s => s.planId).map(s => s.planId)).size;

    return (
        <div className="space-y-6">
            {/* Sarlavha */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        Haftalik Dars Jadvali
                        <Calendar size={18} className="text-indigo-400" />
                    </h2>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Haftaning har kunida qaysi sexlar va qaysi reja bo'yicha dars o'tilishini belgilang
                    </p>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                        {totalSlots} ta dars
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                        {totalWorkshops} ta sex
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                        {linkedPlans} ta reja
                    </span>
                </div>
            </div>

            {/* Hafta kunlari */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {WEEKDAYS.map(day => {
                    const slots = schedule[day.id] || [];
                    return (
                        <motion.div
                            key={day.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden"
                        >
                            {/* Kun sarlavhasi */}
                            <div className={`bg-gradient-to-r ${day.color} px-4 py-2.5`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white">{day.name}</h3>
                                    <span className="text-[10px] text-white/70 font-medium">
                                        {slots.length} dars
                                    </span>
                                </div>
                            </div>

                            {/* Slotlar */}
                            <div className="p-2 space-y-2 min-h-[100px]">
                                <AnimatePresence>
                                    {slots.length === 0 ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-center py-6 text-[hsl(var(--muted-foreground))]">
                                            <Calendar size={24} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] opacity-60">Dars belgilanmagan</p>
                                        </motion.div>
                                    ) : (
                                        slots.map((slot, i) => {
                                            const plan = getPlanById(slot.planId);
                                            return (
                                                <motion.div
                                                    key={slot.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="bg-[hsl(var(--secondary))] rounded-lg p-2.5 border border-[hsl(var(--border))] hover:border-indigo-500/30 transition-colors group"
                                                >
                                                    {/* Vaqt va amallar */}
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400">
                                                            <Clock size={10} /> {slot.time}
                                                        </span>
                                                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openSlotForm(day.id, i)}
                                                                className="p-1 hover:bg-amber-500/10 text-amber-400 rounded transition-colors">
                                                                <Edit3 size={10} />
                                                            </button>
                                                            <button onClick={() => deleteSlot(day.id, i)}
                                                                className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-colors">
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Reja nomi */}
                                                    {plan ? (
                                                        <p className="text-[11px] font-medium text-[hsl(var(--foreground))] leading-tight mb-1.5 line-clamp-2">
                                                            {plan.name}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] italic mb-1.5">
                                                            {slot.note || 'Reja biriktirilmagan'}
                                                        </p>
                                                    )}

                                                    {/* Sexlar */}
                                                    <div className="flex flex-wrap gap-1">
                                                        {(slot.workshops || []).map((w, wi) => (
                                                            <span key={wi} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-indigo-500/15 border border-indigo-500/20 text-indigo-300">
                                                                Sex {w}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Yo'nalish */}
                                                    {plan && (
                                                        <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-1">
                                                            {plan.direction}
                                                        </p>
                                                    )}

                                                    {/* Izoh */}
                                                    {slot.note && (
                                                        <p className="text-[9px] text-amber-400/80 mt-1 italic">
                                                            📌 {slot.note}
                                                        </p>
                                                    )}
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Qo'shish tugmasi */}
                            <div className="p-2 pt-0">
                                <button
                                    onClick={() => openSlotForm(day.id)}
                                    className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-[hsl(var(--border))] rounded-lg text-[10px] text-[hsl(var(--muted-foreground))] hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                                >
                                    <Plus size={12} /> Dars qo'shish
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Jadval ko'rinishi (umumiy) */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.3)]">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Info size={14} className="text-indigo-400" /> Umumiy ko'rinish
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-[hsl(var(--border))]">
                                <th className="px-3 py-2.5 text-left font-semibold text-[hsl(var(--muted-foreground))] w-20">Kun</th>
                                <th className="px-3 py-2.5 text-left font-semibold text-[hsl(var(--muted-foreground))] w-16">Vaqt</th>
                                <th className="px-3 py-2.5 text-left font-semibold text-[hsl(var(--muted-foreground))]">Sexlar</th>
                                <th className="px-3 py-2.5 text-left font-semibold text-[hsl(var(--muted-foreground))]">Yillik Reja</th>
                                <th className="px-3 py-2.5 text-left font-semibold text-[hsl(var(--muted-foreground))]">Yo'nalish</th>
                                <th className="px-3 py-2.5 text-left font-semibold text-[hsl(var(--muted-foreground))] w-32">Izoh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {WEEKDAYS.map(day => {
                                const slots = schedule[day.id] || [];
                                if (slots.length === 0) {
                                    return (
                                        <tr key={day.id} className="border-b border-[hsl(var(--border)/0.5)]">
                                            <td className="px-3 py-2 font-medium">{day.name}</td>
                                            <td colSpan={5} className="px-3 py-2 text-[hsl(var(--muted-foreground))] italic opacity-50">
                                                — Bo'sh —
                                            </td>
                                        </tr>
                                    );
                                }
                                return slots.map((slot, i) => {
                                    const plan = getPlanById(slot.planId);
                                    return (
                                        <tr key={`${day.id}-${i}`} className="border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--secondary)/0.3)]">
                                            {i === 0 && (
                                                <td className="px-3 py-2 font-medium" rowSpan={slots.length}>
                                                    <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${day.color} mr-1.5`} />
                                                    {day.name}
                                                </td>
                                            )}
                                            <td className="px-3 py-2 text-indigo-400 font-medium">{slot.time}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {(slot.workshops || []).map((w, wi) => (
                                                        <span key={wi} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/10 text-indigo-300">
                                                            Sex {w}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                {plan ? plan.name : <span className="text-[hsl(var(--muted-foreground))] italic">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-[hsl(var(--muted-foreground))]">
                                                {plan ? plan.direction : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-[hsl(var(--muted-foreground))]">
                                                {slot.note || '—'}
                                            </td>
                                        </tr>
                                    );
                                });
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== Slot Tahrirlash Modal ===== */}
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
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl w-full max-w-lg"
                        >
                            {/* Modal sarlavha */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
                                <div>
                                    <h3 className="text-sm font-bold">
                                        {editingSlot.index >= 0 ? 'Darsni Tahrirlash' : 'Yangi Dars Qo\'shish'}
                                    </h3>
                                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                                        {WEEKDAYS.find(d => d.id === editingSlot.dayId)?.name} kuni
                                    </p>
                                </div>
                                <button onClick={() => setEditingSlot(null)}
                                    className="p-1.5 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Forma */}
                            <div className="p-5 space-y-4">
                                {/* Vaqt */}
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                                        <Clock size={12} className="inline mr-1" /> Dars vaqti
                                    </label>
                                    <input
                                        type="time"
                                        value={slotForm.time}
                                        onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>

                                {/* Yillik reja tanlash */}
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                                        <BookOpen size={12} className="inline mr-1" /> Yillik Reja
                                    </label>
                                    <select
                                        value={slotForm.planId}
                                        onChange={(e) => handlePlanSelect(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <option value="">-- Reja tanlang --</option>
                                        {annualPlans.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.year}) — Sex: {p.workshops.join(', ')}
                                            </option>
                                        ))}
                                    </select>
                                    {slotForm.planId && getPlanById(slotForm.planId) && (
                                        <p className="text-[10px] text-emerald-400 mt-1">
                                            ✓ {getPlanById(slotForm.planId).direction}
                                        </p>
                                    )}
                                </div>

                                {/* Sexlar */}
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                                        <Users size={12} className="inline mr-1" /> Biriktirilgan Sexlar
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={workshopInput}
                                            onChange={(e) => setWorkshopInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addWorkshopToSlot(); } }}
                                            className="flex-1 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Sex raqami..."
                                        />
                                        <button onClick={addWorkshopToSlot}
                                            className="px-3 py-2 bg-indigo-500 text-white rounded-xl text-sm hover:bg-indigo-600 transition-colors">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {slotForm.workshops.map((w, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                                Sex {w}
                                                <button onClick={() => removeWorkshopFromSlot(w)} className="hover:text-red-400 transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                        {slotForm.workshops.length === 0 && (
                                            <span className="text-[10px] text-[hsl(var(--muted-foreground))] opacity-50">
                                                Reja tanlansa sexlar avtomatik qo'shiladi
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Izoh */}
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 block">
                                        📌 Izoh (ixtiyoriy)
                                    </label>
                                    <input
                                        type="text"
                                        value={slotForm.note}
                                        onChange={(e) => setSlotForm({ ...slotForm, note: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Qo'shimcha ma'lumot..."
                                    />
                                </div>
                            </div>

                            {/* Saqlash */}
                            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[hsl(var(--border))]">
                                <button onClick={() => setEditingSlot(null)}
                                    className="px-4 py-2.5 bg-[hsl(var(--secondary))] rounded-xl text-xs font-medium hover:bg-[hsl(var(--border))] transition-colors">
                                    Bekor qilish
                                </button>
                                <button onClick={saveSlot}
                                    disabled={slotForm.workshops.length === 0}
                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Save size={14} /> Saqlash
                                </button>
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
                        <CheckCheck size={16} /> Saqlandi!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
