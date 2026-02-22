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
    },
];

// Rollar va ularning ruxsatlari
export const ROLES = {
    admin: {
        label: "Administrator",
        description: "Barcha bo'limlarga kirish va foydalanuvchilarni boshqarish",
        color: "from-red-500 to-orange-500",
        icon: "👑",
        permissions: ['dashboard', 'lessons', 'exams', 'reports', 'workers', 'users'],
    },
    teacher: {
        label: "O'qituvchi",
        description: "Darslar va imtihonlarni boshqarish",
        color: "from-blue-500 to-cyan-500",
        icon: "👨‍🏫",
        permissions: ['dashboard', 'lessons', 'exams'],
    },
    inspector: {
        label: "Nazoratchi",
        description: "Hisobotlar va monitoring",
        color: "from-green-500 to-emerald-500",
        icon: "🔍",
        permissions: ['dashboard', 'reports', 'exams'],
    },
    hr: {
        label: "Kadrlar bo'limi",
        description: "Xodimlarni boshqarish",
        color: "from-purple-500 to-pink-500",
        icon: "👥",
        permissions: ['dashboard', 'workers'],
    },
    exam_taker: {
        label: "Imtihon topshiruvchi",
        description: "Imtihon topshirish",
        color: "from-amber-500 to-yellow-500",
        icon: "📝",
        permissions: ['exam_interface'],
    },
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('oquv_users');
        return saved ? JSON.parse(saved) : DEFAULT_USERS;
    });
    const [isLoading, setIsLoading] = useState(true);

    // Boshlang'ichda sessiyani tekshirish
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

    // Users o'zgarganda saqlash
    useEffect(() => {
        localStorage.setItem('oquv_users', JSON.stringify(users));
    }, [users]);

    // Login/parol orqali kirish
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

    // Imtihon topshiruvchi uchun tabel raqam orqali kirish (FaceID bilan)
    const loginByTabel = (tabelId, workerData) => {
        const examUser = {
            id: `exam_${tabelId}`,
            username: tabelId,
            fullName: workerData.name,
            role: 'exam_taker',
            tabelId: tabelId,
            workerData: workerData,
        };
        setCurrentUser(examUser);
        // Imtihon topshiruvchi uchun sessiya saqlamaymiz (har safar yangi kirish)
        return { success: true, user: examUser };
    };

    // Chiqish
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('oquv_session');
    };

    // Yangi foydalanuvchi yaratish (faqat admin)
    const createUser = (userData) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: "Ruxsat yo'q!" };
        }

        // Username takrorlanmasligini tekshirish
        if (users.some(u => u.username === userData.username)) {
            return { success: false, error: "Bu login allaqachon mavjud!" };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            avatar: null,
        };

        setUsers(prev => [...prev, newUser]);
        return { success: true, user: newUser };
    };

    // Foydalanuvchini tahrirlash
    const updateUser = (userId, updates) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: "Ruxsat yo'q!" };
        }

        // Username tekshirish (boshqa foydalanuvchida bormi)
        if (updates.username) {
            const existing = users.find(u => u.username === updates.username && u.id !== userId);
            if (existing) {
                return { success: false, error: "Bu login allaqachon mavjud!" };
            }
        }

        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        return { success: true };
    };

    // Foydalanuvchini o'chirish
    const deleteUser = (userId) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: "Ruxsat yo'q!" };
        }

        // Admin o'zini o'chira olmaydi
        if (userId === currentUser.id) {
            return { success: false, error: "O'zingizni o'chira olmaysiz!" };
        }

        setUsers(prev => prev.filter(u => u.id !== userId));
        return { success: true };
    };

    // Foydalanuvchining ruxsatlarini tekshirish
    const hasPermission = (permission) => {
        if (!currentUser) return false;
        const role = ROLES[currentUser.role];
        return role?.permissions.includes(permission) || false;
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
