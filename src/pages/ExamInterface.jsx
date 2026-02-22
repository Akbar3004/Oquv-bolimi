import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    LogOut, User, Clock, BookOpen, ChevronRight, CheckCircle,
    AlertCircle, Timer, Award, Hash, ArrowRight
} from 'lucide-react';

// Demo imtihon savollari
const DEMO_QUESTIONS = [
    {
        id: 1,
        question: "Lokomotivning asosiy vazifasi nima?",
        options: [
            "Yo'lovchilarni tashish",
            "Vagonlarni tortish va harakatga keltirish",
            "Temiryo'l izlarini ta'mirlash",
            "Signal berish"
        ],
        correct: 1,
    },
    {
        id: 2,
        question: "Temiryo'l signalizatsiyasida qizil rang nimani bildiradi?",
        options: [
            "Harakatga ruxsat",
            "Ehtiyotkorlik bilan harakatlanish",
            "To'liq to'xtash",
            "Sekinlashtirish"
        ],
        correct: 2,
    },
    {
        id: 3,
        question: "Lokomotivdagi tormoz tizimi qanday turga bo'linadi?",
        options: [
            "Faqat mexanik",
            "Faqat elektrik",
            "Mexanik va pnevmatik",
            "Gidravlik"
        ],
        correct: 2,
    },
    {
        id: 4,
        question: "Temir yo'l bo'ylab qanday tezlikda harakatlanish kerak?",
        options: [
            "Shaxsiy xohishga qarab",
            "Belgilangan tezlik chegarasiga rioya qilgan holda",
            "Iloji boricha tez",
            "Faqat sekin"
        ],
        correct: 1,
    },
    {
        id: 5,
        question: "Lokomotivchi ish boshlashdan oldin nimani tekshirishi shart?",
        options: [
            "Faqat yoqilg'i mavjudligini",
            "Lokomotivning texnik holatini to'liq tekshirish",
            "Faqat tormoz tizimini",
            "Faqat chiroqlarni"
        ],
        correct: 1,
    },
];

export default function ExamInterface() {
    const { currentUser, logout } = useAuth();
    const [examState, setExamState] = useState('intro'); // 'intro' | 'exam' | 'result'
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(300); // 5 daqiqa
    const [selectedOption, setSelectedOption] = useState(null);

    // Timer
    useEffect(() => {
        if (examState !== 'exam') return;
        if (timeLeft <= 0) {
            setExamState('result');
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [examState, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId, optionIndex) => {
        setSelectedOption(optionIndex);
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleNext = () => {
        if (currentQuestion < DEMO_QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOption(answers[DEMO_QUESTIONS[currentQuestion + 1]?.id] ?? null);
        } else {
            setExamState('result');
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            setSelectedOption(answers[DEMO_QUESTIONS[currentQuestion - 1]?.id] ?? null);
        }
    };

    // Natijani hisoblash
    const calculateResult = () => {
        let correct = 0;
        DEMO_QUESTIONS.forEach(q => {
            if (answers[q.id] === q.correct) correct++;
        });
        return {
            correct,
            total: DEMO_QUESTIONS.length,
            percentage: Math.round((correct / DEMO_QUESTIONS.length) * 100),
            grade: correct >= 4 ? '5' : correct >= 3 ? '4' : correct >= 2 ? '3' : '2',
        };
    };

    const workerData = currentUser?.workerData;

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white">
            {/* Top Bar */}
            <div className="bg-[#111827]/90 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {workerData?.name?.charAt(0) || 'X'}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{workerData?.name || 'Xodim'}</p>
                        <p className="text-xs text-slate-500">
                            {workerData?.sex} • Tabel: {workerData?.tabelId || '—'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {examState === 'exam' && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 60 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white'
                            }`}>
                            <Timer className="w-4 h-4" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Chiqish
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* INTRO */}
                {examState === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8 py-10"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/20 relative"
                        >
                            <BookOpen className="w-12 h-12 text-white" />
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl blur-2xl opacity-30" />
                        </motion.div>

                        <div>
                            <h1 className="text-3xl font-black mb-2">Bilimlarni Tekshirish</h1>
                            <p className="text-slate-400">O'zbekiston Lokomotiv Deposi — O'quv Bo'limi</p>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <p className="text-2xl font-bold text-amber-400">{DEMO_QUESTIONS.length}</p>
                                <p className="text-xs text-slate-500">Savollar</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <p className="text-2xl font-bold text-blue-400">5:00</p>
                                <p className="text-xs text-slate-500">Daqiqa</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <p className="text-2xl font-bold text-green-400">60%</p>
                                <p className="text-xs text-slate-500">O'tish bali</p>
                            </div>
                        </div>

                        {/* Worker Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {workerData?.name?.charAt(0) || '?'}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold">{workerData?.name}</h3>
                                    <p className="text-sm text-slate-400">{workerData?.lavozim}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Hash className="w-4 h-4" />
                                    <span>Tabel: <span className="text-white font-mono">{workerData?.tabelId}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Award className="w-4 h-4" />
                                    <span>Razryad: <span className="text-white">{workerData?.razryad}</span></span>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setExamState('exam')}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl font-bold text-lg flex items-center gap-3 mx-auto shadow-xl shadow-amber-500/25 transition-all"
                        >
                            Imtihonni Boshlash
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                )}

                {/* EXAM */}
                {examState === 'exam' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Savol {currentQuestion + 1} / {DEMO_QUESTIONS.length}</span>
                                <span>{Object.keys(answers).length} javob berildi</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${((currentQuestion + 1) / DEMO_QUESTIONS.length) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        {/* Question Navigation Pills */}
                        <div className="flex gap-2 justify-center flex-wrap">
                            {DEMO_QUESTIONS.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => { setCurrentQuestion(i); setSelectedOption(answers[q.id] ?? null); }}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${i === currentQuestion
                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                            : answers[q.id] !== undefined
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-white/5 text-slate-500 border border-white/10'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        {/* Question Card */}
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6"
                        >
                            <h2 className="text-xl font-bold leading-relaxed">
                                <span className="text-amber-400 mr-2">{currentQuestion + 1}.</span>
                                {DEMO_QUESTIONS[currentQuestion].question}
                            </h2>

                            <div className="space-y-3">
                                {DEMO_QUESTIONS[currentQuestion].options.map((option, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => handleAnswer(DEMO_QUESTIONS[currentQuestion].id, index)}
                                        className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 flex items-center gap-4 group ${selectedOption === index
                                                ? 'bg-amber-500/10 border-amber-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${selectedOption === index
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white/10 text-slate-500 group-hover:bg-white/20'
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="text-sm">{option}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <button
                                onClick={handlePrev}
                                disabled={currentQuestion === 0}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Oldingi
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                            >
                                {currentQuestion === DEMO_QUESTIONS.length - 1 ? 'Yakunlash' : 'Keyingi'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* RESULT */}
                {examState === 'result' && (() => {
                    const result = calculateResult();
                    const isPassed = result.percentage >= 60;
                    return (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 py-10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className={`mx-auto w-28 h-28 rounded-full flex items-center justify-center shadow-2xl relative ${isPassed
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20'
                                        : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'
                                    }`}
                            >
                                {isPassed ? (
                                    <CheckCircle className="w-14 h-14 text-white" />
                                ) : (
                                    <AlertCircle className="w-14 h-14 text-white" />
                                )}
                                <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${isPassed ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                            </motion.div>

                            <div>
                                <h1 className={`text-4xl font-black mb-2 ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPassed ? "Tabriklaymiz! 🎉" : "Afsuski..."}
                                </h1>
                                <p className="text-slate-400">
                                    {isPassed ? "Siz imtihondan muvaffaqiyatli o'tdingiz!" : "Siz imtihondan o'ta olmadingiz. Qayta urinib ko'ring."}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
                                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                                    <p className="text-3xl font-black text-white">{result.correct}</p>
                                    <p className="text-xs text-slate-500">To'g'ri</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                                    <p className="text-3xl font-black text-white">{result.total - result.correct}</p>
                                    <p className="text-xs text-slate-500">Noto'g'ri</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                                    <p className={`text-3xl font-black ${isPassed ? 'text-green-400' : 'text-red-400'}`}>{result.percentage}%</p>
                                    <p className="text-xs text-slate-500">Foiz</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                                    <p className={`text-3xl font-black ${isPassed ? 'text-green-400' : 'text-red-400'}`}>{result.grade}</p>
                                    <p className="text-xs text-slate-500">Baho</p>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={logout}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                                >
                                    Chiqish
                                </button>
                            </div>
                        </motion.div>
                    );
                })()}
            </div>
        </div>
    );
}
