
import React, { useState, useEffect } from 'react';

import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddWorkshopModal({ isOpen, onClose, onSave, initialData }) {
    const [workshopData, setWorkshopData] = useState({
        number: '',
        masterName: '',
        func: ''
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setWorkshopData(initialData);
        } else if (isOpen) {
            setWorkshopData({ number: '', masterName: '', func: '' });
        }
    }, [isOpen, initialData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setWorkshopData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(workshopData);
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
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {initialData ? "Sehni Tahrirlash" : "Yangi Seh Qo'shish"}
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">

                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Seh Raqami <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="number"
                                required
                                placeholder="Masalan: 4-Sex"
                                value={workshopData.number}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Master Ism Familiyasi
                            </label>
                            <input
                                type="text"
                                name="masterName"
                                placeholder="Masalan: Eshmatov Toshmat"
                                value={workshopData.masterName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Seh Vazifasi
                            </label>
                            <input
                                type="text"
                                name="func"
                                placeholder="Masalan: Ta'mirlash"
                                value={workshopData.func}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
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
                                Saqlash
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
