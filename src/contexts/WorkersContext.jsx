import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWorkers, saveWorkers, getWorkshops, saveWorkshops, fileToBase64 } from '../utils/dataService';

const WorkersContext = createContext(null);

export function WorkersProvider({ children }) {
    const [workers, setWorkers] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Ma'lumotlarni yuklash
    useEffect(() => {
        setWorkers(getWorkers());
        setWorkshops(getWorkshops());
        setIsLoaded(true);
    }, []);

    // O'zgarishlarni localStorage ga saqlash
    useEffect(() => {
        if (isLoaded) {
            saveWorkers(workers);
        }
    }, [workers, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            saveWorkshops(workshops);
        }
    }, [workshops, isLoaded]);

    // === Xodimlar CRUD ===

    const addWorker = useCallback((workerData) => {
        const newWorker = {
            id: Date.now(),
            joined: new Date().toISOString().split('T')[0],
            status: 'Active',
            lastExamDate: '-',
            lastExamGrade: '-',
            photo: null,
            ...workerData,
        };
        setWorkers(prev => [...prev, newWorker]);
        return newWorker;
    }, []);

    const updateWorker = useCallback((workerId, updates) => {
        setWorkers(prev => prev.map(w =>
            w.id === workerId ? { ...w, ...updates } : w
        ));
    }, []);

    const deleteWorker = useCallback((workerId) => {
        setWorkers(prev => prev.filter(w => w.id !== workerId));
    }, []);

    const importWorkers = useCallback((newWorkers) => {
        setWorkers(prev => [...prev, ...newWorkers]);
    }, []);

    // === Sexlar CRUD ===

    const addWorkshop = useCallback((workshopData) => {
        const newWorkshop = {
            id: Date.now(),
            workerCount: 0,
            ...workshopData,
        };
        setWorkshops(prev => [...prev, newWorkshop]);
        return newWorkshop;
    }, []);

    const updateWorkshop = useCallback((workshopId, updates) => {
        setWorkshops(prev => prev.map(ws =>
            ws.id === workshopId ? { ...ws, ...updates } : ws
        ));
    }, []);

    // === Xodim rasmini o'rnatish ===

    const setWorkerPhoto = useCallback(async (workerId, file) => {
        try {
            const base64 = await fileToBase64(file);
            setWorkers(prev => prev.map(w =>
                w.id === workerId ? { ...w, photo: base64 } : w
            ));
            return base64;
        } catch (e) {
            console.error('Rasm yuklashda xatolik:', e);
            return null;
        }
    }, []);

    // === Yordamchi funksiyalar ===

    // Tabel raqam bo'yicha xodimni topish (imtihon tizimi uchun)
    const findWorkerByTabel = useCallback((tabelId) => {
        return workers.find(w => {
            const workerTabel = w.tabelId ? w.tabelId.toString() : (1000 + w.id).toString();
            return workerTabel === tabelId.toString();
        });
    }, [workers]);

    // Barcha xodimlarni olish (imtihon uchun)
    const getAllWorkersForExam = useCallback(() => {
        return workers.map(w => ({
            id: w.id,
            name: w.name,
            sex: w.sex,
            lavozim: w.lavozim,
            tabelId: w.tabelId || (1000 + w.id).toString(),
            razryad: w.razryad,
            lastExamDate: w.lastExamDate,
            lastExamGrade: w.lastExamGrade,
            photo: w.photo,
        }));
    }, [workers]);

    // Sex bo'yicha xodimlar sonini hisoblash
    const getWorkerCountBySex = useCallback((sexNumber) => {
        return workers.filter(w => w.sex === sexNumber).length;
    }, [workers]);

    // Sexlar + xodimlar sonini yangilangan holda olish
    const getWorkshopsWithCounts = useCallback(() => {
        return workshops.map(ws => ({
            ...ws,
            workerCount: workers.filter(w => w.sex === ws.number).length,
        }));
    }, [workshops, workers]);

    const value = {
        workers,
        workshops,
        isLoaded,
        // Xodimlar
        addWorker,
        updateWorker,
        deleteWorker,
        importWorkers,
        setWorkerPhoto,
        setWorkers,
        // Sexlar
        addWorkshop,
        updateWorkshop,
        setWorkshops,
        // Yordamchi
        findWorkerByTabel,
        getAllWorkersForExam,
        getWorkerCountBySex,
        getWorkshopsWithCounts,
    };

    return (
        <WorkersContext.Provider value={value}>
            {children}
        </WorkersContext.Provider>
    );
}

export function useWorkers() {
    const context = useContext(WorkersContext);
    if (!context) {
        throw new Error('useWorkers must be used within a WorkersProvider');
    }
    return context;
}

export default WorkersContext;
