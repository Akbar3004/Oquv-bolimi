import React from 'react';
import { X, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImportConflictsModal({ isOpen, onClose, conflicts, onResolve }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-full text-red-600 dark:text-red-400">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Dublikat xodimlar aniqlandi
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {conflicts.length} ta xodim bazada allaqachon mavjud.
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 hover:bg-white/50 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Quyidagi xodimlar Ism va Tabel raqami bo'yicha bazada mavjud. Ularni qanday qayta ishlashni xohlaysiz?
                        </p>

                        <div className="space-y-2">
                            {conflicts.map((worker, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{worker.name}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span>ID: {worker.tabelId}</span>
                                                <span>•</span>
                                                <span>{worker.sex}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md border border-red-200">
                                        Mavjud
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={() => onResolve('skip')}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all"
                        >
                            <Trash2 size={18} />
                            Dublikatlarni tashlab ketish
                        </button>
                        <button
                            onClick={() => onResolve('all')}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                        >
                            <CheckCircle size={18} />
                            Hammasini yuklash
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
