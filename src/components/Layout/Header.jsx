
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, Globe } from 'lucide-react';

export default function Header({ toggleSidebar }) {
    const [time, setTime] = useState(new Date());
    const [theme, setTheme] = useState('dark');
    const [lang, setLang] = useState('uz-latin'); // 'uz-latin' or 'uz-cyrl'

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const toggleLang = () => {
        setLang(prev => prev === 'uz-latin' ? 'uz-cyrl' : 'uz-latin');
        // In a real app, this would toggle a global context
    };

    const formatDate = (date) => {
        // Basic date formatting, ideally localized
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('uz-UZ', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] sticky top-0 z-50 shadow-sm glass">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    {/* Logo placeholder */}
                    <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold shadow-lg">
                        TY
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm md:text-md font-bold uppercase tracking-wide text-[hsl(var(--foreground))]">O'zbekiston Temir Yo'llari</h1>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">O'zbekiston Lokomotiv Deposi</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                <div className="text-right hidden md:block">
                    <p className="text-lg font-mono font-bold text-[hsl(var(--primary))]">{formatTime(time)}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{formatDate(time)}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={toggleLang}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors flex items-center gap-1 text-sm border border-[hsl(var(--border))]"
                        title="Tilni o'zgartirish"
                    >
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">{lang === 'uz-latin' ? 'UZ' : 'ЎЗ'}</span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors border border-[hsl(var(--border))]"
                        title="Mavzuni o'zgartirish"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
}
