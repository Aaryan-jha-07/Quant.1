import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const VolatilityChart = () => {
    const { currentUnderlyingPrice } = useSelector((state) => state.marketData);

    const chartData = useMemo(() => {
        const data = [];
        const startPrice = currentUnderlyingPrice * 0.8;
        const endPrice = currentUnderlyingPrice * 1.2;
        for (let i = startPrice; i <= endPrice; i += (endPrice - startPrice) / 20) {
            data.push({
                strike: Math.round(i),
                nnPrice: Math.max(0, i - currentUnderlyingPrice + Math.random() * 5),
                bsPrice: Math.max(0, i - currentUnderlyingPrice),
            });
        }
        return data;
    }, [currentUnderlyingPrice]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0f0f0f] border border-[#c5a059] p-3 shadow-xl font-sans text-xs uppercase tracking-widest">
                    <p className="text-[#8c7b65] mb-1">Strike: <span className="text-[#f4f1ea]">${label}</span></p>
                    <p className="text-[#c5a059] font-bold">NN: ${payload[0].value.toFixed(2)}</p>
                    <p className="text-[#8c7b65]">BS: ${payload[1].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c5a059" opacity={0.1} vertical={false} />
                    <XAxis dataKey="strike" stroke="#c5a059" opacity={0.5} tick={{ fill: '#8c7b65', fontSize: 10, fontFamily: 'sans-serif' }} tickLine={false} />
                    <YAxis stroke="#c5a059" opacity={0.5} tick={{ fill: '#8c7b65', fontSize: 10, fontFamily: 'sans-serif' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine x={currentUnderlyingPrice} stroke="#c5a059" strokeDasharray="3 3" opacity={0.3} />
                    <Line type="monotone" dataKey="bsPrice" stroke="#8c7b65" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="nnPrice" stroke="#c5a059" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#c5a059', stroke: '#0f0f0f' }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
export default VolatilityChart;