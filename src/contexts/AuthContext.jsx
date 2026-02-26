import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Boshlang'ich foydalanuvchilar (admin har doim mavjud)
const DEFAULT_USERS = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        fullName: 'Administrator',
        role: 'admin',
        avatar: null,
        permissions: {
            dashboard: { view: true, edit: true },
            lessons: { view: true, edit: true },
            exams: { view: true, edit: true },
            reports: { view: true, edit: true },
            workers: { view: true, edit: true },
            users: { view: true, edit: true },
        },
    },
    {
        id: 2,
        username: 'tchnuk',
        password: 'tchnuk123',
        fullName: "O'quv bo'limi rahbari",
        role: 'tchnuk',
        avatar: null,
        permissions: {
            dashboard: { view: true, edit: true },
            lessons: { view: true, edit: true },
            exams: { view: true, edit: true },
            reports: { view: true, edit: true },
            workers: { view: true, edit: true },
            users: { view: false, edit: false },
        },
    },
];

// Barcha mavjud ruxsatlar ro'yxati
export const ALL_PERMISSIONS = {
    dashboard: { label: "Boshqaruv Paneli", description: "Asosiy statistika va ko'rsatkichlar" },
    lessons: { label: "Darslar", description: "Dars jadvallari va materiallar" },
    exams: { label: "Imtihonlar", description: "Imtihonlar va natijalar" },
    reports: { label: "Hisobotlar", description: "Hisobotlar va tahlillar" },
    workers: { label: "Xodimlar", description: "Xodimlar ma'lumotlari" },
    users: { label: "Foydalanuvchilar", description: "Login/parol va rollar boshqaruvi" },
};

// Rollar — faqat shablon sifatida (standart ruxsatlar to'plami)
export const ROLES = {
    admin: {
        label: "Administrator",
        description: "Barcha bo'limlarga kirish va boshqarish",
        color: "from-red-500 to-orange-500",
        defaultPermissions: {
            dashboard: { view: true, edit: true },
            lessons: { view: true, edit: true },
            exams: { view: true, edit: true },
            reports: { view: true, edit: true },
            workers: { view: true, edit: true },
            users: { view: true, edit: true },
        },
    },
    teacher: {
        label: "O'qituvchi",
        description: "Darslar va imtihonlarni boshqarish",
        color: "from-blue-500 to-cyan-500",
        defaultPermissions: {
            dashboard: { view: true, edit: false },
            lessons: { view: true, edit: true },
            exams: { view: true, edit: true },
            reports: { view: false, edit: false },
            workers: { view: false, edit: false },
            users: { view: false, edit: false },
        },
    },
    inspector: {
        label: "Nazoratchi",
        description: "Hisobotlar va monitoring",
        color: "from-green-500 to-emerald-500",
        defaultPermissions: {
            dashboard: { view: true, edit: false },
            lessons: { view: false, edit: false },
            exams: { view: true, edit: false },
            reports: { view: true, edit: true },
            workers: { view: false, edit: false },
            users: { view: false, edit: false },
        },
    },
    tchnuk: {
        label: "O'quv bo'limi rahbari",
        description: "Darslar, imtihonlar, hisobotlar va xodimlarni boshqarish",
        color: "from-sky-500 to-blue-600",
        defaultPermissions: {
            dashboard: { view: true, edit: true },
            lessons: { view: true, edit: true },
            exams: { view: true, edit: true },
            reports: { view: true, edit: true },
            workers: { view: true, edit: true },
            users: { view: false, edit: false },
        },
    },
    hr: {
        label: "Kadrlar bo'limi",
        description: "Xodimlarni boshqarish",
        color: "from-purple-500 to-pink-500",
        defaultPermissions: {
            dashboard: { view: true, edit: false },
            lessons: { view: false, edit: false },
            exams: { view: false, edit: false },
            reports: { view: false, edit: false },
            workers: { view: true, edit: true },
            users: { view: false, edit: false },
        },
    },
    exam_taker: {
        label: "Imtihon topshiruvchi",
        description: "Imtihon topshirish",
        color: "from-amber-500 to-yellow-500",
        defaultPermissions: {
            dashboard: { view: false, edit: false },
            lessons: { view: false, edit: false },
            exams: { view: false, edit: false },
            reports: { view: false, edit: false },
            workers: { view: false, edit: false },
            users: { view: false, edit: false },
        },
    },
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('oquv_users');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                let migrated = parsed.map(u => {
                    // Eski formatdagi permissions ni yangi formatga o'tkazish
                    if (!u.permissions || typeof u.permissions !== 'object' || Array.isArray(u.permissions)) {
                        const role = ROLES[u.role];
                        return { ...u, permissions: role ? { ...role.defaultPermissions } : ROLES.teacher.defaultPermissions };
                    }
                    // Agar permissions mavjud lekin view/edit yo'q bo'lsa (yarim eski format)
                    const firstPerm = Object.values(u.permissions)[0];
                    if (firstPerm && typeof firstPerm !== 'object') {
                        const role = ROLES[u.role];
                        return { ...u, permissions: role ? { ...role.defaultPermissions } : ROLES.teacher.defaultPermissions };
                    }
                    return u;
                });

                // Admin user har doim mavjud bo'lishini ta'minlash
                const hasAdmin = migrated.some(u => u.id === 1 && u.username === 'admin');
                if (!hasAdmin) {
                    migrated = [DEFAULT_USERS[0], ...migrated.filter(u => u.username !== 'admin')];
                }

                // Duplikat ID larni tuzatish — har biriga noyob ID berish
                const seenIds = new Set();
                migrated = migrated.map((u, idx) => {
                    if (seenIds.has(u.id) || u.id === undefined || u.id === null) {
                        // Admin uchun id=1 saqlash, boshqalarga noyob id berish
                        const newId = u.username === 'admin' ? 1 : Date.now() + idx + 1;
                        console.warn(`[AuthContext] Duplikat ID tuzatildi: ${u.fullName} (${u.id} → ${newId})`);
                        u = { ...u, id: newId };
                    }
                    seenIds.add(u.id);
                    return u;
                });

                return migrated;
            } catch (e) {
                console.error('localStorage parse xatosi, reset qilinmoqda:', e);
                localStorage.removeItem('oquv_users');
                return DEFAULT_USERS;
            }
        }
        return DEFAULT_USERS;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedSession = localStorage.getItem('oquv_session');
        if (savedSession) {
            const session = JSON.parse(savedSession);
            const user = users.find(u => u.id === session.userId);
            if (user) {
                setCurrentUser(user);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        localStorage.setItem('oquv_users', JSON.stringify(users));
    }, [users]);

    const login = (username, password) => {
        const user = users.find(
            u => u.username === username && u.password === password
        );
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('oquv_session', JSON.stringify({ userId: user.id }));
            return { success: true, user };
        }
        return { success: false, error: "Login yoki parol noto'g'ri!" };
    };

    const loginByTabel = (tabelId, workerData) => {
        const examUser = {
            id: `exam_${tabelId}`,
            username: tabelId,
            fullName: workerData.name,
            role: 'exam_taker',
            tabelId: tabelId,
            workerData: workerData,
            permissions: ROLES.exam_taker.defaultPermissions,
        };
        setCurrentUser(examUser);
        return { success: true, user: examUser };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('oquv_session');
    };

    const createUser = (userData) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: "Ruxsat yo'q!" };
        }

        if (users.some(u => u.username === userData.username)) {
            return { success: false, error: "Bu login allaqachon mavjud!" };
        }

        const role = ROLES[userData.role];
        // id ni oxirgi qilib qo'yamiz — userData uni qayta yoza olmasligi uchun
        const { id: _ignoredId, ...cleanUserData } = userData;
        const newUser = {
            ...cleanUserData,
            avatar: null,
            permissions: userData.permissions || (role ? { ...role.defaultPermissions } : {}),
            id: Date.now(),
        };

        setUsers(prev => [...prev, newUser]);
        return { success: true, user: newUser };
    };

    const updateUser = (userId, updates) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: "Ruxsat yo'q!" };
        }

        if (updates.username) {
            const existing = users.find(u => u.username === updates.username && u.id !== userId);
            if (existing) {
                return { success: false, error: "Bu login allaqachon mavjud!" };
            }
        }

        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const updated = { ...u, ...updates };
                if (userId === currentUser.id) {
                    setCurrentUser(updated);
                }
                return updated;
            }
            return u;
        }));
        return { success: true };
    };

    const deleteUser = (userId) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: "Ruxsat yo'q!" };
        }

        if (userId === currentUser.id) {
            return { success: false, error: "O'zingizni o'chira olmaysiz!" };
        }

        setUsers(prev => prev.filter(u => u.id !== userId));
        return { success: true };
    };

    const hasPermission = (permission, type = 'view') => {
        if (!currentUser) return false;

        if (currentUser.permissions && typeof currentUser.permissions === 'object' && !Array.isArray(currentUser.permissions)) {
            return currentUser.permissions[permission]?.[type] === true;
        }

        if (Array.isArray(currentUser.permissions)) {
            return currentUser.permissions.includes(permission);
        }

        const role = ROLES[currentUser.role];
        return role?.defaultPermissions?.[permission]?.[type] === true;
    };

    const value = {
        currentUser,
        users,
        isLoading,
        login,
        loginByTabel,
        logout,
        createUser,
        updateUser,
        deleteUser,
        hasPermission,
        ROLES,
        ALL_PERMISSIONS,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
