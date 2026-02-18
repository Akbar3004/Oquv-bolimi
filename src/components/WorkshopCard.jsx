import React from 'react';
import { Users, UserCog, Wrench } from 'lucide-react';

export default function WorkshopCard({ workshop, onClick }) {
    return (
        <div
            onClick={onClick}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-[hsl(var(--primary))] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wrench size={64} />
            </div>

            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {workshop.number}
                </div>
                <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))] text-sm">
                    <Users size={16} />
                    <span className="font-mono font-bold">{workshop.workerCount}</span>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="text-xl font-bold group-hover:text-[hsl(var(--primary))] transition-colors mb-1">
                    {workshop.function || "Seh Vazifasi"}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                    Mas'ul: {workshop.masterName || "Tayinlanmagan"}
                </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] mt-auto pt-4 border-t border-dashed">
                <UserCog size={16} />
                <span>Master</span>
            </div>
        </div>
    );
}
