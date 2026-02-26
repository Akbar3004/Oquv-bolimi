import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import TopicManager from '../components/lessons/TopicManager';
import LessonSchedule from '../components/lessons/LessonSchedule';
import AttendanceTracker from '../components/lessons/AttendanceTracker';
import ProtocolGenerator from '../components/lessons/ProtocolGenerator';

// ===== LocalStorage kalitlari =====
const STORAGE_KEYS = {
    topics: 'oquv_dars_topics',
    lessons: 'oquv_dars_lessons',
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

// ===== Xodimlar (Workers.jsx dagi bilan bir xil) =====
const INITIAL_WORKERS = [
    { id: 1, name: 'Abdullayev Botir', sex: '1-Sex', lavozim: 'Mashinist', tabelId: '1001', razryad: '3-toifa', lastExamDate: '2025-12-10', lastExamGrade: '5' },
    { id: 2, name: 'Qodirov Jamshid', sex: '2-Sex', lavozim: 'Elektrik', tabelId: '1002', razryad: '4-toifa', lastExamDate: '2026-01-15', lastExamGrade: '4' },
    { id: 3, name: 'Saliyeva Dildora', sex: 'Ofis', lavozim: 'Kadrlar bo\'limi', tabelId: '1003', razryad: '2-toifa', lastExamDate: '2025-11-20', lastExamGrade: '5' },
    { id: 4, name: 'Tursunov Alisher', sex: '3-Sex', lavozim: 'Payvandchi', tabelId: '1004', razryad: '3-toifa', lastExamDate: '2026-02-01', lastExamGrade: '3' },
];

// ===== Tablar konfiguratsiyasi =====
const TABS = [
    { id: 'schedule', label: 'Dars Jadvali', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
    { id: 'topics', label: 'Mavzular', icon: BookOpen, color: 'from-violet-500 to-purple-600' },
    { id: 'attendance', label: 'Qatnashish', icon: Users, color: 'from-emerald-500 to-green-600' },
    { id: 'protocol', label: 'Bayonnoma', icon: FileText, color: 'from-amber-500 to-orange-600' },
];

export default function Lessons() {
    const [activeTab, setActiveTab] = useState('schedule');
    const [selectedLessonForAttendance, setSelectedLessonForAttendance] = useState(null);

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

    // Workers — hozircha Workers.jsx dagi localStorage dan yuklash
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

    // Qatnashish tabiga o'tish (dars jadvalidan)
    const handleNavigateToAttendance = (lesson) => {
        setSelectedLessonForAttendance(lesson);
        setActiveTab('attendance');
    };

    // Tab o'zgarganda tanlangan darsni tozalash
    useEffect(() => {
        if (activeTab !== 'attendance') {
            setSelectedLessonForAttendance(null);
        }
    }, [activeTab]);

    // Umumiy statistika
    const stats = {
        totalTopics: topics.length,
        totalLessons: lessons.length,
        completedLessons: lessons.filter(l => l.status === 'completed').length,
        totalAttendees: lessons.reduce((sum, l) => sum + (l.attendees?.length || 0), 0),
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
                            Dars jadvali, mavzular, qatnashish va bayonnomalar
                        </p>
                    </div>
                </div>

                {/* Mini statistika */}
                <div className="flex gap-3">
                    {[
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
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-1.5 inline-flex gap-1 w-full sm:w-auto">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const TabIcon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-initial justify-center ${isActive
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
