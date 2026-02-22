
import React from 'react';
import { LayoutDashboard, BookOpen, GraduationCap, FileBarChart, Users, ChevronLeft, ChevronRight, Shield, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth, ROLES } from '../../contexts/AuthContext';

const allNavItems = [
    { name: 'Asosiy', path: '/', icon: <LayoutDashboard size={20} />, permission: 'dashboard' },
    { name: 'Dars', path: '/lessons', icon: <BookOpen size={20} />, permission: 'lessons' },
    { name: 'Imtihon', path: '/exams', icon: <GraduationCap size={20} />, permission: 'exams' },
    { name: 'Hisobotlar', path: '/reports', icon: <FileBarChart size={20} />, permission: 'reports' },
    { name: 'Xodimlar', path: '/workers', icon: <Users size={20} />, permission: 'workers' },
    { name: 'Foydalanuvchilar', path: '/users', icon: <Shield size={20} />, permission: 'users' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
    const { currentUser, logout, hasPermission } = useAuth();
    const toggleSidebar = () => setIsOpen(!isOpen);

    // Foydalanuvchi ruxsatlariga qarab menyuni filtrlash
    const navItems = allNavItems.filter(item => hasPermission(item.permission));

    const role = currentUser ? ROLES[currentUser.role] : null;

    return (
        <div className={`h-[calc(100vh-64px)] fixed bottom-0 left-0 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] transition-all duration-300 md:relative md:h-full z-40 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex flex-col h-full py-6 px-3">
                {/* User Info (agar sidebar ochiq bo'lsa) */}
                {currentUser && (
                    <div className={`mb-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <div className="px-3 py-3 bg-[hsl(var(--secondary)/0.5)] rounded-xl border border-[hsl(var(--border))]">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 bg-gradient-to-br ${role?.color || 'from-gray-500 to-gray-600'} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                                    {currentUser.fullName?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">{currentUser.fullName}</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">{role?.icon}</span>
                                        <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">{role?.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex flex-col gap-2 mt-2 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 
                ${isActive
                                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md'
                                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}
              `}
                            title={item.name}
                        >
                            <div className="flex-shrink-0">{item.icon}</div>
                            <span className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto space-y-2">
                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors`}
                        title="Chiqish"
                    >
                        <LogOut size={20} className="shrink-0" />
                        <span className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden text-sm ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>
                            Chiqish
                        </span>
                    </button>

                    {/* Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] transition-colors border border-[hsl(var(--border))]"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <div className={`mt-4 text-center text-xs text-[hsl(var(--muted-foreground))] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <p>Nazirov Akbarbek</p>
                        <p>AI Texnalogiyalar &copy; 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
