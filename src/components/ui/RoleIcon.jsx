import React from 'react';
import {
    Crown, GraduationCap, ScanSearch, Users, FileEdit, BriefcaseBusiness,
    LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, UserCog, ShieldCheck
} from 'lucide-react';

// === ROL IKONKALARI ===
const ROLE_ICON_MAP = {
    admin: { Icon: Crown, gradient: 'from-red-500 to-orange-400', bg: 'bg-red-500/15', text: 'text-red-400' },
    tchnuk: { Icon: BriefcaseBusiness, gradient: 'from-sky-500 to-blue-500', bg: 'bg-sky-500/15', text: 'text-sky-400' },
    teacher: { Icon: GraduationCap, gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-500/15', text: 'text-blue-400' },
    inspector: { Icon: ScanSearch, gradient: 'from-emerald-500 to-green-400', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    hr: { Icon: UserCog, gradient: 'from-purple-500 to-pink-400', bg: 'bg-purple-500/15', text: 'text-purple-400' },
    exam_taker: { Icon: FileEdit, gradient: 'from-amber-500 to-yellow-400', bg: 'bg-amber-500/15', text: 'text-amber-400' },
};

// === RUXSAT (PERMISSION) IKONKALARI ===
const PERMISSION_ICON_MAP = {
    dashboard: { Icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/15', text: 'text-blue-400' },
    lessons: { Icon: BookOpen, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    exams: { Icon: ClipboardCheck, gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/15', text: 'text-violet-400' },
    reports: { Icon: BarChart3, gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/15', text: 'text-orange-400' },
    workers: { Icon: Users, gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
    users: { Icon: ShieldCheck, gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/15', text: 'text-rose-400' },
};

/**
 * RoleIcon — Rol uchun zamonaviy gradient badge ikonka
 * @param {string} roleKey - Rol kaliti (admin, teacher, etc.)
 * @param {number} size - Ikonka o'lchami (default: 20)
 * @param {'badge'|'flat'|'icon'} variant - Ko'rinish turi
 *   - badge: Gradient fonli kvadrat badge (katta; kartalar, sidebar uchun)
 *   - flat: Shaffof fonli yumaloq (o'rta; jadvallar uchun)
 *   - icon: Faqat ikonka (kichik; inline matn uchun)
 */
export function RoleIcon({ roleKey, size = 20, variant = 'badge', className = '' }) {
    const config = ROLE_ICON_MAP[roleKey];
    if (!config) return null;

    const { Icon, gradient, bg, text } = config;

    if (variant === 'icon') {
        return <Icon size={size} className={`${text} ${className}`} />;
    }

    if (variant === 'flat') {
        return (
            <div className={`${bg} rounded-lg p-1.5 shrink-0 ${className}`}>
                <Icon size={size} className={text} />
            </div>
        );
    }

    // badge (default)
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-xl p-2 shadow-lg shadow-black/20 shrink-0 ${className}`}>
            <Icon size={size} className="text-white drop-shadow-sm" />
        </div>
    );
}

/**
 * PermIcon — Ruxsat (menyu) uchun zamonaviy ikonka
 * @param {string} permKey - Permission kaliti (dashboard, lessons, etc.)
 * @param {number} size - Ikonka o'lchami
 * @param {'badge'|'flat'|'icon'} variant
 */
export function PermIcon({ permKey, size = 20, variant = 'badge', className = '' }) {
    const config = PERMISSION_ICON_MAP[permKey];
    if (!config) return null;

    const { Icon, gradient, bg, text } = config;

    if (variant === 'icon') {
        return <Icon size={size} className={`${text} ${className}`} />;
    }

    if (variant === 'flat') {
        return (
            <div className={`${bg} rounded-lg p-1.5 shrink-0 ${className}`}>
                <Icon size={size} className={text} />
            </div>
        );
    }

    // badge (default)
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-xl p-2 shadow-lg shadow-black/20 shrink-0 ${className}`}>
            <Icon size={size} className="text-white drop-shadow-sm" />
        </div>
    );
}

// Export mappings for direct access
export { ROLE_ICON_MAP, PERMISSION_ICON_MAP };
