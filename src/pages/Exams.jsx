
import React, { useState, useEffect, useMemo } from 'react';
import {
    UserCheck, Clock, Monitor, XCircle, CheckCircle, FileText, Download,
    Play, AlertTriangle, Loader2, Plus, Trash2, Edit3, Search, Save,
    Settings, BookOpen, ClipboardList, Activity, BarChart3, StopCircle,
    Hash, Award, MapPin, Timer, ChevronDown, ChevronUp, Eye, X, Shuffle,
    Upload, FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import ExamResultPDF from '../components/ExamResultPDF';
import { examStore } from '../utils/examStore';
import { useAuth } from '../contexts/AuthContext';

// Mock xodimlar (Workers.jsx bilan bir xil)
const KNOWN_WORKERS = [
    { id: 1, name: 'Abdullayev Botir', sex: '1-Sex', lavozim: 'Mashinist', tabelId: '1001', razryad: '3-toifa' },
    { id: 2, name: 'Qodirov Jamshid', sex: '2-Sex', lavozim: 'Elektrik', tabelId: '1002', razryad: '4-toifa' },
    { id: 3, name: 'Saliyeva Dildora', sex: 'Ofis', lavozim: "Kadrlar bo'limi", tabelId: '1003', razryad: '2-toifa' },
    { id: 4, name: 'Tursunov Alisher', sex: '3-Sex', lavozim: 'Payvandchi', tabelId: '1004', razryad: '3-toifa' },
];

const EXAM_TYPES = ['Kvartalni', 'Razryad', 'Tayyorlanish'];

// ==================== ASOSIY KOMPONENT ====================
export default function Exams() {
    const [activeTab, setActiveTab] = useState('questions');
    const { users } = useAuth();

    // TCHNUK ismini AuthContext dan olish
    const tchnukName = useMemo(() => {
        const tchnukUser = users?.find(u => u.role === 'tchnuk');
        return tchnukUser?.fullName || "O'quv bo'limi rahbari";
    }, [users]);

    const tabs = [
        { id: 'questions', label: 'Savollar Bazasi', icon: <BookOpen size={16} /> },
        { id: 'assign', label: 'Tayinlash', icon: <ClipboardList size={16} /> },
        { id: 'live', label: 'Jarayon (Live)', icon: <Activity size={16} /> },
        { id: 'settings', label: 'Sozlamalar', icon: <Settings size={16} /> },
        { id: 'results', label: 'Natijalar', icon: <BarChart3 size={16} /> },
    ];

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Imtihon Tizimi</h1>
                <div className="flex gap-1 p-1 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md'
                                : 'hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'questions' && <QuestionsTab />}
            {activeTab === 'assign' && <AssignTab />}
            {activeTab === 'live' && <LiveTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'results' && <ResultsTab tchnukName={tchnukName} />}
        </div>
    );
}

// ==================== 1. SAVOLLAR BAZASI ====================
function QuestionsTab() {
    const [banks, setBanks] = useState(examStore.getQuestionBanks());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [expandedBank, setExpandedBank] = useState(null);

    const refreshBanks = () => setBanks(examStore.getQuestionBanks());

    const handleDelete = (bankId) => {
        if (confirm("Bu savollar bazasini o'chirmoqchimisiz?")) {
            examStore.deleteQuestionBank(bankId);
            refreshBanks();
        }
    };

    const handleEdit = (bank) => {
        setEditingBank(bank);
        setIsModalOpen(true);
    };

    const handleSave = (bankData) => {
        if (editingBank) {
            examStore.updateQuestionBank(editingBank.id, bankData);
        } else {
            examStore.createQuestionBank(bankData);
        }
        setIsModalOpen(false);
        setEditingBank(null);
        refreshBanks();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                    Jami: <strong>{banks.length}</strong> ta test to'plami
                </p>
                <button
                    onClick={() => { setEditingBank(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} /> Yangi Test To'plami
                </button>
            </div>

            {banks.length === 0 ? (
                <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
                    <BookOpen className="mx-auto mb-4 opacity-30" size={48} />
                    <p className="text-lg font-medium">Savollar bazasi bo'sh</p>
                    <p className="text-sm mt-1">Yangi test to'plami yarating</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {banks.map(bank => (
                        <div key={bank.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden shadow-sm">
                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                                        {bank.questions?.length || 0}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg truncate">{bank.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{bank.seh || 'Barchasi'}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">{bank.lavozim || 'Barchasi'}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{bank.razryad || 'Barchasi'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <button onClick={() => setExpandedBank(expandedBank === bank.id ? null : bank.id)}
                                        className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors" title="Savollarni ko'rish">
                                        {expandedBank === bank.id ? <ChevronUp size={18} /> : <Eye size={18} />}
                                    </button>
                                    <button onClick={() => handleEdit(bank)}
                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="Tahrirlash">
                                        <Edit3 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(bank.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors" title="O'chirish">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            {expandedBank === bank.id && bank.questions?.length > 0 && (
                                <div className="border-t border-[hsl(var(--border))] px-5 py-4 bg-[hsl(var(--secondary)/0.3)] max-h-80 overflow-y-auto space-y-3">
                                    {bank.questions.map((q, i) => (
                                        <div key={i} className="bg-[hsl(var(--card))] rounded-lg p-3 border border-[hsl(var(--border))] text-sm">
                                            <p className="font-medium mb-2"><span className="text-[hsl(var(--primary))]">{i + 1}.</span> {q.question}</p>
                                            <div className="grid grid-cols-2 gap-1">
                                                {q.options.map((opt, j) => (
                                                    <span key={j} className={`px-2 py-1 rounded text-xs ${j === q.correct ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold' : 'text-[hsl(var(--muted-foreground))]'}`}>
                                                        {String.fromCharCode(65 + j)}) {opt}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <QuestionBankModal
                    bank={editingBank}
                    onSave={handleSave}
                    onClose={() => { setIsModalOpen(false); setEditingBank(null); }}
                />
            )}
        </div>
    );
}

// === Savollar bazasi modal (AddWorkshopModal uslubida) ===
function QuestionBankModal({ bank, onSave, onClose }) {
    const [name, setName] = useState(bank?.name || '');
    const [seh, setSeh] = useState(bank?.seh || 'Barchasi');
    const [lavozim, setLavozim] = useState(bank?.lavozim || 'Barchasi');
    const [razryad, setRazryad] = useState(bank?.razryad || 'Barchasi');
    const [questions, setQuestions] = useState(bank?.questions || [{ question: '', options: ['', '', '', ''], correct: 0 }]);
    const [importErrors, setImportErrors] = useState([]);
    const [importSuccess, setImportSuccess] = useState('');

    const addQuestion = () => setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 0 }]);

    const removeQuestion = (idx) => {
        if (questions.length <= 1) return;
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx, field, val) => {
        const updated = [...questions];
        if (field === 'question') updated[idx].question = val;
        else if (field === 'correct') updated[idx].correct = val;
        else if (field.startsWith('option_')) {
            const optIdx = parseInt(field.split('_')[1]);
            updated[idx].options[optIdx] = val;
        }
        setQuestions(updated);
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!name.trim()) return alert("To'plam nomini kiriting!");
        const validQ = questions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
        if (validQ.length === 0) return alert("Kamida 1 ta to'liq savol kiriting!");
        onSave({ name, seh, lavozim, razryad, questions: validQ });
    };

    // Import qilish
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        setImportErrors([]);
        setImportSuccess('');

        try {
            const result = await examStore.importTestQuestions(file);

            if (result.errors.length > 0) {
                setImportErrors(result.errors);
            }

            if (result.questions.length > 0) {
                // Mavjud bo'sh savolni (faqat bitta bo'sh bo'lsa) olib tashlab, import savollarini qo'shish
                const hasOnlyEmptyQuestion = questions.length === 1 && !questions[0].question.trim();
                if (hasOnlyEmptyQuestion) {
                    setQuestions(result.questions);
                } else {
                    setQuestions([...questions, ...result.questions]);
                }
                setImportSuccess(`${result.questions.length} ta savol muvaffaqiyatli yuklandi!`);
                setTimeout(() => setImportSuccess(''), 5000);
            } else if (result.errors.length === 0) {
                setImportErrors([{ row: '-', message: 'Faylda hech qanday savol topilmadi' }]);
            }
        } catch (err) {
            console.error('Import xatolik:', err);
            setImportErrors([{ row: '-', message: 'Fayl formatini tekshiring. Faqat .xlsx yoki .xls fayllarini yuklang.' }]);
        }
    };

    // Export
    const handleExport = () => {
        const validQ = questions.filter(q => q.question.trim());
        if (validQ.length === 0) return alert("Export qilish uchun kamida 1 ta savol kerak!");
        examStore.exportTestQuestions(validQ, name || 'Test_Savollari');
    };

    const inputCls = "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
    const selectCls = inputCls;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {bank ? "Test To'plamini Tahrirlash" : "Yangi Test To'plami"}
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                        {/* To'plam nomi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                To'plam Nomi <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                className={inputCls} placeholder="Masalan: Mashinist asosiy testlari" />
                        </div>

                        {/* Seh, Lavozim, Razryad */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seh</label>
                                <select value={seh} onChange={e => setSeh(e.target.value)} className={selectCls}>
                                    <option value="Barchasi">Barchasi</option>
                                    <option value="1-Sex">1-Sex</option><option value="2-Sex">2-Sex</option>
                                    <option value="3-Sex">3-Sex</option><option value="Ofis">Ofis</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lavozim</label>
                                <select value={lavozim} onChange={e => setLavozim(e.target.value)} className={selectCls}>
                                    <option value="Barchasi">Barchasi</option>
                                    <option>Mashinist</option><option>Elektrik</option>
                                    <option>Payvandchi</option><option>Kadrlar bo'limi</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Razryad</label>
                                <select value={razryad} onChange={e => setRazryad(e.target.value)} className={selectCls}>
                                    <option value="Barchasi">Barchasi</option>
                                    <option>2-toifa</option><option>3-toifa</option>
                                    <option>4-toifa</option><option>5-toifa</option>
                                </select>
                            </div>
                        </div>

                        {/* Import / Export / Namuna tugmalari */}
                        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={() => examStore.downloadTestTemplate()}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                                <Download size={16} /> Namuna Yuklab Olish
                            </button>
                            <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-700 dark:text-gray-300">
                                <Upload size={16} /> Import (Excel)
                                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                            </label>
                            <button type="button" onClick={handleExport}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10">
                                <FileDown size={16} /> Export (Excel)
                            </button>
                        </div>

                        {/* Import xatoliklari */}
                        <AnimatePresence>
                            {importErrors.length > 0 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Import Xatoliklari ({importErrors.length})
                                        </h4>
                                        <button type="button" onClick={() => setImportErrors([])} className="text-red-400 hover:text-red-600 p-1 rounded">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {importErrors.map((err, i) => (
                                            <p key={i} className="text-xs text-red-600 dark:text-red-400">
                                                <strong>Qator {err.row}:</strong> {err.message}
                                            </p>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Import muvaffaqiyat */}
                        <AnimatePresence>
                            {importSuccess && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm">
                                    <CheckCircle size={16} /> {importSuccess}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Savollar ro'yxati */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Savollar <span className="text-gray-400">({questions.length} ta)</span>
                                </label>
                                <button type="button" onClick={addQuestion}
                                    className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                                    <Plus size={14} /> Savol Qo'shish
                                </button>
                            </div>
                            {questions.map((q, qi) => (
                                <div key={qi} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Savol #{qi + 1}</span>
                                        {questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(qi)}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                    <input value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)}
                                        className={inputCls} placeholder="Savol matnini kiriting..." />
                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options.map((opt, oi) => (
                                            <div key={oi} className="flex items-center gap-2">
                                                <input type="radio" name={`correct_${qi}`} checked={q.correct === oi}
                                                    onChange={() => updateQuestion(qi, 'correct', oi)} className="accent-green-500 w-4 h-4" />
                                                <input value={opt} onChange={e => updateQuestion(qi, `option_${oi}`, e.target.value)}
                                                    className={`${inputCls} flex-1`} placeholder={`${String.fromCharCode(65 + oi)} variant`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 shrink-0">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            Bekor qilish
                        </button>
                        <button type="button" onClick={handleSubmit}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow-md">
                            <Save size={18} /> Saqlash
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ==================== 2. TAYINLASH ====================
function AssignTab() {
    const [tabelId, setTabelId] = useState('');
    const [foundWorker, setFoundWorker] = useState(null);
    const [examType, setExamType] = useState('');
    const [selectedBank, setSelectedBank] = useState(null);
    const [questionCount, setQuestionCount] = useState(20);
    const [matchingBanks, setMatchingBanks] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleTabelSearch = () => {
        setError(''); setSuccess(''); setFoundWorker(null); setMatchingBanks([]);
        if (!tabelId.trim()) return setError("Tabel raqamni kiriting!");
        const worker = KNOWN_WORKERS.find(w => w.tabelId === tabelId.trim());
        if (!worker) return setError("Bu tabel raqam bo'yicha xodim topilmadi!");
        setFoundWorker(worker);
        const banks = examStore.findMatchingBanks(worker.sex, worker.lavozim, worker.razryad);
        setMatchingBanks(banks);
        if (banks.length > 0) setSelectedBank(banks[0]);
    };

    const handleAssign = () => {
        if (!foundWorker) return setError("Avval xodimni toping!");
        if (!examType) return setError("Imtihon turini tanlang!");
        if (!selectedBank) return setError("Test to'plamini tanlang!");
        if (questionCount < 1) return setError("Savollar sonini kiriting!");

        const maxQ = selectedBank.questions?.length || 0;
        if (questionCount > maxQ) return setError(`Bu to'plamda faqat ${maxQ} ta savol bor!`);

        examStore.createActiveExam({
            worker: { ...foundWorker },
            examType,
            questions: selectedBank.questions,
            questionCount,
            bankName: selectedBank.name,
        });

        setSuccess(`${foundWorker.name} uchun "${examType}" imtihoni tayinlandi!`);
        setTabelId(''); setFoundWorker(null); setExamType(''); setSelectedBank(null); setQuestionCount(20);
        setTimeout(() => setSuccess(''), 4000);
    };

    const inputCls = "w-full px-3 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {success && (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm animate-in fade-in">
                    <CheckCircle size={20} /> {success}
                </div>
            )}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-in fade-in">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* Tabel raqam */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Hash size={20} /> Xodimni Topish</h3>
                <div className="flex gap-3">
                    <input value={tabelId} onChange={e => { setTabelId(e.target.value); setError(''); }}
                        className={`${inputCls} flex-1 font-mono text-center text-lg tracking-wider`}
                        placeholder="Tabel raqamni kiriting..." onKeyDown={e => e.key === 'Enter' && handleTabelSearch()} />
                    <button onClick={handleTabelSearch}
                        className="px-6 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 flex items-center gap-2">
                        <Search size={18} /> Qidirish
                    </button>
                </div>
            </div>

            {/* Topilgan xodim */}
            {foundWorker && (
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                            {foundWorker.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{foundWorker.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {foundWorker.sex}</span>
                                <span className="flex items-center gap-1"><UserCheck size={12} /> {foundWorker.lavozim}</span>
                                <span className="flex items-center gap-1"><Award size={12} /> {foundWorker.razryad}</span>
                            </div>
                        </div>
                    </div>

                    {/* Imtihon turi */}
                    <div>
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-2 block">Imtihon Turi (maqsadi)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {EXAM_TYPES.map(t => (
                                <button key={t} onClick={() => setExamType(t)}
                                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${examType === t
                                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Test to'plami */}
                    <div>
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-2 block">
                            Mos Test To'plami ({matchingBanks.length} ta topildi)
                        </label>
                        {matchingBanks.length === 0 ? (
                            <p className="text-sm text-amber-500 py-2">Bu xodim uchun mos test to'plami topilmadi. Avval "Savollar Bazasi" bo'limida yarating.</p>
                        ) : (
                            <select value={selectedBank?.id || ''} onChange={e => setSelectedBank(matchingBanks.find(b => b.id === e.target.value))} className={inputCls}>
                                {matchingBanks.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.questions?.length || 0} savol)</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Savollar soni */}
                    {selectedBank && (
                        <div>
                            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-2 block">
                                Savollar soni (max: {selectedBank.questions?.length || 0})
                            </label>
                            <input type="number" min="1" max={selectedBank.questions?.length || 250}
                                value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value) || 1)}
                                className={`${inputCls} max-w-[200px] font-mono text-center text-lg`} />
                        </div>
                    )}

                    <button onClick={handleAssign}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all">
                        <Play size={20} /> Imtihonni Tayinlash
                    </button>
                </div>
            )}
        </div>
    );
}

// ==================== 3. JARAYON (LIVE) ====================
function LiveTab() {
    const [activeExams, setActiveExams] = useState(examStore.getActiveExams());
    const refresh = () => setActiveExams(examStore.getActiveExams());

    useEffect(() => {
        const interval = setInterval(refresh, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleFinish = (examId) => {
        if (confirm("Bu imtihonni tugatmoqchimisiz?")) {
            examStore.finishExam(examId);
            refresh();
        }
    };

    const handleAutoFail = (examId) => {
        examStore.updateActiveExam(examId, { status: 'failed' });
        examStore.finishExam(examId);
        refresh();
    };

    if (activeExams.length === 0) {
        return (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
                <Monitor className="mx-auto mb-4 opacity-30" size={48} />
                <p className="text-lg font-medium">Hozirda faol imtihonlar yo'q</p>
                <p className="text-sm mt-1">Tayinlash bo'limida yangi imtihon boshlang</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeExams.map(exam => {
                const progress = exam.correct + exam.wrong;
                const total = exam.totalQuestions;
                const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
                const isWarning = exam.wrong >= Math.floor(exam.maxErrors * 0.7);
                const isFailed = exam.wrong >= exam.maxErrors;

                if (isFailed && exam.status !== 'failed') {
                    setTimeout(() => handleAutoFail(exam.id), 100);
                }

                return (
                    <div key={exam.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{exam.worker?.name}</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">{exam.worker?.lavozim} • {exam.worker?.sex}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">{exam.examType}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-mono">#{exam.worker?.tabelId}</span>
                                </div>
                            </div>
                            <div className={`p-2 rounded-lg ${isWarning ? 'bg-red-100 dark:bg-red-900/20 text-red-500' : 'bg-[hsl(var(--secondary))]'}`}>
                                <Monitor size={20} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Jarayon: {progress}/{total}</span>
                                <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full transition-all duration-500 ${isWarning ? 'bg-red-500' : 'bg-[hsl(var(--primary))]'}`}
                                    style={{ width: `${pct}%` }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center mb-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                                <span className="block text-2xl font-black text-green-600 dark:text-green-400">{exam.correct}</span>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">To'g'ri</span>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                                <span className="block text-2xl font-black text-red-600 dark:text-red-400">{exam.wrong}</span>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">Xato ({exam.maxErrors} max)</span>
                            </div>
                        </div>

                        <button onClick={() => handleFinish(exam.id)}
                            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                            <StopCircle size={16} /> Imtihonni Tugatish
                        </button>

                        {isFailed && (
                            <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg animate-pulse text-lg">Yiqildi (Avto)</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ==================== 4. SOZLAMALAR ====================
function SettingsTab() {
    const [settings, setSettings] = useState(examStore.getSettings());
    const [saved, setSaved] = useState(false);

    const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

    const handleSave = () => {
        examStore.saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (confirm("Barcha sozlamalarni standart holatga qaytarmoqchimisiz?")) {
            setSettings(examStore.DEFAULT_SETTINGS);
            examStore.saveSettings(examStore.DEFAULT_SETTINGS);
        }
    };

    const inputCls = "w-full px-3 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {saved && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm animate-in fade-in">
                    <CheckCircle size={18} /> Sozlamalar saqlandi!
                </div>
            )}

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><Settings size={22} /> Imtihon Sozlamalari</h3>

                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Maksimal xato soni (avtomatik tugatilsin)</label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Xodim shu miqdorda xato qilsa, imtihon avtomatik tugatiladi</p>
                        <input type="number" min="1" max="50" value={settings.maxErrors} onChange={e => update('maxErrors', parseInt(e.target.value) || 5)}
                            className={`${inputCls} max-w-[150px] font-mono text-center text-lg`} />
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-1 block">Imtihon davomiyligi (daqiqa)</label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Har bir imtihon uchun ajratilgan vaqt</p>
                        <input type="number" min="5" max="180" value={settings.examDuration} onChange={e => update('examDuration', parseInt(e.target.value) || 30)}
                            className={`${inputCls} max-w-[150px] font-mono text-center text-lg`} />
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-1 block">O'tish foizi (%)</label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Imtihondan o'tish uchun minimal ball</p>
                        <input type="number" min="10" max="100" value={settings.passingPercent} onChange={e => update('passingPercent', parseInt(e.target.value) || 60)}
                            className={`${inputCls} max-w-[150px] font-mono text-center text-lg`} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[hsl(var(--secondary)/0.3)] rounded-xl border border-[hsl(var(--border))]">
                        <div>
                            <label className="text-sm font-semibold">Savollar tartibini aralashtirish</label>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Har safar savol random tartibda chiqadi</p>
                        </div>
                        <button onClick={() => update('randomOrder', !settings.randomOrder)}
                            className={`w-12 h-7 rounded-full transition-colors relative ${settings.randomOrder ? 'bg-green-500' : 'bg-[hsl(var(--secondary))]'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings.randomOrder ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={handleReset} className="flex-1 py-3 border border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--secondary))] transition-colors text-sm font-medium">
                    Standart Sozlamalar
                </button>
                <button onClick={handleSave} className="flex-1 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl hover:opacity-90 transition-opacity text-sm font-bold flex items-center justify-center gap-2">
                    <Save size={16} /> Saqlash
                </button>
            </div>
        </div>
    );
}

// ==================== 5. NATIJALAR ====================
function ResultsTab({ tchnukName }) {
    const [subTab, setSubTab] = useState('Kvartalni');
    const [results, setResults] = useState(examStore.getResults());
    const [loadingPdfId, setLoadingPdfId] = useState(null);

    useEffect(() => { setResults(examStore.getResults()); }, [subTab]);

    const filteredResults = results.filter(r => r.examType === subTab);

    const imageToDataUrl = (url) => new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); resolve(c.toDataURL('image/png')); };
        img.onerror = () => resolve(null);
        img.src = url;
    });

    const generatePDF = async (result) => {
        setLoadingPdfId(result.id);
        try {
            const qrDataUrl = await QRCode.toDataURL(`https://railway-exam.uz/verify/${result.id}`, { width: 150, margin: 1, color: { dark: '#000', light: '#fff' } });
            const logoDataUrl = await imageToDataUrl('/logo.png');
            const pdfResult = {
                id: result.id,
                name: result.worker?.name || '-',
                position: result.worker?.lavozim || '-',
                workshop: result.worker?.sex || '-',
                tabelId: result.worker?.tabelId || '-',
                examType: result.examType,
                examFile: result.bankName || '-',
                date: result.date,
                startTime: result.startTime,
                endTime: result.endTime,
                duration: '-',
                grade: result.grade,
                score: result.score,
                tchnuk: tchnukName,
            };
            const blob = await pdf(<ExamResultPDF result={pdfResult} qrDataUrl={qrDataUrl} logoDataUrl={logoDataUrl} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${(result.worker?.name || 'Natija').replace(/\s+/g, '_')}_${result.examType}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF xatolik:', err);
            alert("PDF yaratishda xatolik!");
        } finally {
            setLoadingPdfId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2 p-1 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
                    {EXAM_TYPES.map(t => (
                        <button key={t} onClick={() => setSubTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${subTab === t ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md' : 'hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'}`}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="font-medium">TCHNUK:</span> <span className="font-bold text-[hsl(var(--foreground))]">{tchnukName}</span>
                </div>
            </div>

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
                {filteredResults.length === 0 ? (
                    <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
                        <BarChart3 className="mx-auto mb-4 opacity-30" size={48} />
                        <p className="text-lg font-medium">"{subTab}" bo'yicha natijalar topilmadi</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">F.I.SH</th>
                                    <th className="px-4 py-3">Seh</th>
                                    <th className="px-4 py-3">Sana</th>
                                    <th className="px-4 py-3">Natija</th>
                                    <th className="px-4 py-3">Baho</th>
                                    <th className="px-4 py-3">Holat</th>
                                    <th className="px-4 py-3">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {filteredResults.map((r, i) => (
                                    <tr key={r.id} className="hover:bg-[hsl(var(--secondary)/0.5)] transition-colors">
                                        <td className="px-4 py-3 font-mono text-[hsl(var(--muted-foreground))]">{i + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{r.worker?.name}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{r.worker?.lavozim} • #{r.worker?.tabelId}</div>
                                        </td>
                                        <td className="px-4 py-3">{r.worker?.sex}</td>
                                        <td className="px-4 py-3">{r.date}</td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-green-600 dark:text-green-400">{r.score?.correct}</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">/</span>
                                            <span className="font-mono">{r.score?.total}</span>
                                            <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">({r.percentage}%)</span>
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${r.grade >= 4 ? 'text-green-500' : r.grade === 3 ? 'text-amber-500' : 'text-red-500'}`}>
                                            {r.grade}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => generatePDF(r)} disabled={loadingPdfId === r.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] rounded-lg text-xs font-medium disabled:opacity-50 transition-colors">
                                                {loadingPdfId === r.id ? <><Loader2 size={14} className="animate-spin" /> Yuklanmoqda...</> : <><Download size={14} /> PDF</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
