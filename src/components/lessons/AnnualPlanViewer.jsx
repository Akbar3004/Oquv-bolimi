import React, { useState, useRef } from 'react';
import { ArrowLeft, Printer, Download, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

// Standart titil sahifasi (agar plan da bo'lmasa)
const DEFAULT_TITLE_PAGE = {
    kelishildi: { orgLine1: '"O\'zbekiston" lokomotiv', orgLine2: 'deposi boshlig\'i', name: 'N.M.Hamdamov' },
    tasdiqlayman: { orgLine1: '"O\'zbekiston Temir yo\'llari" AJ', orgLine2: 'Lokomotivlardan foydalanish boshqarmasi', orgLine3: 'boshlig\'i', name: 'Sh.T.Tulyaganov' },
    centerOrg: { line1: '"O\'zbekiston temir yo\'llari" A.J.', line2: '"O\'zbekiston" lokomotiv deposi.' },
    maslaxatchilar: [
        { title: '"O\'zbekiston" lokomotiv deposi\nKasaba uyushmasi raisi:', name: 'D.T.Asamidinov' },
        { title: '"O\'zbekiston" lokomotiv deposi boshlig\'ining\nLokomotivlarni ta\'mirlash ishlari bo\'yicha\no\'rinbosari:', name: 'J.S.Ergashev' },
        { title: 'Depo bosh texnologi:', name: 'X.N.Minajiddinov' },
        { title: 'O\'qituvchi:', name: '' },
    ],
};

export default function AnnualPlanViewer({ plan, onBack, onEdit }) {
    const printRef = useRef(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const tp = plan.titlePage || DEFAULT_TITLE_PAGE;
    const totalHours = plan.lessons.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    const filledLessons = plan.lessons.filter(l => l.topic?.trim()).length;

    // Darslarni oylar bo'yicha guruhlash
    const lessonsByMonth = {};
    MONTHS.forEach(m => { lessonsByMonth[m] = []; });
    plan.lessons.forEach(l => {
        if (lessonsByMonth[l.month]) lessonsByMonth[l.month].push(l);
    });

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
                    @page { size: A4 landscape; margin: 10mm 12mm; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Times New Roman', serif; color: #000; font-size: 11pt; line-height: 1.3; }
                    .title-page { page-break-after: always; padding: 0; }
                    .header-flex { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .header-left, .header-right { width: 42%; font-size: 10pt; line-height: 1.4; }
                    .header-right { text-align: right; }
                    .header-label { font-weight: bold; text-decoration: underline; margin-bottom: 4px; }
                    .center-block { text-align: center; margin: 30px 0 15px; }
                    .center-block p { font-size: 11pt; }
                    .center-block .title-bold { font-weight: bold; font-size: 11pt; margin-top: 20px; }
                    .direction-block { text-align: center; font-weight: bold; font-size: 10.5pt; margin: 20px 0; }
                    .consultants { margin: 30px 0; font-size: 10pt; }
                    .consultants h4 { font-weight: bold; margin-bottom: 15px; font-size: 10pt; }
                    .consultant-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; padding-left: 20px; }
                    .consultant-title { max-width: 55%; font-size: 10pt; line-height: 1.3; }
                    .consultant-name { display: flex; align-items: center; gap: 15px; font-size: 10pt; }
                    .sign-line { display: inline-block; width: 100px; border-bottom: 1px solid #000; }
                    .footer-org { text-align: center; font-style: italic; font-size: 10pt; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
                    th, td { border: 1px solid #000; padding: 2px 4px; }
                    th { background: #f0f0f0; font-weight: bold; text-align: center; font-size: 8.5pt; }
                    .col-num { width: 25px; text-align: center; }
                    .col-month { width: 55px; text-align: center; font-weight: bold; vertical-align: middle; }
                    .col-topic { text-align: left; }
                    .col-hour { width: 35px; text-align: center; font-size: 8pt; }
                    .col-lit { width: 130px; text-align: left; font-size: 8pt; }
                    .col-lesson { width: 55px; text-align: center; font-size: 8pt; }
                    .total-row { font-weight: bold; text-align: right; margin-top: 8px; font-size: 10pt; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 30px; font-size: 10pt; }
                    .sig-block { display: flex; align-items: center; gap: 10px; }
                </style>
            </head>
            <body>${printContents}</body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 300);
    };

    const handleExportExcel = () => {
        const data = plan.lessons.map(l => ({
            '№': l.number, 'Oy': l.month,
            'Texnik mashg\'ulot mavzusi': l.topic || '',
            'Soat': l.hours, 'Adabiyotlar': l.literature || '',
            'Dars': `Dars №${l.number}`,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        ws['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 60 }, { wch: 8 }, { wch: 30 }, { wch: 12 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, plan.name.slice(0, 30));
        XLSX.writeFile(wb, `${plan.name}.xlsx`);
        setShowExportMenu(false);
    };

    // Matn qatorlariga ajratish
    const renderMultiline = (text, style = {}) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => <p key={i} style={style}>{line}</p>);
    };

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
                    <button onClick={() => onEdit(plan)} className="px-4 py-2 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--border))] rounded-xl text-xs font-medium transition-colors">
                        ✏️ Tahrirlash
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                            <Download size={14} /> Export <ChevronDown size={12} />
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-10 overflow-hidden min-w-[150px]">
                                <button onClick={handleExportExcel} className="w-full px-4 py-2.5 text-left text-xs hover:bg-[hsl(var(--secondary))] transition-colors flex items-center gap-2">📊 Excel (.xlsx)</button>
                                <button onClick={handlePrint} className="w-full px-4 py-2.5 text-left text-xs hover:bg-[hsl(var(--secondary))] transition-colors flex items-center gap-2">🖨️ Chop etish / PDF</button>
                            </div>
                        )}
                    </div>
                    <button onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                        <Printer size={14} /> Chop etish
                    </button>
                </div>
            </div>

            {/* ===== Hujjat ko'rinishi ===== */}
            <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                <div ref={printRef}>

                    {/* ========== TITIL SAHIFASI ========== */}
                    <div className="title-page" style={{ padding: '30px 40px', fontFamily: "'Times New Roman', serif", fontSize: '11pt', lineHeight: '1.35', color: '#000' }}>

                        {/* KELISHILDI va TASDIQLAYMAN */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                            {/* KELISHILDI — chap */}
                            <div style={{ width: '42%', fontSize: '10pt' }}>
                                <p style={{ fontWeight: 'bold' }}>KELISHILDI :</p>
                                <p>{tp.kelishildi.orgLine1}</p>
                                <p>{tp.kelishildi.orgLine2}</p>
                                <p>{tp.kelishildi.name} _______________</p>
                                <p style={{ marginTop: '3px' }}>" _______ " _____________ {plan.year}y</p>
                            </div>
                            {/* TASDIQLAYMAN — o'ng */}
                            <div style={{ width: '42%', fontSize: '10pt', textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold' }}>TASDIQLAYMAN:</p>
                                <p>{tp.tasdiqlayman.orgLine1}</p>
                                <p>{tp.tasdiqlayman.orgLine2}</p>
                                <p>{tp.tasdiqlayman.orgLine3}</p>
                                <p style={{ textDecoration: 'underline' }}>{tp.tasdiqlayman.name}</p>
                                <p style={{ marginTop: '3px' }}>" _______ " _____________ {plan.year}y</p>
                            </div>
                        </div>

                        {/* Markaziy tashkilot */}
                        <div style={{ textAlign: 'center', margin: '35px 0 15px' }}>
                            <p style={{ fontSize: '11pt' }}>{tp.centerOrg.line1}</p>
                            <p style={{ fontSize: '11pt', textDecoration: 'underline' }}>{tp.centerOrg.line2}</p>
                        </div>

                        {/* Sarlavha */}
                        <div style={{ textAlign: 'center', margin: '30px 0 15px' }}>
                            <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                                {plan.year} yil uchun tuzilgan choraklarga bo'lingan
                            </p>
                            <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                                Yillik texnik o'quv mashg'ulotlar mavzulari rejasi
                            </p>
                        </div>

                        {/* Yo'nalish va Sexlar */}
                        <div style={{ textAlign: 'center', margin: '25px 0', fontWeight: 'bold', fontSize: '10.5pt' }}>
                            <p>Yo'nalish: {plan.direction}</p>
                            <p>Sex № {plan.workshops.join(', №')}{plan.workshops.length > 0 ? '.' : ''}</p>
                        </div>

                        {/* Maslaxatchilar */}
                        <div style={{ margin: '35px 0 20px', fontSize: '10pt' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '10pt' }}>Maslaxatchilar:</p>

                            {tp.maslaxatchilar.map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px', paddingLeft: '15px' }}>
                                    <div style={{ maxWidth: '55%', fontSize: '10pt', lineHeight: '1.35' }}>
                                        {m.title.split('\n').map((line, li) => (
                                            <p key={li} style={li === 0 && m.title.includes('\n') ? { fontWeight: 'normal' } : {}}>{line}</p>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '10pt' }}>
                                        <span>{m.name || '_______________'}</span>
                                        <span style={{ display: 'inline-block', width: '100px', borderBottom: '1px solid #000' }}></span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pastki tashkilot nomi */}
                        <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '10pt', marginTop: '30px' }}>
                            <p>„{tp.centerOrg.line2.replace(/"/g, '').replace(/\./g, '')}"</p>
                        </div>

                    </div>

                    {/* ========== DARSLAR JADVALI ========== */}
                    <div style={{ padding: '20px 30px', fontFamily: "'Times New Roman', serif", fontSize: '10pt' }}>

                        {/* Yo'nalish sarlavhasi */}
                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10pt', marginBottom: '10px' }}>
                            <p>Yo'nalish: {plan.direction}</p>
                        </div>

                        {/* Jadval */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f0f0' }}>
                                    <th style={{ border: '1px solid #000', padding: '4px', width: '28px', fontSize: '8.5pt' }}>№</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', width: '60px', fontSize: '8.5pt' }}>Oylar</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', fontSize: '8.5pt' }}>Texnik mashg'ulot mavzusi</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', width: '38px', fontSize: '8.5pt' }}>Soat</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', width: '140px', fontSize: '8.5pt' }}>Adabiyotlar</th>
                                    <th style={{ border: '1px solid #000', padding: '4px', width: '58px', fontSize: '8.5pt' }}>Darslar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MONTHS.map(month => {
                                    const ml = lessonsByMonth[month] || [];
                                    return ml.map((lesson, i) => {
                                        const cumHours = plan.lessons
                                            .slice(0, plan.lessons.indexOf(lesson) + 1)
                                            .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

                                        return (
                                            <tr key={lesson.number}>
                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', fontSize: '8.5pt' }}>{lesson.number}</td>
                                                {i === 0 && (
                                                    <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle', fontSize: '8.5pt' }} rowSpan={ml.length}>
                                                        {month}
                                                    </td>
                                                )}
                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left', fontSize: '8.5pt' }}>{lesson.topic || '—'}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', fontSize: '7.5pt' }}>{lesson.hours}/{cumHours}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left', fontSize: '7.5pt' }}>{lesson.literature || ''}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', fontSize: '7.5pt' }}>Dars №{lesson.number}</td>
                                            </tr>
                                        );
                                    });
                                })}
                            </tbody>
                        </table>

                        <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '10pt', marginTop: '10px' }}>
                            Jami: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{totalHours} soat
                        </p>

                        {/* Adabiyotlar */}
                        {(() => {
                            const uniqueLits = [...new Set(plan.lessons.map(l => l.literature).filter(l => l?.trim()))];
                            if (uniqueLits.length === 0) return null;
                            return (
                                <div style={{ marginTop: '15px', fontSize: '9pt' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '3px' }}>Foydalanilgan adabiyotlar:</p>
                                    {uniqueLits.map((lit, i) => (
                                        <p key={i}>{lit}</p>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Imzolar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px', fontSize: '10pt' }}>
                            <div>
                                <p><strong>Tuzuvchi:</strong> &nbsp;&nbsp;&nbsp; {plan.author || '_______________'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _______________</p>
                            </div>
                            <div>
                                <p><strong>Konsultant: O'quv sinf boshlig'i:</strong> &nbsp;&nbsp;&nbsp; {plan.consultant || '_______________'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _______________</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
