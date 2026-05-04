import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const VolatilityChart = ({ data }) => {
  return (
    <div className="w-full border border-[#C1A173]/30 p-4 md:p-8 relative">
      
      {/* Chart Header */}
      <h2 className="text-xs tracking-widest text-gray-500 uppercase mb-8">
        Fig 1.0 Volatility Surface
      </h2>
      
      {/* MOBILE FIX: The wrapper must have a strict minimum height */}
      <div className="w-full min-h-[350px] md:min-h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            
            <XAxis 
              dataKey="strike" 
              stroke="#555" 
              tick={{ fill: '#888', fontSize: 12, fontFamily: 'serif' }} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            
            <YAxis 
              stroke="#555" 
              tick={{ fill: '#888', fontSize: 12, fontFamily: 'serif' }} 
              tickLine={false}
              axisLine={false}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'transparent', 
                border: '1px solid #C1A173',
                fontFamily: 'serif',
                color: '#fff'
              }} 
              itemStyle={{ color: '#C1A173' }}
            />
            
            {/* Neural Network Line */}
            <Line 
              type="monotone" 
              dataKey="nn" 
              name="NN" 
              stroke="#C1A173" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4, fill: '#C1A173' }}
            />
            
            {/* Black-Scholes Line */}
            <Line 
              type="monotone" 
              dataKey="bs" 
              name="BS" 
              stroke="#444" 
              strokeWidth={2} 
              dot={false} 
            />
            
          </LineChart>
          
        </ResponsiveContainer>
      </div>

      {/* Decorative Corner Borders */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#C1A173]/50"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#C1A173]/50"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#C1A173]/50"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#C1A173]/50"></div>

    </div>
  );
};

export default VolatilityChart;