
import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockWorkers = [
    { id: 1, name: 'Abdullayev Botir', sex: '1-Sex', lavozim: 'Mashinist', phone: '+998 90 123 45 67', joined: '2020-05-12', status: 'Active' },
    { id: 2, name: 'Qodirov Jamshid', sex: '2-Sex', lavozim: 'Elektrik', phone: '+998 93 987 65 43', joined: '2021-08-20', status: 'Sick' },
    { id: 3, name: 'Saliyeva Dildora', sex: 'Ofis', lavozim: 'Kadrlar bo\'limi', phone: '+998 99 555 44 33', joined: '2019-01-15', status: 'Active' },
    { id: 4, name: 'Tursunov Alisher', sex: '3-Sex', lavozim: 'Payvandchi', phone: '+998 97 111 22 33', joined: '2022-11-05', status: 'Vacation' },
];

export default function Workers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);

    const filtered = mockWorkers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.sex.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
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

            {/* Modal - Personal Card */}
            <AnimatePresence>
                {selectedWorker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedWorker(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedWorker(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-[hsl(var(--secondary))] rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

                            <div className="px-8 pb-8">
                                <div className="relative -mt-16 mb-6 flex justify-between items-end">
                                    <div className="w-32 h-32 bg-[hsl(var(--card))] rounded-full p-2 shadow-lg">
                                        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl overflow-hidden">
                                            {/* Placeholder for real image */}
                                            <User size={64} className="text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        <button className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:opacity-90">Tahrirlash</button>
                                        <button className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--secondary))]">Export PDF</button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold">{selectedWorker.name}</h2>
                                    <p className="text-lg text-[hsl(var(--muted-foreground))]">{selectedWorker.lavozim} • {selectedWorker.sex}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b border-[hsl(var(--border))] pb-2">Shaxsiy Ma'lumotlar</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-[hsl(var(--muted-foreground))]">Tug'ilgan sana:</span>
                                            <span>15.04.1985</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">Millati:</span>
                                            <span>O'zbek</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">Jinsi:</span>
                                            <span>Erkak</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">Manzil:</span>
                                            <span>Toshkent sh, Yunusobod</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b border-[hsl(var(--border))] pb-2">Ish Faoliyati</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-[hsl(var(--muted-foreground))]">Tabel Raqami:</span>
                                            <span>100{selectedWorker.id}</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">Ishga kirgan:</span>
                                            <span>{selectedWorker.joined}</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">Ma'lumoti:</span>
                                            <span>Oliy (ToshTYMI)</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">Razryad:</span>
                                            <span>4-toifa</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
                                    <h3 className="font-semibold mb-4">So'nggi Imtihon Natijalari</h3>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm text-center">
                                            <span className="block font-bold">Kvartal 1</span>
                                            <span>A'lo (5)</span>
                                        </div>
                                        <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm text-center">
                                            <span className="block font-bold">Xavfsizlik</span>
                                            <span>Yaxshi (4)</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
