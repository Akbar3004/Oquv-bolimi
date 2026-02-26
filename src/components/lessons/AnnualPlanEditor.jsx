import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X, BookOpen, CheckCheck, FileText, Users, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

// 48 ta bo'sh dars yaratish
const createEmptyLessons = (hourPerLesson = 2) => {
    const lessons = [];
    let num = 1;
    for (const month of MONTHS) {
        for (let w = 0; w < 4; w++) {
            lessons.push({ number: num, month, topic: '', hours: hourPerLesson, literature: '', instructor: '' });
            num++;
        }
    }
    return lessons;
};

// Standart titil sahifasi
const DEFAULT_TITLE_PAGE = {
    kelishildi: {
        orgLine1: '"O\'zbekiston" lokomotiv',
        orgLine2: 'deposi boshlig\'i',
        name: 'N.M.Hamdamov',
    },
    tasdiqlayman: {
        orgLine1: '"O\'zbekiston Temir yo\'llari" AJ',
        orgLine2: 'Lokomotivlardan foydalanish boshqarmasi',
        orgLine3: 'boshlig\'i',
        name: 'Sh.T.Tulyaganov',
    },
    centerOrg: {
        line1: '"O\'zbekiston temir yo\'llari" A.J.',
        line2: '"O\'zbekiston" lokomotiv deposi.',
    },
    maslaxatchilar: [
        {
            title: '"O\'zbekiston" lokomotiv deposi\nKasaba uyushmasi raisi:',
            name: 'D.T.Asamidinov',
        },
        {
            title: '"O\'zbekiston" lokomotiv deposi boshlig\'ining\nLokomotivlarni ta\'mirlash ishlari bo\'yicha\no\'rinbosari:',
            name: 'J.S.Ergashev',
        },
        {
            title: 'Depo bosh texnologi:',
            name: 'X.N.Minajiddinov',
        },
        {
            title: 'O\'qituvchi:',
            name: '',
        },
    ],
};

// Tahrirlash uchun input komponenti
function EditField({ label, value, onChange, placeholder, multiline = false, className = '' }) {
    if (multiline) {
        return (
            <div className={className}>
                <label className="text-[10px] font-medium mb-1 block text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{label}</label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                    rows={2}
                    placeholder={placeholder}
                />
            </div>
        );
    }
    return (
        <div className={className}>
            <label className="text-[10px] font-medium mb-1 block text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder={placeholder}
            />
        </div>
    );
}

export default function AnnualPlanEditor({ plan, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        direction: '',
        workshops: [],
        hourPerLesson: 2,
        author: '',
        consultant: '',
        lessons: createEmptyLessons(2),
        titlePage: JSON.parse(JSON.stringify(DEFAULT_TITLE_PAGE)),
    });
    const [workshopInput, setWorkshopInput] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [activeMonth, setActiveMonth] = useState('Yanvar');
    const [errors, setErrors] = useState({});
    const [expandedSection, setExpandedSection] = useState('titlePage'); // 'titlePage' | 'planInfo' | 'lessons'

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
                titlePage: plan.titlePage || JSON.parse(JSON.stringify(DEFAULT_TITLE_PAGE)),
            });
        }
    }, [plan]);

    // Titil sahifasini yangilash
    const updateTitlePage = (path, value) => {
        const newTitlePage = JSON.parse(JSON.stringify(formData.titlePage));
        const keys = path.split('.');
        let obj = newTitlePage;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        setFormData({ ...formData, titlePage: newTitlePage });
    };

    // Maslaxatchi yangilash
    const updateMaslaxatchi = (index, field, value) => {
        const newTitlePage = JSON.parse(JSON.stringify(formData.titlePage));
        newTitlePage.maslaxatchilar[index][field] = value;
        setFormData({ ...formData, titlePage: newTitlePage });
    };

    // Maslaxatchi qo'shish
    const addMaslaxatchi = () => {
        const newTitlePage = JSON.parse(JSON.stringify(formData.titlePage));
        newTitlePage.maslaxatchilar.push({ title: '', name: '' });
        setFormData({ ...formData, titlePage: newTitlePage });
    };

    // Maslaxatchi o'chirish
    const removeMaslaxatchi = (index) => {
        const newTitlePage = JSON.parse(JSON.stringify(formData.titlePage));
        newTitlePage.maslaxatchilar.splice(index, 1);
        setFormData({ ...formData, titlePage: newTitlePage });
    };

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

    const monthLessons = formData.lessons.filter(l => l.month === activeMonth);
    const monthStartIndex = formData.lessons.findIndex(l => l.month === activeMonth);

    const getMonthCompletion = (month) => {
        return formData.lessons.filter(l => l.month === month && l.topic?.trim()).length;
    };

    // Seksiya accordion
    const SectionHeader = ({ id, title, icon: Icon, color, subtitle }) => (
        <button
            onClick={() => setExpandedSection(expandedSection === id ? null : id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${expandedSection === id
                ? `bg-gradient-to-r ${color} text-white shadow-lg`
                : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-indigo-500/20'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                <div className="text-left">
                    <span className="font-semibold text-sm">{title}</span>
                    {subtitle && <p className={`text-xs mt-0.5 ${expandedSection === id ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'}`}>{subtitle}</p>}
                </div>
            </div>
            {expandedSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
    );

    return (
        <div className="space-y-4">
            {/* Sarlavha */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold">{plan ? 'Rejani Tahrirlash' : 'Yangi Yillik Reja'}</h2>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {formData.lessons.filter(l => l.topic?.trim()).length}/48 dars to'ldirilgan
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

            {/* ========== 1. TITIL SAHIFASI ========== */}
            <SectionHeader
                id="titlePage"
                title="📄 Titil Sahifasi"
                icon={FileText}
                color="from-indigo-500 to-blue-600"
                subtitle="Kelishildi, Tasdiqlayman, Maslaxatchilar"
            />

            <AnimatePresence>
                {expandedSection === 'titlePage' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 space-y-6">

                            {/* KELISHILDI va TASDIQLAYMAN */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* KELISHILDI */}
                                <div className="p-4 bg-[hsl(var(--secondary)/0.3)] border border-[hsl(var(--border))] rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-blue-400">KELISHILDI</h4>
                                    </div>
                                    <EditField
                                        label="Tashkilot (1-qator)"
                                        value={formData.titlePage.kelishildi.orgLine1}
                                        onChange={(v) => updateTitlePage('kelishildi.orgLine1', v)}
                                        placeholder={"O'zbekiston lokomotiv"}
                                    />
                                    <EditField
                                        label="Tashkilot (2-qator)"
                                        value={formData.titlePage.kelishildi.orgLine2}
                                        onChange={(v) => updateTitlePage('kelishildi.orgLine2', v)}
                                        placeholder="deposi boshlig'i"
                                    />
                                    <EditField
                                        label="F.I.SH"
                                        value={formData.titlePage.kelishildi.name}
                                        onChange={(v) => updateTitlePage('kelishildi.name', v)}
                                        placeholder="N.M.Hamdamov"
                                    />
                                </div>

                                {/* TASDIQLAYMAN */}
                                <div className="p-4 bg-[hsl(var(--secondary)/0.3)] border border-[hsl(var(--border))] rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">TASDIQLAYMAN</h4>
                                    </div>
                                    <EditField
                                        label="Tashkilot (1-qator)"
                                        value={formData.titlePage.tasdiqlayman.orgLine1}
                                        onChange={(v) => updateTitlePage('tasdiqlayman.orgLine1', v)}
                                        placeholder={"O'zbekiston Temir yo'llari AJ"}
                                    />
                                    <EditField
                                        label="Tashkilot (2-qator)"
                                        value={formData.titlePage.tasdiqlayman.orgLine2}
                                        onChange={(v) => updateTitlePage('tasdiqlayman.orgLine2', v)}
                                        placeholder="Lokomotivlardan foydalanish boshqarmasi"
                                    />
                                    <EditField
                                        label="Tashkilot (3-qator)"
                                        value={formData.titlePage.tasdiqlayman.orgLine3}
                                        onChange={(v) => updateTitlePage('tasdiqlayman.orgLine3', v)}
                                        placeholder="boshlig'i"
                                    />
                                    <EditField
                                        label="F.I.SH"
                                        value={formData.titlePage.tasdiqlayman.name}
                                        onChange={(v) => updateTitlePage('tasdiqlayman.name', v)}
                                        placeholder="Sh.T.Tulyaganov"
                                    />
                                </div>
                            </div>

                            {/* Markaziy tashkilot nomi */}
                            <div className="p-4 bg-[hsl(var(--secondary)/0.3)] border border-[hsl(var(--border))] rounded-xl space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">Markaziy sarlavha</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <EditField
                                        label="1-qator"
                                        value={formData.titlePage.centerOrg.line1}
                                        onChange={(v) => updateTitlePage('centerOrg.line1', v)}
                                        placeholder={"O'zbekiston temir yo'llari A.J."}
                                    />
                                    <EditField
                                        label="2-qator"
                                        value={formData.titlePage.centerOrg.line2}
                                        onChange={(v) => updateTitlePage('centerOrg.line2', v)}
                                        placeholder={"O'zbekiston lokomotiv deposi."}
                                    />
                                </div>
                            </div>

                            {/* MASLAXATCHILAR */}
                            <div className="p-4 bg-[hsl(var(--secondary)/0.3)] border border-[hsl(var(--border))] rounded-xl space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-violet-400">Maslaxatchilar</h4>
                                    </div>
                                    <button
                                        onClick={addMaslaxatchi}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-colors"
                                    >
                                        <Plus size={12} /> Qo'shish
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.titlePage.maslaxatchilar.map((m, index) => (
                                        <div key={index} className="flex gap-3 items-start p-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl group">
                                            <span className="w-6 h-6 flex items-center justify-center bg-violet-500/10 text-violet-400 rounded-md text-xs font-bold shrink-0 mt-5">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <EditField
                                                    label="Lavozim"
                                                    value={m.title}
                                                    onChange={(v) => updateMaslaxatchi(index, 'title', v)}
                                                    placeholder="Masalan: Kasaba uyushmasi raisi:"
                                                    multiline
                                                />
                                                <EditField
                                                    label="F.I.SH"
                                                    value={m.name}
                                                    onChange={(v) => updateMaslaxatchi(index, 'name', v)}
                                                    placeholder="Masalan: D.T.Asamidinov"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeMaslaxatchi(index)}
                                                className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-5"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tuzuvchi va Konsultant */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[hsl(var(--secondary)/0.3)] border border-[hsl(var(--border))] rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400">Tuzuvchi</h4>
                                    </div>
                                    <EditField label="F.I.SH" value={formData.author} onChange={(v) => setFormData({ ...formData, author: v })} placeholder="Saqaliyev I." />
                                </div>
                                <div className="p-4 bg-[hsl(var(--secondary)/0.3)] border border-[hsl(var(--border))] rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400">Konsultant</h4>
                                    </div>
                                    <EditField label="F.I.SH" value={formData.consultant} onChange={(v) => setFormData({ ...formData, consultant: v })} placeholder="Israilov I.A." />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== 2. REJA MA'LUMOTLARI ========== */}
            <SectionHeader
                id="planInfo"
                title="📋 Reja Ma'lumotlari"
                icon={BookOpen}
                color="from-violet-500 to-purple-600"
                subtitle="Nomi, yo'nalish, sexlar, soat"
            />

            <AnimatePresence>
                {expandedSection === 'planInfo' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Reja nomi *</label>
                                    <input type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: false }); }}
                                        className={`w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${errors.name ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                        placeholder="Masalan: 02-13-Seh yillik reja" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Yil</label>
                                    <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Yo'nalish *</label>
                                    <input type="text" value={formData.direction} onChange={(e) => { setFormData({ ...formData, direction: e.target.value }); setErrors({ ...errors, direction: false }); }}
                                        className={`w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${errors.direction ? 'border-red-500' : 'border-[hsl(var(--border))]'}`}
                                        placeholder="Masalan: Chilangarlik ishi: Gaz-elektr Payvandchisi. Tokarlik ishi." />
                                </div>

                                {/* Sexlar */}
                                <div className="md:col-span-2">
                                    <label className={`text-xs font-medium mb-1.5 block ${errors.workshops ? 'text-red-400' : 'text-[hsl(var(--muted-foreground))]'}`}>
                                        Biriktirilgan sexlar *
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text" value={workshopInput} onChange={(e) => setWorkshopInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addWorkshop(); } }}
                                            className="flex-1 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Sex raqamini kiriting va Enter bosing..." />
                                        <button type="button" onClick={addWorkshop}
                                            className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-500/20 transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {formData.workshops.map((w, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                                Sex {w}
                                                <button onClick={() => removeWorkshop(w)} className="hover:text-red-400 transition-colors ml-0.5"><X size={12} /></button>
                                            </span>
                                        ))}
                                        {formData.workshops.length === 0 && <span className="text-xs text-[hsl(var(--muted-foreground))] opacity-50">Hech qanday sex biriktirilmagan</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium mb-1.5 block text-[hsl(var(--muted-foreground))]">Bir dars davomiyligi (soat)</label>
                                    <select value={formData.hourPerLesson} onChange={(e) => {
                                        const h = parseFloat(e.target.value);
                                        const updatedLessons = formData.lessons.map(l => ({ ...l, hours: h }));
                                        setFormData({ ...formData, hourPerLesson: h, lessons: updatedLessons });
                                    }} className="w-full px-3 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        {[1, 1.5, 2, 2.5, 3].map(v => <option key={v} value={v}>{v} soat</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== 3. DARSLAR JADVALI ========== */}
            <SectionHeader
                id="lessons"
                title="📝 Darslar Jadvali"
                icon={BookOpen}
                color="from-emerald-500 to-green-600"
                subtitle={`${formData.lessons.filter(l => l.topic?.trim()).length}/48 dars to'ldirilgan`}
            />

            <AnimatePresence>
                {expandedSection === 'lessons' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-[hsl(var(--border))]">
                                <div className="flex flex-wrap gap-1.5">
                                    {MONTHS.map(m => {
                                        const completion = getMonthCompletion(m);
                                        return (
                                            <button key={m} onClick={() => setActiveMonth(m)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeMonth === m
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                                                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
                                                    }`}>
                                                {m.slice(0, 3)}
                                                <span className={`ml-1 text-[10px] ${activeMonth === m ? 'text-white/70' : completion === 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {completion}/4
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

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
                                            const hasContent = lesson.topic?.trim();
                                            return (
                                                <tr key={globalIndex} className={`border-b border-[hsl(var(--border)/0.5)] ${hasContent ? 'bg-emerald-500/3' : 'hover:bg-[hsl(var(--secondary)/0.3)]'}`}>
                                                    <td className="px-3 py-2 text-center text-xs text-[hsl(var(--muted-foreground))]">{lesson.number}</td>
                                                    <td className="px-3 py-2"><span className="text-xs font-medium text-indigo-400">Dars №{lesson.number}</span></td>
                                                    <td className="px-3 py-2">
                                                        <input type="text" value={lesson.topic} onChange={(e) => updateLesson(globalIndex, 'topic', e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[hsl(var(--border))] focus:border-emerald-500 focus:bg-[hsl(var(--secondary))] rounded-lg text-sm outline-none transition-all focus:ring-1 focus:ring-emerald-500/50"
                                                            placeholder="Mashg'ulot mavzusini kiriting..." />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input type="text" value={lesson.hours} onChange={(e) => updateLesson(globalIndex, 'hours', e.target.value)}
                                                            className="w-14 px-2 py-1.5 bg-transparent border border-transparent hover:border-[hsl(var(--border))] focus:border-emerald-500 focus:bg-[hsl(var(--secondary))] rounded-lg text-sm text-center outline-none transition-all" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input type="text" value={lesson.literature} onChange={(e) => updateLesson(globalIndex, 'literature', e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-[hsl(var(--border))] focus:border-emerald-500 focus:bg-[hsl(var(--secondary))] rounded-lg text-sm outline-none transition-all"
                                                            placeholder="Adabiyot..." />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-4 py-3 bg-[hsl(var(--secondary)/0.3)] border-t border-[hsl(var(--border))] flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                                <span>{activeMonth}: {monthLessons.filter(l => l.topic?.trim()).length}/4 dars to'ldirilgan</span>
                                <span>Jami: {formData.lessons.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0)} soat</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pastki saqlash */}
            <div className="flex justify-end pt-2">
                <motion.button onClick={handleSubmit} whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${isSaved
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                        }`}>
                    {isSaved ? <><CheckCheck size={16} /> Saqlandi!</> : <><Save size={16} /> Saqlash</>}
                </motion.button>
            </div>
        </div>
    );
}
