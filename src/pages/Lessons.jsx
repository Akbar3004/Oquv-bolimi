import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, FileText, Sparkles, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import TopicManager from '../components/lessons/TopicManager';
import LessonSchedule from '../components/lessons/LessonSchedule';
import AttendanceTracker from '../components/lessons/AttendanceTracker';
import ProtocolGenerator from '../components/lessons/ProtocolGenerator';
import AnnualPlanList from '../components/lessons/AnnualPlanList';
import AnnualPlanEditor from '../components/lessons/AnnualPlanEditor';
import AnnualPlanViewer from '../components/lessons/AnnualPlanViewer';

// ===== LocalStorage kalitlari =====
const STORAGE_KEYS = {
    topics: 'oquv_dars_topics',
    lessons: 'oquv_dars_lessons',
    annualPlans: 'oquv_annual_plans',
};

// ===== Boshlang'ich namuna ma'lumotlar =====
const INITIAL_TOPICS = [
    { id: 1, name: 'Elektr sxemalar asoslari', description: 'Lokomotiv elektr sxemalarini o\'qish va tushunish', duration: '90', month: 'Fevral', category: 'Elektr jihozlari' },
    { id: 2, name: 'Xavfsizlik qoidalari', description: 'Ish joyidagi umumiy xavfsizlik qoidalari va ehtiyot choralari', duration: '60', month: 'Fevral', category: 'Texnik xavfsizlik' },
    { id: 3, name: 'Pnevmatik tizimlar', description: 'Lokomotiv pnevmatik tormoz tizimi ishlash prinsipi', duration: '120', month: 'Fevral', category: 'Mexanika va ta\'mirlash' },
    { id: 4, name: 'Yangi lokomotiv turlari', description: 'Zamonaviy lokomotivlar va ularning texnik xususiyatlari', duration: '90', month: 'Mart', category: 'Yangi texnologiyalar' },
    { id: 5, name: 'O\'t xavfsizligi', description: 'Yong\'in xavfsizligi qoidalari va o\'t o\'chirish vositalari', duration: '60', month: 'Mart', category: 'O\'t xavfsizligi' },
];

const INITIAL_LESSONS = [
    { id: 1, topicId: 1, topicName: 'Elektr sxemalar asoslari', topicCategory: 'Elektr jihozlari', date: '2026-02-10', time: '09:00', duration: '90', instructor: 'Abdullayev A.B.', location: 'O\'quv xonasi №1', status: 'completed', attendees: [1, 2, 3], notes: '' },
    { id: 2, topicId: 2, topicName: 'Xavfsizlik qoidalari', topicCategory: 'Texnik xavfsizlik', date: '2026-02-17', time: '10:00', duration: '60', instructor: 'Karimov S.T.', location: 'O\'quv xonasi №2', status: 'completed', attendees: [1, 2, 4], notes: '' },
    { id: 3, topicId: 3, topicName: 'Pnevmatik tizimlar', topicCategory: 'Mexanika va ta\'mirlash', date: '2026-02-24', time: '09:00', duration: '120', instructor: 'Abdullayev A.B.', location: 'O\'quv xonasi №1', status: 'planned', attendees: [], notes: '' },
    { id: 4, topicId: 4, topicName: 'Yangi lokomotiv turlari', topicCategory: 'Yangi texnologiyalar', date: '2026-03-03', time: '09:00', duration: '90', instructor: 'Toshmatov G.', location: 'O\'quv xonasi №1', status: 'planned', attendees: [], notes: '' },
];

// ===== Xodimlar =====
const INITIAL_WORKERS = [
    { id: 1, name: 'Abdullayev Botir', sex: '1-Sex', lavozim: 'Mashinist', tabelId: '1001', razryad: '3-toifa', lastExamDate: '2025-12-10', lastExamGrade: '5' },
    { id: 2, name: 'Qodirov Jamshid', sex: '2-Sex', lavozim: 'Elektrik', tabelId: '1002', razryad: '4-toifa', lastExamDate: '2026-01-15', lastExamGrade: '4' },
    { id: 3, name: 'Saliyeva Dildora', sex: 'Ofis', lavozim: 'Kadrlar bo\'limi', tabelId: '1003', razryad: '2-toifa', lastExamDate: '2025-11-20', lastExamGrade: '5' },
    { id: 4, name: 'Tursunov Alisher', sex: '3-Sex', lavozim: 'Payvandchi', tabelId: '1004', razryad: '3-toifa', lastExamDate: '2026-02-01', lastExamGrade: '3' },
];

// ===== Namuna yillik reja =====
const SAMPLE_ANNUAL_PLAN = {
    id: 1,
    name: '02-13-Seh yillik reja',
    year: 2025,
    direction: 'Chilangarlik ishi: Gaz-elektr Payvandchisi. Tokarlik ishi.',
    workshops: ['02', '13'],
    hourPerLesson: 2,
    author: 'Saqaliyev I.',
    consultant: 'Israilov I.A.',
    totalHours: 96,
    createdAt: '2025-01-15',
    lessons: (() => {
        const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
        const topics = [
            '2024 yil yo\'l qo\'yilgan braklar va nuqsonlar tahlili',
            'Xalqaro CI o\'lcham birliklari bo\'yicha umumiy tushuncha',
            'Metallar va materiallar bo\'yicha umumiy tushuncha',
            '2024 yil mehnat muhofazasi talab va qoidalari buzilishi tahlili',
            'Metall qotishmalarini mexanik xususiyatlari',
            'Po\'lat. Termik va kimyoviy ishlov berish',
            'Cho\'yanlar. Umumiy ma\'lumot',
            'Temir yo\'llarda yurish qonun va qoidalari',
            'Rangli metallar va qotishmalar',
            'Plastmassalar. Nometall materiallar',
            'Germetik materiallar',
            'Uch qirralik nazorat tizimi. Talon tizimi',
            'Moy va moylash materiallari',
            'Shtangen serkul va mikrometr o\'lchov asboblari',
            'Yassi maydonlarni belgilash usullari',
            'Chilangarlik asboblariga qo\'yiladigan talablar',
            'Metalllarni bukish va kesish usullari',
            'Metallarni kesish va maydonlarni egovlash',
            'Metallarni teshish va zinkirlash',
            'Shaxsiy himoya vositalari. O\'t o\'chirish turlari',
            'Metall materiallarga rezba ochish va shaberlash',
            'Tayyor detallarni pritirka qilish usullari',
            'Mehnat muhofazasi vakillarini ishlarini tashkil etish',
            'Inson travma olganda birinchi tibbiy yordam ko\'rsatish',
            'Dopusk va posadka tushunchalari',
            'Mashina va mexanizmlarni sxemalarini o\'qish',
            'Stanoklar klassifikatsiyasi',
            'Elektr himoya vositalari',
            'Gazoelektr payvandlash texnologiyasi',
            'Payvandlash elektrodlari va turlari',
            'Tokarlik stanoklariga texnik qarov ko\'rsatish (PPR)',
            'Balandlikda va yuqori balandlikda ishlarni tashkil etish',
            'Yemirilgan rezbalarni tiklash',
            'Elektr payvandchilarni lavozim yo\'riqnomasi',
            'Kran va zadvashkalarni ta\'mirlash',
            'Zaharlantsh va uning turlari',
            'Texnologik jarayonda qo\'llaniladigan texnik terminlar',
            'A-41 lokomotiv juft g\'ildiraklarini yo\'nish dastgoxiga texnik qarov',
            'A-41 lokomotiv juft g\'ildiraklarini yo\'nish dastgoxini ta\'mirlash',
            'Yo\'nish dastgoxlarini ta\'mirlashda mehnat muhofazasi talablari',
            '1130 Lokomotiv juft g\'ildiraklarini yo\'nish dastgoxiga texnik qarov',
            '1130 Yo\'nish dastgoxini ta\'mirlash',
            'Yuk ko\'tarish kranlarini xavfsiz ishlatishda qonun qoidalari (PUBE)',
            'Yuk ko\'tarish kranlarni statik va dinamik sinovdan o\'tkazish texnologiyasi',
            '1132 Lokomotiv juft g\'ildiraklarini yo\'nish dastgoxiga texnik qarov',
            '1132 Yo\'nish dastgoxini ta\'mirlash',
            'KDE-16 temir yo\'l kraniga texnik qarov ko\'rsatish',
            'Bilim sinovi',
        ];
        const lits = [
            'Hisobot ma\'lumot', 'V.A.Starichkov. Konspekt', 'G.K.Tatarinov. Konspekt', 'Hisobot ma\'lumot',
            'G.K.Tatarinov. Konspekt', 'G.K.Tatarinov. Konspekt', 'G.K.Tatarinov. Konspekt', 'Konspekt',
            'G.K.Tatarinov. Konspekt', 'G.K.Tatarinov. Konspekt', 'G.K.Tatarinov. Konspekt', 'Konspekt',
            'G.K.Tatarinov. Konspekt', 'Pasport. Konspekt', 'V.A.Starichkov', 'Konspekt',
            'V.A.Starichkov', 'V.A.Starichkov. Konspekt', 'V.A.Starichkov. Konspekt', 'Konspekt',
            'V.A.Starichkov', 'V.A.Starichkov', 'Konspekt', 'Konspekt',
            'Konspekt', 'V.A.Starichkov. Konspekt', 'N.I.Makienko. Konspekt', 'Konspekt',
            'Payvandlash yo\'riqnomasi', 'Konspekt', 'Konspekt. Grafik PPR', 'Yo\'riqnoma',
            'Payvandlash yo\'riqnomasi', 'Lavozim yo\'riqnomasi', 'V.K.Tepinkevich', 'Konspekt',
            'Tex. protsess', 'Yo\'riqnoma', 'Yo\'riqnoma', 'Konspekt',
            'Tex. pasport', 'Tex. pasport', 'PUBE', '(PUBE)',
            'Ta\'mir qo\'llanmasi', 'Ta\'mir qo\'llanmasi', 'Ta\'mir qo\'llanmasi', 'Test',
        ];
        const lessons = [];
        let num = 1;
        for (let m = 0; m < 12; m++) {
            for (let w = 0; w < 4; w++) {
                const idx = num - 1;
                lessons.push({
                    number: num,
                    month: MONTHS[m],
                    topic: topics[idx] || '',
                    hours: 2,
                    literature: lits[idx] || '',
                    instructor: '',
                });
                num++;
            }
        }
        return lessons;
    })(),
};

// ===== Tablar konfiguratsiyasi =====
const TABS = [
    { id: 'annualPlan', label: 'Yillik Reja', icon: ClipboardList, color: 'from-indigo-500 to-blue-600' },
    { id: 'schedule', label: 'Dars Jadvali', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
    { id: 'topics', label: 'Mavzular', icon: BookOpen, color: 'from-violet-500 to-purple-600' },
    { id: 'attendance', label: 'Qatnashish', icon: Users, color: 'from-emerald-500 to-green-600' },
    { id: 'protocol', label: 'Bayonnoma', icon: FileText, color: 'from-amber-500 to-orange-600' },
];

export default function Lessons() {
    const [activeTab, setActiveTab] = useState('annualPlan');
    const [selectedLessonForAttendance, setSelectedLessonForAttendance] = useState(null);

    // === Yillik Reja holati ===
    const [annualPlanView, setAnnualPlanView] = useState('list'); // 'list' | 'editor' | 'viewer'
    const [editingPlan, setEditingPlan] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(null);

    // LocalStorage dan yuklash
    const [topics, setTopics] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.topics);
            return saved ? JSON.parse(saved) : INITIAL_TOPICS;
        } catch { return INITIAL_TOPICS; }
    });

    const [lessons, setLessons] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.lessons);
            return saved ? JSON.parse(saved) : INITIAL_LESSONS;
        } catch { return INITIAL_LESSONS; }
    });

    const [annualPlans, setAnnualPlans] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.annualPlans);
            return saved ? JSON.parse(saved) : [SAMPLE_ANNUAL_PLAN];
        } catch { return [SAMPLE_ANNUAL_PLAN]; }
    });

    const [workers] = useState(() => {
        try {
            const saved = localStorage.getItem('oquv_workers');
            return saved ? JSON.parse(saved) : INITIAL_WORKERS;
        } catch { return INITIAL_WORKERS; }
    });

    // LocalStorage ga saqlash
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.topics, JSON.stringify(topics));
    }, [topics]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(lessons));
    }, [lessons]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.annualPlans, JSON.stringify(annualPlans));
    }, [annualPlans]);

    // === Yillik Reja funksiyalari ===
    const handleCreateNewPlan = () => {
        setEditingPlan(null);
        setAnnualPlanView('editor');
    };

    const handleViewPlan = (plan) => {
        setViewingPlan(plan);
        setAnnualPlanView('viewer');
    };

    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
        setAnnualPlanView('editor');
    };

    const handleDeletePlan = (planId) => {
        if (confirm('Ushbu yillik rejani o\'chirmoqchimisiz?')) {
            setAnnualPlans(prev => prev.filter(p => p.id !== planId));
        }
    };

    const handleSavePlan = (planData) => {
        setAnnualPlans(prev => {
            const exists = prev.find(p => p.id === planData.id);
            if (exists) {
                return prev.map(p => p.id === planData.id ? planData : p);
            }
            return [...prev, planData];
        });
        setAnnualPlanView('list');
        setEditingPlan(null);
    };

    const handleNavigateToAttendance = (lesson) => {
        setSelectedLessonForAttendance(lesson);
        setActiveTab('attendance');
    };

    useEffect(() => {
        if (activeTab !== 'attendance') {
            setSelectedLessonForAttendance(null);
        }
        if (activeTab !== 'annualPlan') {
            setAnnualPlanView('list');
            setEditingPlan(null);
            setViewingPlan(null);
        }
    }, [activeTab]);

    // Umumiy statistika
    const stats = {
        totalPlans: annualPlans.length,
        totalTopics: topics.length,
        totalLessons: lessons.length,
        completedLessons: lessons.filter(l => l.status === 'completed').length,
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-10">
            {/* Sarlavha */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Dars Jarayoni
                            <Sparkles size={18} className="text-amber-400" />
                        </h1>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Yillik rejalar, dars jadvali, qatnashish va bayonnomalar
                        </p>
                    </div>
                </div>

                {/* Mini statistika */}
                <div className="flex gap-3">
                    {[
                        { label: 'Rejalar', value: stats.totalPlans, color: 'text-indigo-400' },
                        { label: 'Mavzular', value: stats.totalTopics, color: 'text-violet-400' },
                        { label: 'Darslar', value: stats.totalLessons, color: 'text-blue-400' },
                        { label: 'O\'tkazildi', value: stats.completedLessons, color: 'text-emerald-400' },
                    ].map(s => (
                        <div key={s.label} className="text-center px-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl">
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tablar */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-1.5 inline-flex gap-1 w-full sm:w-auto overflow-x-auto">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const TabIcon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-initial justify-center whitespace-nowrap ${isActive
                                    ? 'text-white shadow-lg'
                                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg`}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            <span className="relative flex items-center gap-2">
                                <TabIcon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab kontenti */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'annualPlan' && (
                        <>
                            {annualPlanView === 'list' && (
                                <AnnualPlanList
                                    plans={annualPlans}
                                    onCreateNew={handleCreateNewPlan}
                                    onView={handleViewPlan}
                                    onEdit={handleEditPlan}
                                    onDelete={handleDeletePlan}
                                />
                            )}
                            {annualPlanView === 'editor' && (
                                <AnnualPlanEditor
                                    plan={editingPlan}
                                    onSave={handleSavePlan}
                                    onCancel={() => { setAnnualPlanView('list'); setEditingPlan(null); }}
                                />
                            )}
                            {annualPlanView === 'viewer' && viewingPlan && (
                                <AnnualPlanViewer
                                    plan={viewingPlan}
                                    onBack={() => { setAnnualPlanView('list'); setViewingPlan(null); }}
                                    onEdit={(p) => { setEditingPlan(p); setAnnualPlanView('editor'); }}
                                />
                            )}
                        </>
                    )}

                    {activeTab === 'schedule' && (
                        <LessonSchedule
                            lessons={lessons}
                            topics={topics}
                            onLessonsChange={setLessons}
                            onNavigateToAttendance={handleNavigateToAttendance}
                        />
                    )}

                    {activeTab === 'topics' && (
                        <TopicManager
                            topics={topics}
                            onTopicsChange={setTopics}
                        />
                    )}

                    {activeTab === 'attendance' && (
                        <AttendanceTracker
                            lessons={lessons}
                            workers={workers}
                            onLessonsChange={setLessons}
                            selectedLesson={selectedLessonForAttendance}
                        />
                    )}

                    {activeTab === 'protocol' && (
                        <ProtocolGenerator
                            lessons={lessons}
                            workers={workers}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
