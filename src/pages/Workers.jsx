
import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, X, ChevronLeft, Plus, Download, Upload, FileDown, Pencil, Medal, Hash } from 'lucide-react';





import { motion, AnimatePresence } from 'framer-motion';
import WorkshopCard from '../components/WorkshopCard';
import { downloadTemplate, parseEmployees, exportToExcel } from '../utils/excelHandler';
import AddWorkshopModal from '../components/AddWorkshopModal';
import AddWorkerModal from '../components/AddWorkerModal';



// Mock initial data
const initialWorkshops = [
    { id: 1, number: '1-Sex', masterName: 'Ali Valiyev', function: 'Temir kesish', workerCount: 2 },
    { id: 2, number: '2-Sex', masterName: 'Vali Aliyev', function: 'Payvandlash', workerCount: 1 },
    { id: 3, number: '3-Sex', masterName: 'G\'anisher Toshmatov', function: 'Yig\'ish', workerCount: 1 },
];

const initialWorkers = [
    { id: 1, name: 'Abdullayev Botir', sex: '1-Sex', lavozim: 'Mashinist', joined: '2020-05-12', status: 'Active', razryad: '3-toifa', lastExamDate: '2025-12-10', lastExamGrade: '5' },
    { id: 2, name: 'Qodirov Jamshid', sex: '2-Sex', lavozim: 'Elektrik', joined: '2021-08-20', status: 'Sick', razryad: '4-toifa', lastExamDate: '2026-01-15', lastExamGrade: '4' },
    { id: 3, name: 'Saliyeva Dildora', sex: 'Ofis', lavozim: 'Kadrlar bo\'limi', joined: '2019-01-15', status: 'Active', razryad: '2-toifa', lastExamDate: '2025-11-20', lastExamGrade: '5' },
    { id: 4, name: 'Tursunov Alisher', sex: '3-Sex', lavozim: 'Payvandchi', joined: '2022-11-05', status: 'Vacation', razryad: '3-toifa', lastExamDate: '2026-02-01', lastExamGrade: '3' },
];


export default function Workers() {
    const [viewMode, setViewMode] = useState('workshops'); // 'workshops' or 'list'
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [workshops, setWorkshops] = useState(initialWorkshops);
    const [workers, setWorkers] = useState(initialWorkers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [isAddWorkshopOpen, setIsAddWorkshopOpen] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState(null);
    const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [pendingImport, setPendingImport] = useState({ workshops: [], employees: [] });




    // Update worker counts when workers change
    useEffect(() => {
        const counts = {};
        workers.forEach(w => {
            counts[w.sex] = (counts[w.sex] || 0) + 1;
        });

        setWorkshops(prev => prev.map(ws => ({
            ...ws,
            workerCount: counts[ws.number] || 0
        })));
    }, [workers]);

    const handleWorkshopClick = (workshop) => {
        setSelectedWorkshop(workshop);
        setViewMode('list');
        setSearchTerm(''); // Reset search
    };

    const handleBackToWorkshops = () => {
        setSelectedWorkshop(null);
        setViewMode('workshops');
    };

    const handleAddWorkshop = () => {
        setEditingWorkshop(null);
        setIsAddWorkshopOpen(true);
    };

    const handleEditWorkshop = (workshop) => {
        setEditingWorkshop(workshop);
        setIsAddWorkshopOpen(true);
    };

    const handleSaveWorkshop = (data) => {
        if (editingWorkshop && !pendingImport.workshops.length) {
            // Update existing (Normal Edit)
            setWorkshops(prev => prev.map(w =>
                w.id === editingWorkshop.id ? { ...w, ...data } : w
            ));
            setEditingWorkshop(null);
        } else {
            // Create new (Add or Import flow)
            const { number, masterName, func } = data;

            const isImportFlow = pendingImport.workshops.length > 0;

            // Check if exists (only if not in import flow or ensure uniqueness)
            if (!isImportFlow && workshops.some(w => w.number === number)) {
                alert("Bu raqamli seh allaqachon mavjud!");
                return;
            }

            const newWorkshop = {
                id: Date.now(),
                number: isImportFlow ? editingWorkshop.number : number, // Use preset number for import
                masterName: masterName || "Tayinlanmagan",
                function: func || "Vazifa belgilanmagan",
                workerCount: 0
            };

            // We need to use functional state update to ensure we have latest workshops
            setWorkshops(prev => [...prev, newWorkshop]);

            if (isImportFlow) {
                const remainingWorkshops = pendingImport.workshops.slice(1);

                if (remainingWorkshops.length > 0) {
                    // Next in queue
                    setPendingImport(prev => ({ ...prev, workshops: remainingWorkshops }));

                    // Small delay to allow modal to close/reset visual state if needed, 
                    // or just update state to show next form
                    setTimeout(() => {
                        setEditingWorkshop({ number: remainingWorkshops[0], masterName: '', func: '' });
                        setIsAddWorkshopOpen(true);
                    }, 50);
                } else {
                    // All workshops created, add employees
                    setWorkers(prev => [...prev, ...pendingImport.employees]);

                    const totalWorkshops = pendingImport.workshops.length; // Approximate, assuming all processed
                    setPendingImport({ workshops: [], employees: [] });
                    setEditingWorkshop(null);
                    alert(`${pendingImport.employees.length} xodim va yangi sehlar muvaffaqiyatli qo'shildi!`);
                }
            } else {
                setEditingWorkshop(null);
            }
        }
    };




    const handleAddWorker = () => {
        if (!selectedWorkshop) return;
        setEditingWorker(null);
        setIsAddWorkerOpen(true);
    };

    const handleEditWorker = (worker) => {
        setEditingWorker(worker);
        setIsAddWorkerOpen(true);
    };

    const handleSaveWorker = (data) => {
        if (editingWorker) {
            // Update existing
            setWorkers(prev => prev.map(w =>
                w.id === editingWorker.id ? { ...w, ...data } : w
            ));
        } else {
            // Create new
            const { name, tabelId, razryad } = data;
            const newWorker = {
                id: Date.now(),
                name,
                sex: selectedWorkshop.number,
                tabelId: tabelId || "1000",
                razryad: razryad || "-",
                lavozim: "Ishchi",
                joined: new Date().toISOString().split('T')[0],
                status: "Active",
                lastExamDate: "-",
                lastExamGrade: "-"
            };
            setWorkers([...workers, newWorker]);
        }
        setEditingWorker(null);
    };


    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const importedEmployees = await parseEmployees(file);

            if (importedEmployees.length === 0) {
                alert("Faylda xodimlar topilmadi.");
                return;
            }

            // Identify new workshops
            const uniqueWorkshopNumbers = [...new Set(importedEmployees.map(e => e.sex))];
            const existingWorkshopNumbers = workshops.map(w => w.number);
            const newWorkshopNumbers = uniqueWorkshopNumbers.filter(num => !existingWorkshopNumbers.includes(num));

            let updatedWorkshops = [...workshops];

            // Prompt for new workshops
            // Prompt for new workshops
            if (newWorkshopNumbers.length > 0) {
                // Start the queue
                setPendingImport({ workshops: newWorkshopNumbers, employees: importedEmployees });

                // Open first modal
                setEditingWorkshop({ number: newWorkshopNumbers[0], masterName: '', func: '' });
                setIsAddWorkshopOpen(true);
                return; // Stop here, wait for user to finish modal flow
            }


            setWorkers([...workers, ...importedEmployees]);
            alert(`${importedEmployees.length} xodim va ${newWorkshopNumbers.length} yangi seh muvaffaqiyatli qo'shildi!`);
        } catch (error) {
            console.error("Import Error:", error);
            alert("Xatolik yuz berdi: Fayl formatini tekshiring.");
        }
    };

    const handleExportWorkshops = () => {
        const data = workshops.map(w => ({
            "Seh Raqami": w.number,
            "Mas'ul": w.masterName,
            "Vazifasi": w.function,
            "Xodimlar Soni": w.workerCount
        }));
        exportToExcel(data, "Sehlar_Ro'yxati", "Sehlar");
    };

    const handleExportEmployees = () => {
        const currentWorkers = viewMode === 'list' ? filteredWorkers : workers;
        const fileName = selectedWorkshop ? `${selectedWorkshop.number}_Xodimlari` : "Barcha_Xodimlar";

        const data = currentWorkers.map((w, index) => ({
            "ID": index + 1,
            "F.I.SH": w.name,
            "Seh": w.sex,
            "Tabel Raqam": w.tabelId,
            "Razryad": w.razryad,
            "Lavozim": w.lavozim,
            "Oxirgi Imtihon": w.lastExamDate,
            "Baho": w.lastExamGrade
        }));


        exportToExcel(data, fileName, "Xodimlar");
    };

    // Filter workers based on view mode and search

    const filteredWorkers = workers.filter(w => {
        const lowerTerm = searchTerm.toLowerCase();
        const workerTabelId = w.tabelId ? w.tabelId.toString() : (1000 + w.id).toString();

        const matchesSearch =
            w.name.toLowerCase().includes(lowerTerm) ||
            workerTabelId.includes(lowerTerm) ||
            (w.razryad && w.razryad.toLowerCase().includes(lowerTerm));

        const matchesWorkshop = selectedWorkshop ? w.sex === selectedWorkshop.number : true;
        return matchesSearch && matchesWorkshop;
    });


    return (
        <>
            <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-10 relative">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {viewMode === 'list' && (
                            <button onClick={handleBackToWorkshops} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold">
                            {viewMode === 'workshops' ? 'Sehlar (Workshops)' : `${selectedWorkshop?.number} Xodimlari`}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {viewMode === 'workshops' ? (
                            <>
                                <button onClick={handleAddWorkshop} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity">
                                    <Plus size={18} /> Seh Qo'shish
                                </button>
                                <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
                                    <Download size={18} /> Namuna Yuklash
                                </button>
                                <label className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer">
                                    <Upload size={18} /> Import
                                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
                                </label>
                                <button onClick={handleExportWorkshops} className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20">
                                    <FileDown size={18} /> Export
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Add Employee Button in Detail View */}
                                <button onClick={handleAddWorker} className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity">
                                    <Plus size={18} /> Xodim Qo'shish
                                </button>
                                <button onClick={handleExportEmployees} className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20">
                                    <FileDown size={18} /> Export
                                </button>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Qidirish (Ism, Tabel, Razryad)..."

                                        className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                {viewMode === 'workshops' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {workshops.map(workshop => (
                            <WorkshopCard
                                key={workshop.id}
                                workshop={workshop}
                                onClick={() => handleWorkshopClick(workshop)}
                                onEdit={handleEditWorkshop}
                            />

                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWorkers.length > 0 ? (
                            filteredWorkers.map(worker => (
                                <div
                                    key={worker.id}
                                    onClick={() => setSelectedWorker(worker)}
                                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4 mb-4 relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {worker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold group-hover:text-[hsl(var(--primary))] transition-colors">{worker.name}</h3>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{worker.lavozim}</p>

                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-900/30">
                                                <Hash size={14} />
                                                <span className="font-mono font-bold text-sm">{worker.tabelId || (1000 + worker.id)}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditWorker(worker);
                                            }}
                                            className="absolute top-0 right-0 p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Tahrirlash"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} /> {worker.sex}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 rounded text-xs font-medium border border-yellow-200 dark:border-yellow-900/30">
                                                <Medal size={12} />
                                                <span>{worker.razryad}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-[hsl(var(--muted-foreground))]">
                                Ushbu sehda xodimlar topilmadi.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal - Personal Card (SIBLING TO CONTAINER) */}
            <AnimatePresence>
                {selectedWorker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 top-0 left-0 w-full h-full z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
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
                                        <span className="font-bold text-lg font-mono">{selectedWorker.tabelId || (1000 + selectedWorker.id)}</span>
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

            {/* Custom Modals */}
            <AddWorkshopModal
                isOpen={isAddWorkshopOpen}
                onClose={() => setIsAddWorkshopOpen(false)}
                onSave={handleSaveWorkshop}
                initialData={editingWorkshop}
            />
            <AddWorkerModal
                isOpen={isAddWorkerOpen}
                onClose={() => setIsAddWorkerOpen(false)}
                onSave={handleSaveWorker}
                workshopName={selectedWorkshop?.number}
                initialData={editingWorker}
            />

        </>
    );
}
