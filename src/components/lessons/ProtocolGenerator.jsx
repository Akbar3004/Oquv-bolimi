import React, { useState, useRef } from 'react';
import { Printer, FileText, Calendar, Clock, User, MapPin, Users, Download, ChevronDown, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProtocolGenerator({ lessons, workers }) {
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [protocolNumber, setProtocolNumber] = useState('');
    const printRef = useRef(null);

    // Faqat qatnashchilari bo'lgan darslar
    const eligibleLessons = lessons
        .filter(l => l.attendees && l.attendees.length > 0)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const handlePrint = () => {
        const printContents = printRef.current?.innerHTML;
        if (!printContents) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bayonnoma</title>
                <style>
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    body {
                        font-family: 'Times New Roman', serif;
                        color: #000;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                    }
                    .protocol-header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .protocol-header h1 {
                        font-size: 18px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 0 0 5px 0;
                    }
                    .protocol-header h2 {
                        font-size: 16px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 0 0 5px 0;
                    }
                    .protocol-header p {
                        font-size: 14px;
                        font-style: italic;
                        margin: 0;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 15px;
                        font-size: 13px;
                    }
                    .topic-section {
                        margin-bottom: 15px;
                        font-size: 13px;
                    }
                    .topic-section p {
                        margin: 5px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 6px 8px;
                    }
                    th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        text-align: center;
                    }
                    td {
                        text-align: center;
                    }
                    td:nth-child(2) {
                        text-align: left;
                    }
                    .signatures {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 50px;
                        padding: 0 30px;
                    }
                    .signature-block {
                        text-align: center;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        padding-top: 5px;
                        display: inline-block;
                        font-weight: bold;
                        font-size: 12px;
                        min-width: 180px;
                    }
                </style>
            </head>
            <body>
                ${printContents}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const getAttendeeWorkers = () => {
        if (!selectedLesson) return [];
        return (selectedLesson.attendees || [])
            .map(id => workers.find(w => w.id === id || w.id === parseInt(id)))
            .filter(Boolean);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const calculateEndTime = (startTime, duration) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + parseInt(duration);
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    if (!selectedLesson) {
        return (
            <div className="space-y-6">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold mb-2">Bayonnoma Yaratish</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Bayonnoma chiqarish uchun darsni tanlang (faqat qatnashchilari bo'lgan darslar)
                    </p>
                </div>

                {eligibleLessons.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText size={48} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-30" />
                        <p className="text-[hsl(var(--muted-foreground))] text-sm">Qatnashchilari bo'lgan dars topilmadi</p>
                        <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1 opacity-60">
                            Avval "Qatnashish" bo'limida xodimlarni belgilang
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {eligibleLessons.map((lesson, index) => (
                            <motion.button
                                key={lesson.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                onClick={() => setSelectedLesson(lesson)}
                                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 text-left hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{lesson.topicName}</h4>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={11} /> {formatDate(lesson.date)}
                                            </span>
                                            <span className="flex items-center gap-1 text-emerald-400">
                                                <Users size={11} /> {lesson.attendees.length} kishi
                                            </span>
                                        </div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 flex items-center gap-1">
                                            <User size={11} /> {lesson.instructor}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                        <FileText size={16} />
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const attendeeWorkers = getAttendeeWorkers();
    const endTime = calculateEndTime(selectedLesson.time, selectedLesson.duration);

    return (
        <div className="space-y-5">
            {/* Yuqori panel */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedLesson(null)}
                        className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h3 className="font-bold text-sm">Bayonnoma — {selectedLesson.topicName}</h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(selectedLesson.date)} • {attendeeWorkers.length} qatnashchi</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-[hsl(var(--muted-foreground))]">Bayonnoma №</label>
                        <input
                            type="text"
                            value={protocolNumber}
                            onChange={(e) => setProtocolNumber(e.target.value)}
                            className="w-20 px-3 py-1.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-amber-500/50"
                            placeholder="42"
                        />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all active:scale-[0.98]"
                    >
                        <Printer size={16} /> Chop etish
                    </button>
                </div>
            </div>

            {/* Bayonnoma ko'rinishi */}
            <div className="bg-white text-black rounded-xl shadow-xl overflow-hidden">
                <div ref={printRef} className="p-8 min-h-[700px] font-serif">
                    {/* Sarlavha */}
                    <div className="protocol-header" style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 5px 0' }}>
                            O'zbekiston Temir Yo'llari
                        </h1>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 5px 0' }}>
                            Lokomotiv Deposi O'quv Markazi
                        </h2>
                        <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '0' }}>
                            Bayonnoma № {protocolNumber || '___'}
                        </p>
                    </div>

                    {/* Sana va vaqt */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' }}>
                        <p><strong>Sana:</strong> {formatDate(selectedLesson.date)}</p>
                        <p><strong>Vaqt:</strong> {selectedLesson.time} - {endTime}</p>
                    </div>

                    {/* Mavzu */}
                    <div style={{ marginBottom: '15px', fontSize: '13px' }}>
                        <p><strong>Mashg'ulot Mavzusi:</strong> <span style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{selectedLesson.topicName}</span></p>
                        <p style={{ marginTop: '5px' }}><strong>O'qituvchi:</strong> {selectedLesson.instructor}</p>
                        <p style={{ marginTop: '5px' }}><strong>Joy:</strong> {selectedLesson.location}</p>
                        <p style={{ marginTop: '5px' }}><strong>Davomiylik:</strong> {selectedLesson.duration} daqiqa</p>
                    </div>

                    {/* Qatnashchilar jadvali */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '40px' }}>№</th>
                                <th style={{ border: '1px solid #000', padding: '6px 8px' }}>F.I.SH</th>
                                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '80px' }}>Tabel №</th>
                                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '80px' }}>Sex</th>
                                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '80px' }}>Razryad</th>
                                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '100px' }}>Imzo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendeeWorkers.map((worker, i) => (
                                <tr key={worker.id}>
                                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>{worker.name}</td>
                                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{worker.tabelId || '-'}</td>
                                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{worker.sex}</td>
                                    <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{worker.razryad || '-'}</td>
                                    <td style={{ border: '1px solid #000', padding: '6px 8px' }}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Imzolar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', padding: '0 30px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1px solid #000', paddingTop: '5px', display: 'inline-block', fontWeight: 'bold', fontSize: '12px', minWidth: '180px' }}>
                                Sesh boshlig'i imzosi
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1px solid #000', paddingTop: '5px', display: 'inline-block', fontWeight: 'bold', fontSize: '12px', minWidth: '180px' }}>
                                O'quv bo'limi boshlig'i
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
