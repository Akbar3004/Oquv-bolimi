/**
 * Data Service — Ma'lumotlar bilan ishlash qatlami
 * 
 * Hozircha localStorage bilan ishlaydi.
 * Kelajakda faqat shu fayldagi funksiyalarni o'zgartirib,
 * API yoki baza bilan ulash mumkin.
 */

const STORAGE_KEYS = {
    WORKERS: 'oquv_bolimi_workers',
    WORKSHOPS: 'oquv_bolimi_workshops',
};

// === Boshlang'ich ma'lumotlar ===
const DEFAULT_WORKSHOPS = [
    { id: 1, number: '1-Sex', masterName: 'Ali Valiyev', function: 'Temir kesish', workerCount: 2 },
    { id: 2, number: '2-Sex', masterName: 'Vali Aliyev', function: 'Payvandlash', workerCount: 1 },
    { id: 3, number: '3-Sex', masterName: "G'anisher Toshmatov", function: "Yig'ish", workerCount: 1 },
];

const DEFAULT_WORKERS = [
    { id: 1, name: 'Abdullayev Botir', sex: '1-Sex', lavozim: 'Mashinist', tabelId: '1001', razryad: '3-toifa', joined: '2020-05-12', status: 'Active', lastExamDate: '2025-12-10', lastExamGrade: '5', photo: null },
    { id: 2, name: 'Qodirov Jamshid', sex: '2-Sex', lavozim: 'Elektrik', tabelId: '1002', razryad: '4-toifa', joined: '2021-08-20', status: 'Sick', lastExamDate: '2026-01-15', lastExamGrade: '4', photo: null },
    { id: 3, name: 'Saliyeva Dildora', sex: 'Ofis', lavozim: "Kadrlar bo'limi", tabelId: '1003', razryad: '2-toifa', joined: '2019-01-15', status: 'Active', lastExamDate: '2025-11-20', lastExamGrade: '5', photo: null },
    { id: 4, name: 'Tursunov Alisher', sex: '3-Sex', lavozim: 'Payvandchi', tabelId: '1004', razryad: '3-toifa', joined: '2022-11-05', status: 'Vacation', lastExamDate: '2026-02-01', lastExamGrade: '3', photo: null },
];

// === Sexlar (Workshops) ===

export function getWorkshops() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.WORKSHOPS);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Sexlar ma\'lumotlarini olishda xatolik:', e);
    }
    return DEFAULT_WORKSHOPS;
}

export function saveWorkshops(workshops) {
    try {
        localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(workshops));
        return true;
    } catch (e) {
        console.error('Sexlar ma\'lumotlarini saqlashda xatolik:', e);
        return false;
    }
}

// === Xodimlar (Workers) ===

export function getWorkers() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.WORKERS);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Xodimlar ma\'lumotlarini olishda xatolik:', e);
    }
    return DEFAULT_WORKERS;
}

export function saveWorkers(workers) {
    try {
        localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
        return true;
    } catch (e) {
        console.error('Xodimlar ma\'lumotlarini saqlashda xatolik:', e);
        return false;
    }
}

// === Rasmlar bilan ishlash ===

/**
 * Faylni base64 formatiga o'giradi
 * @param {File} file - Rasm fayli
 * @param {number} maxWidth - Maksimal kenglik (px), default: 400
 * @returns {Promise<string>} - base64 string
 */
export function fileToBase64(file, maxWidth = 400) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Rasmni kichiklashtirish (localStorage sig'imi uchun)
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // JPEG formatida siqish
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// === Ma'lumotlarni tozalash (kerak bo'lganda) ===

export function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.WORKERS);
    localStorage.removeItem(STORAGE_KEYS.WORKSHOPS);
}
