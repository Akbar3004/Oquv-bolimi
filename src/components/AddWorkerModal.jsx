
import React, { useState, useEffect, useRef } from 'react';

import { X, Save, UserPlus, Camera, ImagePlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileToBase64 } from '../utils/dataService';

export default function AddWorkerModal({ isOpen, onClose, onSave, workshopName, initialData }) {
    const [workerData, setWorkerData] = useState({
        name: '',
        tabelId: '',
        razryad: '',
        lavozim: '',
        photo: null,
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setWorkerData({
                name: initialData.name || '',
                tabelId: initialData.tabelId || '',
                razryad: initialData.razryad || '',
                lavozim: initialData.lavozim || '',
                photo: initialData.photo || null,
            });
            setPhotoPreview(initialData.photo || null);
        } else if (isOpen) {
            setWorkerData({ name: '', tabelId: '', razryad: '', lavozim: '', photo: null });
            setPhotoPreview(null);
        }
    }, [isOpen, initialData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setWorkerData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Fayl turini tekshirish
        if (!file.type.startsWith('image/')) {
            alert('Iltimos, faqat rasm faylini tanlang!');
            return;
        }

        // Fayl hajmini tekshirish (10 MB dan katta bo'lmasin)
        if (file.size > 10 * 1024 * 1024) {
            alert('Rasm hajmi 10 MB dan katta bo\'lmasligi kerak!');
            return;
        }

        setIsLoadingPhoto(true);
        try {
            const base64 = await fileToBase64(file);
            setPhotoPreview(base64);
            setWorkerData(prev => ({ ...prev, photo: base64 }));
        } catch (error) {
            console.error('Rasm yuklashda xatolik:', error);
            alert('Rasm yuklashda xatolik yuz berdi');
        } finally {
            setIsLoadingPhoto(false);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setWorkerData(prev => ({ ...prev, photo: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
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

                    <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                        {/* Rasm yuklash */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-blue-200 dark:border-blue-800 shadow-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    {isLoadingPhoto ? (
                                        <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    ) : photoPreview ? (
                                        <img src={photoPreview} alt="Xodim rasmi" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={32} className="text-gray-400" />
                                    )}
                                </div>
                                {/* Rasm tanlash tugmasi */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors"
                                    title="Rasm tanlash"
                                >
                                    <ImagePlus size={14} />
                                </button>
                                {/* Rasmni o'chirish */}
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -bottom-1 -left-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                                        title="Rasmni o'chirish"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoSelect}
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Kompyuterdan rasm tanlang (JPG, PNG)
                            </p>
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Lavozimi
                            </label>
                            <input
                                type="text"
                                name="lavozim"
                                placeholder="Mashinist"
                                value={workerData.lavozim}
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
