import * as XLSX from 'xlsx';

/**
 * Imtihon tizimi uchun markaziy ma'lumotlar do'koni
 * - Savollar bazasi (seh, lavozim, razryad bo'yicha)
 * - Faol imtihonlar
 * - Natijalar
 * - Sozlamalar
 * 
 * Barcha ma'lumotlar localStorage da saqlanadi.
 */

const STORAGE_KEYS = {
    QUESTION_BANKS: 'oquv_exam_question_banks',
    ACTIVE_EXAMS: 'oquv_exam_active',
    RESULTS: 'oquv_exam_results',
    SETTINGS: 'oquv_exam_settings',
};

// === Standart sozlamalar ===
const DEFAULT_SETTINGS = {
    maxErrors: 5,           // Nechta xatoda avtomatik tugatilsin
    examDuration: 30,       // Imtihon vaqti (daqiqalarda)
    passingPercent: 60,     // O'tish foizi
    randomOrder: true,      // Savollar tartibini aralashtirish
    showResultImmediately: false, // Har bir javobdan keyin natijani ko'rsatish
};

// === SAVOLLAR BAZASI ===
function getQuestionBanks() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.QUESTION_BANKS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveQuestionBanks(banks) {
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(banks));
}

function createQuestionBank(bankData) {
    // bankData: { name, seh, lavozim, razryad, questions: [{question, options:[], correct: index}] }
    const banks = getQuestionBanks();
    const newBank = {
        id: Date.now().toString(),
        ...bankData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    banks.push(newBank);
    saveQuestionBanks(banks);
    return newBank;
}

function updateQuestionBank(bankId, updates) {
    const banks = getQuestionBanks();
    const idx = banks.findIndex(b => b.id === bankId);
    if (idx === -1) return null;
    banks[idx] = { ...banks[idx], ...updates, updatedAt: new Date().toISOString() };
    saveQuestionBanks(banks);
    return banks[idx];
}

function deleteQuestionBank(bankId) {
    const banks = getQuestionBanks().filter(b => b.id !== bankId);
    saveQuestionBanks(banks);
}

// Seh va lavozimga mos savollar bazasini topish
function findMatchingBanks(seh, lavozim, razryad) {
    const banks = getQuestionBanks();
    return banks.filter(b => {
        const sehMatch = !b.seh || b.seh === seh || b.seh === 'Barchasi';
        const lavozimMatch = !b.lavozim || b.lavozim === lavozim || b.lavozim === 'Barchasi';
        const razryadMatch = !b.razryad || b.razryad === razryad || b.razryad === 'Barchasi';
        return sehMatch && lavozimMatch && razryadMatch;
    });
}

// === FAOL IMTIHONLAR ===
function getActiveExams() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_EXAMS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveActiveExams(exams) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EXAMS, JSON.stringify(exams));
}

function createActiveExam(examData) {
    // examData: { worker, examType, questions, questionCount, bankName }
    const settings = getSettings();
    const exams = getActiveExams();

    // Savollarni random tanlash
    let selectedQuestions = [...examData.questions];
    if (settings.randomOrder) {
        selectedQuestions = shuffleArray(selectedQuestions);
    }
    selectedQuestions = selectedQuestions.slice(0, examData.questionCount);

    const newExam = {
        id: Date.now().toString(),
        worker: examData.worker,
        examType: examData.examType, // 'Kvartalni' | 'Razryad' | 'Tayyorlanish'
        bankName: examData.bankName,
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
        currentQuestion: 0,
        correct: 0,
        wrong: 0,
        answers: {},
        status: 'ongoing', // 'ongoing' | 'warning' | 'failed' | 'completed'
        startTime: new Date().toISOString(),
        maxErrors: settings.maxErrors,
        duration: settings.examDuration,
        passingPercent: settings.passingPercent,
    };
    exams.push(newExam);
    saveActiveExams(exams);
    return newExam;
}

function updateActiveExam(examId, updates) {
    const exams = getActiveExams();
    const idx = exams.findIndex(e => e.id === examId);
    if (idx === -1) return null;
    exams[idx] = { ...exams[idx], ...updates };
    saveActiveExams(exams);
    return exams[idx];
}

function removeActiveExam(examId) {
    const exams = getActiveExams().filter(e => e.id !== examId);
    saveActiveExams(exams);
}

function finishExam(examId) {
    const exams = getActiveExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) return null;

    const endTime = new Date().toISOString();
    const total = exam.totalQuestions;
    const correct = exam.correct;
    const wrong = exam.wrong;
    const answered = correct + wrong;
    const unanswered = total - answered;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Baho hisoblash
    let grade;
    if (percentage >= 90) grade = 5;
    else if (percentage >= 70) grade = 4;
    else if (percentage >= 60) grade = 3;
    else grade = 2;

    const result = {
        id: Date.now().toString(),
        examId: exam.id,
        worker: exam.worker,
        examType: exam.examType,
        bankName: exam.bankName,
        date: new Date().toLocaleDateString('uz-UZ'),
        startTime: new Date(exam.startTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(endTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        score: { correct, wrong, unanswered, total },
        percentage,
        grade,
        passed: percentage >= exam.passingPercent,
        status: exam.status === 'failed' ? 'Yiqildi (Avto)' : (percentage >= exam.passingPercent ? "O'tdi" : "O'ta olmadi"),
    };

    // Natijaga qo'shish
    const results = getResults();
    results.unshift(result);
    saveResults(results);

    // Faol imtihonlardan o'chirish
    removeActiveExam(examId);

    return result;
}

// === NATIJALAR ===
function getResults() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveResults(results) {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
}

function getResultsByType(examType) {
    return getResults().filter(r => r.examType === examType);
}

// === SOZLAMALAR ===
function getSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// === Yordamchi funksiyalar ===
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// === TEST IMPORT / EXPORT / NAMUNA ===

/**
 * Test savollarini Excel namuna faylini yuklab olish
 */
function downloadTestTemplate() {
    const headers = [
        ['Savol matni', 'A variant', 'B variant', 'C variant', 'D variant', "To'g'ri javob (A/B/C/D)"],
        ['Lokomotivning asosiy vazifasi nima?', "Yo'lovchilarni tashish", 'Vagonlarni tortish', "Temiryo'l ta'mirlash", 'Signal berish', 'B'],
        ["Qizil signal nimani bildiradi?", 'Harakatga ruxsat', 'Ehtiyotkorlik', "To'liq to'xtash", 'Sekinlashtirish', 'C'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    // Ustun kengliklarini belgilash
    ws['!cols'] = [
        { wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Savollari');
    XLSX.writeFile(wb, 'Test_Savollari_Namuna.xlsx');
}

/**
 * Test savollarini Excel faylidan import qilish (validatsiya bilan)
 * @param {File} file
 * @returns {Promise<{questions: Array, errors: Array}>}
 */
function importTestQuestions(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Birinchi qatorni o'tkazib yuborish (sarlavha)
                const dataRows = rows.slice(1).filter(row => row.length > 0 && row[0]);

                if (dataRows.length === 0) {
                    resolve({ questions: [], errors: [{ row: '-', message: "Faylda savollar topilmadi" }] });
                    return;
                }

                const questions = [];
                const errors = [];
                const VALID_ANSWERS = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

                dataRows.forEach((row, idx) => {
                    const rowNum = idx + 2; // Excel da 2-qatordan boshlanadi
                    const questionText = row[0]?.toString().trim();
                    const optA = row[1]?.toString().trim();
                    const optB = row[2]?.toString().trim();
                    const optC = row[3]?.toString().trim();
                    const optD = row[4]?.toString().trim();
                    const correctRaw = row[5]?.toString().trim().toUpperCase();

                    // Validatsiyalar
                    if (!questionText) {
                        errors.push({ row: rowNum, message: "Savol matni bo'sh" });
                        return;
                    }
                    if (!optA) {
                        errors.push({ row: rowNum, message: "A variant bo'sh" });
                        return;
                    }
                    if (!optB) {
                        errors.push({ row: rowNum, message: "B variant bo'sh" });
                        return;
                    }
                    if (!optC) {
                        errors.push({ row: rowNum, message: "C variant bo'sh" });
                        return;
                    }
                    if (!optD) {
                        errors.push({ row: rowNum, message: "D variant bo'sh" });
                        return;
                    }
                    if (!correctRaw || !VALID_ANSWERS.hasOwnProperty(correctRaw)) {
                        errors.push({ row: rowNum, message: `To'g'ri javob noto'g'ri: "${correctRaw || 'bo\'sh'}". Faqat A, B, C, D bo'lishi kerak` });
                        return;
                    }

                    questions.push({
                        question: questionText,
                        options: [optA, optB, optC, optD],
                        correct: VALID_ANSWERS[correctRaw],
                    });
                });

                resolve({ questions, errors });
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Test savollarini Excel fayliga export qilish
 * @param {Array} questions - [{question, options:[], correct}]
 * @param {string} bankName
 */
function exportTestQuestions(questions, bankName) {
    const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];
    const data = [
        ['Savol matni', 'A variant', 'B variant', 'C variant', 'D variant', "To'g'ri javob (A/B/C/D)"],
        ...questions.map(q => [
            q.question,
            q.options[0] || '',
            q.options[1] || '',
            q.options[2] || '',
            q.options[3] || '',
            ANSWER_LETTERS[q.correct] || 'A',
        ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
        { wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 20 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Savollari');
    XLSX.writeFile(wb, `${bankName.replace(/\s+/g, '_')}_Savollar.xlsx`);
}

// Jami eksport
export const examStore = {
    // Savollar bazasi
    getQuestionBanks,
    createQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
    findMatchingBanks,

    // Faol imtihonlar
    getActiveExams,
    createActiveExam,
    updateActiveExam,
    removeActiveExam,
    finishExam,

    // Natijalar
    getResults,
    getResultsByType,
    saveResults,

    // Sozlamalar
    getSettings,
    saveSettings,
    DEFAULT_SETTINGS,

    // Test import/export
    downloadTestTemplate,
    importTestQuestions,
    exportTestQuestions,
};
