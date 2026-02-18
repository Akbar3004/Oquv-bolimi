
import React, { useState } from 'react';
import { Upload, FileText, Calendar, Printer, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const mockTopics = {
    'Fevral': ['Elektr sxemelar', 'Xavfsizlik qoidalari', 'Pnevmatik tizimlar', 'Favqulodda vaziyatlar'],
    'Mart': ['Yangi lokomotiv turlari', 'Texnik xizmat ko\'rsatish', 'O\'t o\'chirish tizimi', 'Aloqa vositalari']
};

export default function Lessons() {
    const [reportFile, setReportFile] = useState(null);
    const [planFile, setPlanFile] = useState(null);
    const [currentMonth, setCurrentMonth] = useState('Fevral');

    const handleFileUpload = (e, setFile) => {
        const file = e.target.files[0];
        if (file) setFile(file.name);
    };

    const handlePrintProtocol = () => {
        window.print();
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dars Jarayoni</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity">
                        <Calendar size={18} /> Dars Jadvali
                    </button>
                </div>
            </div>

            {/* File Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Dars Hisoboti</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Excel fayl yuklash (.xlsx)</p>
                        </div>
                    </div>
                    <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-8 text-center hover:bg-[hsl(var(--secondary))] transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileUpload(e, setReportFile)}
                        />
                        <Upload size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                        <p className="text-sm font-medium">{reportFile ? reportFile : "Faylni tanlang yoki shu yerga tashlang"}</p>
                    </div>
                </div>

                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-300">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Yillik Reja</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Reja faylini yuklash (.pdf, .xlsx)</p>
                        </div>
                    </div>
                    <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-8 text-center hover:bg-[hsl(var(--secondary))] transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".xlsx, .pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileUpload(e, setPlanFile)}
                        />
                        <Upload size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                        <p className="text-sm font-medium">{planFile ? planFile : "Faylni tanlang yoki shu yerga tashlang"}</p>
                    </div>
                </div>
            </div>

            {/* Protocol Preview */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-8 shadow-md print:shadow-none print:border-none">
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText size={24} /> Bayonnoma (Protocol)
                    </h2>
                    <button
                        onClick={handlePrintProtocol}
                        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--border))] rounded-lg transition-colors"
                    >
                        <Printer size={18} /> Chop etish
                    </button>
                </div>

                {/* Printable Area - Simple styling for print */}
                <div className="bg-white text-black p-8 rounded-lg shadow-inner min-h-[600px] font-serif border border-gray-200 print:border-none print:shadow-none print:p-0 print:w-full">
                    <div className="text-center mb-8 border-b-2 border-black pb-4">
                        <h1 className="text-2xl font-bold uppercase mb-2">O'zbekiston Temir Yo'llari</h1>
                        <h2 className="text-xl font-bold uppercase">Lokomotiv Deposi O'quv Markazi</h2>
                        <p className="mt-2 text-sm italic">Bayonnoma № 42</p>
                    </div>

                    <div className="flex justify-between mb-6 text-sm">
                        <p><strong>Sana:</strong> {new Date().toLocaleDateString('uz-UZ')}</p>
                        <p><strong>Vaqt:</strong> 09:00 - 10:30</p>
                    </div>

                    <div className="mb-6">
                        <p><strong>Mashg'ulot Mavzusi:</strong> <span className="underline decoration-dotted">{mockTopics[currentMonth] ? mockTopics[currentMonth][0] : 'Umumiy xavfsizlik'}</span></p>
                        <p className="mt-2"><strong>O'qituvchi:</strong> Abdullayev A.B. (Bosh muhandis)</p>
                    </div>

                    <table className="w-full border-collapse border border-black mb-8 text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 w-10">№</th>
                                <th className="border border-black p-2">F.I.SH</th>
                                <th className="border border-black p-2 w-24">Tabel №</th>
                                <th className="border border-black p-2 w-32">Sex</th>
                                <th className="border border-black p-2 w-32">Imzo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    <td className="border border-black p-2 text-center">{i}</td>
                                    <td className="border border-black p-2">Ishchi Xodim {i}</td>
                                    <td className="border border-black p-2 text-center">100{i}</td>
                                    <td className="border border-black p-2 text-center">Ta'mirlash</td>
                                    <td className="border border-black p-2"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-12 flex justify-between px-10">
                        <div className="text-center">
                            <p className="font-bold border-t border-black pt-2 px-4 inline-block">Sesh boshlig'i imzosi</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold border-t border-black pt-2 px-4 inline-block">O'quv bo'limi boshlig'i</p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 border border-red-500 bg-red-50 rounded text-red-700 text-xs flex items-center gap-2 print:hidden">
                        <AlertCircle size={16} /> Eslatma: Tizim xodimlarning lavozimi mavzuga mos kelishini avtomatik tekshirdi. 1 ta nomutanosiblik aniqlandi.
                    </div>
                </div>
            </div>
        </div>
    );
}
