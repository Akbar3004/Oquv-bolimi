
import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockWorkers = [
    { id: 1, name: 'Abdullayev Botir', sex: '1-Sex', lavozim: 'Mashinist', phone: '+998 90 123 45 67', joined: '2020-05-12', status: 'Active', razryad: '3-toifa', lastExamDate: '2025-12-10', lastExamGrade: '5' },
    { id: 2, name: 'Qodirov Jamshid', sex: '2-Sex', lavozim: 'Elektrik', phone: '+998 93 987 65 43', joined: '2021-08-20', status: 'Sick', razryad: '4-toifa', lastExamDate: '2026-01-15', lastExamGrade: '4' },
    { id: 3, name: 'Saliyeva Dildora', sex: 'Ofis', lavozim: 'Kadrlar bo\'limi', phone: '+998 99 555 44 33', joined: '2019-01-15', status: 'Active', razryad: '2-toifa', lastExamDate: '2025-11-20', lastExamGrade: '5' },
    { id: 4, name: 'Tursunov Alisher', sex: '3-Sex', lavozim: 'Payvandchi', phone: '+998 97 111 22 33', joined: '2022-11-05', status: 'Vacation', razryad: '3-toifa', lastExamDate: '2026-02-01', lastExamGrade: '3' },
];

export default function Workers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);

    const filtered = mockWorkers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.sex.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-10 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">Xodimlar Bazasi</h1>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                        <input
                            type="text"
                            placeholder="Qidirish (Ism, Sex)..."
                            className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(worker => (
                        <div
                            key={worker.id}
                            onClick={() => setSelectedWorker(worker)}
                            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {worker.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold group-hover:text-[hsl(var(--primary))] transition-colors">{worker.name}</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{worker.lavozim}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                                    <MapPin size={16} /> {worker.sex}
                                </div>
                                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                                    <Phone size={16} /> {worker.phone}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${worker.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    worker.status === 'Sick' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {worker.status === 'Active' ? 'Faol' : worker.status === 'Sick' ? 'Kasal' : 'Ta\'tilda'}
                                </span>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">Ro'yxat: {worker.joined}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Modal - Personal Card */}
            <AnimatePresence>
                {selectedWorker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 top-16 md:left-64 bg-black/60 backdrop-blur-md z-[30] flex items-center justify-center p-4 overflow-hidden"
                        onClick={() => setSelectedWorker(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white text-black w-full max-w-[360px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col font-sans"
                            style={{ aspectRatio: '360/580', maxHeight: '90vh' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedWorker(null)}
                                className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Curved Header */}
                            <div className="relative h-36 bg-[#1e3a8a] overflow-hidden shrink-0">
                                <div className="absolute top-6 w-full text-center text-white z-10">
                                    <h2 className="text-sm font-bold tracking-widest uppercase opacity-90">O'zbekiston Temir Yo'llari</h2>
                                    <p className="text-[10px] uppercase opacity-75 tracking-wide">LOKOMOTIV DEPOSI</p>
                                </div>
                                {/* Decorative Curves */}
                                <div className="absolute -bottom-10 left-0 right-0 h-20 bg-white rounded-[50%] scale-x-150"></div>
                            </div>

                            {/* Profile Section */}
                            <div className="relative -mt-16 flex flex-col items-center z-10 px-6 shrink-0">
                                <div className="p-1.5 bg-white rounded-full shadow-lg">
                                    <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden border-2 border-[#1e3a8a] flex items-center justify-center">
                                        {/* In real app, use <img> tag here */}
                                        <User size={56} className="text-gray-400" />
                                    </div>
                                </div>

                                <div className="text-center mt-3 mb-2">
                                    <h1 className="text-xl font-black text-[#1e293b] uppercase tracking-tight leading-tight">{selectedWorker.name}</h1>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="px-8 mt-4 flex-1 flex flex-col justify-start text-center">
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm text-[#334155]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sex Raqami</span>
                                        <span className="font-bold text-lg">{selectedWorker.sex}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Tabel Raqami</span>
                                        <span className="font-bold text-lg font-mono">{1000 + selectedWorker.id}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Razryad</span>
                                        <span className="font-bold text-lg">{selectedWorker.razryad}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Ohirgi Imtihon</span>
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-bold">{selectedWorker.lastExamDate}</span>
                                            <span className={`text-xs font-bold ${selectedWorker.lastExamGrade === '5' ? 'text-green-600' : 'text-blue-600'}`}>Baho: {selectedWorker.lastExamGrade}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Bottom Line */}
                            <div className="h-2 bg-[#1e3a8a] w-full mt-auto"></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
