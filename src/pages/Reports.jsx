
import React from 'react';
import { Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const mockReportData = [
    { id: 1, sex: '1-Sex', "yo'nalish": 'Lokomotiv', xodimlar: 45, qatnashgan: 42, qatnashmagan: 3, baho_5: 10, baho_4: 20, baho_3: 10, baho_2: 2, urtacha: 3.9 },
    { id: 2, sex: '2-Sex', "yo'nalish": 'Vagon', xodimlar: 30, qatnashgan: 28, qatnashmagan: 2, baho_5: 5, baho_4: 15, baho_3: 8, baho_2: 0, urtacha: 3.8 },
    { id: 3, sex: '3-Sex', "yo'nalish": 'Elektr', xodimlar: 50, qatnashgan: 50, qatnashmagan: 0, baho_5: 25, baho_4: 20, baho_3: 5, baho_2: 0, urtacha: 4.4 },
];

export default function Reports() {
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(mockReportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kvartal Hisoboti");
        XLSX.writeFile(wb, "Kvartal_Hisoboti.xlsx");
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Kvartal Hisobotlari</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
                        <Filter size={18} /> Filtr
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Download size={18} /> Excel Yuklash
                    </button>
                </div>
            </div>

            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center">
                        <thead className="text-xs uppercase bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left">№</th>
                                <th className="px-4 py-3 text-left">Sex Raqami</th>
                                <th className="px-4 py-3">Yo'nalishi</th>
                                <th className="px-4 py-3">Xodimlar Soni</th>
                                <th className="px-4 py-3 text-green-600">Qatnashganlar</th>
                                <th className="px-4 py-3 text-red-600">Qatnashmaganlar</th>
                                <th className="px-4 py-3 border-l border-[hsl(var(--border))]">5 (A'lo)</th>
                                <th className="px-4 py-3">4 (Yaxshi)</th>
                                <th className="px-4 py-3">3 (Qoniqarli)</th>
                                <th className="px-4 py-3">2 (Yomon)</th>
                                <th className="px-4 py-3 border-l border-[hsl(var(--border))] font-bold">O'rtacha Ball</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {mockReportData.map((row, index) => (
                                <tr key={row.id} className="hover:bg-[hsl(var(--secondary))] transition-colors group">
                                    <td className="px-4 py-3 text-left font-medium">{index + 1}</td>
                                    <td className="px-4 py-3 text-left">{row.sex}</td>
                                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{row["yo'nalish"]}</td>
                                    <td className="px-4 py-3 font-bold">{row.xodimlar}</td>
                                    <td className="px-4 py-3 text-green-600 dark:text-green-400">{row.qatnashgan}</td>
                                    <td className="px-4 py-3 text-red-600 dark:text-red-400">{row.qatnashmagan}</td>
                                    <td className="px-4 py-3 border-l border-[hsl(var(--border))] bg-green-50/50 dark:bg-green-900/10">{row.baho_5}</td>
                                    <td className="px-4 py-3">{row.baho_4}</td>
                                    <td className="px-4 py-3">{row.baho_3}</td>
                                    <td className="px-4 py-3 text-red-600 font-bold bg-red-50/50 dark:bg-red-900/10">{row.baho_2}</td>
                                    <td className="px-4 py-3 border-l border-[hsl(var(--border))] font-bold text-lg">{row.urtacha}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
