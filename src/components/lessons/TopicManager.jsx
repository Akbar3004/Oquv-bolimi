import React, { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Search, Tag, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddTopicModal from './AddTopicModal';

const MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const CATEGORY_COLORS = {
    'Texnik xavfsizlik': 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-300',
    'Yangi texnologiyalar': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
    'Mexanika va ta\'mirlash': 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300',
    'Elektr jihozlari': 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300',
    'Sanitariya va gigiyena': 'from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-300',
    'O\'t xavfsizligi': 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300',
    'Mehnat muhofazasi': 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300',
    'Boshqa': 'from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-300',
};

export default function TopicManager({ topics, onTopicsChange }) {
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [expandedTopic, setExpandedTopic] = useState(null);

    const filteredTopics = topics
        .filter(t => t.month === selectedMonth)
        .filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleSaveTopic = (topicData) => {
        if (editingTopic) {
            onTopicsChange(topics.map(t => t.id === topicData.id ? topicData : t));
        } else {
            onTopicsChange([...topics, topicData]);
        }
        setEditingTopic(null);
    };

    const handleDeleteTopic = (id) => {
        if (confirm('Ushbu mavzuni o\'chirmoqchimisiz?')) {
            onTopicsChange(topics.filter(t => t.id !== id));
        }
    };

    const handleEdit = (topic) => {
        setEditingTopic(topic);
        setIsModalOpen(true);
    };

    const getCategoryColor = (category) => {
        return CATEGORY_COLORS[category] || CATEGORY_COLORS['Boshqa'];
    };

    return (
        <div className="space-y-6">
            {/* Yuqori qism — filtr va qo'shish */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {MONTHS.map(m => {
                        const count = topics.filter(t => t.month === m).length;
                        return (
                            <button
                                key={m}
                                onClick={() => setSelectedMonth(m)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedMonth === m
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
                                    }`}
                            >
                                {m.slice(0, 3)}
                                {count > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${selectedMonth === m ? 'bg-white/20' : 'bg-violet-500/20 text-violet-300'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => { setEditingTopic(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all active:scale-[0.98] shrink-0"
                >
                    <Plus size={16} /> Yangi Mavzu
                </button>
            </div>

            {/* Qidiruv */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all"
                    placeholder="Mavzu yoki kategoriya bo'yicha qidirish..."
                />
            </div>

            {/* Mavzular ro'yxati */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredTopics.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <BookOpen size={48} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-30" />
                            <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                {searchQuery ? 'Qidiruv natijasi topilmadi' : `${selectedMonth} oyi uchun mavzular mavjud emas`}
                            </p>
                            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1 opacity-60">
                                "Yangi Mavzu" tugmasini bosib mavzu qo'shing
                            </p>
                        </motion.div>
                    ) : (
                        filteredTopics.map((topic, index) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                layout
                                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden hover:border-violet-500/30 transition-all group"
                            >
                                <div
                                    className="p-4 cursor-pointer"
                                    onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 shrink-0">
                                                <BookOpen size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{topic.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium bg-gradient-to-r border ${getCategoryColor(topic.category)}`}>
                                                        {topic.category}
                                                    </span>
                                                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                                        <Clock size={10} /> {topic.duration} daqiqa
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(topic); }}
                                                className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Tahrirlash"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="O'chirish"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <div className="text-[hsl(var(--muted-foreground))]">
                                                {expandedTopic === topic.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedTopic === topic.id && topic.description && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-0 border-t border-[hsl(var(--border))]">
                                                <p className="text-sm text-[hsl(var(--muted-foreground))] pt-3">
                                                    {topic.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Statistika */}
            {filteredTopics.length > 0 && (
                <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] px-1">
                    <span>{selectedMonth} oyida jami: <strong className="text-[hsl(var(--foreground))]">{filteredTopics.length}</strong> ta mavzu</span>
                    <span>Umumiy vaqt: <strong className="text-[hsl(var(--foreground))]">{filteredTopics.reduce((sum, t) => sum + parseInt(t.duration || 0), 0)}</strong> daqiqa</span>
                </div>
            )}

            {/* Modal */}
            <AddTopicModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTopic(null); }}
                onSave={handleSaveTopic}
                editData={editingTopic}
            />
        </div>
    );
}
