import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X, BookOpen, CheckCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

// 48 ta bo'sh dars yaratish
const createEmptyLessons = (hourPerLesson = 2) => {
    const lessons = [];
    let num = 1;
    for (const month of MONTHS) {
        for (let w = 0; w < 4; w++) {
            lessons.push({
                number: num,
                month,
                topic: '',
                hours: hourPerLesson,
                literature: '',
                instructor: '',
            });
            num++;
        }
    }
    return lessons;
};

export default function AnnualPlanEditor({ plan, onSave, onCancel, workshops: availableWorkshops }) {
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        direction: '',
        workshops: [],
        hourPerLesson: 2,
        author: '',
        consultant: '',
        lessons: createEmptyLessons(2),
    });
    const [workshopInput, setWorkshopInput] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [activeMonth, setActiveMonth] = useState('Yanvar');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name || '',
                year: plan.year || new Date().getFullYear(),
                direction: plan.direction || '',
                workshops: plan.workshops || [],
                hourPerLesson: plan.hourPerLesson || 2,
                author: plan.author || '',
                consultant: plan.consultant || '',
                lessons: plan.lessons && plan.lessons.length === 48 ? plan.lessons : createEmptyLessons(plan.hourPerLesson || 2),
            });
        }
    }, [plan]);

    const addWorkshop = () => {
        const trimmed = workshopInput.trim();
        if (trimmed && !formData.workshops.includes(trimmed)) {
            setFormData({ ...formData, workshops: [...formData.workshops, trimmed] });
            setWorkshopInput('');
        }
    };

    const removeWorkshop = (w) => {
        setFormData({ ...formData, workshops: formData.workshops.filter(ws => ws !== w) });
    };

    const updateLesson = (index, field, value) => {
        const updated = [...formData.lessons];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, lessons: updated });
    };

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = true;
        if (!formData.direction.trim()) newErrors.direction = true;
        if (formData.workshops.length === 0) newErrors.workshops = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const totalHours = formData.lessons.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

        onSave({
            ...formData,
            id: plan?.id || Date.now(),
            totalHours,
            createdAt: plan?.createdAt || new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        });

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    // Oylik darslar
    const monthLessons = formData.lessons.filter(l => l.month === activeMonth);
    const monthStartIndex = formData.lessons.findIndex(l => l.month === activeMonth);

    // Oylik to'ldirilganlik
    const getMonthCompletion = (month) => {
        const ml = formData.lessons.filter(l => l.month === month);
        return ml.filter(l => l.topic && l.topic.trim()).length;
    };

    return (
        <div className="space-y-6">
            {/* Sarlavha */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold">{plan ? 'Rejani Tahrirlash' : 'Yangi Yillik Reja'}</h2>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {formData.lessons.filter(l => l.topic && l.topic.trim()).length}/48 dars to'ldirilgan
                        </p>
                    </div>
                </div>
                <motion.button
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isSaved
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                        }`}
                >
                    {isSaved ? <><CheckCheck size={16} /> Saqlandi!</> : <><Save size={16} /> Saqlash</>}
                </motion.button>
            </div>

            {/* Asosiy ma'lumotlar */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-400" /> Reja ma'lumotlari
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reja nomi */}
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Reja nomi *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: false }); }}
                            className={`w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${errors.name ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                            placeholder="Masalan: 02-13-Seh yillik reja"
                        />
                    </div>

                    {/* Yil */}
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Yil</label>
                        <select
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Yo'nalish */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Yo'nalish *</label>
                        <input
                            type="text"
                            value={formData.direction}
                            onChange={(e) => { setFormData({ ...formData, direction: e.target.value }); setErrors({ ...errors, direction: false }); }}
                            className={`w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${errors.direction ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                            placeholder="Masalan: Chilangarlik ishi: Gaz-elektr Payvandchisi. Tokarlik ishi."
                        />
                    </div>

                    {/* Sexlar */}
                    <div className="md:col-span-2">
                        <label className={`text-xs font-medium mb-1.5 block ${errors.workshops ? 'text-red-400' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            Biriktirilgan sexlar * {errors.workshops && <span className="text-red-400 ml-1">(kamida 1 ta sex kiritilishi kerak)</span>}
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={workshopInput}
                                onChange={(e) => setWorkshopInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addWorkshop(); } }}
                                className="flex-1 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="Sex raqamini kiriting (masalan: 02, 13, OGM)..."
                            />
                            <button
                                type="button"
                                onClick={addWorkshop}
                                className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-500/20 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {formData.workshops.map((w, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                    Sex {w}
                                    <button onClick={() => removeWorkshop(w)} className="hover:text-red-400 transition-colors ml-0.5">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            {formData.workshops.length === 0 && (
                                <span className="text-xs text-[hsl(var(--muted-foreground))] opacity-50">Hech qanday sex biriktirilmagan</span>
                            )}
                        </div>
                    </div>

                    {/* Soat */}
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Bir dars davomiyligi (soat)</label>
                        <select
                            value={formData.hourPerLesson}
                            onChange={(e) => {
                                const h = parseFloat(e.target.value);
                                const updatedLessons = formData.lessons.map(l => ({ ...l, hours: h }));
                                setFormData({ ...formData, hourPerLesson: h, lessons: updatedLessons });
                            }}
                            className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <option value={1}>1 soat</option>
                            <option value={1.5}>1.5 soat</option>
                            <option value={2}>2 soat</option>
                            <option value={2.5}>2.5 soat</option>
                            <option value={3}>3 soat</option>
                        </select>
                    </div>

                    {/* Tuzuvchi */}
                    <div>
                        <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Tuzuvchi</label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="Masalan: Saqaliyev I."
                        />
                    </div>

                    {/* Konsultant */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Konsultant (O'quv sinf boshlig'i)</label>
                        <input
                            type="text"
                            value={formData.consultant}
                            onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                            className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="Masalan: Israilov I.A."
                        />
                    </div>
                </div>
            </div>

            {/* Darslar jadvali */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="font-semibold text-sm mb-3">📋 Darslar Jadvali (48 ta dars)</h3>

                    {/* Oylar tablari */}
                    <div className="flex flex-wrap gap-1.5">
                        {MONTHS.map(m => {
                            const completion = getMonthCompletion(m);
                            const isActive = activeMonth === m;
                            return (
                                <button
                                    key={m}
                                    onClick={() => setActiveMonth(m)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                                        : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
                                        }`}
                                >
                                    {m.slice(0, 3)}
                                    <span className={`ml-1 text-[10px] ${isActive ? 'text-white/70' : completion === 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {completion}/4
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Jadval */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[hsl(var(--secondary)/0.5)] border-b border-[hsl(var(--border))]">
                                <th className="px-3 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] w-12">№</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] w-20">Dars</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))]">Texnik mashg'ulot mavzusi</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] w-16">Soat</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] w-48">Adabiyotlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthLessons.map((lesson, i) => {
                                const globalIndex = monthStartIndex + i;
                                const hasContent = lesson.topic && lesson.topic.trim();

                                return (
                                    <tr key={globalIndex} className={`border-b border-[hsl(var(--border)/0.5)] transition-colors ${hasContent ? 'bg-emerald-500/3' : 'hover:bg-[hsl(var(--secondary)/0.3)]'}`}>
                                        <td className="px-3 py-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
                                            {lesson.number}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-xs font-medium text-indigo-400">Dars №{lesson.number}</span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={lesson.topic}
                                                onChange={(e) => updateLesson(globalIndex, 'topic', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[hsl(var(--border))] focus:border-indigo-500 focus:bg-[hsl(var(--secondary))] rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-indigo-500/50"
                                                placeholder="Mashg'ulot mavzusini kiriting..."
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={lesson.hours}
                                                onChange={(e) => updateLesson(globalIndex, 'hours', e.target.value)}
                                                className="w-14 px-2 py-1.5 bg-transparent border border-transparent hover:border-[hsl(var(--border))] focus:border-indigo-500 focus:bg-[hsl(var(--secondary))] rounded-lg text-sm text-center outline-none transition-all focus:ring-1 focus:ring-indigo-500/50"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={lesson.literature}
                                                onChange={(e) => updateLesson(globalIndex, 'literature', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[hsl(var(--border))] focus:border-indigo-500 focus:bg-[hsl(var(--secondary))] rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-indigo-500/50"
                                                placeholder="Adabiyot..."
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Jami */}
                <div className="px-4 py-3 bg-[hsl(var(--secondary)/0.3)] border-t border-[hsl(var(--border))] flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                    <span>{activeMonth} oyi: {monthLessons.filter(l => l.topic?.trim()).length}/4 dars to'ldirilgan</span>
                    <span>Jami: {formData.lessons.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0)} soat</span>
                </div>
            </div>

            {/* Pastki saqlash tugmasi */}
            <div className="flex justify-end">
                <motion.button
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${isSaved
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                        }`}
                >
                    {isSaved ? <><CheckCheck size={16} /> Saqlandi!</> : <><Save size={16} /> Saqlash</>}
                </motion.button>
            </div>
        </div>
    );
}
