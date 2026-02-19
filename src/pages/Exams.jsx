
import React, { useState } from 'react';
import { UserCheck, Clock, Monitor, XCircle, CheckCircle, FileText, Download, Play, AlertTriangle, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import ExamResultPDF from '../components/ExamResultPDF';

export default function Exams() {
    const [activeTab, setActiveTab] = useState('active'); // active, assign, results
    const [selectedTchnuk, setSelectedTchnuk] = useState("Eshmatov T.");

    // Mock Active Exams
    const [activeExams, setActiveExams] = useState([
        { id: 1, name: 'Aliyev Vali', type: 'Kvartal', progress: 8, total: 20, correct: 6, wrong: 2, status: 'ongoing' },
        { id: 2, name: 'Karimov Salim', type: 'Razryad', progress: 15, total: 30, correct: 10, wrong: 5, status: 'warning' }, // > 50% fail risk
    ]);

    // Mock Results
    const results = [
        {
            id: 1,
            name: 'Aliyev Vali',
            position: 'Mashinist yordamchisi',
            workshop: '1-Sex',
            tabelId: '9842',
            examType: 'Kvartal',
            examFile: "O'rta bo'g'in raxbarlari(Sex masterlari).txt",
            date: '18.02.2026',
            startTime: '14:30',
            endTime: '15:15',
            duration: '45 daqiqa',
            grade: 5,
            score: { correct: 18, wrong: 2, total: 20 },
            tchnuk: selectedTchnuk
        },
        {
            id: 2,
            name: 'Qodirov Jamshid',
            position: 'Elektrik',
            workshop: '2-Sex',
            tabelId: '1023',
            examType: 'Xavfsizlik texnikasi',
            examFile: "Mehnat muhofazasi va xavfsizlik texnikasi.txt",
            date: '15.02.2026',
            startTime: '09:00',
            endTime: '09:25',
            duration: '25 daqiqa',
            grade: 4,
            score: { correct: 16, wrong: 4, total: 20 },
            tchnuk: selectedTchnuk
        },
        {
            id: 3,
            name: 'Tursunov Alisher',
            position: 'Payvandchi',
            workshop: '3-Sex',
            tabelId: '5521',
            examType: 'Kvartal',
            examFile: "Payvandlash ishlari texnologiyasi.txt",
            date: '10.02.2026',
            startTime: '10:15',
            endTime: '11:00',
            duration: '45 daqiqa',
            grade: 3,
            score: { correct: 13, wrong: 7, total: 20 },
            tchnuk: selectedTchnuk
        }
    ];

    const [loadingPdfId, setLoadingPdfId] = useState(null);

    // Helper: convert image URL to data URL for @react-pdf/renderer
    const imageToDataUrl = (url) => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null); // fallback: no logo
            img.src = url;
        });
    };

    const generatePDF = async (result) => {
        setLoadingPdfId(result.id);
        try {
            // 1. Generate QR code as data URL
            const qrDataUrl = await QRCode.toDataURL(
                `https://railway-exam.uz/verify/${result.id}`,
                { width: 150, margin: 1, color: { dark: '#000', light: '#fff' } }
            );

            // 2. Load logo as data URL (avoids cross-origin issues in @react-pdf)
            const logoDataUrl = await imageToDataUrl('/logo.png');

            // 3. Generate PDF blob directly (no html2canvas!)
            const blob = await pdf(
                <ExamResultPDF
                    result={{ ...result, tchnuk: selectedTchnuk }}
                    qrDataUrl={qrDataUrl}
                    logoDataUrl={logoDataUrl}
                />
            ).toBlob();

            // 4. Download the PDF
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${result.name.replace(/\s+/g, '_')}_Natija.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF yaratishda xatolik:', err);
            alert('PDF yaratishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
        } finally {
            setLoadingPdfId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Imtihon Tizimi</h1>
                <div className="flex gap-2 p-1 bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-[hsl(var(--secondary))] shadow-sm' : 'hover:bg-[hsl(var(--secondary))] opacity-70'}`}
                    >
                        Jarayon (Live)
                    </button>
                    <button
                        onClick={() => setActiveTab('assign')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'assign' ? 'bg-[hsl(var(--secondary))] shadow-sm' : 'hover:bg-[hsl(var(--secondary))] opacity-70'}`}
                    >
                        Tayinlash
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'results' ? 'bg-[hsl(var(--secondary))] shadow-sm' : 'hover:bg-[hsl(var(--secondary))] opacity-70'}`}
                    >
                        Natijalar
                    </button>
                </div>
            </div>

            {activeTab === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeExams.map(exam => (
                        <div key={exam.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{exam.name}</h3>
                                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-mono">{exam.type}</span>
                                </div>
                                <Monitor className="text-[hsl(var(--muted-foreground))]" />
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Jarayon: {exam.progress}/{exam.total}</span>
                                    <span>{Math.round((exam.progress / exam.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2">
                                    <div className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-500" style={{ width: `${(exam.progress / exam.total) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                    <span className="block text-xl font-bold text-green-600 dark:text-green-400">{exam.correct}</span>
                                    <span className="text-xs text-[hsl(var(--muted-foreground))]">To'g'ri</span>
                                </div>
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                                    <span className="block text-xl font-bold text-red-600 dark:text-red-400">{exam.wrong}</span>
                                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Xato</span>
                                </div>
                            </div>

                            {exam.wrong >= (exam.total / 2) && (
                                <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg animate-pulse">Yiqildi (Avto)</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'results' && (
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Oxirgi Natijalar</h2>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">TCHNUK (O'quv bo'limi rahbari):</label>
                            <input
                                type="text"
                                value={selectedTchnuk}
                                onChange={(e) => setSelectedTchnuk(e.target.value)}
                                className="px-3 py-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
                                placeholder="F.I.SH kiriting..."
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">F.I.SH</th>
                                    <th className="px-4 py-3">Imtihon Turi</th>
                                    <th className="px-4 py-3">Sana</th>
                                    <th className="px-4 py-3">Baho</th>
                                    <th className="px-4 py-3 rounded-r-lg">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {results.map(result => (
                                    <tr key={result.id} className="hover:bg-[hsl(var(--secondary))] transition-colors">
                                        <td className="px-4 py-3 font-medium">
                                            <div>{result.name}</div>
                                            <div className="text-[10px] text-gray-400">{result.examFile}</div>
                                        </td>
                                        <td className="px-4 py-3">{result.examType}</td>
                                        <td className="px-4 py-3">{result.date}</td>
                                        <td className={`px-4 py-3 font-bold ${result.grade >= 4 ? 'text-green-500' : result.grade === 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {result.grade} ({result.grade === 5 ? "A'lo" : result.grade === 4 ? "Yaxshi" : result.grade === 3 ? "Qoniqarli" : "Qoniqarsiz"})
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => generatePDF(result)}
                                                disabled={loadingPdfId === result.id}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] rounded-md transition-colors text-xs font-medium disabled:opacity-50"
                                            >
                                                {loadingPdfId === result.id ? (
                                                    <><Loader2 size={14} className="animate-spin" /> Yuklanmoqda...</>
                                                ) : (
                                                    <><Download size={14} /> PDF</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
