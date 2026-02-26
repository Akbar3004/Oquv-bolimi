import React, { useState, useRef } from 'react';
import { ArrowLeft, Printer, Download, FileText, Calendar, Users, Clock, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export default function AnnualPlanViewer({ plan, onBack, onEdit }) {
    const printRef = useRef(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const handlePrint = () => {
        const printContents = printRef.current?.innerHTML;
        if (!printContents) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${plan.name}</title>
                <style>
                    @page { size: A4 landscape; margin: 12mm; }
                    body { font-family: 'Times New Roman', serif; color: #000; line-height: 1.4; margin: 0; padding: 0; font-size: 11px; }
                    .header-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .header-left, .header-right { width: 45%; font-size: 11px; }
                    .center-block { text-align: center; margin-bottom: 15px; }
                    .center-block h2 { font-size: 13px; margin: 3px 0; }
                    .center-block h3 { font-size: 12px; margin: 3px 0; }
                    .direction { text-align: center; margin-bottom: 10px; font-size: 11px; font-weight: bold; }
                    .officials { margin-bottom: 15px; font-size: 10px; line-height: 1.8; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    th, td { border: 1px solid #000; padding: 3px 5px; font-size: 10px; }
                    th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
                    td:first-child { text-align: center; width: 30px; }
                    td:nth-child(2) { text-align: center; width: 60px; }
                    td:nth-child(4) { text-align: center; width: 40px; }
                    td:last-child { text-align: center; width: 60px; }
                    .footer-section { margin-top: 15px; font-size: 10px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
                    .signature-block { font-size: 10px; }
                    .month-header td { background: #e8e8e8; font-weight: bold; }
                </style>
            </head>
            <body>${printContents}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportExcel = () => {
        const data = plan.lessons.map(l => ({
            '№': l.number,
            'Oy': l.month,
            'Texnik mashg\'ulot mavzusi': l.topic || '',
            'Soat': l.hours,
            'Adabiyotlar': l.literature || '',
            'Dars': `Dars №${l.number}`,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();

        // Ustun kengliklari
        ws['!cols'] = [
            { wch: 5 }, { wch: 10 }, { wch: 60 }, { wch: 8 }, { wch: 30 }, { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, plan.name.slice(0, 30));
        XLSX.writeFile(wb, `${plan.name}.xlsx`);
        setShowExportMenu(false);
    };

    // Darslarni oylar bo'yicha guruhlash
    const lessonsByMonth = {};
    MONTHS.forEach(m => { lessonsByMonth[m] = []; });
    plan.lessons.forEach(l => {
        if (lessonsByMonth[l.month]) lessonsByMonth[l.month].push(l);
    });

    // Jami soat
    const totalHours = plan.lessons.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    const filledLessons = plan.lessons.filter(l => l.topic && l.topic.trim()).length;

    return (
        <div className="space-y-5">
            {/* Yuqori panel */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="font-bold text-sm">{plan.name}</h2>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {plan.year}-yil • {plan.workshops.map(w => `Sex ${w}`).join(', ')} • {filledLessons}/48 dars
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(plan)}
                        className="px-4 py-2 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--border))] rounded-xl text-xs font-medium transition-colors"
                    >
                        ✏️ Tahrirlash
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                        >
                            <Download size={14} /> Export <ChevronDown size={12} />
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-10 overflow-hidden min-w-[150px]">
                                <button onClick={handleExportExcel} className="w-full px-4 py-2.5 text-left text-xs hover:bg-[hsl(var(--secondary))] transition-colors flex items-center gap-2">
                                    📊 Excel (.xlsx)
                                </button>
                                <button onClick={handlePrint} className="w-full px-4 py-2.5 text-left text-xs hover:bg-[hsl(var(--secondary))] transition-colors flex items-center gap-2">
                                    🖨️ Chop etish / PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                    >
                        <Printer size={14} /> Chop etish
                    </button>
                </div>
            </div>

            {/* Reja hujjat ko'rinishi */}
            <div className="bg-white text-black rounded-xl shadow-xl overflow-hidden">
                <div ref={printRef} className="p-6 font-serif" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                    {/* Sarlavha */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ width: '45%', fontSize: '11px' }}>
                            <p><strong>KELISHILDI :</strong></p>
                            <p>"O'zbekiston" lokomotiv</p>
                            <p>deposi boshlig'i</p>
                            <p>N.M.Hamdamov _______________</p>
                            <p>" _____ " _____________ {plan.year}y</p>
                        </div>
                        <div style={{ width: '45%', fontSize: '11px', textAlign: 'right' }}>
                            <p><strong>TASDIQLAYMAN:</strong></p>
                            <p>"O'zbekiston Temir yo'llari" AJ</p>
                            <p>Lokomotivlardan foydalanish boshqarmasi</p>
                            <p>boshlig'i</p>
                            <p>Sh.T.Tulyaganov _______________</p>
                            <p>" _____ " _____________ {plan.year}y</p>
                        </div>
                    </div>

                    {/* Markaziy sarlavha */}
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <p style={{ fontSize: '12px' }}>"O'zbekiston temir yo'llari" A.J.</p>
                        <p style={{ fontSize: '12px' }}>"O'zbekiston" lokomotiv deposi.</p>
                        <br />
                        <p style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            {plan.year} yil uchun tuzilgan choraklarga bo'lingan
                        </p>
                        <p style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            Yillik texnik o'quv mashg'ulotlar mavzulari rejasi
                        </p>
                    </div>

                    {/* Yo'nalish va sexlar */}
                    <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', fontSize: '11px' }}>
                        <p>Yo'nalish: {plan.direction}</p>
                        <p>Sex № {plan.workshops.join(', ')}</p>
                    </div>

                    {/* Jadval */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #000', padding: '4px', width: '30px' }}>№</th>
                                <th style={{ border: '1px solid #000', padding: '4px', width: '65px' }}>Oylar</th>
                                <th style={{ border: '1px solid #000', padding: '4px' }}>Texnik mashg'ulot mavzusi</th>
                                <th style={{ border: '1px solid #000', padding: '4px', width: '40px' }}>Soat</th>
                                <th style={{ border: '1px solid #000', padding: '4px', width: '150px' }}>Adabiyotlar</th>
                                <th style={{ border: '1px solid #000', padding: '4px', width: '65px' }}>Darslar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MONTHS.map(month => {
                                const monthLessons = lessonsByMonth[month] || [];
                                return monthLessons.map((lesson, i) => {
                                    // Soat ustunida kumulyativ qiymat
                                    const cumulativeHours = plan.lessons
                                        .slice(0, plan.lessons.indexOf(lesson) + 1)
                                        .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
                                    const hourDisplay = `${lesson.hours}/${cumulativeHours}`;

                                    return (
                                        <tr key={lesson.number}>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{lesson.number}</td>
                                            {i === 0 ? (
                                                <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }} rowSpan={monthLessons.length}>
                                                    {month}
                                                </td>
                                            ) : null}
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'left' }}>{lesson.topic || '—'}</td>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '9px' }}>{hourDisplay}</td>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'left', fontSize: '9px' }}>{lesson.literature || ''}</td>
                                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontSize: '9px' }}>Dars №{lesson.number}</td>
                                        </tr>
                                    );
                                });
                            })}
                        </tbody>
                    </table>

                    {/* Jami */}
                    <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '11px', marginBottom: '15px' }}>
                        Jami: {totalHours} soat
                    </p>

                    {/* Imzolar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '11px' }}>
                        <div>
                            <p><strong>Tuzuvchi:</strong> {plan.author || '_______________'}</p>
                        </div>
                        <div>
                            <p><strong>Konsultant:</strong> {plan.consultant || '_______________'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
