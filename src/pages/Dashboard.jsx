
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserX, CheckCircle, AlertTriangle } from 'lucide-react';

const KPICard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm hover:translate-y-[-2px] transition-transform duration-200">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</h3>
            <div className={`p-2 rounded-lg bg-[hsl(var(--secondary))] ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{subtext}</span>
        </div>
    </div>
);

const dataQuarterly = [
    { name: 'Yanvar', Razryad: 12, Imtihon: 45 },
    { name: 'Fevral', Razryad: 19, Imtihon: 38 },
    { name: 'Mart', Razryad: 8, Imtihon: 52 },
];

const dataAttendance = [
    { name: 'Keldi', value: 850 },
    { name: 'Kelmadi', value: 45 },
    { name: 'Sababli', value: 20 },
];
const COLORS = ['#0088FE', '#FF8042', '#FFBB28'];

export default function Dashboard() {
    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Boshqaruv Paneli</h1>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">So'nggi yangilanish: Bugun, 14:00</div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Jami Ishchilar"
                    value="895"
                    subtext="+2 yangi xodim"
                    icon={Users}
                    color="text-blue-500"
                />
                <KPICard
                    title="Davomat (Bugun)"
                    value="94%"
                    subtext="850 kishi ishda"
                    icon={CheckCircle}
                    color="text-green-500"
                />
                <KPICard
                    title="Sababsiz Kelmaganlar"
                    value="12"
                    subtext="-3 kechagidan"
                    icon={UserX}
                    color="text-red-500"
                />
                <KPICard
                    title="Ogohlantirishlar"
                    value="5"
                    subtext="Xavfsizlik bo'yicha"
                    icon={AlertTriangle}
                    color="text-yellow-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Kvartal Ko'rsatkichlari (Razryad & Imtihon)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataQuarterly}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend />
                                <Bar dataKey="Razryad" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Razryad Olganlar" />
                                <Bar dataKey="Imtihon" fill="#10b981" radius={[4, 4, 0, 0]} name="Imtihon Topshirganlar" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Chart */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold mb-4 w-full text-left">Davomat Strukturasi</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataAttendance}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataAttendance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
