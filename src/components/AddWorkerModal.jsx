
import React, { useState, useEffect } from 'react';

import { X, Save, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddWorkerModal({ isOpen, onClose, onSave, workshopName, initialData }) {
    const [workerData, setWorkerData] = useState({
        name: '',
        tabelId: '',
        razryad: ''
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setWorkerData(initialData);
        } else if (isOpen) {
            setWorkerData({ name: '', tabelId: '', razryad: '' });
        }
    }, [isOpen, initialData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setWorkerData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(workerData);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {initialData ? "Xodimni Tahrirlash" : "Xodim Qo'shish"}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{workshopName}</p>
                            </div>

                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                F.I.SH <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Abdullayev Botir"
                                value={workerData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tabel Raqami
                                </label>
                                <input
                                    type="text"
                                    name="tabelId"
                                    placeholder="1234"
                                    value={workerData.tabelId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Razryadi
                                </label>
                                <input
                                    type="text"
                                    name="razryad"
                                    placeholder="3-toifa"
                                    value={workerData.razryad}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow-md"
                            >
                                <Save size={18} />
                                {initialData ? "Saqlash" : "Qo'shish"}
                            </button>

                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
