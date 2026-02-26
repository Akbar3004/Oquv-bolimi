import React, { useState } from 'react';
import { Plus, Search, FileText, Calendar, Users, Pencil, Trash2, Eye, Download, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WORKSHOP_COLORS = [
    'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    'from-rose-500/20 to-pink-500/20 border-rose-500/30',
    'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
];

export default function AnnualPlanList({ plans, onCreateNew, onView, onEdit, onDelete }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState('all');

    const years = [...new Set(plans.map(p => p.year))].sort((a, b) => b - a);

    const filteredPlans = plans
        .filter(p => yearFilter === 'all' || p.year.toString() === yearFilter)
        .filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.direction.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.workshops.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    const getCompletionPercent = (plan) => {
        const filled = plan.lessons.filter(l => l.topic && l.topic.trim() !== '').length;
        return Math.round((filled / 48) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Sarlavha */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">Yillik Rejalar</h2>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Jami {plans.length} ta reja • {filteredPlans.length} ta ko'rsatilmoqda
                    </p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
                >
                    <Plus size={16} /> Yangi Reja
                </button>
            </div>

            {/* Filtrlar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Reja nomi, yo'nalish yoki sex bo'yicha qidirish..."
                    />
                </div>
                {years.length > 0 && (
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="px-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                        <option value="all">Barcha yillar</option>
                        {years.map(y => <option key={y} value={y}>{y}-yil</option>)}
                    </select>
                )}
            </div>

            {/* Rejalar ro'yxati */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredPlans.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center py-20"
                        >
                            <FileText size={56} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-20" />
                            <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                {searchQuery ? 'Qidiruv natijasi topilmadi' : 'Hech qanday yillik reja mavjud emas'}
                            </p>
                            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1 opacity-60">
                                "Yangi Reja" tugmasini bosib reja yarating
                            </p>
                        </motion.div>
                    ) : (
                        filteredPlans.map((plan, index) => {
                            const completion = getCompletionPercent(plan);
                            const colorClass = WORKSHOP_COLORS[index % WORKSHOP_COLORS.length];

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
                                >
                                    {/* Reja raqami va yili */}
                                    <div className="px-5 pt-5 pb-3">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 bg-gradient-to-br ${colorClass} rounded-lg border`}>
                                                    <FileText size={16} className="text-[hsl(var(--foreground))]" />
                                                </div>
                                                <div>
                                                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{plan.year}-yil</span>
                                                </div>
                                            </div>
                                            {/* Amallar */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onView(plan)} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="Ko'rish">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => onEdit(plan)} className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors" title="Tahrirlash">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => onDelete(plan.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="O'chirish">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-sm mb-1 truncate">{plan.name}</h3>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">{plan.direction || 'Yo\'nalish ko\'rsatilmagan'}</p>

                                        {/* Sexlar */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {plan.workshops.slice(0, 5).map((w, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                                    {w.includes('Sex') || w.includes('sex') ? w : `Sex ${w}`}
                                                </span>
                                            ))}
                                            {plan.workshops.length > 5 && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                                                    +{plan.workshops.length - 5}
                                                </span>
                                            )}
                                        </div>

                                        {/* Statistika */}
                                        <div className="flex items-center gap-4 text-[10px] text-[hsl(var(--muted-foreground))]">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} /> {plan.lessons.filter(l => l.topic).length}/48 dars
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ⏱️ {plan.totalHours || plan.lessons.length * (plan.hourPerLesson || 2)} soat
                                            </span>
                                        </div>
                                    </div>

                                    {/* To'ldirilganlik darajasi */}
                                    <div className="px-5 pb-4 pt-1">
                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                            <span className="text-[hsl(var(--muted-foreground))]">To'ldirilganlik</span>
                                            <span className={`font-semibold ${completion === 100 ? 'text-emerald-400' : completion > 50 ? 'text-blue-400' : 'text-amber-400'}`}>{completion}%</span>
                                        </div>
                                        <div className="h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${completion}%` }}
                                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                                className={`h-full rounded-full ${completion === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : completion > 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Ochish tugmasi */}
                                    <button
                                        onClick={() => onView(plan)}
                                        className="w-full flex items-center justify-center gap-2 py-3 border-t border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                                    >
                                        Ko'rish va chop etish <ChevronRight size={14} />
                                    </button>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
