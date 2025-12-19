import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const GRADE_COLORS = {
  high: '#22c55e', // Green-500
  mid: '#eab308',  // Yellow-500
  low: '#ef4444',  // Red-500
  none: '#4b5563'  // Gray-600
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-dark border border-border-dark p-3 rounded-lg shadow-xl">
        <p className="text-white font-bold text-sm mb-1">{payload[0].name}</p>
        <p className="text-primary text-sm">
          {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DistributionChart({ grades = [], accumulatedPoints }) {
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

  return (
    <div className="p-6 rounded-xl bg-surface-dark border border-border-dark h-80 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pie_chart</span>
            Distribución
        </h3>
        <div className="flex-1 min-h-0" style={{ minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-0.5em" fontSize="24" fill="#fff" fontWeight="bold">{accumulatedPoints}</tspan>
                        <tspan x="50%" dy="1.5em" fontSize="12" fill="#888">Acumulado</tspan>
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}
