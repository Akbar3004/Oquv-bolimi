
import React, { useState } from 'react';
import { UserCheck, Clock, Monitor, XCircle, CheckCircle, FileText, Download, Play, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function Exams() {
    const [activeTab, setActiveTab] = useState('active'); // active, assign, results
    const [showModal, setShowModal] = useState(false);

    // Mock Active Exams
    const [activeExams, setActiveExams] = useState([
        { id: 1, name: 'Aliyev Vali', type: 'Kvartal', progress: 8, total: 20, correct: 6, wrong: 2, status: 'ongoing' },
        { id: 2, name: 'Karimov Salim', type: 'Razryad', progress: 15, total: 30, correct: 10, wrong: 5, status: 'warning' }, // > 50% fail risk
    ]);

    const generatePDF = () => {
        const input = document.getElementById('exam-result-1');
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("Aliyev_Vali_Natija.pdf");
        });
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
                    <h2 className="text-lg font-bold mb-4">Oxirgi Natijalar</h2>
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
                                <tr className="hover:bg-[hsl(var(--secondary))] transition-colors">
                                    <td className="px-4 py-3 font-medium">Aliyev Vali</td>
                                    <td className="px-4 py-3">Kvartal</td>
                                    <td className="px-4 py-3">18.02.2026</td>
                                    <td className="px-4 py-3 text-green-500 font-bold">5 (A'lo)</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={generatePDF} className="p-2 hover:bg-[hsl(var(--accent))] rounded-full text-[hsl(var(--primary))]">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Hidden PDF content */}
                    <div id="exam-result-1" className="fixed top-[-9999px] left-[-9999px] bg-white text-black p-10 w-[210mm] min-h-[297mm]">
                        <div className="text-center border-b-2 border-black pb-6 mb-8">
                            <h1 className="text-2xl font-bold uppercase">O'zbekiston Temir Yo'llari</h1>
                            <h2 className="text-xl">Imtihon Natijalari</h2>
                        </div>
                        <div className="mb-6 text-lg">
                            <p><strong>F.I.SH:</strong> Aliyev Vali</p>
                            <p><strong>Lavozim:</strong> Mashinist yordamchisi</p>
                            <p><strong>Imtihon Turi:</strong> Kvartal</p>
                            <p><strong>Sana:</strong> 18.02.2026</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 mb-10 text-center">
                            <div className="border border-black p-4 rounded">
                                <p className="text-sm">To'g'ri Javoblar</p>
                                <p className="text-4xl font-bold text-green-600">18</p>
                            </div>
                            <div className="border border-black p-4 rounded">
                                <p className="text-sm">Xato Javoblar</p>
                                <p className="text-4xl font-bold text-red-600">2</p>
                            </div>
                        </div>
                        <div className="text-center mb-16">
                            <p className="text-6xl font-black mb-2">5</p>
                            <p className="text-xl uppercase tracking-widest">A'lo</p>
                        </div>
                        <div className="flex justify-between mt-auto pt-10 border-t border-black">
                            <p>Komissiya raisi: _______________</p>
                            <p>A'zolar: _______________</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
