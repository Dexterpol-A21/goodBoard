import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

const GRADE_COLORS = {
  high: '#22c55e', // Green-500
  mid: '#eab308',  // Yellow-500
  orange: '#f97316', // Orange-500
  low: '#ef4444',  // Red-500
  none: '#4b5563' // Gray-600
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-dark border border-border-dark p-3 rounded-lg shadow-xl">
        <p className="text-white font-bold text-sm mb-1">{label || payload[0].name}</p>
        <p className="text-primary text-sm">
          {payload[0].name === 'Cantidad' ? 'Cursos: ' : 'Calificación: '}
          {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function OverallPerformanceChart({ grades = [], onCourseClick }) {
  const [activeTab, setActiveTab] = useState('barras');

  const data = useMemo(() => {
    if (!grades) return [];
    return grades.map(g => {
      let val = 0;
      if (typeof g.grade === 'string') {
        let clean = g.grade.trim();
        if (clean.includes('%')) {
          val = parseFloat(clean.replace('%', '')) / 10;
        } else if (clean.includes('/')) {
          val = parseFloat(clean.split('/')[0]);
        } else {
          val = parseFloat(clean);
        }
      } else if (typeof g.grade === 'number') {
        val = g.grade;
      }
      
      return {
        name: g.course,
        shortName: g.courseId || (g.course.length > 15 ? g.course.substring(0, 15) + '...' : g.course),
        grade: isNaN(val) ? 0 : val,
        fullMark: 10,
        scholarship: 9.0,
        pass: 7.0
      };
    }).sort((a, b) => b.grade - a.grade);
  }, [grades]);

  const average = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / data.length).toFixed(2);
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="w-full bg-surface-dark border border-border-dark rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
            <h3 className="text-lg font-bold text-white">Rendimiento General</h3>
            <p className="text-text-secondary text-sm">Promedio Global: <span className="text-primary font-bold text-lg">{average}</span></p>
        </div>
        <div className="flex gap-2 bg-background-dark p-1 rounded-lg border border-border-dark">
            <button 
                onClick={() => setActiveTab('barras')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'barras' ? 'bg-primary text-background-dark' : 'text-text-secondary hover:text-white'}`}
            >
                Barras
            </button>
            <button 
                onClick={() => setActiveTab('radar')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'radar' ? 'bg-primary text-background-dark' : 'text-text-secondary hover:text-white'}`}
            >
                Radar
            </button>
        </div>
      </div>
      
      <div className="h-[350px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {activeTab === 'barras' && (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                    dataKey="shortName" 
                    stroke="#666" 
                    tick={{fill: '#888', fontSize: 10}} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                />
                <YAxis stroke="#666" tick={{fill: '#888'}} domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <ReferenceLine y={7} stroke="#E4E4E7" strokeDasharray="3 3" label={{ value: 'Pasar', fill: '#E4E4E7', position: 'insideTopRight' }} />
                <ReferenceLine y={9} stroke="#C084FC" strokeDasharray="3 3" label={{ value: 'Beca', fill: '#C084FC', position: 'insideTopRight' }} />
                <Bar 
                    dataKey="grade" 
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => onCourseClick && onCourseClick(data.name)}
                    cursor="pointer"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                        entry.grade >= 9 ? GRADE_COLORS.high : 
                        entry.grade >= 8 ? GRADE_COLORS.mid : 
                        entry.grade >= 7 ? GRADE_COLORS.orange : 
                        GRADE_COLORS.low
                    } />
                ))}
                </Bar>
            </BarChart>
          )}

          {activeTab === 'radar' && (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <defs>
                    <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="shortName" tick={{ fill: '#888', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#666' }} />
                <Radar
                    name="Aprobar (7.0)"
                    dataKey="pass"
                    stroke="#E4E4E7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="none"
                    fillOpacity={0}
                />
                <Radar
                    name="Beca (9.0)"
                    dataKey="scholarship"
                    stroke="#C084FC"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="none"
                    fillOpacity={0}
                />
                <Radar
                    name="Calificación"
                    dataKey="grade"
                    stroke="#8884d8"
                    strokeWidth={3}
                    fill="url(#radarFill)"
                    fillOpacity={0.6}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
