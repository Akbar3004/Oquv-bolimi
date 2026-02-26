import React, { useState, useRef } from 'react';
import { Plus, Search, FileText, Calendar, Users, Pencil, Trash2, Eye, Download, Upload, ChevronRight, Sparkles, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const WORKSHOP_COLORS = [
    'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    'from-rose-500/20 to-pink-500/20 border-rose-500/30',
    'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
];

// ===== Namuna Excel faylini yaratish va yuklab olish =====
function downloadSampleFile() {
    // 1-sheet: Reja ma'lumotlari
    const infoData = [
        ['Maydon', 'Qiymat', 'Izoh'],
        ['Reja nomi', '02-13-Seh yillik reja', 'Reja nomini kiriting'],
        ['Yil', '2025', 'Yilni kiriting (masalan: 2025)'],
        ['Yo\'nalish', 'Chilangarlik ishi: Gaz-elektr Payvandchisi. Tokarlik ishi.', 'Yo\'nalishni kiriting'],
        ['Sexlar', '02, 13', 'Vergul bilan ajratib kiriting'],
        ['Soat', '2', 'Bir dars uchun soat (1, 1.5, 2, 2.5, 3)'],
    ];

    // 2-sheet: Darslar jadvali (48 qator)
    const lessonsData = [['№', 'Oy', 'Texnik mashg\'ulot mavzusi', 'Soat', 'Adabiyotlar']];
    let num = 1;
    for (const month of MONTHS) {
        for (let w = 0; w < 4; w++) {
            lessonsData.push([
                num,
                month,
                num <= 5 ? [
                    '2024 yil yo\'l qo\'yilgan braklar va nuqsonlar tahlili',
                    'Xizmat CI vkletini boshlatuvchi bo\'yidan mashinist xatosi',
                    'Moratlar va materiallar qo\'llash va usullari',
                    '2024 yil mehan zararlari tahlili',
                    'Metal qotishmalari xususiy xavfsizligi',
                ][num - 1] : '',
                2,
                num <= 3 ? ['Hisobot ma\'lumot', 'V.A.Starichkov. Konspekt', 'G.K.Tatarinov. Konspekt'][num - 1] : ''
            ]);
            num++;
        }
    }

    // 3-sheet: Imzolar
    const sigData = [
        ['Lavozim', 'F.I.SH'],
        ['Tuzuvchi: Bosh mexanik:', 'Saqaliyev.I'],
        ['Konsultant: O\'quv sinf boshlig\'i:', 'Israilov.I.A.'],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(infoData);
    ws1['!cols'] = [{ wch: 15 }, { wch: 55 }, { wch: 40 }];
    const ws2 = XLSX.utils.aoa_to_sheet(lessonsData);
    ws2['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 60 }, { wch: 8 }, { wch: 35 }];
    const ws3 = XLSX.utils.aoa_to_sheet(sigData);
    ws3['!cols'] = [{ wch: 40 }, { wch: 25 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Reja malumotlari');
    XLSX.utils.book_append_sheet(wb, ws2, 'Darslar');
    XLSX.utils.book_append_sheet(wb, ws3, 'Imzolar');
    XLSX.writeFile(wb, 'Yillik_reja_namuna.xlsx');
}

// ===== Excel fayldan import qilish =====
function parseImportedFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Sheet nomlari
                const sheetNames = workbook.SheetNames;

                // 1-sheet: Reja ma'lumotlari
                let name = '', year = new Date().getFullYear(), direction = '', workshops = [], hourPerLesson = 2;
                if (sheetNames.length >= 1) {
                    const infoSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], { header: 1 });
                    // Birinchi qator sarlavha, keyingilari maydon-qiymat
                    for (let i = 1; i < infoSheet.length; i++) {
                        const row = infoSheet[i];
                        if (!row || !row[0]) continue;
                        const field = String(row[0]).trim().toLowerCase();
                        const val = row[1] != null ? String(row[1]).trim() : '';
                        if (field.includes('nomi') || field.includes('reja nomi') || field === 'name') name = val;
                        else if (field.includes('yil') || field === 'year') year = parseInt(val) || new Date().getFullYear();
                        else if (field.includes('nalish') || field === 'direction') direction = val;
                        else if (field.includes('sex') || field === 'workshops') {
                            workshops = val.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
                        }
                        else if (field.includes('soat') || field === 'hour') hourPerLesson = parseFloat(val) || 2;
                    }
                }

                // 2-sheet: Darslar
                const lessons = [];
                if (sheetNames.length >= 2) {
                    const lessonsSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]], { header: 1 });
                    // Birinchi qator sarlavha
                    for (let i = 1; i < lessonsSheet.length; i++) {
                        const row = lessonsSheet[i];
                        if (!row || row.length < 2) continue;
                        lessons.push({
                            number: parseInt(row[0]) || (i),
                            month: String(row[1] || '').trim() || MONTHS[Math.floor((i - 1) / 4) % 12],
                            topic: String(row[2] || '').trim(),
                            hours: parseFloat(row[3]) || hourPerLesson,
                            literature: String(row[4] || '').trim(),
                            instructor: '',
                        });
                    }
                }

                // Agar 48 ta dars bo'lmasa, to'ldirish
                while (lessons.length < 48) {
                    const idx = lessons.length;
                    const monthIdx = Math.floor(idx / 4) % 12;
                    lessons.push({
                        number: idx + 1,
                        month: MONTHS[monthIdx],
                        topic: '',
                        hours: hourPerLesson,
                        literature: '',
                        instructor: '',
                    });
                }

                // 3-sheet: Imzolar
                let signatures = [];
                if (sheetNames.length >= 3) {
                    const sigSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[2]], { header: 1 });
                    for (let i = 1; i < sigSheet.length; i++) {
                        const row = sigSheet[i];
                        if (!row || !row[0]) continue;
                        signatures.push({
                            title: String(row[0] || '').trim(),
                            name: String(row[1] || '').trim(),
                        });
                    }
                }
                if (signatures.length === 0) {
                    signatures = [
                        { title: 'Tuzuvchi:', name: '' },
                        { title: 'Konsultant:', name: '' },
                    ];
                }

                const totalHours = lessons.slice(0, 48).reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

                const plan = {
                    id: Date.now(),
                    name: name || file.name.replace(/\.(xlsx|xls)$/i, ''),
                    year,
                    direction,
                    workshops,
                    hourPerLesson,
                    author: '',
                    consultant: '',
                    totalHours,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    lessons: lessons.slice(0, 48),
                    signatures,
                    titlePage: {
                        kelishildi: { orgLine1: '"O\'zbekiston" lokomotiv', orgLine2: 'deposi boshlig\'i', name: '' },
                        tasdiqlayman: { orgLine1: '"O\'zbekiston Temir yo\'llari" AJ', orgLine2: 'Lokomotivlardan foydalanish boshqarmasi', orgLine3: 'boshlig\'i', name: '' },
                        centerOrg: { line1: '"O\'zbekiston temir yo\'llari" A.J.', line2: '"O\'zbekiston" lokomotiv deposi.' },
                        maslaxatchilar: [],
                    },
                };

                resolve(plan);
            } catch (err) {
                reject(new Error('Faylni o\'qishda xatolik: ' + err.message));
            }
        };
        reader.onerror = () => reject(new Error('Faylni o\'qib bo\'lmadi'));
        reader.readAsArrayBuffer(file);
    });
}

export default function AnnualPlanList({ plans, onCreateNew, onView, onEdit, onDelete, onImport }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [importStatus, setImportStatus] = useState(null); // { type: 'success'|'error', message: string }
    const fileInputRef = useRef(null);

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Fayl formatini tekshirish
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            setImportStatus({ type: 'error', message: 'Faqat .xlsx yoki .xls formatdagi fayllarni yuklash mumkin!' });
            e.target.value = '';
            return;
        }

        try {
            const plan = await parseImportedFile(file);
            const filledCount = plan.lessons.filter(l => l.topic?.trim()).length;
            onImport(plan);
            setImportStatus({
                type: 'success',
                message: `"${plan.name}" muvaffaqiyatli import qilindi! (${filledCount}/48 dars, ${plan.workshops.length} ta sex)`
            });
        } catch (err) {
            setImportStatus({ type: 'error', message: err.message });
        }

        e.target.value = '';
        // 5 soniyadan keyin xabarni olib tashlash
        setTimeout(() => setImportStatus(null), 5000);
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
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Namuna fayl */}
                    <button
                        onClick={downloadSampleFile}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] rounded-xl text-xs font-medium hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
                        title="Namuna Excel faylini yuklab olish"
                    >
                        <Download size={14} /> Namuna fayl
                    </button>

                    {/* Import */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all"
                        title="Excel fayldan import qilish"
                    >
                        <Upload size={14} /> Import
                    </button>

                    {/* Yangi reja */}
                    <button
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
                    >
                        <Plus size={16} /> Yangi Reja
                    </button>
                </div>
            </div>

            {/* Import holat xabari */}
            <AnimatePresence>
                {importStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm ${importStatus.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/10 border-red-500/20 text-red-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {importStatus.type === 'success'
                                ? <CheckCircle size={16} />
                                : <AlertCircle size={16} />
                            }
                            <span className="text-xs">{importStatus.message}</span>
                        </div>
                        <button onClick={() => setImportStatus(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-2 opacity-60">
                                "Yangi Reja" tugmasini bosib reja yarating yoki Excel fayldan import qiling
                            </p>
                            <div className="flex items-center justify-center gap-3 mt-4">
                                <button
                                    onClick={downloadSampleFile}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-xs hover:border-emerald-500/30 transition-colors"
                                >
                                    <Download size={14} /> Namuna faylni yuklab oling
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/20 transition-colors"
                                >
                                    <Upload size={14} /> Import qiling
                                </button>
                            </div>
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
