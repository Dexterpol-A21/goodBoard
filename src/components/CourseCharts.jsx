import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine, LineChart, Line, AreaChart, Area, ComposedChart, Treemap
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const GRADE_COLORS = {
  high: '#22c55e', // Green-500
  mid: '#eab308',  // Yellow-500
  low: '#ef4444',  // Red-500
  none: '#4b5563', // Gray-600
  orange: '#f97316' // Orange-500
};

const CustomizedDot = (props) => {
    const { cx, cy, value } = props;
    let fill = GRADE_COLORS.low;
    if (value >= 9) fill = GRADE_COLORS.high;
    else if (value >= 8) fill = GRADE_COLORS.mid; // Yellow
    else if (value >= 7) fill = GRADE_COLORS.orange; // Orange
    
    return (
      <circle cx={cx} cy={cy} r={4} fill={fill} stroke="none" />
    );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-dark border border-border-dark p-3 rounded-lg shadow-xl">
        <p className="text-white font-bold text-sm mb-1">{label || payload[0].name}</p>
        <p className="text-primary text-sm">
          {payload[0].value.toFixed(2)}
          {payload[0].unit ? ` ${payload[0].unit}` : ''}
        </p>
        {payload[0].payload.weight && (
           <p className="text-text-secondary text-xs">
             Peso: {payload[0].payload.weight}%
           </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomizedTreemapContent = (props) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name, value, grade } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: grade >= 9 ? GRADE_COLORS.high : 
                grade >= 8 ? GRADE_COLORS.mid : 
                grade >= 7 ? GRADE_COLORS.orange : 
                grade > 0 ? GRADE_COLORS.low : GRADE_COLORS.none,
          stroke: '#1e1e1e',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          {name.length > 10 ? name.substring(0, 10) + '...' : name}
        </text>
      )}
      {width > 50 && height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize={10}
        >
          {grade > 0 ? grade : '-'}
        </text>
      )}
    </g>
  );
};

export default function CourseCharts({ grades = [], totalWeight, accumulatedPoints }) {
  const [activeTab, setActiveTab] = useState('progreso');
  const [targetGrade, setTargetGrade] = useState(8.5);

  // Data Preparation
  const chartData = useMemo(() => {
    let cumulative = 0;
    let maxCumulative = 0;
    
    return grades.map((g, i) => {
        let shortName = `A${i + 1}`;
        const match = g.title.match(/Actividad\s+(\d+)/i);
        if (match) shortName = `A${match[1]}`;
        
        const grade = g.grade && g.grade !== '-' ? parseFloat(g.grade) : 0;
        const weight = g.weight ? parseFloat(g.weight) : 0;
        const maxPoints = (weight / 100) * 10;
        const earnedPoints = (grade / 10) * maxPoints;
        
        if (g.grade && g.grade !== '-') {
            cumulative += earnedPoints;
        }
        maxCumulative += maxPoints;

        return {
            name: g.title,
            shortName,
            calificacion: grade,
            weight,
            earnedPoints,
            cumulative: g.grade && g.grade !== '-' ? cumulative : null,
            maxCumulative,
            ideal: (maxCumulative / 10) * targetGrade,
            idealPass: (maxCumulative / 10) * 7.0,
            idealScholarship: (maxCumulative / 10) * 9.0
        };
    });
  }, [grades, targetGrade]);

  const pieData = useMemo(() => {
    let earned = 0;
    let lost = 0;
    let remaining = 0;

    grades.forEach(g => {
      const weightVal = g.weight ? parseFloat(g.weight) : 0;
      const maxPointsForActivity = (weightVal / 100) * 10;
      
      if (g.grade && g.grade !== '-') {
        const gradeVal = parseFloat(g.grade);
        const pointsEarned = (gradeVal / 10) * maxPointsForActivity;
        earned += pointsEarned;
        lost += (maxPointsForActivity - pointsEarned);
      } else {
        remaining += maxPointsForActivity;
      }
    });

    return [
      { name: 'Ganado', value: earned, color: GRADE_COLORS.high },
      { name: 'Perdido', value: lost, color: GRADE_COLORS.low },
      { name: 'Restante', value: remaining, color: GRADE_COLORS.none },
    ].filter(d => d.value > 0);
  }, [grades]);

  const treemapData = useMemo(() => {
    return grades
        .filter(g => g.weight && parseFloat(g.weight) > 0)
        .map(g => ({
            name: g.title,
            size: parseFloat(g.weight),
            grade: g.grade && g.grade !== '-' ? parseFloat(g.grade) : 0
        }));
  }, [grades]);

  const calculateNeeded = (target, current, remaining) => {
      const needed = target - current;
      if (needed <= 0) return { status: 'achieved', avg: 0 };
      if (needed > remaining + 0.001) return { status: 'impossible', avg: null };
      return { status: 'achievable', avg: (needed / remaining) * 10 };
  };

  const targetAnalysis = useMemo(() => {
    const current = parseFloat(accumulatedPoints);
    const remaining = pieData.find(d => d.name === 'Restante')?.value || 0;
    const maxPossible = current + remaining;
    
    const remainingAssignments = grades.filter(g => !g.grade || g.grade === '-').map(g => ({
        title: g.title,
        weight: g.weight ? parseFloat(g.weight) : 0
    }));

    return {
        maxPossible,
        remaining,
        remainingAssignments,
        targets: {
            pass: calculateNeeded(7.0, current, remaining),
            scholarship: calculateNeeded(9.0, current, remaining),
            custom: calculateNeeded(targetGrade, current, remaining)
        }
    };
  }, [accumulatedPoints, pieData, targetGrade, grades]);

  const renderGrade = (analysis) => {
      if (analysis.status === 'achieved') return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-green-500 mx-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      );
      if (analysis.status === 'impossible') return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-red-500 mx-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      );
      return analysis.avg.toFixed(2);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Target Calculator */}
      <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
                <h3 className="text-lg font-bold text-white">Proyección de Meta</h3>
                <p className="text-text-secondary text-sm">Calcula qué necesitas para pasar</p>
            </div>
            <div className="flex items-center gap-3 bg-background-dark p-2 rounded-lg border border-border-dark">
                <span className="text-sm text-text-secondary">Meta:</span>
                <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    step="0.1"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(parseFloat(e.target.value))}
                    className="bg-transparent text-white font-bold w-16 text-center focus:outline-none border-b border-primary"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-lg bg-background-dark/50 border border-border-dark flex flex-col justify-center gap-2">
                {targetAnalysis.remainingAssignments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-text-secondary border-b border-border-dark">
                                    <th className="py-2 font-medium">Actividad Pendiente</th>
                                    <th className="py-2 text-center font-medium" style={{ color: '#E4E4E7' }}>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">foundation</span>
                                            <span>Pasar (7.0)</span>
                                        </div>
                                    </th>
                                    <th className="py-2 text-center font-medium" style={{ color: '#C084FC' }}>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">emoji_events</span>
                                            <span>Beca (9.0)</span>
                                        </div>
                                    </th>
                                    <th className="py-2 text-center font-medium" style={{ color: '#EC4899' }}>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">track_changes</span>
                                            <span>Meta ({targetGrade})</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {targetAnalysis.remainingAssignments.map((a, idx) => (
                                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                        <td className="py-3 pr-4 truncate max-w-[200px] text-white" title={a.title}>{a.title}</td>
                                        <td className="py-3 text-center font-mono text-white">{renderGrade(targetAnalysis.targets.pass)}</td>
                                        <td className="py-3 text-center font-mono text-white">{renderGrade(targetAnalysis.targets.scholarship)}</td>
                                        <td className="py-3 text-center font-mono font-bold" style={{ color: '#EC4899' }}>{renderGrade(targetAnalysis.targets.custom)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-4 text-text-secondary">
                        No hay actividades pendientes.
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Criteria & Distribution */}
      <div className="flex flex-col gap-6">
          <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col h-[500px]">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['progreso', 'tendencia', 'barras', 'mapa'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors whitespace-nowrap ${
                            activeTab === tab 
                            ? 'bg-primary text-background-dark' 
                            : 'bg-background-dark text-text-secondary hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    {activeTab === 'barras' && (
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={GRADE_COLORS.high} />
                                    <stop offset="10%" stopColor={GRADE_COLORS.high} />
                                    <stop offset="10%" stopColor={GRADE_COLORS.mid} />
                                    <stop offset="20%" stopColor={GRADE_COLORS.mid} />
                                    <stop offset="20%" stopColor={GRADE_COLORS.orange} />
                                    <stop offset="30%" stopColor={GRADE_COLORS.orange} />
                                    <stop offset="30%" stopColor={GRADE_COLORS.low} />
                                    <stop offset="100%" stopColor={GRADE_COLORS.low} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="shortName" stroke="#666" tick={{fill: '#888'}} />
                            <YAxis stroke="#666" tick={{fill: '#888'}} domain={[0, 10]} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <ReferenceLine y={7} stroke="#E4E4E7" strokeDasharray="3 3" label={{ value: 'Pasar', fill: '#E4E4E7', position: 'right' }} />
                            <ReferenceLine y={9} stroke="#C084FC" strokeDasharray="3 3" label={{ value: 'Beca', fill: '#C084FC', position: 'right' }} />
                            <ReferenceLine y={targetGrade} stroke="#EC4899" strokeDasharray="3 3" label={{ value: 'Meta', fill: '#EC4899', position: 'right' }} />
                            <Bar dataKey="calificacion" fill="url(#gradeGradient)" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.calificacion >= 9 ? GRADE_COLORS.high : entry.calificacion >= 8 ? GRADE_COLORS.mid : entry.calificacion >= 7 ? GRADE_COLORS.orange : GRADE_COLORS.low} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}

                    {activeTab === 'tendencia' && (
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradeGradientLine" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={GRADE_COLORS.high} />
                                    <stop offset="10%" stopColor={GRADE_COLORS.high} />
                                    <stop offset="10%" stopColor={GRADE_COLORS.mid} />
                                    <stop offset="20%" stopColor={GRADE_COLORS.mid} />
                                    <stop offset="20%" stopColor={GRADE_COLORS.orange} />
                                    <stop offset="30%" stopColor={GRADE_COLORS.orange} />
                                    <stop offset="30%" stopColor={GRADE_COLORS.low} />
                                    <stop offset="100%" stopColor={GRADE_COLORS.low} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="shortName" stroke="#666" tick={{fill: '#888'}} />
                            <YAxis stroke="#666" tick={{fill: '#888'}} domain={[0, 10]} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={7} stroke="#E4E4E7" strokeDasharray="3 3" label={{ value: 'Pasar', fill: '#E4E4E7', position: 'right' }} />
                            <ReferenceLine y={9} stroke="#C084FC" strokeDasharray="3 3" label={{ value: 'Beca', fill: '#C084FC', position: 'right' }} />
                            <ReferenceLine y={targetGrade} stroke="#EC4899" strokeDasharray="3 3" label={{ value: 'Meta', fill: '#EC4899', position: 'right' }} />
                            <Line type="monotone" dataKey="calificacion" stroke="url(#gradeGradientLine)" strokeWidth={3} dot={<CustomizedDot />} activeDot={{r: 6}} />
                        </LineChart>
                    )}

                    {activeTab === 'progreso' && (
                        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradeGradientArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={GRADE_COLORS.high} stopOpacity={0.3} />
                                    <stop offset="10%" stopColor={GRADE_COLORS.high} stopOpacity={0.3} />
                                    <stop offset="10%" stopColor={GRADE_COLORS.mid} stopOpacity={0.3} />
                                    <stop offset="20%" stopColor={GRADE_COLORS.mid} stopOpacity={0.3} />
                                    <stop offset="20%" stopColor={GRADE_COLORS.orange} stopOpacity={0.3} />
                                    <stop offset="30%" stopColor={GRADE_COLORS.orange} stopOpacity={0.3} />
                                    <stop offset="30%" stopColor={GRADE_COLORS.low} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={GRADE_COLORS.low} stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="shortName" stroke="#666" tick={{fill: '#888'}} />
                            <YAxis stroke="#666" tick={{fill: '#888'}} domain={[0, 10]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="cumulative" fill="url(#gradeGradientArea)" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="idealPass" stroke="#E4E4E7" strokeDasharray="3 3" strokeWidth={2} dot={false} name="Ruta Pasar (7.0)" />
                            <Line type="monotone" dataKey="idealScholarship" stroke="#C084FC" strokeDasharray="3 3" strokeWidth={2} dot={false} name="Ruta Beca (9.0)" />
                            <Line type="monotone" dataKey="ideal" stroke="#EC4899" strokeDasharray="5 5" strokeWidth={2} dot={false} name={`Ruta Meta (${targetGrade})`} />
                        </ComposedChart>
                    )}

                    {activeTab === 'mapa' && (
                        <Treemap
                            data={treemapData}
                            dataKey="size"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedTreemapContent />}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    )}
                </ResponsiveContainer>
            </div>
          </div>
      </div>
    </div>
  );
}
